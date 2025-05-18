# ./modules/acm_route53/variables.tf - 変数を修正

variable "domain_name" {
  description = "メインドメイン名"
  type        = string
}

# CloudFrontに関連する変数を削除