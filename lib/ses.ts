import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import type { Submission } from './dynamodb';

function getSESClient(): SESClient | null {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    return null;
  }
  return new SESClient({
    region: process.env.AWS_REGION ?? 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    },
  });
}

function buildReceiptHtml(submission: Submission): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LumaPath Receipt — ${submission.transactionId}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #0f172a; color: #f1f5f9; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #7c3aed; padding: 24px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; color: #ffffff; }
    .header p { margin: 4px 0 0; color: #ddd6fe; font-size: 14px; }
    .body { background: #1e293b; padding: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    td { padding: 10px 12px; border-bottom: 1px solid #334155; font-size: 14px; }
    td:first-child { color: #94a3b8; width: 40%; }
    td:last-child { color: #f1f5f9; font-weight: 500; }
    .footer { background: #059669; padding: 16px; border-radius: 0 0 8px 8px; text-align: center; color: #ffffff; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LumaPath — Digital Moi Express</h1>
      <p>Transaction Receipt</p>
    </div>
    <div class="body">
      <table>
        <tr><td>Transaction ID</td><td>${submission.transactionId}</td></tr>
        <tr><td>Guest Name</td><td>${submission.name}</td></tr>
        <tr><td>Address</td><td>${submission.address}</td></tr>
        <tr><td>Phone</td><td>${submission.phone}</td></tr>
        <tr><td>Amount</td><td>₹${submission.amount.toLocaleString('en-IN')}</td></tr>
        <tr><td>Allocation</td><td>${submission.allocation}</td></tr>
        <tr><td>Payment Mode</td><td>${submission.paymentMode}</td></tr>
        <tr><td>Event</td><td>${submission.event}</td></tr>
        <tr><td>Timestamp</td><td>${new Date(submission.timestamp).toLocaleString('en-IN')}</td></tr>
      </table>
    </div>
    <div class="footer">
      Thank you for your contribution! — LumaPath Digital Moi Express
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function sendReceiptEmail(
  submission: Submission,
  toEmail?: string
): Promise<void> {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.SES_FROM_EMAIL) return;
  if (!toEmail) return;

  const client = getSESClient();
  if (!client) return;

  try {
    await client.send(
      new SendEmailCommand({
        Source: process.env.SES_FROM_EMAIL,
        ReplyToAddresses: process.env.SES_REPLY_TO
          ? [process.env.SES_REPLY_TO]
          : undefined,
        Destination: {
          ToAddresses: [toEmail],
        },
        Message: {
          Subject: {
            Data: `LumaPath Receipt — ${submission.transactionId}`,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: buildReceiptHtml(submission),
              Charset: 'UTF-8',
            },
          },
        },
      })
    );
  } catch {
    // no-op — SES send failure should never crash the app
  }
}
