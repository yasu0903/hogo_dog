FROM node:20-slim

WORKDIR /app

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
