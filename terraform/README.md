# HogoDog Frontend Infrastructure

React SPAのためのTerraform構成（S3 + CloudFront + Route 53）

## 🏗️ アーキテクチャ

```
📦 HogoDog Frontend Infrastructure
├── 🌐 CloudFront (CDN)
├── 📄 S3 (Static Website Hosting)
├── 🔒 ACM (SSL Certificate)
└── 🔗 Route 53 (DNS Management)
```

## 📁 構成

```
terraform/
├── environments/
│   ├── dev/                      # 開発環境 (dev.hogodog.jp)
│   │   ├── main.tf              # 開発環境メイン設定
│   │   ├── terraform.tfvars.example  # 設定例
│   │   └── backend.hcl.example  # バックエンド設定例
│   └── prod/                     # 本番環境 (hogodog.jp)
│       ├── main.tf              # 本番環境メイン設定
│       ├── terraform.tfvars.example  # 設定例
│       └── backend.hcl.example  # バックエンド設定例
├── shared/                       # 共通設定
├── modules/                      # 再利用可能モジュール
└── .terraform-version
```

## 🚀 使用方法

### 1. 設定ファイル準備

```bash
# 開発環境
cd terraform/environments/dev

# terraform.tfvarsファイルを作成
cp terraform.tfvars.example terraform.tfvars
# ← 実際の値を編集

# バックエンド設定ファイルを作成
cp backend.hcl.example backend.hcl
# ← 実際のS3バケット名等を編集
```

### 2. Terraform実行（簡単版）

```bash
# 開発環境
cd terraform/environments/dev

terraform init -backend-config=backend.hcl
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"

# 本番環境
cd ../prod

# 本番環境も同様に設定ファイルを準備
cp terraform.tfvars.example terraform.tfvars
cp backend.hcl.example backend.hcl
# ← 本番環境用の値を編集

terraform init -backend-config=backend.hcl
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

## 🌍 環境別設定

### 開発環境 (dev.hogodog.jp)
- **CloudFront**: PriceClass_100 (最安)
- **S3バケット**: 自動作成
- **デフォルトコンテンツ**: 開発用プレースホルダー

### 本番環境 (hogodog.jp)
- **CloudFront**: PriceClass_All (全世界配信)
- **S3バケット**: 既存バケット使用推奨
- **高性能設定**

## 📄 出力値

デプロイ後、以下の値が出力されます：

```bash
terraform output
```

- `website_url`: WebサイトURL
- `cloudfront_distribution_id`: CloudFront配信ID
- `s3_bucket_name`: S3バケット名

## 🗑️ リソース削除

```bash
cd terraform/environments/dev  # または prod
terraform destroy -var-file="terraform.tfvars"
```

## 📝 注意事項

1. **ドメイン**: 事前にRoute 53でホストゾーンを作成
2. **S3バケット**: 本番環境では既存バケット使用を推奨  
3. **SSL証明書**: ACMで自動管理（us-east-1リージョン）
4. **機密情報**: `.tfvars`および`backend.hcl`ファイルはGit管理対象外
5. **バックエンド設定**: S3バケットは事前に作成済みであることを前提

## 🔧 設定ファイル例

### backend.hcl例
```hcl
bucket = "your-terraform-state-bucket"
key    = "hogo-dog-frontend/dev/terraform.tfstate"  # 環境に応じて変更
region = "ap-northeast-1"

# オプション: ステートロック用
# dynamodb_table = "terraform-state-locks"
# encrypt = true
```

### terraform.tfvars例
```hcl
project_name = "hogo-dog"
environment  = "dev"  # 本番環境では "prod"
domain_name  = "dev.hogodog.jp"  # 本番環境では "hogodog.jp"

# Route53
route53_zone_id = "Z1234567890ABC"

# タグ
tags = {
  Project     = "HogoDog"
  Environment = "dev"
  ManagedBy   = "terraform"
}
```