# ./modules/s3/main.tf - S3バケットモジュール

resource "aws_s3_bucket" "website" {
  bucket = var.bucket_name

  tags = {
    Name        = "静的ウェブサイトバケット"
    Environment = "production"
  }
}

# バケットの所有者設定
resource "aws_s3_bucket_ownership_controls" "website" {
  bucket = aws_s3_bucket.website.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# パブリックアクセスブロック設定（CloudFrontを使用するため、S3へのパブリックアクセスはブロックします）
resource "aws_s3_bucket_public_access_block" "website" {
  bucket                  = aws_s3_bucket.website.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 静的ウェブサイトホスティングの設定
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = var.index_document
  }

  error_document {
    key = var.error_document
  }
}