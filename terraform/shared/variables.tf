# ====================
# 共通変数定義
# ====================

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "hogo-dog"
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

# ====================
# ドメイン設定
# ====================

variable "domain_name" {
  description = "Main domain name (e.g., example.com)"
  type        = string
}

variable "subdomain_prefix" {
  description = "Subdomain prefix for environment (e.g., 'dev' for dev.example.com)"
  type        = string
  default     = null
}

# ====================
# S3設定
# ====================

variable "website_bucket_name" {
  description = "S3 bucket name (if null, domain_name will be used)"
  type        = string
  default     = null
}

variable "s3_create_bucket" {
  description = "Whether to create S3 bucket (false to use existing bucket)"
  type        = bool
  default     = true
}

# ====================
# CloudFront設定
# ====================

variable "cloudfront_price_class" {
  description = "CloudFront price class (PriceClass_All, PriceClass_200, PriceClass_100)"
  type        = string
  default     = "PriceClass_100"
}

# ====================
# コンテンツ設定
# ====================

variable "index_document" {
  description = "Index document"
  type        = string
  default     = "index.html"
}

variable "error_document" {
  description = "Error document"
  type        = string
  default     = "error.html"
}

variable "index_content" {
  description = "Index page HTML content (optional)"
  type        = string
  default     = null
}

variable "error_content" {
  description = "Error page HTML content (optional)"
  type        = string
  default     = null
}