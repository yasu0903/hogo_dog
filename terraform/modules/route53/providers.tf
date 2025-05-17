# ./modules/route53/providers.tf - Route 53モジュールのプロバイダ

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}