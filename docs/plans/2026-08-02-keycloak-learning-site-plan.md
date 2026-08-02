# フロントエンドエンジニアのための Keycloak — サイト構築プラン

Keycloak 公式ドキュメントをもとに、フロントエンドエンジニア（広くはアプリケーションエンジニア）向けの
日本語学習サイトを Astro で構築し、Cloudflare で公開するためのプラン。

- **リポジトリ**: asakaicode/keycloak-practice-for-application-engineer
- **進め方**: フェーズ 0〜2 はローカル確認のみ。フェーズ 3 で初めて公開する
- **作成日**: 2026-08-02（技術情報は同日時点の調査に基づく）

---

## 1. ゴールとコンセプト

### ゴール

- 会社で導入されている Keycloak を、フロントエンドエンジニアの視点でキャッチアップできる
- 「読むだけ」ではなく、手元で Keycloak を動かしながら進められるハンズオン教材にする
- 自分用がメインだが、公開しても恥ずかしくない品質・体裁にする

### コンセプト: 「15分で動かして、あとから理解する」

開発者向け学習コンテンツの定番パターン（Astro 公式チュートリアル、web.dev Learn 等）に倣い、
**ハンズオン・ファースト**で構成する。

1. 最初の章の 15 分以内に「Docker 1コマンドで Keycloak 起動 → 用意済み SPA でログイン成功」を体験させる
2. 成功体験のあとに OAuth 2.0 / OIDC の理論を遡って説明する
3. 1 つのサンプル SPA を章が進むごとに育てていく（ログイン → トークン → 権限別 UI → API 保護）
4. 実務で必ず踏むエラー（redirect_uri 不一致、CORS 等）を**わざと起こして直す**章を目玉にする

### 飽きさせないための仕掛け

| 仕掛け | 実現方法 |
|---|---|
| 1ページ1概念、長い解説は折りたたみ | Starlight の Aside / `<details>` |
| 手順は番号付きステップで明確に | Starlight 組み込み `<Steps>` コンポーネント |
| 図で理解する認可フロー | Mermaid シーケンス図（プラグインで導入） |
| ページ末尾のチェックリスト（進捗保存） | localStorage を使う小さな Astro アイランド |
| 章末クイズ（3〜5問の選択式） | starlight-quiz プラグイン or 自作アイランド |
| JWT をその場でデコードするウィジェット | 自作アイランド（Preact など1フレームワークに限定） |
| エラー体験ラボ | 意図的にエラーを起こす→読み方→修正 の実習章 |

---

## 2. 技術選定（調査済み・2026年8月時点）

### サイト: Astro 7 + Starlight 0.41

- **Starlight** は Astro 公式のドキュメントテーマ。検索（Pagefind 内蔵・日本語の分かち書き対応）、
  サイドバー自動生成、ダークモード、MDX、コードハイライト（Expressive Code）、
  Tabs / Aside / Steps / FileTree などの学習コンテンツ向けコンポーネントがゼロ設定で揃う
- Astro 7 は **Node.js v22 以上必須**
- 日本語のみのサイトなので `locales: { root: { label: '日本語', lang: 'ja' } }` を設定
  （URL プレフィックスなし、検索 UI も日本語化される）
- Mermaid は標準未対応のため `astro-mermaid` または `starlight-client-mermaid` プラグインで対応
- インタラクティブ部品は Astro アイランド（`client:visible`）で実装し、フレームワークは 1 つに絞る
- 比較検討: Docusaurus(React 前提・重め) / VitePress(Vue 前提) / Nextra(Next.js 前提) に対し、
  Starlight はフレームワーク非依存・デフォルトでほぼゼロ JS・静的出力で今回の用途に最適

### 教材の題材: keycloak-js + Authorization Code + PKCE

