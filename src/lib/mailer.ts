import nodemailer from 'nodemailer';

let cachedTransporter: any | null = null;

function getBoolean(value: string | undefined, defaultValue = false) {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

function buildTransporter(): any | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const secure = getBoolean(process.env.SMTP_SECURE, false);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function getTransporter(): any | null {
  if (cachedTransporter) return cachedTransporter;
  cachedTransporter = buildTransporter();
  return cachedTransporter;
}

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}): Promise<{ messageId: string } | null> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('SMTP not configured. Skipping sendEmail.');
    return null;
  }

  const fromAddress = options.from || process.env.SMTP_FROM || process.env.SMTP_USER || '';
  const info = await transporter.sendMail({
    from: fromAddress,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  return { messageId: info.messageId };
}

export async function sendErrorEmail(params: {
  route: string;
  method?: string;
  error: unknown;
  userEmail?: string;
  extra?: Record<string, unknown>;
}): Promise<void> {
  const enabled = getBoolean(process.env.ERROR_EMAIL_ENABLED, false);
  const admin = process.env.ADMIN_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!enabled || !admin) {
    return;
  }

  let errorText = 'Unknown error';
  let errorStack = '';
  if (params.error instanceof Error) {
    errorText = params.error.message;
    errorStack = params.error.stack || '';
  } else {
    try {
      errorText = JSON.stringify(params.error);
    } catch {}
  }

  const subject = `SFT: Error in ${params.method || 'REQUEST'} ${params.route}`;
  const lines: string[] = [
    `Route: ${params.route}`,
    `Method: ${params.method || 'N/A'}`,
    params.userEmail ? `User: ${params.userEmail}` : '',
    `Time: ${new Date().toISOString()}`,
    `Message: ${errorText}`,
    errorStack ? `\nStack:\n${errorStack}` : '',
  ].filter(Boolean) as string[];

  const html = `<pre style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 
  \"Liberation Mono\", \"Courier New\", monospace; white-space: pre-wrap;">${lines.join('\n')}</pre>`;

  try {
    await sendEmail({ to: admin, subject, text: lines.join('\n'), html });
  } catch (e) {
    console.warn('Failed to send error email:', e);
  }
}

export async function sendSignupEmail(params: {
  to: string;
  name?: string;
}): Promise<void> {
  const enabled = getBoolean(process.env.SIGNUP_EMAIL_ENABLED, true);
  if (!enabled) return;
  const subject = 'Welcome to Smart Finance Tracker';
  const greeting = params.name ? `Hi ${params.name},` : 'Hi,';
  const text = `${greeting}

Welcome to Smart Finance Tracker! Your account has been created successfully.

You can now sign in and start tracking your finances.

— Smart Finance Tracker`;
  const html = `<p>${greeting}</p>
<p>Welcome to <b>Smart Finance Tracker</b>! Your account has been created successfully.</p>
<p>You can now sign in and start tracking your finances.</p>
<p>— Smart Finance Tracker</p>`;
  try {
    await sendEmail({ to: params.to, subject, text, html });
  } catch (e) {
    console.warn('Failed to send signup email:', e);
  }
}

export async function sendBudgetExceededEmail(params: {
  to: string;
  budgetName: string;
  category?: string;
  spent: number;
  amount: number;
  percentage: number;
  threshold: number;
}): Promise<void> {
  const enabled = getBoolean(process.env.BUDGET_EMAIL_ENABLED, true);
  if (!enabled) return;
  const subject = `Budget Alert: ${params.budgetName} at ${Math.round(params.percentage)}%`;
  const text = `Your budget "${params.budgetName}"${params.category ? ` (${params.category})` : ''} has reached ${params.percentage.toFixed(1)}% of its limit.

Spent: ${params.spent}
Limit: ${params.amount}
Alert Threshold: ${params.threshold}%

Consider adjusting your spending or budget.`;
  const html = `<p>Your budget <b>${params.budgetName}</b>${params.category ? ` (${params.category})` : ''} has reached <b>${params.percentage.toFixed(1)}%</b> of its limit.</p>
<ul>
  <li>Spent: <b>${params.spent}</b></li>
  <li>Limit: <b>${params.amount}</b></li>
  <li>Alert Threshold: <b>${params.threshold}%</b></li>
</ul>
<p>Consider adjusting your spending or budget.</p>`;
  try {
    await sendEmail({ to: params.to, subject, text, html });
  } catch (e) {
    console.warn('Failed to send budget exceeded email:', e);
  }
}


