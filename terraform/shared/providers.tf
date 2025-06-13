terraform {
  required_version = ">= 1.6.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# メインリージョン用プロバイダ
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

# us-east-1用プロバイダ（CloudFront、ACM証明書用）
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = local.common_tags
  }
}

# メインリージョン用の明示的エイリアス（S3バケットポリシー用）
provider "aws" {
  alias  = "main_region"
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}