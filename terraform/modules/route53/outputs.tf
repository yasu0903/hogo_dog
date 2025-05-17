# ./modules/route53/outputs.tf - Route 53モジュールの出力

output "zone_id" {
  description = "Route 53ゾーンID"
  value       = data.aws_route53_zone.zone.zone_id
}

output "nameservers" {
  description = "ホストゾーンのネームサーバー"
  value       = data.aws_route53_zone.zone.name_servers
}

output "certificate_validation" {
  description = "証明書検証のステータス"
  value       = aws_acm_certificate_validation.cert.id
}