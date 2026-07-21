import { getDb } from '@/lib/supabase-server'
import { hashPassword, verifyPassword } from '@/lib/auth/password'

export type Customer = {
  id: string
  email: string
  password_hash: string
  name: string | null
  phone: string | null
  status: 'active' | 'disabled'
  email_verified_at: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export async function findCustomerByEmail(email: string): Promise<Customer | null> {
  const supabase = getDb()
  if (!supabase) return null
  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle()
  return (data as Customer | null) ?? null
}

export async function findCustomerById(id: string): Promise<Customer | null> {
  const supabase = getDb()
  if (!supabase) return null
  const { data } = await supabase.from('customers').select('*').eq('id', id).maybeSingle()
  return (data as Customer | null) ?? null
}

export async function updateCustomerPassword(id: string, newPasswordHash: string) {
  const supabase = getDb()
  if (!supabase) return
  await supabase.from('customers').update({ password_hash: newPasswordHash }).eq('id', id)
}

export async function markCustomerEmailVerified(id: string) {
  const supabase = getDb()
  if (!supabase) return
  await supabase.from('customers').update({ email_verified_at: new Date().toISOString() }).eq('id', id)
}

/** Returns null on success, or an error message on failure (e.g. duplicate email). */
export async function createCustomer(input: {
  email: string
  password: string
  name?: string | null
  phone?: string | null
}): Promise<{ customer: Customer | null; error: string | null }> {
  const supabase = getDb()
  if (!supabase) return { customer: null, error: 'Database is not configured.' }

  const password_hash = await hashPassword(input.password)

  const { data, error } = await supabase
    .from('customers')
    .insert({
      email: input.email.toLowerCase(),
      password_hash,
      name: input.name ?? null,
      phone: input.phone ?? null,
    })
    .select('*')
    .single()

  if (error) {
    // Postgres unique_violation
    if (error.code === '23505') return { customer: null, error: 'An account with this email already exists.' }
    return { customer: null, error: error.message }
  }

  return { customer: data as Customer, error: null }
}

export async function verifyCustomerPassword(customer: Customer, password: string): Promise<boolean> {
  return verifyPassword(password, customer.password_hash)
}

export async function touchCustomerLogin(id: string) {
  const supabase = getDb()
  if (!supabase) return
  await supabase.from('customers').update({ last_login_at: new Date().toISOString() }).eq('id', id)
}
