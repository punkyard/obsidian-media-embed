import { Plugin, PluginSettingTab, Setting, App } from 'obsidian';

interface MediaEmbedSettings {
	embedStyle: 'md' | 'iframe' | 'div';
	shortsWidth: string;
	useAltEmbedServer: boolean;
	altEmbedServerUrl: string;
}

const DEFAULT_SETTINGS: MediaEmbedSettings = {
	embedStyle: 'md',
	shortsWidth: '50%',
	useAltEmbedServer: false,
	altEmbedServerUrl: 'https://invidious.tiekoetter.com',
};

export default class MediaEmbed extends Plugin {
	settings: MediaEmbedSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new MediaEmbedSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on('editor-paste', (evt: ClipboardEvent) => {
				if (evt.defaultPrevented) return;
				const editor = this.app.workspace.activeEditor?.editor;
				if (!editor) return;

				const line = editor.getCursor().line;
				const lineText = editor.getLine(line).trim();
				if (lineText !== '') return;

				const pastedTextRaw = evt.clipboardData?.getData('text/plain') ?? '';
				if (!this.isOnlyYoutubeUrlPaste(pastedTextRaw)) return;

				const pastedText = pastedTextRaw.trim();
				const videoId = this.extractYoutubeId(pastedText);
				const startTime = this.extractYoutubeStartTime(pastedText);
				const isShort = pastedText.includes('/shorts/');
				const shortsWidth = this.settings.shortsWidth || '100%';
				const embedSrc = this.buildYoutubeEmbedSrc(videoId, startTime);

				if (videoId) {
					evt.preventDefault();

					let embedCode = '';

					switch (this.settings.embedStyle) {
						case 'md':
							embedCode = `![](${this.buildYoutubeWatchUrl(videoId, startTime)})`;
							break;
						case 'iframe':
							if (isShort) {
								embedCode = `<iframe style="aspect-ratio: 9/16; width: ${shortsWidth};" src="${embedSrc}" title="Media Embed" frameborder="0" allow="picture-in-picture" allowfullscreen></iframe>`;
						} else {
								embedCode = `<iframe width="100%" style="aspect-ratio: 16/9;" src="${embedSrc}" title="Media Embed" frameborder="0" allow="picture-in-picture" allowfullscreen></iframe>`;
							}
							break;
						case 'div':
							if (isShort) {
								embedCode = `<div style="position: relative; width: ${shortsWidth}; aspect-ratio: 9/16; overflow: hidden;"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="${embedSrc}" title="Media Embed" frameborder="0" allow="picture-in-picture" allowfullscreen></iframe></div>`;
						} else {
								embedCode = `<div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="${embedSrc}" title="Media Embed" frameborder="0" allow="picture-in-picture" allowfullscreen></iframe></div>`;
							}
							break;
					}

					editor.replaceRange(embedCode, { line: line, ch: 0 }, { line: line, ch: lineText.length });
					editor.setCursor({ line: line, ch: embedCode.length });
				}
			})
		);
	}

	isOnlyYoutubeUrlPaste(text: string): boolean {
		const trimmed = text.trim();
		if (trimmed === '') return false;
		if (/\s/.test(trimmed)) return false;

		const isYoutubeHost = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(trimmed);
		if (!isYoutubeHost) return false;

		return this.extractYoutubeId(trimmed) !== null;
	}

	buildYoutubeEmbedSrc(videoId: string | null, startTime: number | null): string {
		const host = this.settings.useAltEmbedServer ? this.settings.altEmbedServerUrl : 'https://www.youtube.com';
		let url = `${host}/embed/${videoId ?? ''}`;
		if (!videoId) return url;

		const params: string[] = [];
		if (this.settings.useAltEmbedServer) params.push('autoplay=0');
		if (startTime !== null && startTime >= 0) params.push(`start=${startTime}`);

		return params.length ? `${url}?${params.join('&')}` : url;
	}

	buildYoutubeWatchUrl(videoId: string | null, startTime: number | null): string {
		if (!videoId) return '';

		let url = `https://www.youtube.com/watch?v=${videoId}`;
		if (startTime !== null && startTime >= 0) {
			url += `&t=${startTime}`;
		}

		return url;
	}

	extractYoutubeStartTime(url: string): number | null {
		const timeMatch = url.match(/[?&#](?:t|start)=([^&#]+)/i);
		if (!timeMatch?.[1]) return null;

		return this.parseYouTubeTimeToSeconds(timeMatch[1]);
	}

	parseYouTubeTimeToSeconds(value: string): number | null {
		const normalized = value.trim().toLowerCase();
		if (normalized === '') return null;

		if (/^\d+$/.test(normalized)) {
			return Number.parseInt(normalized, 10);
		}

		const match = normalized.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
		if (!match) return null;

		const hours = Number.parseInt(match[1] ?? '0', 10);
		const minutes = Number.parseInt(match[2] ?? '0', 10);
		const seconds = Number.parseInt(match[3] ?? '0', 10);
		const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

		return totalSeconds > 0 ? totalSeconds : null;
	}

	normalizeShortsWidth(value: string): string {
		const normalized = value.trim().replace(/\s+/g, '');
		if (normalized === '') {
			return '100%';
		}
		if (/^\d+$/.test(normalized)) {
			return `${normalized}px`;
		}
		if (/^\d+(?:\.\d+)?%$/.test(normalized) || /^\d+(?:\.\d+)?px$/.test(normalized)) {
			return normalized;
		}
		return normalized;
	}

	extractYoutubeId(url: string): string | null {
		const trimmed = url.trim();
		if (!trimmed) return null;
		try {
			const parsed = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
			const hostname = parsed.hostname.toLowerCase();
			if (!/(?:^|\.)youtube\.com$|(?:^|\.)youtu\.be$/.test(hostname)) return null;
			if (/youtu\.be$/.test(hostname)) {
				return this.normalizeYoutubeId(parsed.pathname.slice(1).split(/[/?#]/)[0] ?? '');
			}
			const path = parsed.pathname;
			if (path.startsWith('/shorts/')) return this.normalizeYoutubeId(path.split('/')[2] ?? '');
			if (path.startsWith('/embed/')) return this.normalizeYoutubeId(path.split('/')[2] ?? '');
			if (path === '/watch' || path === '/watch/') return this.normalizeYoutubeId(parsed.searchParams.get('v') ?? '');
			return null;
		} catch {
			return null;
		}
	}

	normalizeYoutubeId(value: string): string | null {
		const id = value.trim();
		return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<MediaEmbedSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class MediaEmbedSettingTab extends PluginSettingTab {
	plugin: MediaEmbed;

	constructor(app: App, plugin: MediaEmbed) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		const embedDesc = createFragment();
		embedDesc.append(
			'Choose how YouTube links are automatically formatted when pasted on an empty line.',
			embedDesc.createEl('br'),
			embedDesc.createEl('br'),
			embedDesc.createSpan({ text: '1. Markdown: ![]() — displays all videos.' }),
			embedDesc.createEl('br'),
			embedDesc.createSpan({ text: '2. Iframe: simple HTML — fills pane width.' }),
			embedDesc.createEl('br'),
			embedDesc.createSpan({ text: '3. Div: resilient wrapper.' }),
		);

		new Setting(containerEl)
			.setName('Embed style')
			.setDesc(embedDesc)
			.addDropdown(dropdown => dropdown
				.addOption('md', 'Markdown (default)')
				.addOption('iframe', 'Iframe (responsive)')
				.addOption('div', 'Div (responsive)')
				.setValue(this.plugin.settings.embedStyle)
				.onChange(async (value: string) => {
					this.plugin.settings.embedStyle = value as MediaEmbedSettings['embedStyle'];
					await this.plugin.saveSettings();
					this.display();
				}));

		new Setting(containerEl)
			.setName('YouTube shorts width')
			.setDesc('Width of the embed for YouTube shorts (portrait videos). Enter a number for pixels (for example, 360) or a percentage for ratio (for example, 50%).')
			.addText(text => text
				.setPlaceholder('50%')
				.setValue(this.plugin.settings.shortsWidth)
				.onChange(async (value: string) => {
					this.plugin.settings.shortsWidth = this.plugin.normalizeShortsWidth(value);
					await this.plugin.saveSettings();
				}));

		if (this.plugin.settings.embedStyle !== 'md') {
			const altServerDesc = createFragment();
			altServerDesc.append(
				'Use an Invidious instance (e.g. https://invidious.tiekoetter.com) to bypass YouTube embed restrictions. May load slower.',
			);

			new Setting(containerEl)
				.setName('Use alternative embed server')
				.setDesc(altServerDesc)
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.useAltEmbedServer)
					.onChange(async (value: boolean) => {
						this.plugin.settings.useAltEmbedServer = value;
						await this.plugin.saveSettings();
						this.display();
					}));

			if (this.plugin.settings.useAltEmbedServer) {
				new Setting(containerEl)
					.setName('Alternative embed server URL')
					.setDesc('Base URL of the alternative server. Must serve embeds at /embed/{VIDEO_ID}.')
					.addText(text => text
						.setPlaceholder('https://invidious.tiekoetter.com')
						.setValue(this.plugin.settings.altEmbedServerUrl)
						.onChange(async (value: string) => {
							this.plugin.settings.altEmbedServerUrl = value.replace(/\/+$/, '');
							await this.plugin.saveSettings();
						}));
			}
		}
	}
}