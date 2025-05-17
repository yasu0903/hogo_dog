# main.tf - モジュール依存関係の修正版

provider "aws" {
  region = var.aws_region
}

# 米国東部リージョン用のプロバイダ（ACM証明書とCloudFrontはus-east-1に必要）
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# S3バケットポリシー用の明示的なエイリアス (メインリージョン用)
provider "aws" {
  alias  = "main_region"
  region = var.aws_region
}

module "s3_website" {
  source = "./modules/s3"

  bucket_name    = local.bucket_name
  index_document = var.index_document
  error_document = var.error_document
  create_bucket  = var.s3_create_bucket

}

# ACMモジュール - 証明書のみを管理
module "acm_route53" {
  source = "./modules/acm_route53"
  providers = {
    aws = aws.us_east_1
  }

  domain_name = var.domain_name
}

# CloudFrontモジュール
module "cloudfront" {
  source = "./modules/cloudfront"
  providers = {
    aws           = aws.us_east_1
    aws.main_region = aws.main_region
  }

  domain_name                 = var.domain_name
  bucket_regional_domain_name = module.s3_website.bucket_regional_domain_name
  bucket_name                 = module.s3_website.bucket_name
  bucket_arn                  = module.s3_website.bucket_arn
  index_document              = var.index_document
  error_document              = var.error_document
  certificate_arn             = module.acm_route53.certificate_arn
  price_class                 = var.cloudfront_price_class
  
  # CloudFrontモジュールはACM証明書の検証が完了するのを待つ必要がある
  depends_on = [module.acm_route53]
}

# CloudFrontが作成された後でのみRoute 53レコードを作成
module "route53_records" {
  source = "./modules/route53_records"
  providers = {
    aws = aws.us_east_1
  }

  domain_name               = var.domain_name
  zone_id                   = module.acm_route53.zone_id
  cloudfront_domain_name    = module.cloudfront.domain_name
  cloudfront_hosted_zone_id = module.cloudfront.hosted_zone_id
  
  # CloudFrontが完全に作成されるのを待つ
  depends_on = [module.cloudfront]
}

# サンプルコンテンツのアップロード（オプション）
module "sample_content" {
  source = "./modules/content"

  bucket_name   = module.s3_website.bucket_name
  domain_name   = var.domain_name
  index_content = var.index_content
  error_content = var.error_content
}

locals {
  bucket_name = var.website_bucket_name != null ? var.website_bucket_name : var.domain_name
}