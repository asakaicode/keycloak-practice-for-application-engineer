---
title: その他の頻出エラー早見表
description: Part 5.1〜5.3 で扱わなかった、実務でよく遭遇するエラーとその対処法をまとめます。
---

Part 5.1〜5.3 で扱った3つ（redirect_uri 不一致・CORS・トークン期限切れ）以外にも、
Keycloak を使う中でよく遭遇するエラーがあります。ここでは早見表としてまとめます。

| エラー / 症状 | よくある原因 | 対処 |
|---|---|---|
| `unauthorized_client`<br/>`Client not allowed for direct access grants` | ROPC（`grant_type=password`）でトークンを取ろうとしたが、Client の **Direct access grants** が無効 | [Part 2.3](/part2-concepts/3-auth-code-pkce/) の通り ROPC は使わない設計が前提。Authorization Code Flow に置き換える |
| `invalid_grant`<br/>`Code not valid` | 認可コードは**一度使うと無効になる使い捨て**。ブラウザの戻るボタンや二重送信で同じコードを2回使おうとした | ログインをやり直す。SPA 側でコールバック処理が二重に走っていないかも確認する |
| `invalid_grant`<br/>`Invalid refresh token` | リフレッシュトークンの有効期限切れ、あるいは [Part 3.4](/part3-handson/4-logout-session/) で見た SSO Session Idle/Max を超過 | `keycloak.login()` を呼び、ユーザーに再ログインしてもらう |
| `Client not found` | `clientId` のタイプミス、または別の realm 向けの `clientId` を指定している | [Part 3.1](/part3-handson/1-realm-client-user/) で作った realm 名・Client ID を再確認する |
| ログイン画面が一瞬表示されてすぐ真っ白になる | `onLoad: 'check-sso'` を使っていて、サードパーティ Cookie がブロックされている | [Part 4.1](/part4-real-world/1-third-party-cookies/) を参照。`checkLoginIframe: false` にし、`login-required` を使う |
| `We are sorry... Invalid parameter: redirect_uri` | Valid Redirect URIs との不一致 | [Part 5.1](/part5-error-lab/1-redirect-uri/) を参照 |
| `TypeError: Failed to fetch`（コンソール） | Web Origins の設定漏れによる CORS ブロック | [Part 5.2](/part5-error-lab/2-cors/) を参照 |
| API から `401` が返る | アクセストークンの期限切れ・無効化 | [Part 5.3](/part5-error-lab/3-token-expiry/) を参照 |
| API から `403` が返る | トークンは有効だが、必要なロールを持っていない | [Part 3.5](/part3-handson/5-roles-claims/)・[Part 3.6](/part3-handson/6-api-protection/) を参照。ユーザーへのロール割り当てを確認する |

## エラーに遭遇したときの基本的な流れ

1. **エラーメッセージの文言をそのまま検索する**より先に、まずどのステップで起きたかを
   切り分ける（ログイン画面に到達する前か、後か。API 呼び出し時か）
2. ブラウザの**開発者ツール（Network タブ・Console タブ）**で、実際に何が送られ、
   何が返ってきたかを確認する
3. Admin Console で該当 Client の設定（Redirect URIs・Web Origins・Capability config）を
   実際の値と見比べる
4. Keycloak コンテナのログ（`docker compose logs keycloak`）にも、サーバー側で拒否した
   理由が出力されていることが多い

## 次へ

エラー体験ラボはここまでです。次は Part 6 で、用語集やエンドポイント一覧などの
リファレンスをまとめます。

[Part 6: リファレンス](/part6-reference/glossary/)
