import { getResend, FROM } from '@/lib/resend'
import { isResendConfigured, env } from '@/lib/env'
import { passwordResetEmail, emailVerificationEmail } from '@/emails/templates'

function baseUrl(): string {
  return env.appUrl.replace(/\/$/, '')
}

/** Best-effort — logs and swallows errors so callers can keep their response generic (anti-enumeration). */
export async function sendPasswordResetEmail(to: string, rawToken: string) {
  if (!isResendConfigured()) {
    console.warn('[auth-email] Resend not configured — password reset email not sent to', to)
    return
  }
  try {
    const resetUrl = `${baseUrl()}/reset-password?token=${rawToken}`
    await getResend().emails.send({
      from: FROM,
      to,
      subject: 'Reset your password',
      html: passwordResetEmail({ resetUrl }),
    })
  } catch (err) {
    console.error('[auth-email] Failed to send password reset email:', err)
  }
}

export async function sendVerificationEmail(to: string, rawToken: string) {
  if (!isResendConfigured()) {
    console.warn('[auth-email] Resend not configured — verification email not sent to', to)
    return
  }
  try {
    const verifyUrl = `${baseUrl()}/verify-email?token=${rawToken}`
    await getResend().emails.send({
      from: FROM,
      to,
      subject: 'Verify your email',
      html: emailVerificationEmail({ verifyUrl }),
    })
  } catch (err) {
    console.error('[auth-email] Failed to send verification email:', err)
  }
}
