# ./modules/cloudfront/outputs.tf - CloudFrontモジュールの出力

output "distribution_id" {
  description = "CloudFront DistributionのID"
  value       = aws_cloudfront_distribution.website.id
}

output "distribution" {
  description = "CloudFront Distributionのオブジェクト"
  value       = aws_cloudfront_distribution.website
}

output "domain_name" {
  description = "CloudFrontのドメイン名"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "hosted_zone_id" {
  description = "CloudFrontのHosted Zone ID"
  value       = aws_cloudfront_distribution.website.hosted_zone_id
}