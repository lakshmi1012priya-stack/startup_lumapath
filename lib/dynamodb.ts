import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

export interface Submission {
  transactionId: string;
  name: string;
  address: string;
  phone: string;
  amount: number;
  allocation: 'Both' | 'Bride' | 'Groom';
  paymentMode: string;
  timestamp: string;
  event: string;
}

export const DYNAMODB_TABLE_NAME =
  process.env.DYNAMODB_TABLE_NAME ?? 'MoiSubmissions';

export function getDynamoClient(): DynamoDBDocumentClient | null {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    return null;
  }
  const ddbClient = new DynamoDBClient({
    region: process.env.AWS_REGION ?? 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    },
  });
  return DynamoDBDocumentClient.from(ddbClient);
}

export async function putSubmission(submission: Submission): Promise<void> {
  const client = getDynamoClient();
  if (!client) return;
  try {
    await client.send(
      new PutCommand({
        TableName: DYNAMODB_TABLE_NAME,
        Item: submission,
      })
    );
  } catch {
    // no-op — offline or missing credentials
  }
}

export async function getSubmissions(): Promise<Submission[]> {
  const client = getDynamoClient();
  if (!client) return [];
  try {
    const result = await client.send(
      new ScanCommand({
        TableName: DYNAMODB_TABLE_NAME,
        Limit: 1000,
      })
    );
    const items = (result.Items ?? []) as Submission[];
    return items.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch {
    return [];
  }
}

export async function getSubmissionById(
  transactionId: string
): Promise<Submission | null> {
  const client = getDynamoClient();
  if (!client) return null;
  try {
    const result = await client.send(
      new GetCommand({
        TableName: DYNAMODB_TABLE_NAME,
        Key: { transactionId },
      })
    );
    return (result.Item as Submission) ?? null;
  } catch {
    return null;
  }
}
