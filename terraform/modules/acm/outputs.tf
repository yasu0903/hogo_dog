# ./modules/acm/outputs.tf - ACMモジュールの出力

output "certificate_arn" {
  description = "SSL証明書のARN"
  value       = aws_acm_certificate.cert.arn
}

output "certificate_validation_options" {
  description = "証明書の検証オプション"
  value       = aws_acm_certificate.cert.domain_validation_options
}