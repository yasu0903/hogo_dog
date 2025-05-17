# ./modules/content/outputs.tf - コンテンツモジュールの出力

output "index_etag" {
  description = "インデックスファイルのETag"
  value       = aws_s3_object.index.etag
}

output "error_etag" {
  description = "エラーファイルのETag"
  value       = aws_s3_object.error.etag
}