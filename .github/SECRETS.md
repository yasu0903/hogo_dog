# GitHub Secrets Configuration

このリポジトリで使用するGitHub Secretsの設定ガイドです。

## 🔐 AWS認証情報

### 共通
```
AWS_ACCESS_KEY_ID          = your-aws-access-key-id
AWS_SECRET_ACCESS_KEY      = your-aws-secret-access-key
TERRAFORM_STATE_BUCKET     = your-terraform-state-bucket
```

## 🚀 開発環境 (Development Environment)

### Development Secrets
```
DEV_API_BASE_URL               = https://dev-api.hogodog.jp
DEV_AWS_REGION                 = ap-northeast-1
DEV_AWS_USER_POOL_ID           = ap-northeast-1_xxxxxxxxx
DEV_AWS_USER_POOL_WEB_CLIENT_ID = xxxxxxxxxxxxxxxxxxxxxxxxxx
DEV_AWS_IDENTITY_POOL_ID       = ap-northeast-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DEV_AWS_COGNITO_DOMAIN         = hogodog-dev.auth.ap-northeast-1.amazoncognito.com
DEV_S3_BUCKET_NAME             = dev.hogodog.jp
DEV_CLOUDFRONT_DISTRIBUTION_ID = E1234567890ABC
```

## 🌟 本番環境 (Production Environment)

### Production Secrets
```
PROD_API_BASE_URL               = https://api.hogodog.jp
PROD_AWS_REGION                 = ap-northeast-1
PROD_AWS_USER_POOL_ID           = ap-northeast-1_yyyyyyyyy
PROD_AWS_USER_POOL_WEB_CLIENT_ID = yyyyyyyyyyyyyyyyyyyyyyyyyy
PROD_AWS_IDENTITY_POOL_ID       = ap-northeast-1:yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy
PROD_AWS_COGNITO_DOMAIN         = hogodog.auth.ap-northeast-1.amazoncognito.com
PROD_S3_BUCKET_NAME             = hogodog.jp
PROD_CLOUDFRONT_DISTRIBUTION_ID = E0987654321XYZ
```

## 📝 設定方法

### 1. GitHub リポジトリのSettings
1. GitHub リポジトリページに移動
2. **Settings** タブをクリック
3. サイドバーから **Secrets and variables** → **Actions** を選択

### 2. Environment Secrets
環境別のSecretsを設定するには：

1. **Environments** をクリック
2. **New environment** で `development` と `production` を作成
3. 各環境に対応するSecretsを設定

### 3. Repository Secrets
共通のAWS認証情報は Repository Secrets に設定：
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `TERRAFORM_STATE_BUCKET`

## 🛡️ セキュリティのベストプラクティス

### IAM権限の最小化
AWS認証情報には以下の最小権限を付与：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::hogodog.jp/*",
                "arn:aws:s3:::dev.hogodog.jp/*",
                "arn:aws:s3:::hogodog.jp",
                "arn:aws:s3:::dev.hogodog.jp"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::your-terraform-state-bucket/*"
        }
    ]
}
```

### Terraform用の追加権限
Terraformワークフロー用には、以下も追加：

```json
{
    "Effect": "Allow",
    "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:PutBucketPolicy",
        "s3:PutBucketWebsite",
        "cloudfront:*",
        "acm:*",
        "route53:*"
    ],
    "Resource": "*"
}
```

## 🔄 ワークフロー実行順序

### 初回セットアップ
1. **Terraform Plan** → 設定確認
2. **Terraform Apply** → インフラ作成
3. **Deploy Dev/Prod** → アプリケーションデプロイ

### 日常的な開発
1. **CI** → 自動実行（プッシュ/PR時）
2. **Deploy Dev** → 開発環境へ自動デプロイ
3. **Deploy Prod** → 本番環境へ手動デプロイ

## 🚨 トラブルシューティング

### よくある問題

1. **S3バケットが見つからない**
   - Terraformで先にインフラを作成してください
   - バケット名がSecretsと一致しているか確認

2. **CloudFront無効化エラー**
   - Distribution IDが正しいか確認
   - IAM権限にCloudFront権限が含まれているか確認

3. **環境変数が反映されない**
   - Environment Secretsが正しく設定されているか確認
   - ワークフローで正しい環境を指定しているか確認