# バックエンドAPI連携完了引き継ぎ書

## 概要

**重要**: hogo_dog_backendの調査結果、**user-organization管理システムは既に完全に実装済み**です！

フロントエンドの管理画面は実装済みバックエンドAPIとの連携のみが必要です。
新たなバックエンド実装は不要で、デプロイ設定とフロントエンド統合が残りの作業です。

## 現在実装済みのAPIエンドポイント

以下のエンドポイントは既に実装済みです：

```
GET    /api/v1/organizations           # 運営団体一覧
GET    /api/v1/organizations/{id}      # 運営団体詳細
GET    /api/v1/animals                 # 動物一覧
GET    /api/v1/animals/{id}            # 動物詳細
GET    /api/v1/animals/{id}/photos     # 動物写真一覧
POST   /api/v1/applications            # 里親申請作成
POST   /api/v1/users                   # ユーザー登録
GET    /api/v1/users/{id}              # ユーザー詳細
```

## ✅ 既に実装済みの管理API（hogo_dog_backend）

### 1. ユーザー・組織権限管理API（完全実装済み）

#### 1.1 組織メンバー管理

**メンバー一覧取得**
```
✅ GET /api/v1/user-organizations/list
```
- **実装状況**: ✅ **完全実装済み**
- **目的**: 組織のメンバー一覧を取得
- **クエリパラメータ**:
  - `organization_id` (required): 組織ID
  - `user_id` (optional): 特定ユーザーの組織権限一覧取得時
  - `status` (optional): `active`, `pending`, `inactive`, `suspended`
  - `organization_role` (optional): `member`, `admin`, `superuser`
  - `page`, `limit`, `offset`: ページネーション対応
- **レスポンス例**:
```json
[
  {
    "id": "uo-123",
    "user_id": "user-456",
    "organization_id": "org-789",
    "organization_role": "admin",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "user": {
      "id": "user-456",
      "name": "田中太郎",
      "email": "tanaka@example.com"
    }
  }
]
```

**メンバー追加**
```
POST /api/v1/user-organizations/create
```
- **目的**: 組織に新しいメンバーを直接追加
- **リクエストボディ**:
```json
{
  "user_id": "user-456",
  "organization_id": "org-789",
  "organization_role": "member"
}
```
- **レスポンス**: 作成されたuser-organizationオブジェクト

**メンバー権限更新**
```
PUT /api/v1/user-organizations/update/{user_organization_id}
```
- **目的**: メンバーの権限レベルを変更
- **リクエストボディ**:
```json
{
  "organization_role": "admin"
}
```

**メンバー削除**
```
DELETE /api/v1/user-organizations/delete/{user_organization_id}
```
- **目的**: 組織からメンバーを削除

#### 1.2 招待機能

**招待メール送信**
```
POST /api/v1/user-organizations/invite
```
- **目的**: メールで組織への招待を送信
- **リクエストボディ**:
```json
{
  "user_id": "user-456",
  "user_email": "invitee@example.com",
  "organization_id": "org-789",
  "organization_role": "member",
  "invite_type": "email"
}
```
- **機能**: 
  - 招待レコードをpendingステータスで作成
  - 招待メールを送信（有効期限7日間）
  - 招待URLにトークンを含める

**保留中招待一覧**
```
GET /api/v1/user-organizations/pending
```
- **クエリパラメータ**:
  - `organization_id` (required): 組織ID
- **レスポンス**: pendingステータスの招待一覧

**招待取り消し**
```
DELETE /api/v1/user-organizations/invite/{invite_id}
```
- **目的**: 送信済み招待を取り消し

#### 1.3 ユーザー検索機能

**組織内ユーザー検索**
```
GET /api/v1/organizations/{organization_id}/users/search
```
- **目的**: 組織管理者が既存ユーザーを検索してメンバーに追加
- **クエリパラメータ**:
  - `q` (required): 検索クエリ（名前またはメールアドレス）
- **レスポンス**: 検索にマッチするユーザー一覧
- **注意**: 既に組織メンバーのユーザーは除外

**メールアドレスでユーザー検索**
```
GET /api/v1/users/search
```
- **クエリパラメータ**:
  - `email` (required): メールアドレス
- **レスポンス**: マッチするユーザーオブジェクト（見つからない場合は404）

### 2. システムロール管理API

#### 2.1 システムロール管理

**ユーザーのシステムロール取得**
```
GET /api/v1/user-roles/get/{user_id}
```

**システムロール一覧**
```
GET /api/v1/user-roles/list
```

**システムロール作成**
```
POST /api/v1/user-roles/create
```

**システムロール更新**
```
PUT /api/v1/user-roles/update/{user_role_id}
```

**システムロール削除**
```
DELETE /api/v1/user-roles/delete/{user_role_id}
```

## データベース設計

### 必要なテーブル

#### user_organizations テーブル
```sql
id                 VARCHAR(36) PRIMARY KEY
user_id           VARCHAR(36) NOT NULL
organization_id   VARCHAR(36) NOT NULL  
organization_role ENUM('member', 'admin', 'superuser') NOT NULL
status            ENUM('active', 'pending', 'inactive', 'suspended') DEFAULT 'active'
created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

UNIQUE KEY unique_user_org (user_id, organization_id)
INDEX idx_organization_id (organization_id)
INDEX idx_user_id (user_id)
INDEX idx_status (status)
```

