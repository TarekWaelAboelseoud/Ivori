import { Resend } from 'resend'
import { env, isResendConfigured } from '@/lib/env'

export function getResend() {
  if (!isResendConfigured()) {
    throw new Error('Resend is not configured. Add RESEND_API_KEY before sending email.')
  }
  return new Resend(env.resendApiKey)
}

export const FROM = `${env.resendFromName} <${env.resendFromEmail}>`
export const ADMIN_EMAIL = env.adminEmail
