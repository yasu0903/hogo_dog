# ====================
# 本番環境出力値
# ====================

output "website_url" {
  description = "Website URL"
  value       = "https://${var.domain_name}"
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.cloudfront.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.cloudfront.distribution_id
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = module.s3_website.bucket_name
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = module.s3_website.bucket_arn
}

output "certificate_arn" {
  description = "ACM certificate ARN"
  value       = module.acm_route53.certificate_arn
}

output "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = module.acm_route53.zone_id
}

output "deployment_info" {
  description = "Production deployment information"
  value = {
    environment             = "prod"
    website_url            = "https://${var.domain_name}"
    s3_bucket             = module.s3_website.bucket_name
    cloudfront_distribution = module.cloudfront.distribution_id
    domain_name           = var.domain_name
    region                = var.aws_region
  }
  sensitive = false
}