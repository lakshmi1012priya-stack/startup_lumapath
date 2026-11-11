# AWS Setup Guide — LumaPath / Digital Moi Express

This guide walks through provisioning all AWS resources required to run LumaPath in production.
All resources should be created in the **ap-south-1 (Mumbai)** region unless stated otherwise.

---

## (a) DynamoDB — MoiSubmissions Table

1. Open the [DynamoDB console](https://console.aws.amazon.com/dynamodb/) and choose **Create table**.
2. **Table name:** `MoiSubmissions`
3. **Partition key:** `transactionId` — type **String**
4. **Sort key:** `timestamp` — type **String**
5. Leave capacity mode as **On-demand** (pay-per-request) for a new deployment.
6. Click **Create table** and wait for it to become Active.

### Add Global Secondary Index (GSI)

After the table is Active:

1. Select the `MoiSubmissions` table → **Indexes** tab → **Create index**.
2. **Index name:** `allocation-index`
3. **Partition key:** `allocation` — type **String**
4. Leave sort key empty.
5. **Projected attributes:** All
6. Click **Create index**.

---

## (b) S3 — lumapath-receipts Bucket

1. Open the [S3 console](https://console.aws.amazon.com/s3/) → **Create bucket**.
2. **Bucket name:** `lumapath-receipts`
3. **Region:** ap-south-1
4. Under **Block Public Access settings**, ensure **all four options are checked** (block all public access — ON).
5. Click **Create bucket**.

### Bucket Policy (restrict to IAM user only)

After creating the bucket, attach the following bucket policy (replace `ACCOUNT_ID` with your 12-digit AWS account ID):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:user/lumapath-app"
      },
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::lumapath-receipts/*"
    }
  ]
}
```

Apply this under the bucket's **Permissions** tab → **Bucket policy**.

---

## (c) SES — Email Setup

### Verify domain

1. Open [SES console](https://console.aws.amazon.com/ses/) → **Verified identities** → **Create identity**.
2. Choose **Domain**, enter `lumapath.com`.
3. AWS will provide DNS records (TXT for domain ownership, CNAME records for DKIM). Add these to your DNS provider.
4. Wait for verification status to show **Verified**.

### Verify sender address

1. In **Verified identities** → **Create identity** → choose **Email address**.
2. Enter `noreply@lumapath.com` and click **Create identity**.
3. Click the confirmation link sent to that address.

### Request production access (exit sandbox)

New SES accounts start in sandbox mode (can only send to verified addresses).

1. In the SES console, go to **Account dashboard** → **Request production access**.
2. Fill in the support form describing your use case (transactional wedding gift receipts).
3. AWS typically responds within 24 hours.

---

## (d) IAM — lumapath-app User

1. Open [IAM console](https://console.aws.amazon.com/iam/) → **Users** → **Create user**.
2. **Username:** `lumapath-app`
3. Select **Provide user access to the AWS Management Console** — leave unchecked (programmatic only).
4. Click through to **Permissions** → choose **Attach policies directly** → skip for now (add inline policy below).
5. Complete user creation.

### Attach inline policy

1. Select the `lumapath-app` user → **Permissions** tab → **Add permissions** → **Create inline policy**.
2. Use the JSON editor and paste (replace `ACCOUNT_ID` and `REGION`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-south-1:ACCOUNT_ID:table/MoiSubmissions",
        "arn:aws:dynamodb:ap-south-1:ACCOUNT_ID:table/MoiSubmissions/index/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::lumapath-receipts/*"
    },
    {
      "Effect": "Allow",
      "Action": "ses:SendEmail",
      "Resource": "*"
    }
  ]
}
```

3. Name the policy `lumapath-app-policy` and save.

### Generate Access Key

1. Select the `lumapath-app` user → **Security credentials** tab → **Create access key**.
2. Choose **Application running outside AWS**.
3. Copy the **Access key ID** and **Secret access key** — you will need them for the next step.

---

## (e) Vercel Environment Variables

In your Vercel project dashboard go to **Settings → Environment Variables** and add the following for the **Production** environment:

| Variable | Value |
|---|---|
| `AWS_REGION` | `ap-south-1` |
| `AWS_ACCESS_KEY_ID` | *(from IAM step above)* |
| `AWS_SECRET_ACCESS_KEY` | *(from IAM step above)* |
| `DYNAMODB_TABLE_NAME` | `MoiSubmissions` |
| `S3_BUCKET_NAME` | `lumapath-receipts` |
| `SES_FROM_EMAIL` | `noreply@lumapath.com` |
| `ADMIN_SECRET` | *(generate a strong random string)* |
| `NEXTAUTH_SECRET` | *(generate a strong random string)* |
| `NEXTAUTH_URL` | `https://digital-moi-express.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://digital-moi-express.vercel.app` |

> You can also store these in a `.env.local` file locally (never commit it — it is listed in `.gitignore`).

---

## (f) GitHub Secrets

In your GitHub repository go to **Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret | Value |
|---|---|
| `VERCEL_TOKEN` | Your Vercel personal access token (create at vercel.com → Account Settings → Tokens) |

The GitHub Actions workflow (`deploy.yml`) uses this secret to authenticate with Vercel for production deploys.
