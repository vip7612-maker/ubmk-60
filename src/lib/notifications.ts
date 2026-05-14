import 'server-only';
import { SolapiMessageService } from 'solapi';
import { Resend } from 'resend';
import {
  buildSmsBody, buildSmsSubject,
  buildEmailHtml, buildEmailSubject,
  buildInstallmentReminderSms, buildInstallmentReminderSubject, buildInstallmentReminderHtml,
  buildBriefingBody, buildBriefingSubject,
  type TemplateContext,
  type BriefingContext,
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
    const missing = [
      !apiKey && 'SOLAPI_API_KEY',
      !apiSecret && 'SOLAPI_API_SECRET',
      !sender && 'SOLAPI_SENDER',
    ].filter(Boolean).join(', ');
    result.sms.error = `Solapi env not configured (missing: ${missing})`;
    console.warn('[notifications]', result.sms.error);
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
    const missing = [
      !resendKey && 'RESEND_API_KEY',
      !fromEmail && 'EMAIL_FROM',
      !toEmail && '수신자 이메일',
    ].filter(Boolean).join(', ');
    result.email.error = `Resend env not configured (missing: ${missing})`;
    console.warn('[notifications]', result.email.error);
  }
}

function normalizePhone(p: string): string {
  // Solapi accepts numeric only (e.g. 01012345678)
  return p.replace(/[^0-9]/g, '');
}

/**
 * Send the daily admin briefing SMS to one or more recipients.
 *
 * Recipient resolution order:
 *   1) `briefing_recipients` table (enabled=1) — managed via /admin/settings
 *   2) BRIEFING_RECIPIENTS env (comma-separated, legacy fallback)
 *   3) SOLAPI_SENDER (final fallback so we never silently skip)
 */
export interface BriefingRecipient {
  name?: string;
  phone: string;
}
export interface BriefingResult {
  sent: number;
  failed: number;
  details: Array<{ to: string; name?: string; ok: boolean; error?: string }>;
}

export async function loadBriefingRecipients(): Promise<BriefingRecipient[]> {
  const { getDb } = await import('./db');
  try {
    const db = getDb();
    const res = await db.execute(
      "SELECT name, phone FROM briefing_recipients WHERE enabled = 1 ORDER BY id ASC"
    );
    if (res.rows.length > 0) {
      return res.rows.map(r => ({
        name: r.name ? String(r.name) : undefined,
        phone: String(r.phone),
      }));
    }
  } catch (e) {
    console.warn('[briefing] DB recipients lookup failed, falling back to env:', e);
  }
  const envRaw = process.env.BRIEFING_RECIPIENTS || process.env.SOLAPI_SENDER || '';
  return envRaw.split(',').map(s => s.trim()).filter(Boolean).map(phone => ({ phone }));
}

export async function sendAdminBriefing(ctx: BriefingContext): Promise<BriefingResult> {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const sender = process.env.SOLAPI_SENDER;

  const result: BriefingResult = { sent: 0, failed: 0, details: [] };

  if (!apiKey || !apiSecret || !sender) {
    throw new Error('Solapi env not configured (SOLAPI_API_KEY/SECRET/SENDER)');
  }

  const recipients = await loadBriefingRecipients();
  if (recipients.length === 0) {
    throw new Error('등록된 브리핑 수신자가 없습니다. 관리자 설정에서 추가해 주세요.');
  }

  const svc = new SolapiMessageService(apiKey, apiSecret);
  const text = buildBriefingBody(ctx);
  const subject = buildBriefingSubject();
  const from = normalizePhone(sender);

  for (const r of recipients) {
    const to = normalizePhone(r.phone);
    if (!to) {
      result.failed++;
      result.details.push({ to: r.phone, name: r.name, ok: false, error: 'invalid phone' });
      continue;
    }
    try {
      await svc.send({ to, from, text, subject, type: 'LMS' });
      result.sent++;
      result.details.push({ to, name: r.name, ok: true });
    } catch (err) {
      result.failed++;
      const msg = err instanceof Error ? err.message : 'send failed';
      result.details.push({ to, name: r.name, ok: false, error: msg });
      console.error(`[briefing] failed to ${r.name || to}:`, msg);
    }
  }

  return result;
}
