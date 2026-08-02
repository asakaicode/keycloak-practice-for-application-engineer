---
title: keycloak-js で SPA を保護する
description: Part 1 で動かしたサンプル SPA のコードを読み、keycloak-js がどう Keycloak と連携しているのかを理解します。
---

Part 1.2 で体験した「開いた瞬間にログイン画面へ飛ばされる」動きは、`handson/spa` の中にある
2つの小さなファイルだけで実現されています。ここでは、そのコードを1行ずつ読んでいきます。

## Keycloak インスタンスを作る

```js title="src/keycloak.js"
import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'demo',
  clientId: 'frontend-spa',
})

export default keycloak
```

渡しているのは3つだけです。

- `url`: Keycloak サーバーの URL
- `realm`: [Part 3.1](/part3-handson/1-realm-client-user/) で作った Realm 名
- `clientId`: 同じく Part 3.1 で作った Client の ID

**クライアントシークレットがどこにもない**ことに注目してください。`frontend-spa` は
`Client authentication: Off` のパブリッククライアントとして作ったため、シークレットを
持たない（持てない）構成になっています。ブラウザの開発者ツールでこのファイルの中身を見ても、
悪用できるような秘密情報は含まれていません。

## ログインを要求する

```js title="src/main.js"
const authenticated = await keycloak.init({ onLoad: 'login-required' })
```

`init()` の `onLoad` オプションが、Part 1.2 で見た自動リダイレクトの正体です。

- `'login-required'`: ページを開いた時点で未ログインなら、即座にログイン画面へ移動する
  （今回採用した方式。「15分で動かす」体験を優先し、まずはこのシンプルな方式にしています）
- `'check-sso'`: 裏側で「すでにログイン済みか」だけを確認し、未ログインでもログイン画面へは
  飛ばさない（ログインボタンを自分で用意する場合に使う）

`check-sso` は仕組み上 iframe を使ってセッションを確認するため、ブラウザのサードパーティ Cookie
制限の影響を受けます。この話は [Part 4.1: サードパーティ Cookie 問題](/part4-real-world/1-third-party-cookies/)
で詳しく扱います。

`init()` が返す `authenticated` は真偽値で、ログインに成功していれば `true` になります。

## PKCE はどこで設定しているのか

答えは「していません」。[Part 2.3](/part2-concepts/3-auth-code-pkce/) で説明した通り、
keycloak-js は `pkceMethod: 'S256'` が**デフォルト値**になっているため、
明示的に何も書かなくても PKCE 付きの Authorization Code Flow が使われます。
Part 1.2 でブラウザの URL に `code_challenge_method=S256` が見えていたのは、
このデフォルト動作によるものでした。

:::note
省略できるからといって「暗黙的に安全になっている」ことを忘れないでください。
[Part 3.1](/part3-handson/1-realm-client-user/) で Client 側にも `Require PKCE` を設定したのは、
万が一クライアント側の実装が PKCE を使わない設定に変更されても、サーバー側で PKCE なしの
リクエストを拒否できるようにするためです。
:::

## ログイン後の画面を作る

```js title="src/main.js"
function renderAuthenticated() {
  const { preferred_username } = keycloak.tokenParsed

  document.querySelector('#app').innerHTML = `
    <section>
      <h1>ログイン成功</h1>
      <p>ようこそ、<strong>${preferred_username}</strong> さん。</p>
      <button id="logout">ログアウト</button>
    </section>
  `

  document.querySelector('#logout').addEventListener('click', () => keycloak.logout())
}
```

`keycloak.tokenParsed` には、ログインによって取得した ID トークンの中身が
JavaScript オブジェクトとしてすでにデコードされて入っています。`preferred_username`
はそこに含まれる標準的な OIDC クレームの一つです。トークンの中身をもっと詳しく見るのは
[Part 3.3: トークン深掘り](/part3-handson/3-tokens/) で行います。

`keycloak.logout()` を呼ぶと、SPA 側のセッションだけでなく Keycloak 側の SSO セッションも
終了します。ログアウトの詳しい挙動（リダイレクト先の指定など）は
[Part 3.4: ログアウトとセッション](/part3-handson/4-logout-session/) で扱います。

:::tip[今すぐ試す]
`handson/spa/src/main.js` を開いて `onLoad: 'login-required'` を `onLoad: 'check-sso'` に
書き換え、`npm run dev` で保存後にブラウザをリロードしてみてください。

**期待される結果**: ログイン画面へ自動的には飛ばされず、`renderUnauthenticated()` の
「認証に失敗しました」画面が一瞬表示されます（`authenticated` が `false` になるため）。
確認できたら `'login-required'` に戻しておきましょう。
:::

## 次へ

[Part 3.3: トークン深掘り](/part3-handson/3-tokens/) で、`keycloak.tokenParsed` の中身や
ID / Access / Refresh トークンの違いを詳しく見ていきます。
