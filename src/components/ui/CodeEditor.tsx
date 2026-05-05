import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import "monaco-editor/esm/vs/basic-languages/css/css.contribution";
import "monaco-editor/esm/vs/basic-languages/html/html.contribution";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution";
import "monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution";
import "monaco-editor/esm/vs/basic-languages/php/php.contribution";
import "monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution";

import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

const monacoGlobal = globalThis as typeof globalThis & {
	MonacoEnvironment: monaco.Environment;
};

monacoGlobal.MonacoEnvironment = {
	getWorker(_: string, label: string) {
		if (label === "json") {
			return new JsonWorker();
		}

		if (label === "css" || label === "scss" || label === "less") {
			return new CssWorker();
		}

		if (label === "html" || label === "handlebars" || label === "razor") {
			return new HtmlWorker();
		}

		if (label === "typescript" || label === "javascript") {
			return new TsWorker();
		}

		return new EditorWorker();
	},
};

type CodeEditorProps = {
	value: string;
	language: string;
	path?: string | null;
	placeholder?: string;
	onChange: (value: string) => void;
	onSave?: () => void;
};

let themeDefined = false;

function ensureTheme() {
	if (themeDefined) {
		return;
	}

	monaco.editor.defineTheme("novus-dark", {
		base: "vs-dark",
		inherit: true,
		rules: [],
		colors: {
			"editor.background": "#0b0e14",
			"editor.foreground": "#d4d4d8",
			"editorGutter.background": "#0b0e14",
			"editor.lineHighlightBackground": "#171b24",
			"editor.lineHighlightBorder": "#ffffff00",
			"editorLineNumber.foreground": "#4b5563",
			"editorLineNumber.activeForeground": "#e4e4e7",
			"editor.selectionBackground": "#ef444433",
			"editorCursor.foreground": "#f4f4f5",
			"editorIndentGuide.background1": "#272b35",
			"editorIndentGuide.activeBackground1": "#525866",
			"editorBracketMatch.background": "#ef44441f",
			"editorBracketMatch.border": "#ef444499",
			"minimap.background": "#0b0e14",
			"scrollbarSlider.background": "#71717a44",
			"scrollbarSlider.hoverBackground": "#71717a66",
			"scrollbarSlider.activeBackground": "#a1a1aa77",
		},
	});

	themeDefined = true;
}

export function CodeEditor({
	value,
	language,
	path,
	placeholder,
	onChange,
	onSave,
}: CodeEditorProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const modelRef = useRef<monaco.editor.ITextModel | null>(null);
	const onChangeRef = useRef(onChange);
	const onSaveRef = useRef(onSave);

	useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	useEffect(() => {
		onSaveRef.current = onSave;
	}, [onSave]);

	useEffect(() => {
		const container = containerRef.current;

		if (!container) {
			return;
		}

		ensureTheme();

		const model = monaco.editor.createModel(
			value,
			language,
			monaco.Uri.file(path || "untitled"),
		);

		const editor = monaco.editor.create(container, {
			model,
			theme: "novus-dark",
			automaticLayout: true,
			fontFamily: "JetBrains Mono, Consolas, Monaco, monospace",
			fontSize: 14,
			lineHeight: 22,
			minimap: {
				enabled: true,
				maxColumn: 80,
				renderCharacters: false,
				scale: 1,
				showSlider: "mouseover",
			},
			bracketPairColorization: {
				enabled: true,
			},
			cursorSmoothCaretAnimation: "on",
			folding: true,
			fontLigatures: true,
			guides: {
				bracketPairs: true,
				indentation: true,
			},
			lineDecorationsWidth: 14,
			lineNumbersMinChars: 3,
			scrollBeyondLastLine: false,
			smoothScrolling: true,
			padding: {
				top: 18,
				bottom: 18,
			},
			renderLineHighlight: "line",
			roundedSelection: false,
			tabSize: 2,
			wordWrap: "off",
		});

		const changeSubscription = model.onDidChangeContent(() => {
			onChangeRef.current(model.getValue());
		});

		editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
			onSaveRef.current?.();
		});

		const resizeObserver = new ResizeObserver(() => {
			editor.layout();
		});

		resizeObserver.observe(container);
		editorRef.current = editor;
		modelRef.current = model;

		return () => {
			resizeObserver.disconnect();
			changeSubscription.dispose();
			editor.dispose();
			model.dispose();
			editorRef.current = null;
			modelRef.current = null;
		};
	}, []);

	useEffect(() => {
		const model = modelRef.current;

		if (!model || model.getValue() === value) {
			return;
		}

		model.pushEditOperations(
			[],
			[
				{
					range: model.getFullModelRange(),
					text: value,
				},
			],
			() => null,
		);
	}, [value]);

	useEffect(() => {
		const model = modelRef.current;

		if (!model) {
			return;
		}

		monaco.editor.setModelLanguage(model, language);
	}, [language]);

	return (
		<div className="relative h-full min-h-0 w-full">
			<div ref={containerRef} className="h-full w-full" />

			{!value && placeholder && (
				<pre className="pointer-events-none absolute left-[76px] top-[18px] m-0 whitespace-pre-wrap font-mono text-sm leading-[22px] text-zinc-600">
					{placeholder}
				</pre>
			)}
		</div>
	);
}
