# ====================
# ローカル変数
# ====================

locals {
  # 環境別の完全なドメイン名
  full_domain_name = var.subdomain_prefix != null ? "${var.subdomain_prefix}.${var.domain_name}" : var.domain_name
  
  # S3バケット名の決定
  bucket_name = var.website_bucket_name != null ? var.website_bucket_name : local.full_domain_name
  
  # 共通タグ
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
  
  # 環境別設定
  environment_config = {
    dev = {
      cloudfront_price_class = "PriceClass_100"
      s3_create_bucket      = true
      enable_logging        = false
    }
    prod = {
      cloudfront_price_class = var.cloudfront_price_class
      s3_create_bucket      = var.s3_create_bucket
      enable_logging        = true
    }
  }
  
  # 現在の環境設定
  current_config = local.environment_config[var.environment]
}