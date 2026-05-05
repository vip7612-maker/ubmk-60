import 'server-only';
import { SolapiMessageService } from 'solapi';
import { Resend } from 'resend';
import {
  buildSmsBody, buildSmsSubject,
  buildEmailHtml, buildEmailSubject,
  type TemplateContext,
} from './templates';

interface NotifyContext extends TemplateContext {
  toPhone: string;
  toEmail: string;
}

export interface NotifyResult {
  sms: { sent: boolean; error?: string };
  email: { sent: boolean; error?: string };
}

/**
 * Send sponsor confirmation via SMS (Solapi LMS) + Email (Resend).
 * Failures are caught — we never block the sponsor record on notification errors.
 */
export async function sendSponsorNotifications(ctx: NotifyContext): Promise<NotifyResult> {
  const result: NotifyResult = {
    sms: { sent: false },
    email: { sent: false },
  };

  // Inject default contact info from env if not provided in ctx
  const fullCtx: TemplateContext = {
    ...ctx,
    bankAccount: ctx.bankAccount ?? process.env.BANK_ACCOUNT_INFO,
    contactPhone: ctx.contactPhone ?? process.env.CONTACT_PHONE,
    contactEmail: ctx.contactEmail ?? process.env.CONTACT_EMAIL,
  };

  // ---- SMS via Solapi ----
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const sender = process.env.SOLAPI_SENDER;
  if (apiKey && apiSecret && sender) {
    try {
      const svc = new SolapiMessageService(apiKey, apiSecret);
      await svc.send({
        to: normalizePhone(ctx.toPhone),
        from: normalizePhone(sender),
        text: buildSmsBody(fullCtx),
        subject: buildSmsSubject(),
        type: 'LMS',
      });
      result.sms.sent = true;
    } catch (err) {
      result.sms.error = err instanceof Error ? err.message : 'SMS send failed';
      console.error('[notifications] SMS failed:', result.sms.error);
    }
  } else {
    result.sms.error = 'Solapi env not configured';
    console.warn('[notifications] SMS skipped — SOLAPI_API_KEY/SECRET/SENDER missing');
  }

  // ---- Email via Resend ----
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  if (resendKey && fromEmail) {
    try {
      const resend = new Resend(resendKey);
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: ctx.toEmail,
        subject: buildEmailSubject(fullCtx),
        html: buildEmailHtml(fullCtx),
      });
      if (error) throw new Error(error.message || JSON.stringify(error));
      result.email.sent = true;
    } catch (err) {
      result.email.error = err instanceof Error ? err.message : 'Email send failed';
      console.error('[notifications] Email failed:', result.email.error);
    }
  } else {
    result.email.error = 'Resend env not configured';
    console.warn('[notifications] Email skipped — RESEND_API_KEY/EMAIL_FROM missing');
  }

  return result;
}

function normalizePhone(p: string): string {
  // Solapi accepts numeric only (e.g. 01012345678)
  return p.replace(/[^0-9]/g, '');
}