- **keycloak-js は非推奨ではなく公式サポート継続中**（2025年に独立リポジトリ
  [keycloak/keycloak-js](https://github.com/keycloak/keycloak-js) に分離、サーバーと独立した semver。
  npm 最新は 26.2.4）。SPA 向けの公式ルートは「パブリッククライアント + Authorization Code + PKCE(S256)」
- Node.js アダプタ (keycloak-connect) は非推奨 → サーバーサイド例には openid-client 等を使う
- Implicit フローは公式で「SHOULD NOT be used」、ROPC は「MUST NOT be used」→ アンチパターンとして明示
- ハンズオン環境は `quay.io/keycloak/keycloak:26.x` の `start-dev` + `--import-realm`
  （realm JSON をリポジトリに同梱すれば全員が同一環境を再現できる）
- Keycloak には LTS がなくリリースが速い → 各ページに対象バージョンを明記し、UI 手順の記述は最小限にして
  公式ガイドへの深いリンクを併記する

### デプロイ: Cloudflare Workers (static assets) + Git 連携

- **新規プロジェクトは Pages ではなく Workers が公式推奨**
  （Cloudflare 公式: "If you are starting a new project, use Workers instead of Pages"）
- 完全静的サイトなので **@astrojs/cloudflare アダプタは不要**。`astro build` の `dist/` を
  static assets として配信するだけ
- 必要な設定は `wrangler.jsonc` の最小構成のみ:
  ```jsonc
  {
    "name": "keycloak-for-frontend-engineers",
    "compatibility_date": "2026-08-01",
    "assets": { "directory": "./dist", "not_found_handling": "404-page" }
  }
  ```
- デプロイは **Workers Builds（ダッシュボードで GitHub リポジトリを接続）** が最短。
  push ごとに自動ビルド+デプロイ、非 production ブランチは preview URL 付き
  （deploy command を `npx wrangler versions upload` にする）
- 無料枠で十分: 静的アセット配信は**無料・無制限**、ビルド 3,000分/月、20,000ファイル、25MiB/ファイル
- URL は `<worker名>.<サブドメイン>.workers.dev`。カスタムドメインを使う場合はドメインの DNS ゾーンを
  Cloudflare に置く必要がある（無料プランで可）

### ライセンス・表記上の注意（公開前に必須）

Keycloak のコード・ドキュメントソース・公式サイトはいずれも **Apache License 2.0**。
翻訳・要約・再公開は可能だが、以下をサイトに掲載する:

1. 出典（Keycloak 公式ドキュメントの該当 URL）
2. Apache License 2.0 の表示とリンク
3. 翻訳・要約・改変した旨の明示
4. **非公式サイトであり Keycloak プロジェクト / CNCF の公認ではない**旨のディスクレーマー

Apache 2.0 は商標の使用権を付与しない（第6条）ため、**Keycloak ロゴは使わない**。
サイト名も「(非公式)」等を添えて公式と誤認されない体裁にする。

---

## 3. フェーズ分け

### フェーズ 0: プロジェクト基盤づくり（ローカルのみ / 目安: 半日）

**目的**: 執筆を始められる状態のリポジトリを作る。

- [ ] Node.js v22+ 確認、`npm create astro@latest -- --template starlight` で雛形作成
- [ ] 日本語ルートロケール設定（`locales.root = { label: '日本語', lang: 'ja' }`）
- [ ] Mermaid プラグイン導入と描画確認
- [ ] サイドバー構成の骨格（第4章のカリキュラムどおりのセクション）を空ページで作る
- [ ] ハンズオン用アセットの器を作る:
  - `handson/docker-compose.yml`（Keycloak 26.x `start-dev` + `--import-realm`、ポート8080、127.0.0.1 バインド）
  - `handson/keycloak/demo-realm.json`（realm / client / テストユーザー定義済み）
  - `handson/spa/`（Vite 製の最小サンプル SPA。keycloak-js を後の章で組み込む）
- [ ] `starlight-links-validator` 導入（リンク切れをビルド時に検出）
- [ ] README.md（プロジェクト概要・ローカル起動手順）

**完了条件**: `npm run dev` でサイトが表示され、`docker compose up` で Keycloak が起動し
demo realm がインポートされる。

### フェーズ 1: コンテンツ第1弾 — コア教材（ローカルのみ / 目安: 2〜3週間、1日30分〜1時間ペース）

**目的**: 「15分で動かす」から「トークン深掘り」までの背骨を書き切り、ローカルで通しで検証する。

対象は第4章カリキュラムの **Part 1〜3**:

- [ ] Part 1: 15分で動かす（Docker 起動 → ログイン成功体験）
- [ ] Part 2: 概念編（IdP の存在理由 / OAuth2・OIDC メンタルモデル / 認可コードフロー+PKCE のシーケンス図）
- [ ] Part 3: ハンズオン本編 3.1〜3.3（Realm/Client/User 作成、keycloak-js で SPA 保護、トークン深掘り）
- [ ] 各ページに「今すぐ試す」ボックス（コピー可能なコマンド + 期待される結果）を必ず1つ置く
- [ ] 自分自身で全ハンズオンを最初から通しで実施して検証（執筆者チェック = 最初の読者テスト）

**完了条件**: まっさらな環境で Part 1〜3 を通しでやって詰まらない。
Pagefind の日本語検索が実コンテンツで機能する（`npm run build` + `npm run preview` で確認）。

### フェーズ 2: コンテンツ第2弾 — 実務編と仕掛け（ローカルのみ / 目安: 2〜3週間）

**目的**: 差別化要素（エラー体験ラボ・インタラクティブ部品）と実務で効く章を足す。

- [ ] Part 3 残り（ログアウト/セッション、ロール・クレームの UI 反映、API 保護と CORS）
- [ ] Part 4: 現実と向き合う（サードパーティ Cookie 問題、BFF パターン、dev vs prod）
- [ ] Part 5: エラー体験ラボ（redirect_uri 不一致 / CORS / トークン期限切れを意図的に起こして直す）
- [ ] Part 6: リファレンス（用語対訳表、公式ドキュメントの歩き方、エンドポイント早見表）
- [ ] 仕掛けの実装: ページ末尾チェックリスト（localStorage）、章末クイズ、JWT デコーダウィジェット
- [ ] 全ページ再通読 + ハンズオン再検証

**完了条件**: 全カリキュラムがローカルで完結して読める・試せる。クイズとチェックリストが動作する。

### フェーズ 3: 公開（Cloudflare / 目安: 半日〜1日）

**目的**: 内容に納得できた時点で、最小の手間で公開する。

- [ ] 公開前の体裁: サイト名・説明文の確定、ファビコン/OGP 画像、404 ページ
- [ ] **ライセンス表記とディスクレーマーのページ**（前述の4点。フッターからリンク）
- [ ] `wrangler.jsonc` 追加（上記の最小構成）
- [ ] Cloudflare ダッシュボード > Workers & Pages > Create > **Import a repository** で
      GitHub リポジトリを接続（build: `npm run build`、deploy: `npx wrangler deploy`）
- [ ] 非 production ブランチの deploy command を `npx wrangler versions upload` にして
      ブランチ preview を有効化
- [ ] `*.workers.dev` URL で公開確認（検索・Mermaid・クイズ・ダークモードの動作チェック）
- [ ] （任意）カスタムドメイン: DNS ゾーンを Cloudflare に置き、Worker の
      Settings > Domains & Routes から追加（DNS・証明書は自動）

**完了条件**: main への push で自動デプロイされ、公開 URL で全機能が動く。

### フェーズ 4: 運用・拡張（公開後 / 継続）

- [ ] Keycloak の新バージョンリリース時に対象バージョン表記とハンズオンを追従
      （LTS がないため、四半期に一度の見直しを目安に）
- [ ] 学習ログ/変更履歴ページ（更新が続いているサイトに見せる & 自分の復習にもなる）
- [ ] 拡張候補: Authorization Services（fine-grained authz）、Admin REST API 入門、
      カスタムテーマ（ログイン画面のブランディング）、社内勉強会用スライドへの転用
- [ ] 依存更新: Renovate または Dependabot で Astro / Starlight / keycloak-js を追従

---

## 4. カリキュラム（サイトの章構成案）

Part 1 → 6 がそのまま Starlight のサイドバーセクションになる。**太字**は差別化の目玉。

### Part 0: はじめに
- このサイトについて（対象読者、Keycloak 対象バージョン、非公式である旨）
- 学習の進め方（必要環境: Docker, Node.js）

### Part 1: まず15分で動かす
- 1.1 Docker で Keycloak を起動する（`start-dev` + realm 自動インポート）
- 1.2 サンプル SPA でログインしてみる（成功体験。中身の説明はまだしない）

### Part 2: 何が起きていたのか — 概念編
- 2.1 IdP が解決する課題（自前認証の限界、SSO、社内に Keycloak がある理由）
- 2.2 OAuth 2.0 / OIDC のメンタルモデル（登場人物と Keycloak 用語の対応: Realm / Client / User / Role / Scope）
- 2.3 Authorization Code Flow + PKCE を図で追う（Mermaid シーケンス図、`.well-known` エンドポイント）

### Part 3: ハンズオン本編 — 1つの SPA を育てる
- 3.1 Realm / Client / User を自分の手で作る（Valid redirect URIs と Web origins の意味）
- 3.2 keycloak-js で SPA を保護する（`onLoad`、パブリッククライアント、PKCE はデフォルト有効）
- 3.3 トークン深掘り（ID / Access / Refresh の違い、JWT の中身、`updateToken()`、メモリ内保持の原則）
- 3.4 ログアウトとセッション（`logout()`、post_logout_redirect_uri、SSO Session の各タイムアウト）
- 3.5 ロールとクレームを UI に反映する（realm role / client role、メニュー出し分け）
- 3.6 API を保護する（Bearer トークン、Web Origins と CORS の正しい理解）

### Part 4: 現実と向き合う — 実務編
- 4.1 **サードパーティ Cookie 問題**（checkLoginIframe / silent check-sso が自動無効化される仕様と対策）
- 4.2 BFF パターン（IETF「OAuth 2.0 for Browser-Based Apps」の推奨。公式ドキュメントの範囲と
      業界ベストプラクティスを明確にラベル分けして解説）
- 4.3 dev と prod の違い（`start-dev` vs `start`、リバースプロキシと X-Forwarded-Proto、
      hostname 設定、redirect URI ワイルドカード禁止）

### Part 5: **エラー体験ラボ**（トラブルシューティング図鑑）
- 5.1 `Invalid parameter: redirect_uri` をわざと出して直す（末尾スラッシュ・スキーム・ポート）
- 5.2 CORS エラーをわざと出して直す（Web origins、「+」指定、プロキシ起因の偽 CORS）
- 5.3 トークン期限切れ体験（デフォルト5分。401 → `updateToken` での自動リカバリ実装）
- 5.4 その他の頻出エラー早見表

### Part 6: リファレンス
- 用語集（英日対訳 + Admin Console のどこにあるか）
- OIDC エンドポイント早見表（auth / token / userinfo / logout / certs / introspect）
- 公式ドキュメントの歩き方（guides 系と docs/latest 系の使い分け、どのガイドをいつ読むか）
- クイズまとめ（全章の腕試し）

---

## 5. リポジトリ構成案

```
keycloak-practice-for-application-engineer/
├── PLAN.md                      # このファイル
├── README.md                    # 概要とローカル起動手順
├── package.json                 # Astro + Starlight（リポジトリ直下にサイトを置く）
├── astro.config.mjs             # Starlight 設定（ja ロケール、サイドバー、Mermaid）
├── wrangler.jsonc               # フェーズ3で追加（Cloudflare Workers static assets）
├── src/
│   ├── content/docs/            # 教材本体（Markdown / MDX）
│   │   ├── index.mdx            # トップページ
│   │   ├── part1-quickstart/
│   │   ├── part2-concepts/
│   │   ├── part3-handson/
│   │   ├── part4-real-world/
│   │   ├── part5-error-lab/
│   │   └── part6-reference/
│   └── components/              # チェックリスト、クイズ、JWTデコーダ等のアイランド
└── handson/                     # 読者が手元で動かす一式
    ├── docker-compose.yml       # Keycloak 26.x start-dev + --import-realm
    ├── keycloak/
    │   └── demo-realm.json      # 再現可能な realm 定義
    └── spa/                     # サンプル SPA（Vite。章ごとの完成形は branch or ディレクトリで提供）
```

---

## 6. 主要な参考リンク

**Keycloak 公式**
- ドキュメント一覧: https://www.keycloak.org/documentation / ガイド: https://www.keycloak.org/guides
- JavaScript アダプタ: https://www.keycloak.org/securing-apps/javascript-adapter
- Docker で始める: https://www.keycloak.org/getting-started/getting-started-docker
- Realm インポート/エクスポート: https://www.keycloak.org/server/importExport
- keycloak-js リポジトリ: https://github.com/keycloak/keycloak-js
- 公式サンプル集: https://github.com/keycloak/keycloak-quickstarts

**サイト構築・デプロイ**
- Starlight: https://starlight.astro.build/getting-started/
- Starlight i18n（日本語ルートロケール）: https://starlight.astro.build/guides/i18n/
- Astro → Cloudflare デプロイガイド: https://docs.astro.build/en/guides/deploy/cloudflare/
- Cloudflare Workers static assets: https://developers.cloudflare.com/workers/static-assets/
- Workers Builds（Git 連携）: https://developers.cloudflare.com/workers/ci-cd/builds/

**参考にする学習体験**
- Astro 公式チュートリアル（チェックリスト・進捗保存）: https://docs.astro.build/en/tutorial/0-introduction/
- web.dev Learn（自己評価クイズ）: https://web.dev/learn/css/welcome
- OAuth 2.0 for Browser-Based Apps（BFF の根拠）: https://curity.io/resources/learn/spa-best-practices/
