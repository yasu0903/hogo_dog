FROM node:20-alpine

WORKDIR /app

# 必要なパッケージをインストール
RUN apk add --no-cache libc6-compat

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# ソースコードをコピー
COPY . .

# ホットリロードのために必要
ENV CHOKIDAR_USEPOLLING=true

# コンテナ内でViteのデフォルトポートを公開
EXPOSE 5173

# 開発モードでViteを起動
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
