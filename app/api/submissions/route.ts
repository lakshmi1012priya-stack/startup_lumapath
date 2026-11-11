import { NextRequest, NextResponse } from 'next/server';
import {
  getSubmissions,
  putSubmission,
  type Submission,
} from '@/lib/dynamodb';
import { sendReceiptEmail } from '@/lib/ses';

export async function GET(): Promise<NextResponse> {
  const submissions = await getSubmissions();
  return NextResponse.json(submissions);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, address, phone, amount, allocation, paymentMode } = body as {
    name?: string;
    address?: string;
    phone?: string;
    amount?: unknown;
    allocation?: string;
    paymentMode?: string;
  };

  // Validate required fields
  if (!name || !address || !phone || !allocation || !paymentMode) {
    return NextResponse.json(
      { error: 'Missing required fields: name, address, phone, allocation, paymentMode' },
      { status: 400 }
    );
  }

  const parsedAmount = Number(amount);
  if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json(
      { error: 'amount must be a positive number' },
      { status: 400 }
    );
  }

  if (allocation !== 'Both' && allocation !== 'Bride' && allocation !== 'Groom') {
    return NextResponse.json(
      { error: 'allocation must be "Both", "Bride", or "Groom"' },
      { status: 400 }
    );
  }

  const transactionId = 'MOI-' + String(Date.now()).slice(-6).padStart(6, '0');

  const submission: Submission = {
    transactionId,
    name: String(name),
    address: String(address),
    phone: String(phone),
    amount: parsedAmount,
    allocation: allocation as 'Both' | 'Bride' | 'Groom',
    paymentMode: String(paymentMode),
    timestamp: new Date().toISOString(),
    event: 'Suresh & Priya Wedding | Raja Mahal, Chennai',
  };

  await putSubmission(submission);

  // Fire-and-forget — do not await, do not let failure affect the response
  void sendReceiptEmail(submission);

  return NextResponse.json({ success: true, submission }, { status: 201 });
}
