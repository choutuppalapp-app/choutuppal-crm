import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(request: Request) {
  const body = await request.json()
  const supabase = await createAdminClient()

  try {
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ success: true })
    }

    // Since we don't have session in webhooks, let's just get the first user to tie the data to (for single-tenant simplicity)
    const { data: usersData } = await supabase.auth.admin.listUsers()
    const firstUserId = usersData?.users?.[0]?.id

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.value && change.value.messages) {
          const message = change.value.messages[0]
          const contact = change.value.contacts?.[0]
          
          const phone = message.from
          const name = contact?.profile?.name || phone
          const text = message.text?.body || ''

          if (!firstUserId) continue; // Cannot proceed without a user

          // 1. Upsert Contact
          const { data: dbContact } = await supabase
            .from('contacts')
            .upsert({ user_id: firstUserId, phone, name }, { onConflict: 'phone' })
            .select()
            .single()

          if (dbContact) {
            // 2. Insert or find open conversation
            let convId;
            const { data: existingConv } = await supabase
              .from('conversations')
              .select('id')
              .eq('contact_id', dbContact.id)
              .eq('status', 'open')
              .single()
            
            if (existingConv) {
              convId = existingConv.id
            } else {
              const { data: newConv } = await supabase
                .from('conversations')
                .insert({ user_id: firstUserId, contact_id: dbContact.id, status: 'open' })
                .select()
                .single()
              convId = newConv?.id
            }

            if (convId) {
              // 3. Insert Message
              await supabase.from('messages').insert({
                conversation_id: convId,
                sender_type: 'customer',
                content_text: text,
                status: 'delivered'
              })
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
