---
title: サードパーティ Cookie 問題
description: checkLoginIframe や silent-check-sso が、ブラウザのサードパーティ Cookie 制限によって機能しなくなる問題を理解します。
---

ここからは Part 3 までのシンプルな構成のままでは実務で必ずぶつかる、現実的な課題を扱います。
最初はブラウザのプライバシー保護機能が引き起こす問題です。

## `checkLoginIframe` の仕組み

keycloak-js は、デフォルトで `checkLoginIframe: true` になっています。これは、
見えない `<iframe>` で Keycloak のセッション状態確認用ページを埋め込み、定期的に
「まだログインしたままか」「他のタブでログアウトされていないか」を確認する仕組みです
（`onLoad: 'check-sso'` の裏側にある silent SSO チェックも、同様に隠し iframe を使います）。

この仕組みは、**iframe の中から Keycloak 側の Cookie を読み書きできること**を前提にしています。
SPA（`localhost:5173`）から見ると、埋め込まれた Keycloak（`localhost:8080`）の iframe は
別オリジンの、いわゆる**サードパーティ Cookie**の文脈で動作します。

## ブラウザがサードパーティ Cookie をブロックする

プライバシー保護のため、主要ブラウザはサードパーティ Cookie を制限する方向で進んでいます。

- Safari・Firefox（Strict Tracking Protection）は以前からサードパーティ Cookie をブロック
- Chrome も 2024 年から段階的に廃止を進めており、2026年時点で対象ユーザーが拡大中

Keycloak の iframe がサードパーティとして扱われる環境では、iframe 内で Keycloak の
セッション Cookie が読めなくなり、`checkLoginIframe` は正しく動作しません。
（Chrome はこの制限を検知した場合、アダプタ側で自動的に機能を無効化するようになっていますが、
すべてのブラウザ・すべてのバージョンで確実とは言えません。）結果として、
**実際にはログインしたままなのに、ログアウトしたと誤判定される**ことがあります。

## 対策: 明示的に無効化し、トークンの有効期限で判断する

`handson/spa` では、この問題を避けるために `checkLoginIframe` を明示的に `false` にしています。

```js title="handson/spa/src/keycloak.js"
const authenticated = await keycloak.init({
  onLoad: 'login-required',
  checkLoginIframe: false,
})
```

`checkLoginIframe` を無効化すると、「他のタブ・別アプリでログアウトされたことに即座には
気づけない」という副作用がありますが、[Part 3.3](/part3-handson/3-tokens/) で実装した
「アクセストークンの有効期限が切れたら `updateToken()` で更新し、失敗したら再ログインを促す」
という設計にしておけば、実用上は十分にセッション切れを検知できます。

このサイトのハンズオンでは次の方針を採用しています。

- `checkLoginIframe: false`（iframe ベースの監視には頼らない）
- `onLoad: 'login-required'`（`check-sso` の暗黙リダイレクトも同様の問題を持つため避ける）
- トークンの有効期限管理は `updateToken()` に一本化する

## 根本的な解決策への展望

iframe に頼らずにサーバーサイドでセッションを一元管理する **BFF（Backend for Frontend）
パターン**は、この問題そのものを回避できる設計です。次のページで扱います。

なお、ブラウザ標準でクロスサイトの認証状態を安全に共有する仕組みとして **FedCM
（Federated Credential Management）** という API も策定が進んでいますが、
本稿執筆時点（2026年8月）で Keycloak 側の対応は発展途上です。

## 次へ

[Part 4.2: BFF パターン](/part4-real-world/2-bff-pattern/)
