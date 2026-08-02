// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'フロントエンドエンジニアのための Keycloak（非公式）',
			description:
				'Keycloak 公式ドキュメントをもとにした、フロントエンド / アプリケーションエンジニア向けの日本語ハンズオン学習サイト',
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
		}),
	],
});
