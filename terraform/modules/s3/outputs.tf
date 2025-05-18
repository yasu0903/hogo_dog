# ./modules/s3/outputs.tf - 条件付き出力

output "bucket_name" {
  description = "S3バケット名"
  value       = local.bucket_id
}

output "bucket_arn" {
  description = "S3バケットARN"
  value       = local.bucket_arn
}

output "website_endpoint" {
  description = "S3ウェブサイトエンドポイント"
  value       = aws_s3_bucket_website_configuration.website.website_endpoint
}

output "bucket_regional_domain_name" {
  description = "S3バケットのリージョナルドメイン名"
  value       = local.bucket_regional_domain_name
}