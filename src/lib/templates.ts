import 'server-only';

const PROJECT_NAME = '크롬북 한 대, 공정한 교육기회';
const SPONSOR_AMOUNT = '500,000';

export interface TemplateContext {
  sponsorName: string;
  studentAlias: string;
  studentGrade: string;
  studentDream: string | null;
  bankAccount?: string;
  contactPhone?: string;
  contactEmail?: string;
}

/* ================================
 *  SMS (Solapi LMS — up to 2000 bytes)
 * ================================ */
export function buildSmsBody(ctx: TemplateContext): string {
  const bank = ctx.bankAccount?.trim()
    ? ctx.bankAccount.trim()
    : '* 입금 계좌는 곧 별도로 안내드립니다.';
  const phone = ctx.contactPhone?.trim() || '';
  const email = ctx.contactEmail?.trim() || '';

  return [
    `[${PROJECT_NAME}]`,
    '',
    `${ctx.sponsorName}님, 결연 신청해주셔서 진심으로 감사합니다 💝`,
    '',
    `▣ 결연 학생: ${ctx.studentAlias} (${ctx.studentGrade})`,
    `▣ 후원 금액: ${SPONSOR_AMOUNT}원 (크롬북 1대)`,
    '',
    '▼ 입금 안내',
    bank,
    '',
    '입금이 확인되면 결연이 정식 완료되며,',
    '학생의 학습 진행 상황을 분기별로 안내드립니다.',
    '',
    phone ? `문의: ${phone}` : '',
    email ? `이메일: ${email}` : '',
  ].filter(Boolean).join('\n');
}

export function buildSmsSubject(): string {
  return `[${PROJECT_NAME}] 결연 신청 안내`;
}

/* ================================
 *  Email (HTML)
 * ================================ */
export function buildEmailSubject(ctx: TemplateContext): string {
  return `[${PROJECT_NAME}] ${ctx.sponsorName}님, ${ctx.studentAlias} 학생과의 결연 신청이 접수되었습니다`;
}

export function buildEmailHtml(ctx: TemplateContext): string {
  const bank = ctx.bankAccount?.trim() || '* 입금 계좌는 담당자가 별도로 안내드립니다.';
  const dream = ctx.studentDream
    ? `<p style="margin:16px 0 0;font-style:italic;color:#475569;">"${escapeHtml(ctx.studentDream)}"</p>`
    : '';
  const phone = ctx.contactPhone?.trim() || '';
  const email = ctx.contactEmail?.trim() || '';

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(buildEmailSubject(ctx))}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Pretendard','Noto Sans KR',sans-serif;color:#0f172a;line-height:1.6;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">

    <!-- Brand Header -->
    <div style="background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 100%);border-radius:20px;padding:36px 28px;text-align:center;color:#fff;">
      <div style="font-size:13px;letter-spacing:.15em;font-weight:700;text-transform:uppercase;color:#fbbf24;margin-bottom:10px;">
        UBMK · MONGOLIA
      </div>
      <div style="font-size:22px;font-weight:800;letter-spacing:-.02em;white-space:nowrap;">
        크롬북 한 대, <span style="color:#fbbf24;">공정한 교육기회</span>
      </div>
    </div>

    <!-- Greeting -->
    <div style="background:#fff;border-radius:20px;margin-top:16px;padding:32px 28px;border:1px solid #e2e8f0;">
      <h1 style="font-size:22px;margin:0 0 12px;font-weight:800;letter-spacing:-.02em;">
        💝 ${escapeHtml(ctx.sponsorName)}님, 진심으로 감사합니다.
      </h1>
      <p style="margin:0 0 8px;color:#334155;">
        몽골 UBMK 학교 학생과의 1:1 결연 신청이 정상적으로 접수되었습니다.
      </p>
      <p style="margin:0;color:#64748b;font-size:14px;">
        이 한 통의 신청이, 한 아이의 5년을 바꾸는 시작입니다.
      </p>
    </div>

    <!-- Student Card -->
    <div style="background:linear-gradient(135deg,#fffbeb,#eff6ff);border-radius:20px;margin-top:16px;padding:28px;border:1px solid #fef3c7;">
      <div style="font-size:11px;font-weight:800;color:#d97706;letter-spacing:.15em;text-transform:uppercase;margin-bottom:8px;">
        결연 학생
      </div>
      <div style="font-size:24px;font-weight:800;margin-bottom:4px;">${escapeHtml(ctx.studentAlias)}</div>
      <div style="color:#64748b;font-size:14px;">${escapeHtml(ctx.studentGrade)}</div>
      ${dream}
    </div>

    <!-- Payment Info -->
    <div style="background:#fff;border-radius:20px;margin-top:16px;padding:28px;border:1px solid #e2e8f0;">
      <h2 style="font-size:16px;margin:0 0 16px;font-weight:800;">▼ 후원 입금 안내</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:10px 0;color:#64748b;font-weight:600;width:35%;">후원 금액</td>
          <td style="padding:10px 0;color:#1d4ed8;font-weight:800;font-size:18px;">${SPONSOR_AMOUNT}원</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#64748b;font-weight:600;border-top:1px solid #f1f5f9;">입금 계좌</td>
          <td style="padding:10px 0;font-weight:700;border-top:1px solid #f1f5f9;white-space:pre-line;">${escapeHtml(bank)}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#64748b;font-weight:600;border-top:1px solid #f1f5f9;">입금자명</td>
          <td style="padding:10px 0;font-weight:700;border-top:1px solid #f1f5f9;">${escapeHtml(ctx.sponsorName)}님 성함으로 입금해주세요</td>
        </tr>
      </table>
    </div>

    <!-- Next Steps -->
    <div style="background:#f8fafc;border-radius:20px;margin-top:16px;padding:24px 28px;">
      <h3 style="font-size:14px;font-weight:800;margin:0 0 12px;color:#334155;">📋 다음 안내</h3>
      <ol style="margin:0;padding-left:20px;color:#475569;font-size:14px;">
        <li style="margin-bottom:6px;">위 계좌로 후원금 입금</li>
        <li style="margin-bottom:6px;">입금 확인 후 결연이 정식 완료됩니다</li>
        <li style="margin-bottom:6px;">${escapeHtml(ctx.studentAlias)} 학생의 손편지 원본 사진을 발송해드립니다</li>
        <li style="margin-bottom:6px;">학습 진행 상황을 분기별로 안내드립니다</li>
        <li>기부금 영수증은 본 이메일 주소로 발송됩니다</li>
      </ol>
    </div>

    <!-- Contact -->
    <div style="text-align:center;margin-top:24px;padding:20px;color:#64748b;font-size:13px;">
      <p style="margin:0 0 8px;">문의 사항이 있으시면 언제든 연락 주세요.</p>
      ${phone ? `<p style="margin:0 0 4px;">📞 ${escapeHtml(phone)}</p>` : ''}
      ${email ? `<p style="margin:0;">✉️ ${escapeHtml(email)}</p>` : ''}
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:8px;padding:16px;color:#94a3b8;font-size:11px;line-height:1.6;">
      © 2026 크롬북 한 대, 공정한 교육기회<br/>
      몽골 울란바타르 UBMK 학교 후원 프로젝트
    </div>

  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
