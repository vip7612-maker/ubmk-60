import 'server-only';
import { SolapiMessageService } from 'solapi';
import { Resend } from 'resend';
import {
  buildSmsBody, buildSmsSubject,
  buildEmailHtml, buildEmailSubject,
  buildInstallmentReminderSms, buildInstallmentReminderSubject, buildInstallmentReminderHtml,
  type TemplateContext,
} from './templates';

interface NotifyContext extends TemplateContext {
  toPhone: string;
  toEmail: string;
}

export interface NotifyResult {
  sms: { sent: boolean; error?: string };
  email: { sent: boolean; error?: string };
  smsBody?: string;
  emailSubject?: string;
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

  const smsBody = buildSmsBody(fullCtx);
  const emailSubject = buildEmailSubject(fullCtx);
  const emailHtml = buildEmailHtml(fullCtx);
  result.smsBody = smsBody;
  result.emailSubject = emailSubject;

  await dispatch(result, ctx.toPhone, ctx.toEmail, smsBody, buildSmsSubject(), emailSubject, emailHtml);
  return result;
}

/**
 * 분할 후원 회차 안내 (Cron에서 호출).
 * sendSponsorNotifications와 시그니처는 같지만 본문은 회차 입금 안내 톤.
 */
export async function sendInstallmentReminder(ctx: NotifyContext): Promise<NotifyResult> {
  const result: NotifyResult = { sms: { sent: false }, email: { sent: false } };
  const fullCtx: TemplateContext = {
    ...ctx,
    bankAccount: ctx.bankAccount ?? process.env.BANK_ACCOUNT_INFO,
    contactPhone: ctx.contactPhone ?? process.env.CONTACT_PHONE,
    contactEmail: ctx.contactEmail ?? process.env.CONTACT_EMAIL,
  };
  const smsBody = buildInstallmentReminderSms(fullCtx);
  const subject = buildInstallmentReminderSubject(fullCtx);
  const emailHtml = buildInstallmentReminderHtml(fullCtx);
  result.smsBody = smsBody;
  result.emailSubject = subject;

  await dispatch(result, ctx.toPhone, ctx.toEmail, smsBody, subject, subject, emailHtml);
  return result;
}

/** SMS+Email 발송 + 실패 처리를 공통화. */
async function dispatch(
  result: NotifyResult,
  toPhone: string,
  toEmail: string,
  smsBody: string,
  smsSubject: string,
  emailSubject: string,
  emailHtml: string,
) {
  // ---- SMS via Solapi ----
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const sender = process.env.SOLAPI_SENDER;
  if (apiKey && apiSecret && sender) {
    try {
      const svc = new SolapiMessageService(apiKey, apiSecret);
      await svc.send({
        to: normalizePhone(toPhone),
        from: normalizePhone(sender),
        text: smsBody,
        subject: smsSubject,
        type: 'LMS',
      });
      result.sms.sent = true;
    } catch (err) {
      result.sms.error = err instanceof Error ? err.message : 'SMS send failed';
      console.error('[notifications] SMS failed:', result.sms.error);
    }
  } else {
    result.sms.error = 'Solapi env not configured';
  }

  // ---- Email via Resend ----
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  if (resendKey && fromEmail && toEmail) {
    try {
      const resend = new Resend(resendKey);
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: emailSubject,
        html: emailHtml,
      });
      if (error) throw new Error(error.message || JSON.stringify(error));
      result.email.sent = true;
    } catch (err) {
      result.email.error = err instanceof Error ? err.message : 'Email send failed';
      console.error('[notifications] Email failed:', result.email.error);
    }
  } else {
    result.email.error = 'Resend env not configured or email missing';
  }
}

function normalizePhone(p: string): string {
  // Solapi accepts numeric only (e.g. 01012345678)
  return p.replace(/[^0-9]/g, '');
}
