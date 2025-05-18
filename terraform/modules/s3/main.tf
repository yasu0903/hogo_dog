# ./modules/s3/main.tf - S3バケットモジュール

# 既存バケットの参照（バケットを作成しない場合）
data "aws_s3_bucket" "existing" {
  count  = var.create_bucket ? 0 : 1
  bucket = var.bucket_name
}

# 新規バケットの作成（create_bucket = true の場合）
resource "aws_s3_bucket" "website" {
  count  = var.create_bucket ? 1 : 0
  bucket = var.bucket_name

  tags = {
    Name        = "静的ウェブサイトバケット"
    Environment = "production"
  }
}
# バケットIDとARNのローカル変数
locals {
  bucket_id  = var.create_bucket ? aws_s3_bucket.website[0].id : data.aws_s3_bucket.existing[0].id
  bucket_arn = var.create_bucket ? aws_s3_bucket.website[0].arn : data.aws_s3_bucket.existing[0].arn
  bucket_regional_domain_name = var.create_bucket ? aws_s3_bucket.website[0].bucket_regional_domain_name : data.aws_s3_bucket.existing[0].bucket_regional_domain_name
}

# バケットの所有者設定
resource "aws_s3_bucket_ownership_controls" "website" {
  bucket = local.bucket_id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# パブリックアクセスブロック設定
resource "aws_s3_bucket_public_access_block" "website" {
  bucket                  = local.bucket_id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 静的ウェブサイトホスティングの設定
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = local.bucket_id

  index_document {
    suffix = var.index_document
  }

  error_document {
    key = var.error_document
  }
}