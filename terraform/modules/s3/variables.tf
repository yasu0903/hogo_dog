# ./modules/s3/variables.tf - S3モジュールの変数

variable "bucket_name" {
  description = "S3バケット名"
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

variable "create_bucket" {
  description = "バケットを作成するかどうか（falseの場合、既存バケットを使用）"
  type        = bool
  default     = true
}