import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/whatsapp/encryption'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()
  
  if (!profile?.account_id) {
    return NextResponse.json({ error: 'No account linked' }, { status: 403 })
  }

  const adminClient = require('@supabase/supabase-js').createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: config } = await adminClient
    .from('whatsapp_config')
    .select('*')
    .eq('account_id', profile.account_id)
    .single()

  if (!config || !config.access_token || !config.phone_number_id) {
    return NextResponse.json({ error: 'Incomplete WhatsApp configuration found' }, { status: 404 })
  }

  try {
    const accessToken = decrypt(config.access_token)
    const res = await fetch(`https://graph.facebook.com/v20.0/${config.phone_number_id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    
    if (res.ok) {
      const data = await res.json()
      return NextResponse.json({ success: true, data })
    } else {
      const errorData = await res.json()
      return NextResponse.json({ success: false, error: errorData.error?.message || 'Meta API returned an error' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unknown error' }, { status: 500 })
  }
}
