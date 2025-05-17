# ./modules/s3/outputs.tf - S3モジュールの出力

output "bucket_name" {
  description = "S3バケット名"
  value       = aws_s3_bucket.website.id
}

output "bucket_arn" {
  description = "S3バケットARN"
  value       = aws_s3_bucket.website.arn
}

output "website_endpoint" {
  description = "S3ウェブサイトエンドポイント"
  value       = aws_s3_bucket_website_configuration.website.website_endpoint
}

output "bucket_regional_domain_name" {
  description = "S3バケットのリージョナルドメイン名"
  value       = aws_s3_bucket.website.bucket_regional_domain_name
}