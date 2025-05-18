# ./modules/route53_records/providers.tf - Route53レコードモジュール用のプロバイダー設定
terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      configuration_aliases = []  # このモジュールは外部から渡されたデフォルトのAWSプロバイダーのみを使用
    }
  }
}