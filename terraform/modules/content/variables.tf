# ./modules/content/variables.tf - コンテンツモジュールの変数

variable "domain_name" {
  description = "ウェブサイトのドメイン名"
  type        = string
}

variable "bucket_name" {
  description = "S3バケット名"
  type        = string
}

variable "index_content" {
  description = "インデックスページのHTMLコンテンツ（nullの場合、デフォルトHTMLが使用されます）"
  type        = string
  default     = null
}

variable "error_content" {
  description = "エラーページのHTMLコンテンツ（nullの場合、デフォルトHTMLが使用されます）"
  type        = string
  default     = null
}