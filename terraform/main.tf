# main.tf - メインエントリーポイント

provider "aws" {
  region = var.aws_region
}

# 米国東部リージョン用のプロバイダ（ACM証明書はCloudFrontで使用する場合、us-east-1に作成する必要があります）
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

module "s3_website" {
  source = "./modules/s3"

  bucket_name    = local.bucket_name
  index_document = var.index_document
  error_document = var.error_document
}

module "acm" {
  source = "./modules/acm"
  providers = {
    aws = aws.us_east_1
  }

  domain_name = var.domain_name
}

module "cloudfront" {
  source = "./modules/cloudfront"
  providers = {
    aws = aws.us_east_1
  }

  domain_name         = var.domain_name
  bucket_regional_domain_name = module.s3_website.bucket_regional_domain_name
  bucket_name         = module.s3_website.bucket_name
  bucket_arn          = module.s3_website.bucket_arn
  index_document      = var.index_document
  error_document      = var.error_document
  certificate_arn     = module.acm.certificate_arn
}

module "route53" {
  source = "./modules/route53"

  domain_name               = var.domain_name
  certificate_validation    = module.acm.certificate_validation_options
  cloudfront_distribution   = module.cloudfront.distribution
  certificate_arn           = module.acm.certificate_arn
}

locals {
  bucket_name = var.website_bucket_name != null ? var.website_bucket_name : var.domain_name
}

# サンプルコンテンツのアップロード（オプション）
module "sample_content" {
  source = "./modules/content"

  bucket_name   = module.s3_website.bucket_name
  domain_name   = var.domain_name
  index_content = var.index_content
  error_content = var.error_content
}

# CircleCIなどのCI/CDツールを使用する場合は、このモジュールは無効化し、
# 代わりにCI/CDパイプラインでコンテンツをデプロイすることを推奨