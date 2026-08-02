# フロントエンドエンジニアのための Keycloak（非公式）

Keycloak 公式ドキュメントをもとにした、フロントエンド / アプリケーションエンジニア向けの
日本語ハンズオン学習サイトを作るプロジェクト。

- サイトは Astro (Starlight) で構築し、Cloudflare Workers (static assets) で公開予定
- まずはローカルで内容を確認し、納得できた段階で公開する

## 現在のステータス

🚧 **フェーズ0（プロジェクト基盤づくり）完了** — Astro + Starlight の雛形とハンズオン環境の器ができた段階。
コンテンツはまだプレースホルダー。全体計画は
[docs/plans/2026-08-02-keycloak-learning-site-plan.md](./docs/plans/2026-08-02-keycloak-learning-site-plan.md) を参照。

## フェーズ概要

| フェーズ | 内容 | 公開 |
|---|---|---|
| 0 | Astro + Starlight の基盤づくり、ハンズオン環境（Docker + realm JSON） | ローカルのみ |
| 1 | コア教材（15分クイックスタート〜トークン深掘り） | ローカルのみ |
| 2 | 実務編（Cookie 問題・BFF・エラー体験ラボ）と仕掛け（クイズ等） | ローカルのみ |
| 3 | Cloudflare Workers へデプロイ（Git 連携で自動デプロイ） | 🌐 公開 |
| 4 | Keycloak バージョン追従・コンテンツ拡張 | 継続運用 |

## 必要な環境

- Node.js v22 以上
- Docker / Docker Compose（ハンズオン用の Keycloak を起動するため）

## ローカルでの起動手順

### サイト（Astro + Starlight）

```bash
npm install
npm run dev
```

`http://localhost:4321` でサイトが開く。

```bash
npm run build   # 静的ビルド（リンク切れチェックも同時に実行される）
npm run preview # ビルド結果をプレビュー
```

### ハンズオン環境（Keycloak）

```bash
cd handson
docker compose up -d
```

`http://localhost:8080` で Keycloak が起動し、`demo` realm が自動インポートされる
（Admin Console: `admin` / `admin`）。

- Realm: `demo`
- Client: `frontend-spa`（パブリッククライアント、Authorization Code + PKCE(S256)）
- テストユーザー: `alice` / `alice-password`（role: `user`）、`bob` / `bob-password`（role: `user`, `admin`）

停止する場合:

```bash
docker compose down
```

### サンプル SPA

```bash
cd handson/spa
npm install
npm run dev
```

`http://localhost:5173` で開く。keycloak-js との統合は Part 3.2 で実装する。

## 注意書き

本プロジェクトは Keycloak プロジェクト / CNCF の公式・公認ではありません。
Keycloak のドキュメントは [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
で提供されており、本サイトはこれを翻訳・要約・再構成したものを含みます（出典は各ページに明記）。
