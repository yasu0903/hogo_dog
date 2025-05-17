# Terraformプロジェクト構造とモジュールの説明

このTerraformプロジェクトは、AWS S3静的ウェブサイトホスティング、CloudFront、ACM証明書、およびRoute 53を使用して、セキュアで高性能なウェブホスティング環境を構築します。  

## プロジェクト構造

```
.
├── main.tf                 # メインのTerraformファイル
├── variables.tf            # 変数定義
├── outputs.tf              # 出力定義
├── terraform.tfvars        # 設定値
├── modules/
│   ├── s3/                 # S3バケットモジュール
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── acm/                # ACM証明書モジュール
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── cloudfront/         # CloudFrontモジュール
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── providers.tf
│   │   └── outputs.tf
│   ├── route53/            # Route 53モジュール
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── providers.tf
│   │   └── outputs.tf
│   └── content/            # サンプルコンテンツモジュール
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
```

## モジュール説明

1. **S3モジュール**
   - 静的ウェブサイトホスティング用のS3バケットを作成
   - ウェブサイト設定（インデックスとエラードキュメント）
   - パブリックアクセスブロック設定

2. **ACMモジュール**
   - SSL/TLS証明書の作成
   - 証明書のドメイン検証設定

3. **CloudFrontモジュール**
   - CloudFront Distributionの作成
   - S3へのOrigin Access Control設定
   - キャッシュポリシーの設定
   - カスタムエラーページの設定
   - S3バケットポリシーの設定

4. **Route 53モジュール**
   - 既存のホストゾーンの使用
   - SSL証明書の検証レコード
   - ApexドメインとWWWサブドメインのAレコード

5. **コンテンツモジュール**
   - サンプルのindex.htmlとerror.html
   - カスタムコンテンツのサポート

## 使用方法

1. `terraform.tfvars`ファイルをカスタマイズ（少なくともdomain_nameを設定）
2. 次のコマンドを実行：
   ```
   terraform init
   terraform plan
   terraform apply
   ```

3. デプロイ後、次のURLでアクセス可能：
   - https://example.com
   - https://www.example.com

## 注意点

- 既存のRoute 53ホストゾーンが必要です
- ACM証明書はus-east-1リージョンに作成されます（CloudFrontの要件）
- CloudFrontのデプロイには時間がかかることがあります（20〜30分）
- 実際のコンテンツをデプロイする場合は、CI/CDパイプラインの使用を推奨
