# ====================
# 開発環境変数
# ====================

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "hogo-dog"
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
  description = "Base domain name (e.g., hogodog.jp -> dev.hogodog.jp)"
  type        = string
}

# ====================
# S3設定
# ====================

variable "website_bucket_name" {
  description = "S3 bucket name (if null, dev.domain_name will be used)"
  type        = string
  default     = null
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
  description = "Index page HTML content (optional, null to use development default)"
  type        = string
  default     = null
}

variable "error_content" {
  description = "Error page HTML content (optional, null to use development default)"
  type        = string
  default     = null
}