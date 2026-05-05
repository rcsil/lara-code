export function getFileName(filePath: string): string {
	return filePath.split(/[\\/]/).pop() || filePath;
}

export function getFileExtension(filePath: string): string {
	const fileName = getFileName(filePath);
	const parts = fileName.split(".");

	if (fileName.endsWith(".blade.php")) {
		return "blade.php";
	}

	return parts.length > 1 ? parts.pop()?.toLowerCase() || "" : "";
}

export function getMonacoLanguage(filePath: string): string {
	const extension = getFileExtension(filePath);

	const languages: Record<string, string> = {
		php: "php",
		"blade.php": "html",
		js: "javascript",
		jsx: "javascript",
		ts: "typescript",
		tsx: "typescript",
		json: "json",
		css: "css",
		scss: "scss",
		html: "html",
		md: "markdown",
		yml: "yaml",
		yaml: "yaml",
		xml: "xml",
		sql: "sql",
		env: "plaintext",
		txt: "plaintext"
	};

	return languages[extension] || "plaintext";
}

export function shouldIgnoreFileSystemEntry(name: string): boolean {
	return [
		".git",
		"node_modules",
		"vendor",
		"target",
		"dist",
		"build",
		".tauri",
		".next",
		".nuxt"
	].includes(name);
}