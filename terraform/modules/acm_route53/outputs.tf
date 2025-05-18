# ./modules/acm_route53/outputs.tf - 統合モジュールの出力

output "certificate_arn" {
  description = "SSL証明書のARN"
  value       = aws_acm_certificate.cert.arn
}

output "zone_id" {
  description = "Route 53ゾーンID"
  value       = data.aws_route53_zone.zone.zone_id
}

output "nameservers" {
  description = "ホストゾーンのネームサーバー"
  value       = data.aws_route53_zone.zone.name_servers
}