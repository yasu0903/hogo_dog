# variables.tf - 共通変数定義

variable "aws_region" {
  description = "AWSのメインリージョン"
  type        = string
  default     = "ap-northeast-1"  # 東京リージョン
}

variable "domain_name" {
  description = "メインドメイン名（例: example.com）"
  type        = string
}

variable "website_bucket_name" {
  description = "S3バケット名（nullの場合、domain_nameが使用されます）"
  type        = string
  default     = null
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

variable "index_content" {
  description = "インデックスページのHTMLコンテンツ（オプション）"
  type        = string
  default     = null  # nullの場合、モジュール内のデフォルトHTMLが使用されます
}

variable "error_content" {
  description = "エラーページのHTMLコンテンツ（オプション）"
  type        = string
  default     = null  # nullの場合、モジュール内のデフォルトHTMLが使用されます
}

variable "cloudfront_price_class" {
  description = "CloudFrontの料金クラス（PriceClass_All, PriceClass_200, PriceClass_100）"
  type        = string
  default     = "PriceClass_All"
}