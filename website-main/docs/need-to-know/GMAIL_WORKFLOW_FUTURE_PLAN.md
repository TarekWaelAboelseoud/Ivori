# Gmail Workflow Future Plan

## Not Implemented Yet

No Gmail integration was added in this phase.

## Target Mapping

- Leads: inbound sales, qualified inquiries, contact form follow-ups.
- Clients: active client threads and delivery questions.
- Finance: invoices, payment reminders, subscription issues.
- Receipts: receipt capture and reconciliation.
- Domain & Hosting: DNS, registrar, hosting, SSL, renewal notices.
- Partnerships: referral, affiliate, and strategic partner emails.
- Outreach: outbound campaigns and replies.
- Internal Ops: operational email that does not fit another queue.

## Data Strategy

Store Gmail metadata in `ops_items.metadata`:

- `gmail_thread_id`
- `gmail_message_id`
- `email_from`
- `email_subject`
- `email_label`
- `automation_source`

## Future Sync Architecture

1. OAuth-connect a controlled internal mailbox.
2. Pull labels and message headers through a server-only scheduled job.
3. Classify messages into ops categories.
4. Upsert `ops_items` by `gmail_thread_id`.
5. Log each action to `ops_activity_log`.
6. Keep human approval for client/finance actions until automation is proven.
