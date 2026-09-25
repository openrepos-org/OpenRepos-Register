# <img src="./assets/logo.svg" width="28" height="28" alt="OpenRepos logo" /> OpenRepos Register

[English](./README.md) · [简体中文](./README.zh-CN.md) · **日本語** · [العربية](./README.ar.md) · [Español](./README.es.md) · [Português](./README.pt.md)

OpenRepos のドメイン上で、あなたのオープンソースプロジェクト用の**無料サブドメイン**を取得できます。
永久無料で、ドメインは長期的に適切に管理されます。

- ウェブサイト：**https://openrepos.org/** — 他の 6 ドメインはここにリダイレクトされます
- すべての申請は 1 つのファイル [`register.json`](./register.json) に保存されます
- 例：`awesome-project.openrepos.org` → あなたのプロジェクトのサイト

## ドメイン一覧

| ドメイン         | ウェブサイト                |
| ---------------- | --------------------------- |
| `openrepos.io`   | https://openrepos.io/       |
| `openrepos.org`  | https://openrepos.org/      |
| `openrepos.sh`   | https://openrepos.sh/       |
| `repos.one`      | https://repos.one/          |
| `sourcepage.io`  | https://sourcepage.io/      |
| `sourcepage.org` | https://sourcepage.org/     |
| `sourcepage.sh`  | https://sourcepage.sh/      |

## ルール

1. **永久無料**。オープンソースプロジェクト限定（LICENSE を含む公開 GitHub リポジトリ）。
2. **プロジェクトのリポジトリを所有している**か、その Organization のメンバーである必要が
   あります。CI が Pull Request の作成者から自動検証します。
3. **1 プロジェクトにつき 1 サブドメイン、1 ドメインのみ**。複数の OpenRepos ドメインでは
   取得できません。
4. サブドメイン名：3〜63 文字、小文字の `a-z`、`0-9`、`-` のみ。先頭・末尾の `-` は不可。
5. 予約語は取得できません — [`reserved.json`](./reserved.json) を参照。
6. ターゲットは許可されたホスティング事業者に限られます（下記参照）。カスタムターゲットは
   メンテナーの承認が必要です。
