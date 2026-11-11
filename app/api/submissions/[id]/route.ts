import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionById } from '@/lib/dynamodb';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const submission = await getSubmissionById(params.id);
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }
  return NextResponse.json(submission);
}
