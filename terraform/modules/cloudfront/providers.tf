# ./modules/cloudfront/providers.tf - これを削除または以下のように変更します
terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      configuration_aliases = [aws.main_region]
    }
  }
}