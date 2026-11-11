import { NextResponse } from 'next/server';
import { getSubmissions, type Submission } from '@/lib/dynamodb';

function escapeCsvField(value: string): string {
  // Wrap in double-quotes and escape any internal double-quotes by doubling them
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET(): Promise<NextResponse> {
  const submissions = await getSubmissions();

  const header =
    '#,Transaction ID,Guest Name,Village/Address,Phone,Amount (INR),Gift For,Payment Mode,Date';

  const rows = submissions.map((s: Submission, index: number) => {
    const date = new Date(s.timestamp).toLocaleString('en-IN');
    return [
      String(index + 1),
      s.transactionId,
      escapeCsvField(s.name),
      escapeCsvField(s.address),
      s.phone,
      String(s.amount),
      s.allocation,
      s.paymentMode,
      escapeCsvField(date),
    ].join(',');
  });

  const csvContent = [header, ...rows].join('\r\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="master-ledger.csv"',
    },
  });
}
