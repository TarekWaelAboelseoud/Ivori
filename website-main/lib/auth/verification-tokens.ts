import { getDb } from '@/lib/supabase-server'
import { generateRawToken, hashToken } from '@/lib/auth/tokens'

export type AccountType = 'admin' | 'customer'
export type TokenPurpose = 'password_reset' | 'email_verification'

const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

/** Creates a token, invalidating any previous unused ones for the same account+purpose. Returns the raw token to email. */
export async function createVerificationToken(
  accountType: AccountType,
  accountId: string,
  purpose: TokenPurpose
): Promise<string | null> {
  const supabase = getDb()
  if (!supabase) return null

  // Invalidate older unused tokens for the same purpose so only the most
  // recently requested link/code actually works.
  await supabase
    .from('verification_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('account_type', accountType)
    .eq('account_id', accountId)
    .eq('purpose', purpose)
    .is('used_at', null)

  const rawToken = generateRawToken()
  const { error } = await supabase.from('verification_tokens').insert({
    account_type: accountType,
    account_id: accountId,
    purpose,
    token_hash: hashToken(rawToken),
    expires_at: new Date(Date.now() + TOKEN_TTL_MS).toISOString(),
  })

  if (error) return null
  return rawToken
}

/** Verifies and consumes a token in one step. Returns the account info, or null if invalid/expired/used. */
export async function consumeVerificationToken(
  rawToken: string,
  purpose: TokenPurpose
): Promise<{ accountType: AccountType; accountId: string } | null> {
  const supabase = getDb()
  if (!supabase) return null

  const { data } = await supabase
    .from('verification_tokens')
    .select('id, account_type, account_id, expires_at, used_at')
    .eq('token_hash', hashToken(rawToken))
    .eq('purpose', purpose)
    .maybeSingle()

  if (!data) return null
  if (data.used_at) return null
  if (new Date(data.expires_at).getTime() < Date.now()) return null

  await supabase.from('verification_tokens').update({ used_at: new Date().toISOString() }).eq('id', data.id)

  return { accountType: data.account_type as AccountType, accountId: data.account_id as string }
}
