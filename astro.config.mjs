// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import starlightLinksValidator from 'starlight-links-validator';

// https://astro.build/config
export default defineConfig({
	site: 'https://keycloak-for-frontend.dev',
	integrations: [
		// astro-mermaid must be registered before starlight.
		mermaid({
			theme: 'neutral',
			autoTheme: true,
		}),
		starlight({
			title: 'フロントエンドエンジニアのための Keycloak（非公式）',
			description:
				'Keycloak 公式ドキュメントをもとにした、フロントエンド / アプリケーションエンジニア向けの日本語ハンズオン学習サイト',
			favicon: '/favicon.png',
			locales: {
				root: {
					label: '日本語',
					lang: 'ja',
				},
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/asakaicode/keycloak-practice-for-application-engineer',
				},
			],
			components: {
				Footer: './src/components/SiteFooter.astro',
			},
			head: [
				{
					tag: 'meta',
					attrs: { property: 'og:image', content: 'https://keycloak-for-frontend.dev/houston-og.webp' },
				},
				{
					tag: 'meta',
					attrs: { name: 'twitter:card', content: 'summary_large_image' },
				},
			],
			plugins: [starlightLinksValidator()],
			sidebar: [
				{
					label: 'はじめに',
					items: [
						{ label: 'このサイトについて', slug: 'part0-introduction/about' },
						{ label: '学習の進め方', slug: 'part0-introduction/getting-started' },
					],
				},
				{
					label: 'Part 1: まず15分で動かす',
					items: [
						{ label: 'Docker で Keycloak を起動する', slug: 'part1-quickstart/1-docker' },
						{ label: 'サンプル SPA でログインしてみる', slug: 'part1-quickstart/2-spa-login' },
					],
				},
				{
					label: 'Part 2: 何が起きていたのか — 概念編',
					items: [
						{ label: 'IdP が解決する課題', slug: 'part2-concepts/1-idp' },
						{ label: 'OAuth 2.0 / OIDC のメンタルモデル', slug: 'part2-concepts/2-oauth-oidc' },
						{
							label: 'Authorization Code Flow + PKCE を図で追う',
							slug: 'part2-concepts/3-auth-code-pkce',
						},
					],
				},
				{
					label: 'Part 3: ハンズオン本編',
					items: [
						{
							label: 'Realm / Client / User を自分の手で作る',
							slug: 'part3-handson/1-realm-client-user',
						},
						{ label: 'keycloak-js で SPA を保護する', slug: 'part3-handson/2-keycloak-js' },
						{ label: 'トークン深掘り', slug: 'part3-handson/3-tokens' },
						{ label: 'ログアウトとセッション', slug: 'part3-handson/4-logout-session' },
						{ label: 'ロールとクレームを UI に反映する', slug: 'part3-handson/5-roles-claims' },
						{ label: 'API を保護する', slug: 'part3-handson/6-api-protection' },
					],
				},
				{
					label: 'Part 4: 現実と向き合う — 実務編',
					items: [
						{
							label: 'サードパーティ Cookie 問題',
							slug: 'part4-real-world/1-third-party-cookies',
						},
						{ label: 'BFF パターン', slug: 'part4-real-world/2-bff-pattern' },
						{ label: 'dev と prod の違い', slug: 'part4-real-world/3-dev-vs-prod' },
					],
				},
				{
					label: 'Part 5: エラー体験ラボ',
					items: [
						{ label: 'redirect_uri 不一致を直す', slug: 'part5-error-lab/1-redirect-uri' },
						{ label: 'CORS エラーを直す', slug: 'part5-error-lab/2-cors' },
						{ label: 'トークン期限切れ体験', slug: 'part5-error-lab/3-token-expiry' },
						{ label: 'その他の頻出エラー早見表', slug: 'part5-error-lab/4-common-errors' },
					],
				},
				{
					label: 'Part 6: リファレンス',
					items: [
						{ label: '用語集', slug: 'part6-reference/glossary' },
						{ label: 'OIDC エンドポイント早見表', slug: 'part6-reference/endpoints' },
						{ label: '公式ドキュメントの歩き方', slug: 'part6-reference/official-docs-guide' },
						{ label: 'クイズまとめ', slug: 'part6-reference/quiz' },
					],
				},
			],
		}),
	],
});
