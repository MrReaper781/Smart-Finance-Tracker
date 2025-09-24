import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, text, html } = await request.json();

    const info = await sendEmail({
      to: to || session.user.email,
      subject: subject || 'Test Email from Smart Finance Tracker',
      text: text || 'This is a test email to confirm settings.',
      html: html || '<p>This is a <b>test email</b> to confirm settings.</p>',
    });

    return NextResponse.json({ messageId: info?.messageId || null });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
