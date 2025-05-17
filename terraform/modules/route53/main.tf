# ./modules/route53/main.tf - Route 53モジュール

# 既存のホストゾーンを参照（ドメインは取得済みの前提）
data "aws_route53_zone" "zone" {
  name         = var.domain_name
  private_zone = false
}

# ACM証明書検証用のDNSレコード
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in var.certificate_validation : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.zone.zone_id
}

# 証明書の検証待機（us-east-1リージョンで実行する必要があります）
resource "aws_acm_certificate_validation" "cert" {
  provider                = aws.us_east_1
  certificate_arn         = var.certificate_arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# Apex（ルート）ドメイン用のAレコード
resource "aws_route53_record" "apex" {
  zone_id = data.aws_route53_zone.zone.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = var.cloudfront_distribution.domain_name
    zone_id                = var.cloudfront_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

# www サブドメイン用のAレコード
resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.zone.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.cloudfront_distribution.domain_name
    zone_id                = var.cloudfront_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}