# ====================
# 本番環境設定
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
  environment  = "prod"
  aws_region   = var.aws_region
  
  # ドメイン設定
  domain_name      = var.domain_name
  subdomain_prefix = null  # 本番は hogodog.jp
  
  # CloudFront設定
  cloudfront_price_class = var.cloudfront_price_class
  s3_create_bucket      = var.s3_create_bucket
  
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
  environment = "prod"
  domain_name = var.domain_name  # hogodog.jp
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
  create_bucket  = var.s3_create_bucket

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
  price_class                 = var.cloudfront_price_class
  
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
# Sample Content (Optional)
# ====================

module "sample_content" {
  source = "../../modules/content"

  bucket_name   = module.s3_website.bucket_name
  domain_name   = local.domain_name
  index_content = var.index_content
  error_content = var.error_content
  
  tags = module.shared.common_tags
  
  depends_on = [module.s3_website]
}