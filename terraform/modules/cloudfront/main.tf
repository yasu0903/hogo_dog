# ./modules/cloudfront/main.tf - CloudFrontモジュール

resource "aws_cloudfront_origin_access_control" "website" {
  name                              = "${var.bucket_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = var.index_document
  price_class         = var.price_class
  wait_for_deployment = false

  aliases = [var.domain_name, "www.${var.domain_name}"]

  origin {
    domain_name              = var.bucket_regional_domain_name
    origin_id                = "S3-${var.bucket_name}"
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.bucket_name}"

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    min_ttl     = 0
    default_ttl = 3600  # 1時間
    max_ttl     = 86400 # 24時間

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  # SPAのため、S3にオブジェクトが存在しないパスはindex.htmlを返し、
  # クライアント側（React Router）でルーティングする。
  # OAC構成ではListBucket権限がなく、存在しないキーはS3が403を返すため403も対象にする
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/${var.index_document}"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/${var.index_document}"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name        = "${var.domain_name} CloudFront Distribution"
    Environment = "production"
  }
}

# バケットポリシー（CloudFrontからのみアクセスを許可）
data "aws_iam_policy_document" "s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${var.bucket_arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.website.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "website" {
  provider = aws.main_region
  bucket   = var.bucket_name
  policy   = data.aws_iam_policy_document.s3_policy.json
}