7. **プロジェクトの README に OpenRepos バッジを追加してください**。新しい申請では自動的に
   確認されます（[バッジの追加](#バッジの追加) を参照）。
8. サブドメインで配信する内容はあなたの責任です。内容ルール：プロジェクトに関連する内容のみ、
   自動リダイレクトの禁止、NSFW/成人向けコンテンツの禁止。不正利用は削除される場合があります。

## 申請方法

1. ドメインと空いているサブドメインを選びます（例：`awesome-project.openrepos.org`）。
2. [`register.json`](./register.json) を編集し、選んだドメインにエントリを追加します：

   ```json
   "openrepos.org": {
     "awesome-project": {
       "repo": "https://github.com/octocat/awesome-project",
       "target": "octocat.github.io"
     }
   }
   ```

3. プロジェクトの README に OpenRepos バッジを追加します（[バッジの追加](#バッジの追加)）。
4. Pull Request を作成します。CI が命名、予約語、重複、ターゲットの許可リスト、所有権、
   バッジを検証します。
5. メンテナーがレビューしてマージします。マージ後は DNS が自動的に設定され、追加作業は
   ありません。

> ヒント：`register.json` の GitHub の **編集**（鉛筆）ボタンを使うと、GitHub が自動的に
> フォークして Pull Request を作成します。

## フィールド

サブドメインがキーです。各エントリに必要なのは 2 つのフィールドだけです：

| フィールド | 必須 | 説明                                                    |
| ---------- | ---- | ------------------------------------------------------- |
| `repo`     | はい | オープンソースプロジェクトの公開 GitHub リポジトリ      |
| `target`   | はい | CNAME ターゲットホスト（例：`octocat.github.io`）       |

所有権は Pull Request の作成者から検証されるため、`owner` フィールドはありません。
レコードは DNS-only で、TLS はホスティング事業者が提供します。

## バッジの追加

新しい申請では、プロジェクトの README に OpenRepos バッジが必要です。バッジは動的で、
審査中は `pending`、マージ後は自動的に `live` になります（README の再編集は不要）。

任意の [shields.io スタイル](https://shields.io)（`flat`、`flat-square`、`plastic`、
`for-the-badge`、`social`）が使えます：

```markdown
[![OpenRepos](https://img.shields.io/endpoint?url=https://openrepos.org/status/awesome-project.openrepos.org.json&style=flat-square)](https://awesome-project.openrepos.org/)
```

ステータス URL は常に `openrepos.org` です。`awesome-project` をサブドメインに置き換え、リンクには取得したドメインを使ってください。

静的版（動的リクエストなし。shields では `-` が `--` にエスケープされます）：

```markdown
[![OpenRepos](https://img.shields.io/badge/openrepos.org-awesome-project.openrepos.org-blue?style=flat-square)](https://awesome-project.openrepos.org/)
```

バッジ URL には正確なサブドメインを含める必要があります。CI が確認し、ない場合は申請を
拒否します。

## 許可されたターゲット

サブドメインは以下のホスティング事業者のみ指定できます：

| パターン                           | 事業者           |
| ---------------------------------- | ---------------- |
| `*.github.io`                      | GitHub Pages     |
| `*.gitlab.io`                      | GitLab Pages     |
| `*.pages.dev`                      | Cloudflare Pages |
| `*.netlify.app`                    | Netlify          |
| `*.vercel.app`, `*.vercel-dns.com` | Vercel           |
| `*.surge.sh`                       | Surge            |
| `*.gitbook.io`, `*.gitbook.com`    | GitBook          |
| `*.alwaysdata.net`                 | Alwaysdata       |

別のターゲットが必要な場合は、同じ Pull Request で [`targets.json`](./targets.json) の
`custom` 配列にホスト名を追加し、理由を書いてください。メンテナーが確認します。

## 内容ルール

- 申請したオープンソースプロジェクトに関する内容のみ。無関係な内容は禁止。
- サブドメインからの自動リダイレクトは禁止。リダイレクトはユーザー操作が必要な場合のみ。
- NSFW/成人向けコンテンツ、フィッシング、マルウェア、その他の不正利用は禁止。

## マージ後

- GitHub Action が CNAME レコード `<subdomain>.<domain> → <target>` を作成/更新します
  （コメント `openrepos-register` 付き）。
- 通常 1 分以内に反映されます。DNS-only のため、HTTPS はホスティング事業者が提供します。
- **ホスティング側でカスタムドメインを設定してください**。設定しないとエラーになります：
  - **GitHub Pages**：リポジトリの Settings → Pages → Custom domain にサブドメインを入力
  - **Cloudflare Pages**：プロジェクト → Custom domains → サブドメインを追加
  - **Vercel / Netlify**：プロジェクトにドメインを追加
- TLS エラーや `522` は、ホスティング側にカスタムドメインが未設定の場合に起こります。

## 削除と不正利用

プロジェクトがオープンソースでなくなった場合、放置された場合、不正利用された場合は削除され
ます。不正利用の報告や削除依頼は、このリポジトリで issue を作成してください。

## リポジトリ構成

```
.
├── register.json                    # すべての申請（ドメイン → サブドメイン → エントリ）
├── domains.json                     # 対応する 7 ドメイン
├── targets.json                     # 許可ホスティング事業者 + 承認済みカスタムターゲット
├── reserved.json                    # 予約語
├── schema/register.schema.json      # register.json の JSON Schema
├── scripts/validate.mjs             # PR 検証（命名、重複、許可リスト、所有権、バッジ）
├── scripts/sync-dns.mjs             # Cloudflare DNS 同期（冪等、ワイルドカード、--prune）
└── .github/workflows/               # validate.yml / dns.yml
```

## ライセンス

[MIT](./LICENSE)
