# ./modules/route53_records/variables.tf - Route 53レコードモジュールの変数

variable "domain_name" {
  description = "メインドメイン名"
  type        = string
}

variable "zone_id" {
  description = "Route 53ゾーンID"
  type        = string
}

variable "cloudfront_domain_name" {
  description = "CloudFrontのドメイン名"
  type        = string
}

variable "cloudfront_hosted_zone_id" {
  description = "CloudFrontのホストゾーンID"
  type        = string
}