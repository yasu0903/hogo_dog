# ./modules/cloudfront/variables.tf - CloudFrontモジュールの変数

variable "domain_name" {
  description = "メインドメイン名"
  type        = string
}

variable "bucket_name" {
  description = "S3バケット名"
  type        = string
}

variable "bucket_arn" {
  description = "S3バケットARN"
  type        = string
}

variable "bucket_regional_domain_name" {
  description = "S3バケットのリージョナルドメイン名"
  type        = string
}

variable "index_document" {
  description = "インデックスドキュメント"
  type        = string
  default     = "index.html"
}

variable "error_document" {
  description = "エラードキュメント"
  type        = string
  default     = "error.html"
}

variable "certificate_arn" {
  description = "ACM証明書ARN"
  type        = string
}

variable "price_class" {
  description = "CloudFrontの料金クラス"
  type        = string
  default     = "PriceClass_All"
}