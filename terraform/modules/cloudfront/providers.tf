# ./modules/cloudfront/providers.tf - CloudFrontモジュールのプロバイダ

# S3バケットポリシーを設定するために、メインリージョンのプロバイダも必要
provider "aws" {
  alias = "main_region"
  region = "ap-northeast-1"  # S3バケットと同じリージョン
}