# ./modules/content/main.tf - サンプルコンテンツモジュール

locals {
  default_index_content = <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>${var.domain_name}</title>
    <meta charset="UTF-8">
</head>
<body>
    <h1>ようこそ ${var.domain_name} へ!</h1>
</body>
</html>
EOF

  default_error_content = <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>エラー - ${var.domain_name}</title>
    <meta charset="UTF-8">
</head>
<body>
    <h1>404 - ページが見つかりません</h1>
    <p>お探しのページは存在しないか、移動された可能性があります。</p>
    <p><a href="/">ホームページに戻る</a></p>
</body>
</html>
EOF

  index_content = var.index_content != null ? var.index_content : local.default_index_content
  error_content = var.error_content != null ? var.error_content : local.default_error_content
}

resource "aws_s3_object" "index" {
  bucket       = var.bucket_name
  key          = "index.html"
  content      = local.index_content
  content_type = "text/html"
  etag         = md5(local.index_content)
}

resource "aws_s3_object" "error" {
  bucket       = var.bucket_name
  key          = "error.html"
  content      = local.error_content
  content_type = "text/html"
  etag         = md5(local.error_content)
}