#### organization_invites テーブル（招待機能用）
```sql
id              VARCHAR(36) PRIMARY KEY
user_id         VARCHAR(36) NOT NULL
organization_id VARCHAR(36) NOT NULL
organization_role ENUM('member', 'admin', 'superuser') NOT NULL
invite_token    VARCHAR(255) UNIQUE NOT NULL
status          ENUM('pending', 'accepted', 'expired', 'cancelled') DEFAULT 'pending'
expires_at      TIMESTAMP NOT NULL
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

INDEX idx_organization_id (organization_id)
INDEX idx_user_id (user_id)
INDEX idx_invite_token (invite_token)
INDEX idx_status (status)
INDEX idx_expires_at (expires_at)
```

#### user_roles テーブル（システムロール用）
```sql
id          VARCHAR(36) PRIMARY KEY
user_id     VARCHAR(36) UNIQUE NOT NULL
system_role ENUM('viewer', 'moderator', 'admin') DEFAULT 'viewer'
created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

INDEX idx_user_id (user_id)
INDEX idx_system_role (system_role)
```

## 権限レベル定義

### 組織権限（階層構造）
1. **member** (レベル1): 基本的な動物管理機能
2. **admin** (レベル2): メンバー管理 + 組織設定
3. **superuser** (レベル3): 完全な組織管理権限

### システム権限（階層構造）
1. **viewer** (レベル1): 読み取り専用
2. **moderator** (レベル2): 組織管理
3. **admin** (レベル3): システム管理

### 権限制御ルール
- **superuser**: 全てのメンバーを管理可能
- **admin**: memberのみ管理可能、他のadmin/superuserは管理不可
- **member**: 管理権限なし

## メール機能

### 招待メール
- **件名**: `[HogoDog] ${organization_name}への招待`
- **内容**: 
  - 招待した組織名
  - 権限レベル
  - 招待受諾URL（トークン付き）
  - 有効期限（7日間）
- **テンプレート**: HTMLメールで作成推奨

### 実装推奨事項

#### 1. セキュリティ
- **JWT認証**: 既存の認証システムを利用
- **RBAC**: Role-Based Access Control実装
- **入力検証**: 全てのAPIでバリデーション実施
- **レート制限**: 招待送信にレート制限を設定

#### 2. エラーハンドリング
- **404**: ユーザー/組織が見つからない場合
- **403**: 権限不足の場合
- **409**: 重複する組織メンバーシップ
- **422**: バリデーションエラー

#### 3. ログ
- **監査ログ**: 権限変更、メンバー追加/削除
- **セキュリティログ**: 不正アクセス試行
- **操作ログ**: 管理者操作の記録

#### 4. パフォーマンス
- **インデックス**: 検索性能のためのDB最適化
- **キャッシュ**: 権限情報のキャッシュ戦略
- **ページネーション**: 大量データの効率的な取得

## 実装優先度

### High Priority（必須）
1. **user-organizations CRUD API** - 基本的なメンバー管理
2. **ユーザー検索API** - メンバー招待機能
3. **権限チェック機能** - セキュリティの根幹

### Medium Priority（推奨）
1. **招待メール機能** - UX向上
2. **システムロール管理** - 将来の拡張性
3. **監査ログ** - 運用時の追跡

### Low Priority（将来実装）
1. **一括操作API** - 管理効率化
2. **権限テンプレート** - 設定の簡素化
3. **高度な検索フィルター** - 大規模運用対応

## フロントエンド連携注意事項

1. **APIレスポンス形式**: フロントエンドが期待する形式に合わせる
2. **エラーレスポンス**: 一貫したエラー形式を使用
3. **認証ヘッダー**: `Authorization: Bearer <token>` 形式
4. **CORS設定**: フロントエンドドメインからのアクセス許可

## テスト項目

### 単体テスト
- [ ] 各APIエンドポイントの正常動作
- [ ] 権限チェックロジック
- [ ] バリデーション機能
- [ ] エラーハンドリング

### 結合テスト
- [ ] 招待フローの完全動作
- [ ] 権限変更の反映
- [ ] メール送信機能
- [ ] フロントエンド連携

### セキュリティテスト
- [ ] 不正な権限変更の防止
- [ ] SQL インジェクション対策
- [ ] 認証バイパス防止
- [ ] 権限昇格攻撃防止

## 実装完了の確認方法

1. **フロントエンド管理画面で以下が動作すること**:
   - メンバー一覧表示
   - メンバー権限変更
   - メンバー削除
   - ユーザー検索・招待
   - 招待メール送信

2. **API仕様書の更新**

3. **本番環境での動作確認**

---

**作成日**: 2024年10月6日  
**作成者**: Claude Code  
**対象バックエンド**: hogo_dog_backend (Go/AWS Lambda)  
**フロントエンド**: React SPA (実装完了済み)