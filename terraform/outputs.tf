# outputs.tf - 出力変数

output "website_bucket_name" {
  description = "ウェブサイトのS3バケット名"
  value       = module.s3_website.bucket_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront ドメイン名"
  value       = module.cloudfront.domain_name
}

output "website_url" {
  description = "ウェブサイトURL"
  value       = "https://${var.domain_name}"
}

output "alternate_website_url" {
  description = "代替ウェブサイトURL (www)"
  value       = "https://www.${var.domain_name}"
}

output "nameservers" {
  description = "Route 53ゾーンのネームサーバー（ドメインレジストラで設定する必要がある場合）"
  value       = module.route53.nameservers
}