---
title: ロールとクレームを UI に反映する
description: realm role と client role の違いを理解し、ロールに応じて SPA の表示を出し分けます。
---

`demo` realm には `user` と `admin` という2つの realm role があり、`alice` には `user` のみ、
`bob` には `user` と `admin` の両方が割り当てられていました（[Part 3.1](/part3-handson/1-realm-client-user/)）。
ここでは、このロールをトークンから読み取り、SPA の表示に反映させます。

## realm role と client role

Keycloak には2種類のロールがあります。

- **realm role**: realm 全体で共通のロール。今回の `user` / `admin` はこちら。
  どの Client からログインしても同じロールが見える
- **client role**: 特定の Client に閉じたロール（例: 「請求管理アプリでだけ意味を持つ
  `billing-admin`」のようなもの）。Client 単位で権限を分けたいときに使う

今回のハンズオンでは realm role だけを使いますが、実務では「複数のアプリで共通の権限」は
realm role、「個々のアプリ固有の権限」は client role、と使い分けるのが基本です。

## トークンの中でロールがどう表現されるか

ID トークン・アクセストークンの中で、ロールは次のようなクレームとして表現されます。

```json
{
  "realm_access": {
    "roles": ["user"]
  }
}
```

`bob` でログインした場合は `"roles": ["user", "admin"]` になります。client role がある場合は
`resource_access.<クライアントID>.roles` という別のクレームに入ります（今回は未使用）。

## SPA の表示に反映する

```js title="src/main.js"
const isAdmin = keycloak.hasRealmRole('admin')

document.querySelector('#app').innerHTML = `
  ...
  <ul>
    <li>ダッシュボード（全ユーザーに表示）</li>
    ${isAdmin ? '<li>ユーザー管理（admin ロールを持つユーザーにのみ表示）</li>' : ''}
  </ul>
  ...
`
```

`keycloak.hasRealmRole('admin')` は、ログイン中のユーザーのアクセストークンに
`admin` ロールが含まれているかを返します。内部的には `tokenParsed.realm_access.roles`
を見ているだけの単純なヘルパーです。

:::tip[今すぐ試す]
`alice` と `bob` それぞれでログインし直して、メニューの表示を見比べてみてください。

**期待される結果**: `alice`（`user` ロールのみ）では「ダッシュボード」だけが表示され、
`bob`（`user` + `admin` ロール）では「ユーザー管理」も追加で表示されます。
:::

## 重要: これは見た目の制御にすぎない

ここで実装したのは、あくまで**画面に何を表示するか**の出し分けです。`alice` が
ブラウザの開発者ツールで `isAdmin` を書き換えたり、そもそも `hasRealmRole` のチェックを
すり抜けるような改造版の SPA を自分で書いたりすれば、見た目の上では「ユーザー管理」画面に
辿り着けてしまいます。

**フロントエンドでのロール分岐は UX のためのものであり、セキュリティの境界にはなりません。**
「`admin` ロールを持つ人だけが本当にその操作をできる」という保証は、次の
[Part 3.6: API を保護する](/part3-handson/6-api-protection/) で見るように、
**API 側（サーバー側）でアクセストークンを検証して**初めて成立します。

## 次へ

[Part 3.6: API を保護する](/part3-handson/6-api-protection/)
