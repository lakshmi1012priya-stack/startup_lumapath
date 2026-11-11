import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

function getS3Client(): S3Client | null {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    return null;
  }
  return new S3Client({
    region: process.env.AWS_REGION ?? 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    },
  });
}

export async function uploadReceiptToS3(
  transactionId: string,
  pngBuffer: Buffer
): Promise<string | null> {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    return null;
  }
  const client = getS3Client();
  if (!client) return null;

  const bucket = process.env.S3_BUCKET_NAME ?? 'lumapath-receipts';
  const key = `receipts/${transactionId}.png`;

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: pngBuffer,
        ContentType: 'image/png',
      })
    );
    return `https://${bucket}.s3.ap-south-1.amazonaws.com/${key}`;
  } catch {
    return null;
  }
}
