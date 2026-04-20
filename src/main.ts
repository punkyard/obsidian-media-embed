import { Plugin, PluginSettingTab, Setting, App } from 'obsidian';

interface VideoEmbedSettings {
	embedStyle: 'md' | 'iframe' | 'div';
}

const DEFAULT_SETTINGS: VideoEmbedSettings = {
	embedStyle: 'md',
};

export default class VideoEmbed extends Plugin {
	settings: VideoEmbedSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new VideoEmbedSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on('editor-paste', (evt: ClipboardEvent) => {
				const editor = this.app.workspace.activeEditor?.editor;
				if (!editor) return;

				const line = editor.getCursor().line;
				const lineText = editor.getLine(line).trim();
				if (lineText !== '') return;

				const pastedText = evt.clipboardData?.getData('text/plain') ?? '';
				const videoId = this.extractYoutubeId(pastedText);

				if (videoId) {
					evt.preventDefault();

					let embedCode = '';

					switch (this.settings.embedStyle) {
						case 'md':
							embedCode = `![](${pastedText})`;
							break;
						case 'iframe':
							embedCode = `<iframe width="100%" style="aspect-ratio: 16/9;" src="https://www.youtube.com/embed/${videoId}" title="Video Embed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
							break;
						case 'div':
							embedCode = `<div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/${videoId}" title="Video Embed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
							break;
					}

					editor.replaceRange(embedCode, { line: line, ch: 0 }, { line: line, ch: lineText.length });
				}
			})
		);
	}

	extractYoutubeId(url: string): string | null {
		const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
		const match = url.match(regex);
		return match ? (match[1] ?? null) : null;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class VideoEmbedSettingTab extends PluginSettingTab {
	plugin: VideoEmbed;

	constructor(app: App, plugin: VideoEmbed) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Video Embed Settings' });

		new Setting(containerEl)
			.setName('Embed Style')
			.setDesc('Choose how YouTube links are automatically formatted when pasted on an empty line.')
			.addDropdown(dropdown => dropdown
				.addOption('md', '1. standard markdown')
				.addOption('iframe', '2. iframe (responsive)')
				.addOption('div', '3. div (responsive)')
				.setValue(this.plugin.settings.embedStyle)
				.onChange(async (value: string) => {
					this.plugin.settings.embedStyle = value as VideoEmbedSettings['embedStyle'];
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('p', { text: "1. markdown: ![]() — cleanest code but locks the video to a fixed size, unresponsive — may result in empty space or black bars above/below the video." });
		containerEl.createEl('p', { text: "2. iframe container: simple HTML — the video stretches to fill the width of the Obsidian pane without any black bars." });
		containerEl.createEl('p', { text: "3. div container: slightly heavier HTML wrapper — the bulletproof standard that should work in 100% of cases." });
	}
}