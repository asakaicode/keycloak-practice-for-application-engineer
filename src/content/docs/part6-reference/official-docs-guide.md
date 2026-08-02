---
title: 公式ドキュメントの歩き方
description: keycloak.org のドキュメントがどう構成されているか、どこから読み始めればよいかをまとめます。
---

[はじめに](/part0-introduction/about/) で触れた通り、Keycloak にはリリースサイクルが速く
LTS がないという特徴があります。このサイトの内容だけでカバーしきれない部分は、
最終的に公式ドキュメントを直接読みに行くことになります。ここでは、迷わず目的のページに
たどり着けるように、公式サイトの構成を整理しておきます。

## 2つの入り口: `/documentation` と `/guides`

Keycloak 公式サイトには、ドキュメントへの入り口が2つあります。

- **[keycloak.org/documentation](https://www.keycloak.org/documentation)**:
  現行バージョンのドキュメント全体の**索引ページ**。Release Notes、各種ガイド、
  REST API リファレンス（Javadoc・Admin REST API）へのリンクが一箇所にまとまっています。
  「何があるか一覧してから探したい」ときはここから。
- **[keycloak.org/guides](https://www.keycloak.org/guides)**:
  目的別に分類された**ガイド集**。Getting started・Server・Securing applications・
  High availability・Admin API など、カテゴリごとにページが並んでいます。
  「やりたいこと」がすでに決まっているときはここから探すのが早いです。

## このサイトでよく参照したページ

| 目的 | ページ |
|---|---|
| SPA から Keycloak を使う（keycloak-js） | [Securing applications → JavaScript adapter](https://www.keycloak.org/securing-apps/javascript-adapter) |
| Realm・Client・User を手動 or JSON で設定する | [Server Administration Guide](https://www.keycloak.org/guides#server) |
| Docker で試す | [Getting Started with Docker](https://www.keycloak.org/getting-started/getting-started-docker) |
| 本番構成（hostname・プロキシ等） | [Server → Configuration](https://www.keycloak.org/guides#server) |
| Realm のインポート・エクスポート | [Server Administration Guide → Import/Export](https://www.keycloak.org/server/importExport) |
| REST API で操作を自動化する | [Admin REST API](https://www.keycloak.org/guides#admin-api) |

## バージョンを意識する

ドキュメントの URL やページ内の説明は、**そのときの最新バージョン**を前提にしていることが
多く、過去バージョンのドキュメントは別途アーカイブされています。手元の Keycloak の
バージョン（`docker compose logs keycloak` の起動ログに `Keycloak x.y.z` と出ます）と、
読んでいるドキュメントのバージョンがずれていないかは、特に Admin Console の画面構成や
設定項目名を追うときに意識してください。このサイト自体、[docker-compose.yml](https://github.com/asakaicode/keycloak-practice-for-application-engineer/blob/main/handson/docker-compose.yml)
で固定しているバージョンを対象に検証しています。

## 次へ

これでリファレンスは以上です。[このサイトについて](/part0-introduction/about/) に戻って、
気になる章を読み返したり、ハンズオンをもう一周してみてください。
