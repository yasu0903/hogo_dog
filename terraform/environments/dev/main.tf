# ====================
# 開発環境設定
# ====================

terraform {
  backend "s3" {
    # S3バックエンド設定は環境変数で動的に設定
    # 必要な環境変数:
    # - TF_VAR_backend_bucket      : S3バケット名
    # - TF_VAR_backend_key         : ステートファイルのキー
    # - TF_VAR_backend_region      : S3バケットのリージョン
    # - TF_VAR_backend_dynamodb_table : ロックテーブル（オプション）
  }
}

# 共通設定を読み込み
module "shared" {
  source = "../../shared"
  
  # 基本変数
  project_name = var.project_name
  environment  = "dev"
  aws_region   = var.aws_region
  
  # ドメイン設定
  domain_name      = var.domain_name
  subdomain_prefix = "dev"  # dev.hogodog.jp
  
  # 開発環境用設定
  cloudfront_price_class = "PriceClass_100"  # 最安価格クラス
  s3_create_bucket      = true
  
  # コンテンツ設定
  index_document = var.index_document
  error_document = var.error_document
  index_content  = var.index_content
  error_content  = var.error_content
}

# ====================
# ローカル設定
# ====================

locals {
  environment = "dev"
  domain_name = "dev.${var.domain_name}"  # dev.hogodog.jp
  bucket_name = var.website_bucket_name != null ? var.website_bucket_name : local.domain_name
}

# ====================
# S3 Website Bucket
# ====================

module "s3_website" {
  source = "../../modules/s3"

  bucket_name    = local.bucket_name
  index_document = var.index_document
  error_document = var.error_document
  create_bucket  = true  # 開発環境は常に作成

  providers = {
    aws = aws.main_region
  }

  tags = module.shared.common_tags
}

# ====================
# ACM Certificate
# ====================

module "acm_route53" {
  source = "../../modules/acm_route53"
  providers = {
    aws = aws.us_east_1
  }

  domain_name = local.domain_name
  tags        = module.shared.common_tags
}

# ====================
# CloudFront Distribution
# ====================

module "cloudfront" {
  source = "../../modules/cloudfront"
  providers = {
    aws           = aws.us_east_1
    aws.main_region = aws.main_region
  }

  domain_name                 = local.domain_name
  bucket_regional_domain_name = module.s3_website.bucket_regional_domain_name
  bucket_name                 = module.s3_website.bucket_name
  bucket_arn                  = module.s3_website.bucket_arn
  index_document              = var.index_document
  error_document              = var.error_document
  certificate_arn             = module.acm_route53.certificate_arn
  price_class                 = "PriceClass_100"  # 開発環境は最安
  
  tags = module.shared.common_tags
  
  depends_on = [module.acm_route53]
}

# ====================
# Route 53 Records
# ====================

module "route53_records" {
  source = "../../modules/route53_records"
  providers = {
    aws = aws.us_east_1
  }

  domain_name               = local.domain_name
  zone_id                   = module.acm_route53.zone_id
  cloudfront_domain_name    = module.cloudfront.domain_name
  cloudfront_hosted_zone_id = module.cloudfront.hosted_zone_id
  
  tags = module.shared.common_tags
  
  depends_on = [module.cloudfront]
}

# ====================
# Sample Content (Development)
# ====================

module "sample_content" {
  source = "../../modules/content"

  bucket_name   = module.s3_website.bucket_name
  domain_name   = local.domain_name
  index_content = var.index_content != null ? var.index_content : local.dev_index_content
  error_content = var.error_content != null ? var.error_content : local.dev_error_content
  
  tags = module.shared.common_tags
  
  depends_on = [module.s3_website]
}

# ====================
# 開発環境用デフォルトコンテンツ
# ====================

locals {
  dev_index_content = <<-EOF
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HogoDog - 開発環境</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2c5aa0; text-align: center; }
            .badge { background: #ff6b35; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; display: inline-block; margin-bottom: 20px; }
            .info { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="badge">開発環境</div>
            <h1>🐕 HogoDog Development</h1>
            <div class="info">
                <p><strong>開発環境へようこそ！</strong></p>
                <p>このページは開発環境用のプレースホルダーです。</p>
                <p>実際のReactアプリケーションをビルドしてデプロイしてください。</p>
            </div>
            <div class="footer">
                <p>Domain: ${local.domain_name}</p>
                <p>Environment: Development</p>
                <p>Managed by Terraform</p>
            </div>
        </div>
    </body>
    </html>
  EOF

  dev_error_content = <<-EOF
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error - HogoDog Development</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
            h1 { color: #e74c3c; }
            .badge { background: #ff6b35; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; display: inline-block; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="badge">開発環境</div>
            <h1>🚫 ページが見つかりません</h1>
            <p>申し訳ございませんが、お探しのページは見つかりませんでした。</p>
            <p><a href="/">トップページに戻る</a></p>
        </div>
    </body>
    </html>
  EOF
}