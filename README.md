<p align="center">
  <img src="public/novus.svg" width="96" height="96" alt="Novus IDE" />
</p>

<h1 align="center">Novus IDE</h1>

<p align="center">
  <strong>Open-source PHP IDE focused on Laravel</strong>
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/github/package-json/v/rcsil/novus?filename=package.json&label=version&color=red" />
  <img alt="Version status" src="https://img.shields.io/badge/status-early%20development-yellow" />
  <img alt="Stack" src="https://img.shields.io/badge/Tauri%20%2B%20Rust-desktop-blue" />
</p>

Novus IDE is an open-source PHP IDE focused on Laravel projects. It is built as a desktop application with Tauri and Rust, using React, TypeScript, and Monaco Editor to provide a lightweight code editing experience.

## Version

- Current version: defined in [`package.json`](package.json)
- Status: early development
- Channel: pre-release

## Goal

Novus is designed as an IDE dedicated to Laravel development workflows, with a simple and fast desktop interface that can evolve with PHP ecosystem-specific features.

## Current Features

- Code editor powered by Monaco Editor.
- Language support for PHP, Blade, JavaScript, TypeScript, JSON, CSS, SCSS, HTML, Markdown, YAML, XML, SQL, and text files.
- Native file and folder selection through Tauri.
- File explorer with project directory navigation.
- File creation, editing, and saving.
- Tabs for open files and unsaved change indicators.
- Brazilian Portuguese interface.
- Borderless desktop window prepared for a custom IDE experience.

## Stack

- Tauri 2
- Rust
- React
- TypeScript
- Vite
- Tailwind CSS
- Monaco Editor
- i18next

## Requirements

- Node.js
- npm
- Rust
- Tauri system dependencies for your operating system

Check the official Tauri documentation if you need to prepare your native desktop development environment.

## Development

Install dependencies:

```bash
npm install
```

Run the desktop application:

```bash
npm run tauri dev
```

Run only the Vite frontend:

```bash
npm run dev
```

Build the frontend:

```bash
npm run build
```

Build desktop packages with Tauri:

```bash
npm run tauri build
```

## Project Structure

```text
src/          React interface, editor, explorer, and frontend services
src-tauri/    Tauri application, desktop configuration, and Rust code
public/       Public frontend assets
```

## Status

The project is in early development. The current foundation already supports opening projects, browsing files, and editing code, while Laravel-specific features can evolve in future versions.

## Open Source

Novus IDE is an open-source project. Contributions, ideas, and improvements for the PHP/Laravel workflow are welcome.
