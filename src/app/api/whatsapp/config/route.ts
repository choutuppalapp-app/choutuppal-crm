import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/whatsapp/encryption'

async function getAccountId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()
  
  return profile?.account_id || null
}

export async function GET() {
  const accountId = await getAccountId()
  if (!accountId) {
    // Return not connected if no account linked
    return NextResponse.json({ connected: false, reason: 'no_account' }, { status: 200 })
  }

  const adminClient = require('@supabase/supabase-js').createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await adminClient
    .from('whatsapp_config')
    .select('*')
    .eq('account_id', accountId)
    .single()

  if (data) {
    let accessToken = ''
    let verifyToken = ''
    try {
      if (data.access_token) accessToken = decrypt(data.access_token)
      if (data.verify_token) verifyToken = decrypt(data.verify_token)
    } catch (err) {
      console.error('Failed to decrypt tokens', err)
    }
    return NextResponse.json({ 
      connected: true, 
      phoneNumberId: data.phone_number_id,
      whatsappBusinessId: data.waba_id,
      accessToken,
      verifyToken,
      phone_info: { verified_name: data.phone_number_id }
    })
  }

  return NextResponse.json(
    { connected: false, reason: 'no_config', message: 'No configuration found in database.' },
    { status: 200 }
  )
}

export async function POST(request: Request) {
  try {
    const accountId = await getAccountId()
    if (!accountId) {
      return NextResponse.json({ error: 'Your profile is not linked to an account.' }, { status: 403 })
    }

    const body = await request.json()
    const { phoneNumberId, whatsappBusinessId, accessToken, verifyToken } = body

    const adminClient = require('@supabase/supabase-js').createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Using upsert with account_id
    const { error } = await adminClient
      .from('whatsapp_config')
      .upsert(
        {
          account_id: accountId,
          user_id: user?.id,
          phone_number_id: phoneNumberId,
          waba_id: whatsappBusinessId,
          access_token: encrypt(accessToken || ''),
          verify_token: encrypt(verifyToken || ''),
          status: 'connected',
        },
        { onConflict: 'account_id' }
      )

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      saved: true, 
      registered: true 
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const accountId = await getAccountId()
    if (!accountId) {
      return NextResponse.json({ error: 'Your profile is not linked to an account.' }, { status: 403 })
    }

    const adminClient = require('@supabase/supabase-js').createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    await adminClient.from('whatsapp_config').delete().eq('account_id', accountId)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
