# S3 静的ウェブサイトホスティング Terraformプロジェクト

このTerraformプロジェクトは、AWSを使用して静的ウェブサイトを構築・デプロイするための完全な環境を提供します。S3、CloudFront、ACM証明書、Route 53を組み合わせて、セキュアかつ高速なウェブサイトホスティングを実現します。

## 機能

- **S3バケット** - 静的ウェブサイトコンテンツのホスティング
- **CloudFront** - CDNによるグローバルな配信とHTTPS対応
- **ACM証明書** - SSL/TLS証明書の自動発行と管理
- **Route 53** - ドメインのDNS設定とルーティング
- **柔軟な設定** - 既存のリソースや新規リソースの両対応

## 前提条件

- AWS CLIがインストールされ、設定済み
- Terraformがインストール済み (v1.0.0以上を推奨)
- 取得済みのドメイン名
- Route 53でホストされたゾーンが作成済み

## プロジェクト構造

```
.
├── README.md                    # プロジェクト説明書
├── main.tf                      # メインのTerraformファイル
├── variables.tf                 # 変数定義
├── outputs.tf                   # 出力定義
├── terraform.tfvars             # 変数値の設定ファイル (各自でカスタマイズ)
├── backend.tf                   # リモート状態管理設定 (オプショナル)
├── modules/
│   ├── s3/                      # S3バケットモジュール 
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── acm_route53/             # ACM証明書モジュール
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── cloudfront/              # CloudFrontモジュール
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── providers.tf
│   │   └── outputs.tf
│   ├── route53_records/         # Route 53レコードモジュール
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── content/                 # サンプルコンテンツモジュール（オプショナル）
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
```

## 使用方法

### 1. 設定ファイルのカスタマイズ

`terraform.tfvars` ファイルを作成し、必要な変数を設定します：

```hcl
# 基本設定
domain_name = "あなたのドメイン.com"  # 必須: 取得済みドメイン名
aws_region  = "ap-northeast-1"       # オプショナル: デフォルトは東京リージョン

# S3バケット設定
website_bucket_name = "example-website"  # オプショナル: 指定がなければドメイン名が使用される
s3_create_bucket    = true               # オプショナル: falseの場合は既存バケットを使用

# CloudFront設定
cloudfront_price_class = "PriceClass_100"  # オプショナル: 100(北米・欧州), 200(+アジア), All(全世界)

# コンテンツ設定
index_document = "index.html"   # オプショナル: インデックスドキュメント
error_document = "error.html"   # オプショナル: エラードキュメント
```

### 2. デプロイメント

以下のコマンドを実行して、インフラをデプロイします：

```bash
# 初期化
terraform init

# 実行計画の確認
terraform plan

# デプロイ実行
terraform apply
```

### 3. 既存リソースの活用

既存のS3バケットを使用したい場合は、`terraform.tfvars`に以下を設定します：

```hcl
s3_create_bucket = false          # バケットを新規作成せず、既存のものを使用
website_bucket_name = "既存のバケット名"  # 既存のS3バケット名
```

### 4. 削除

インフラストラクチャを削除する場合は、以下のコマンドを実行します：

```bash
terraform destroy
```

**注意**: この操作は関連するすべてのリソースを削除します。本番環境での実行には十分注意してください。

## 実行時間の目安

- **S3バケット作成**: 数秒〜1分
- **ACM証明書作成と検証**: 5〜15分
- **CloudFront配信の作成**: 10〜30分
- **Route 53レコードの設定**: 数秒〜数分
- **CloudFront削除**: 15〜40分

## 必要なIAMポリシー

このプロジェクトを実行するIAMユーザーには、以下の権限が必要です：

- S3へのフルアクセス
  - バケット作成/削除/設定、オブジェクト管理
- CloudFrontへのフルアクセス
  - ディストリビューション作成/削除/更新
- ACMへのフルアクセス
  - 証明書作成/検証/管理
- Route 53への権限
  - ホストゾーン読み取り、レコード作成/削除

## tfstate管理

状態ファイル(tfstate)は以下のいずれかの方法で管理することを推奨します：

1. **Terraform Cloud**: 個人無料プランで十分（推奨）
2. **S3 + DynamoDB**: リモート状態管理を自己管理する場合

Terraform Cloudを使用する場合は、以下のように`terraform.tf`ファイルを作成します：

```hcl
terraform {
  cloud {
    organization = "あなたの組織名"
    workspaces {
      name = "静的ウェブサイト"
    }
  }
}
```

## カスタマイズ

### コンテンツのデプロイ

デフォルトでは基本的なサンプルHTMLファイルがデプロイされます。実際のウェブサイトファイルをデプロイするには：

1. content モジュールのサンプルファイル生成を無効化
2. 別のデプロイ方法（CI/CD、AWS CLI、S3 コンソールなど）でコンテンツをアップロード

### 追加機能

このプロジェクトは拡張が可能です。以下の機能を必要に応じて追加できます：

- AWS WAF によるセキュリティ強化
- Lambda@Edge による高度なルーティングやコンテンツ処理
- CloudWatch によるモニタリングとアラート設定
- CI/CD パイプラインによるコンテンツ自動デプロイ

## トラブルシューティング

### よくある問題

1. **S3バケットが既に存在する**:
   - `s3_create_bucket = false` を設定して既存バケットを使用

2. **ACM証明書の検証タイムアウト**:
   - DNSレコードが正しく作成されているか確認
   - ACMコンソールで手動検証を試行

3. **CloudFrontデプロイに時間がかかる**:
   - 通常の動作です。最大30分程度かかることがあります

4. **Route 53レコードで「no hosted zone found」エラー**:
   - 正しいドメイン名でホストゾーンが作成されていることを確認

5. **PermissionDenied エラー**:
   - IAMユーザーに必要な権限が付与されているか確認

## ライセンス

このプロジェクトは MIT ライセンスの下で提供されています。

## 貢献

問題報告や機能提案は GitHub Issues を通じてお願いします。プルリクエストも歓迎します。
