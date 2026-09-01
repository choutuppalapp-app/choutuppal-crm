const fs = require('fs');
const path = require('path');

function walk(d) {
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      if (!p.includes('node_modules') && !p.includes('.next') && !p.includes('.git')) {
        walk(p);
      }
    } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      let content = fs.readFileSync(p, 'utf8');
      let changed = false;

      // Patch resolveAccountId in src/app/api/whatsapp/config/route.ts and similar
      if (content.includes('async function resolveAccountId')) {
        const regex = /if \(error \|\| !data\?\.account_id\) return null\s+return data\.account_id as string/;
        if (regex.test(content)) {
          content = content.replace(regex, `if (!error && data?.account_id) return data.account_id as string;
    
    // Auto-create account and profile
    const adminClient = supabaseAdmin()
    const { data: userObj } = await adminClient.auth.admin.getUserById(userId)
    const email = userObj?.user?.email || 'Unknown'
    const fullName = userObj?.user?.user_metadata?.full_name || email

    const { data: newAccount, error: accError } = await adminClient
      .from('accounts')
      .insert({ name: fullName, owner_user_id: userId })
      .select('id')
      .single()

    if (accError || !newAccount) return null

    // Check if profile exists
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (existingProfile) {
      await adminClient
        .from('profiles')
        .update({ account_id: newAccount.id, account_role: 'owner' })
        .eq('user_id', userId)
    } else {
      await adminClient
        .from('profiles')
        .insert({
          user_id: userId,
          full_name: fullName,
          email: email,
          account_id: newAccount.id,
          account_role: 'owner'
        })
    }
    return newAccount.id as string`);
          changed = true;
        }
      }

      // Patch the manual `const accountId = profile?.account_id` queries in other routes
      const manualQueryRegex = /const accountId = profile\?\.account_id as string \| undefined\s+if \(!accountId\) \{\s+return NextResponse\.json\(\s+\{ error: 'Your profile is not linked to an account\.' \},\s+\{ status: 403 \},?\s+\)\s+\}/g;
      
      if (manualQueryRegex.test(content)) {
        // We can replace it with an auto-create inline block
        content = content.replace(manualQueryRegex, `let accountId = profile?.account_id as string | undefined
    if (!accountId) {
      // Auto-create account and profile
      const adminClient = require('@supabase/supabase-js').createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
      const { data: userObj } = await adminClient.auth.admin.getUserById(user.id)
      const email = userObj?.user?.email || 'Unknown'
      const fullName = userObj?.user?.user_metadata?.full_name || email
      
      const { data: newAccount } = await adminClient
        .from('accounts')
        .insert({ name: fullName, owner_user_id: user.id })
        .select('id')
        .single()
        
      if (newAccount) {
        if (profile) {
          await adminClient.from('profiles').update({ account_id: newAccount.id, account_role: 'owner' }).eq('user_id', user.id)
        } else {
          await adminClient.from('profiles').insert({ user_id: user.id, full_name: fullName, email: email, account_id: newAccount.id, account_role: 'owner' })
        }
        accountId = newAccount.id as string
      } else {
        return NextResponse.json({ error: 'Your profile is not linked to an account.' }, { status: 403 })
      }
    }`);
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(p, content, 'utf8');
        console.log('Patched', p);
      }
    }
  });
}

walk('./src');
