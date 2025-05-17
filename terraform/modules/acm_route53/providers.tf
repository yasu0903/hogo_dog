
# ./modules/acm_route53/providers.tf - ACM/Route53モジュール用のプロバイダー設定
terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      configuration_aliases = []  # このモジュールは外部から渡されたデフォルトのAWSプロバイダーのみを使用
    }
  }
}