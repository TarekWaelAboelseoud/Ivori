const base = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f1eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1eb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;overflow:hidden;">
        <tr>
          <td style="background:#0a0a0a;padding:24px 32px;">
            <p style="margin:0;font-size:14px;font-weight:700;color:#f5f2ec;letter-spacing:0.16em;text-transform:uppercase;">Ivori</p>
            <p style="margin:6px 0 0;font-size:11px;color:#c9a96a;letter-spacing:0.08em;text-transform:uppercase;">Digital Growth Studio</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            ${content}
            <p style="margin:32px 0 0;padding-top:24px;border-top:1px solid #e4e4e7;font-size:12px;color:#71717a;">
              Ivori Digitals - ecommerce growth, Shopify optimization, media buying, and automation.<br>
              Questions? Reply to this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

const btn = (url: string, label: string) =>
  `<a href="${url}" style="display:inline-block;margin-top:24px;padding:14px 28px;background:#0a0a0a;color:#f5f2ec;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">${label}</a>`

export function intakeInviteEmail(opts: { intakeUrl: string; tier: string }) {
  const tierLabel =
    opts.tier === 'quick' || opts.tier === 'starter'
      ? 'Quick Review'
      : opts.tier === 'audit' || opts.tier === 'full'
        ? 'Deep Audit'
        : opts.tier === 'fix'
          ? 'Growth Fix Sprint'
          : 'Monthly Growth Partner'
  return base(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;">Payment confirmed. Let's get started.</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.6;">
      Your <strong>${tierLabel}</strong> is confirmed. To begin, we need a few details about your store.
    </p>
    <p style="margin:0;font-size:15px;color:#52525b;line-height:1.6;">
      It takes about <strong>5 minutes</strong>. Reviews and audits are delivered within <strong>48 hours</strong>; implementation scopes are confirmed directly after we review the context.
    </p>
    ${btn(opts.intakeUrl, 'Complete your intake form')}
    <p style="margin:16px 0 0;font-size:13px;color:#a1a1aa;">This link is unique to your order. Do not share it.</p>
  `)
}

export function intakeReceivedEmail(opts: { storeUrl: string }) {
  return base(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;">We've received your intake.</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.6;">
      Your store <strong>${opts.storeUrl}</strong> is now in the Ivori Digitals review queue.
    </p>
    <p style="margin:0;font-size:15px;color:#52525b;line-height:1.6;">
      You'll receive your conversion review and action plan within <strong>48 hours</strong> if you booked an audit tier.
    </p>
    <div style="margin-top:24px;padding:16px;background:#fafafa;border:1px solid #e4e4e7;">
      <p style="margin:0;font-size:13px;color:#71717a;">
        <strong style="color:#09090b;">What happens next:</strong><br>
        We review your store journey, payment trust, mobile UX, product-page clarity, and growth context. A human checks every recommendation before delivery.
      </p>
    </div>
  `)
}

export function adminNotificationEmail(opts: {
  storeUrl: string
  email: string
  tier: string
  region: string
  adminUrl: string
}) {
  return base(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;">New intake received</h1>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      ${[
        ['Store', opts.storeUrl],
        ['Email', opts.email],
        ['Tier', opts.tier],
        ['Region', opts.region],
      ].map(([k, v]) => `
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#71717a;width:80px;">${k}</td>
          <td style="padding:8px 0;font-size:13px;color:#09090b;font-weight:500;">${v}</td>
        </tr>
      `).join('')}
    </table>
    ${btn(opts.adminUrl, 'Open in admin panel')}
  `)
}

export function deliveryEmail(opts: {
  storeUrl: string
  pdfUrl: string
  upsellBridge: string
  calendlyUrl?: string
}) {
  return base(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;">Your Ivori Digitals review is ready.</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.6;">
      Your conversion review for <strong>${opts.storeUrl}</strong> is ready.
    </p>
    ${btn(opts.pdfUrl, 'Download your review')}
    <div style="margin-top:28px;padding:20px;background:#fafafa;border:1px solid #e4e4e7;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#09090b;">What's next</p>
      <p style="margin:0;font-size:13px;color:#52525b;line-height:1.6;">${opts.upsellBridge}</p>
      ${opts.calendlyUrl
        ? `<a href="${opts.calendlyUrl}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#09090b;color:#ffffff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;">Book an implementation call</a>`
        : ''}
    </div>
    <p style="margin:20px 0 0;font-size:12px;color:#a1a1aa;">
      Reply to this email with any questions about your report.
    </p>
  `)
}

export function passwordResetEmail(opts: { resetUrl: string }) {
  return base(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;">Reset your password</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.6;">
      We received a request to reset your password. This link expires in 1 hour and can only be used once.
    </p>
    ${btn(opts.resetUrl, 'Reset password')}
    <p style="margin:20px 0 0;font-size:12px;color:#a1a1aa;">
      If you didn't request this, you can safely ignore this email — your password won't be changed.
    </p>
  `)
}

export function emailVerificationEmail(opts: { verifyUrl: string }) {
  return base(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;">Verify your email</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.6;">
      Confirm this is your email address to finish setting up your account. This link expires in 1 hour.
    </p>
    ${btn(opts.verifyUrl, 'Verify email')}
    <p style="margin:20px 0 0;font-size:12px;color:#a1a1aa;">
      If you didn't create an account, you can ignore this email.
    </p>
  `)
}
