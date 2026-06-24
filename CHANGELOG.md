# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Added
- Alternative embed server support — toggle in settings to route YouTube embeds through an Invidious instance, bypassing embed restrictions for blocked videos (#46)
- Settings UI: conditional "Alternative embed server URL" field, only visible when toggle is on and embed style is iframe/div

### Changed
- `buildYoutubeEmbedSrc` uses configurable host based on toggle (defaults to `youtube.com/embed/`)
- Invidious embed URLs include `?autoplay=0` to prevent autoplay

## [1.2.0] - 2026-06-13

### Changed
- Replace `eslint-plugin-import` with `eslint-plugin-import-x` for lint compat

## [1.1.9] - 2026-06-13

### Added
- CONTRIBUTING guide with dev setup and PR guidelines

### Changed
- Move CONTRIBUTING to `docs/`
- Link to CONTRIBUTING in README

### Removed
- Duplicate roadmap lines in README

## [1.1.8] - 2026-06-13

### Added
- ESLint configuration
- `.gitignore` for ZIP artifacts

### Changed
- README updates
- License to MIT

## [1.1.7] - 2026-06-11

### Changed
- License from GPL-3.0 to MIT (#39, #41)

### Added
- `.gitignore` for ZIP files
- `docs/` directory

## [1.1.6] - 2026-06-11

### Fixed
- Replaced truncated LICENSE.md with full GPL-3.0-or-later text (#36, #38)

## [1.1.5] - 2026-06-11

### Fixed
- Renamed LICENSE to LICENSE.md for GitHub recognition (#33, #35)

## [1.1.4] - 2026-06-11

### Added
- CI release workflow with GitHub artifact attestation for `main.js` (#20, #21, #27, #28)
- Auto-generated release notes in CI

### Fixed
- Removed redundant `src/styles.css` (#32)
- Added `styles.css` to artifact attestation (#29, #30)

## [1.1.3] - 2026-06-11

### Fixed
- Pinned `obsidian` dependency to exact version `1.13.1` (#18, #26)
- Committed `package-lock.json` for reproducible builds (#19, #26)
- All Scorecard source code warnings: popout window compat, `createFragment()`, unsafe `any` assignment, defaultPrevented guard (#13–#17, #25)
- Aligned `package.json` license field with GPL-3.0 LICENSE (#24)

## [1.1.2] - 2026-04-30

### Changed
- Renamed plugin from "Video Embed" to "Media Embed"
- Updated all references in source, manifest, and docs

## [1.1.1] - 2026-04-24

### Added
- Missing assets (images) for README

### Changed
- README: updated manual install to include `styles.css`, use release ZIP

## [1.1.0] - 2026-04-20

### Added
- Portrait layout for YouTube Shorts
- Configurable shorts width setting

### Fixed
- Cursor moves to end of embed after paste
- Iframe/div timestamp handling for YouTube URLs with `t=` param (#2)

## [1.0.0] - 2026-04-20

### Added
- Initial release
- Intercepts YouTube URLs (`youtu.be`, `/shorts/`, `/embed/`, `/watch?v=`) pasted on empty lines
- Three embed styles: Markdown, Iframe, Div
- Settings panel for embed style selection
- Desktop and mobile support
