import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if they already have an account_id in profiles
    const { data: profile } = await adminClient
      .from('profiles')
      .select('id, account_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile?.account_id) {
      return NextResponse.json({ success: true, account_id: profile.account_id })
    }

    const email = user.email || 'Unknown'
    const fullName = user.user_metadata?.full_name || email

    // Create an account
    const { data: newAccount, error: accError } = await adminClient
      .from('accounts')
      .insert({ name: fullName, owner_user_id: user.id })
      .select('id')
      .single()

    if (accError || !newAccount) {
      console.error('Failed to auto-create account', accError)
      return NextResponse.json({ error: 'Failed to auto-create account' }, { status: 500 })
    }

    // Update or insert profile
    if (profile) {
      await adminClient
        .from('profiles')
        .update({ account_id: newAccount.id, account_role: 'owner' })
        .eq('user_id', user.id)
    } else {
      await adminClient
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: fullName,
          email: email,
          account_id: newAccount.id,
          account_role: 'owner'
        })
    }

    return NextResponse.json({ success: true, account_id: newAccount.id })
  } catch (error) {
    console.error('Error in ensure-profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
