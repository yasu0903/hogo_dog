# ./modules/route53_records/outputs.tf - Route 53レコードモジュールの出力

output "apex_record_name" {
  description = "Apexドメインのレコード名"
  value       = aws_route53_record.apex.name
}

output "www_record_name" {
  description = "WWWサブドメインのレコード名"
  value       = aws_route53_record.www.name
}