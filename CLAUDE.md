# プロジェクト運用ルール

## プラン・設計ドキュメントの置き場所と命名規則

- プランや設計などのドキュメントは `docs/plans/` 配下に置く
- ファイル名は作成日を先頭につける: `YYYY-MM-DD-<内容がわかるスラッグ>.md`
  - 例: `2026-08-02-keycloak-learning-site-plan.md`
- 日付は作成日で固定し、内容を更新してもリネームしない（大きな方針転換は新しい日付で別ファイルを作る）

## 使用モデルの使い分け

- プラン作成・設計検討は基本的に Claude Fable を用いる
- プランが承認された後の実装・開発作業は基本的に Claude Sonnet 5 に任せる

## 開発ブランチの命名規則

- 開発時は `main` から開発ブランチを切る
- ブランチ名は Angular commit message の type に倣い `<type>/<内容がわかるスラッグ>` とする
  - `feat/xxx`: 新機能
  - `fix/xxx`: バグ修正
  - `docs/xxx`: ドキュメント関連
  - `perf/xxx`: パフォーマンス改善
  - `refactor/xxx`: リファクタリング
  - `test/xxx`: テスト追加・修正
  - `build/xxx` / `ci/xxx`: ビルド・CI 設定
  - `chore/xxx`: その他の雑務
- 例: `feat/quickstart-chapter`, `docs/add-workflow-rules`

## マージの方法

- PR のマージは squash and merge で行う
