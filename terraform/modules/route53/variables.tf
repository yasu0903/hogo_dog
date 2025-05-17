# ./modules/route53/variables.tf - Route 53モジュールの変数

variable "domain_name" {
  description = "メインドメイン名"
  type        = string
}

variable "certificate_validation" {
  description = "ACM証明書の検証オプション"
  type        = list(object({
    domain_name           = string
    resource_record_name  = string
    resource_record_type  = string
    resource_record_value = string
  }))
}

variable "cloudfront_distribution" {
  description = "CloudFront Distributionのオブジェクト"
  type = object({
    domain_name     = string
    hosted_zone_id  = string
  })
}

variable "certificate_arn" {
  description = "ACM証明書ARN"
  type        = string
}