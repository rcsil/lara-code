import {
	IconChevronDown,
	IconChevronRight,
	IconCircleDot,
	IconFile,
	IconFilePlus,
	IconFolder,
	IconFolderPlus,
	IconFolderOpen,
	IconGitBranch,
	IconPlayerPlay,
	IconTerminal2,
	IconX,
} from "@tabler/icons-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { FileTreeNode, OpenedFile } from "../types/file-system";
import { CodeEditor } from "./ui/CodeEditor";

type FileExplorerProps = {
	openedFiles: OpenedFile[];
	activeFile: OpenedFile | null;
	activeFileId: string | null;
	workspacePath: string | null;
	tree: FileTreeNode[];
	isLoading: boolean;
	onNewFile: () => void;
	onNewFolder: () => void;
	onSaveFile: () => void;
	onFileContentChange: (content: string) => void;
	onSelectFileTab: (fileId: string) => void;
	onCloseFileTab: (fileId: string) => void;
	onOpenTreeFile: (path: string) => void;
	onToggleDirectory: (path: string) => void;
};

type TreeNodeProps = {
	node: FileTreeNode;
	activePath: string | null;
	level: number;
	onOpenTreeFile: (path: string) => void;
	onToggleDirectory: (path: string) => void;
};

function getDisplayPath(path: string | null) {
	if (!path) {
		return "Novus";
	}

	return path.split(/[\\/]/).pop() || path;
}

function TreeNode({
	node,
	activePath,
	level,
	onOpenTreeFile,
	onToggleDirectory,
}: TreeNodeProps) {
	const isFile = node.type === "file";
	const isActive = isFile && node.path === activePath;
	const Icon = isFile ? IconFile : node.isExpanded ? IconFolderOpen : IconFolder;

	return (
		<div>
			<button
				type="button"
				onClick={() => {
					if (isFile) {
						onOpenTreeFile(node.path);
						return;
					}

					onToggleDirectory(node.path);
				}}
				className={`flex h-8 w-full items-center gap-2 rounded-lg pr-2 text-left text-sm hover:bg-white/7 hover:text-zinc-100 ${isActive ? "bg-white/8 text-zinc-100" : "text-zinc-400"
					}`}
				style={{ paddingLeft: `${8 + level * 14}px` }}
			>
				{isFile ? (
					<span className="w-3" />
				) : node.isExpanded ? (
					<IconChevronDown size={14} stroke={1.7} />
				) : (
					<IconChevronRight size={14} stroke={1.7} />
				)}
				<Icon
					size={16}
					stroke={1.5}
					className={isActive ? "text-[#FF2D20]" : undefined}
				/>
				<span className="truncate">{node.name}</span>
				{node.isLoading && (
					<span className="ml-auto text-[11px] text-zinc-600">...</span>
				)}
			</button>

			{node.isExpanded && node.children?.length > 0 && (
				<div>
					{node.children.map((child) => (
						<TreeNode
							key={child.path}
							node={child}
							activePath={activePath}
							level={level + 1}
							onOpenTreeFile={onOpenTreeFile}
							onToggleDirectory={onToggleDirectory}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export default function FileExplorer({
	openedFiles,
	activeFile,
	activeFileId,
	workspacePath,
	tree,
	isLoading,
	onNewFile,
	onNewFolder,
	onSaveFile,
	onFileContentChange,
	onSelectFileTab,
	onCloseFileTab,
	onOpenTreeFile,
	onToggleDirectory,
}: FileExplorerProps) {
	const { t } = useTranslation();
	const isDirty = activeFile
		? activeFile.content !== activeFile.savedContent
		: false;

	const editorStats = useMemo(() => {
		const lines = activeFile?.content
			? activeFile.content.split(/\r\n|\r|\n/).length
			: 1;
		const characters = activeFile?.content.length ?? 0;

		return { lines, characters };
	}, [activeFile?.content]);

	return (
		<section className="ml-2 grid min-w-0 flex-1 grid-cols-[300px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-white/8 bg-[#0c0e12] shadow-2xl shadow-black/25">
			<aside className="flex min-h-0 flex-col border-r border-white/8 bg-[#151820]">
				<div className="flex h-12 items-center justify-between border-b border-white/8 px-3">
					<div className="min-w-0">
						<p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
							{t("app.fileExplorer.title")}
						</p>
						<p className="truncate text-xs text-zinc-300">
							{getDisplayPath(workspacePath)}
						</p>
					</div>

					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={onNewFile}
							disabled={isLoading}
							className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-white/8 hover:text-white disabled:opacity-50"
							title={t("app.actions.newFile")}
							aria-label={t("app.actions.newFile")}
						>
							<IconFilePlus size={18} stroke={1.5} />
						</button>
						<button
							type="button"
							onClick={onNewFolder}
							disabled={isLoading}
							className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-white/8 hover:text-white disabled:opacity-50"
							title={t("app.actions.newFolder")}
							aria-label={t("app.actions.newFolder")}
						>
							<IconFolderPlus size={18} stroke={1.5} />
						</button>
					</div>
				</div>

				<div className="min-h-0 flex-1 overflow-auto px-2 py-3">
					<div className="mb-2 flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-300">
						<IconChevronDown size={15} stroke={1.8} />
						<span className="truncate">{getDisplayPath(workspacePath)}</span>
					</div>

					<div className="space-y-0.5">
						{tree.length > 0 ? (
							tree.map((node) => (
								<TreeNode
									key={node.path}
									node={node}
									activePath={activeFile?.path ?? null}
									level={0}
									onOpenTreeFile={onOpenTreeFile}
									onToggleDirectory={onToggleDirectory}
								/>
							))
						) : (
							<p className="px-2 py-3 text-xs leading-5 text-zinc-500">
								{t("app.fileExplorer.emptyTree")}
							</p>
						)}
					</div>
				</div>
			</aside>
			<div className="flex min-w-0 flex-col bg-[#090b10]">
				<section className="flex h-10 shrink-0 items-center justify-between border-b border-white/8 bg-[#0c0f14] text-xs">
					<div className="flex min-w-0 flex-1 items-stretch self-stretch overflow-x-auto">
						{openedFiles.length > 0 ? (
							openedFiles.map((file) => {
								const fileIsActive = file.id === activeFileId;
								const fileIsDirty = file.content !== file.savedContent;

								return (
									<div
										key={file.id}
										className={`group relative flex max-w-[240px] shrink-0 items-center border-r border-white/8 text-zinc-400 transition-colors hover:bg-white/7 hover:text-zinc-100 ${fileIsActive ? "bg-[#171b24] text-zinc-100" : ""
											}`}
									>
										{fileIsActive && (
											<span className="absolute inset-x-0 top-0 h-0.5 bg-[#FF2D20]" />
										)}
										<button
											type="button"
											onClick={() => onSelectFileTab(file.id)}
											className="flex h-full min-w-0 flex-1 items-center gap-2 px-3 text-left"
										>
											<IconFile
												size={14}
												stroke={1.5}
												className={fileIsActive ? "text-[#FF2D20]" : undefined}
											/>
											<span className="truncate">{file.name}</span>
											{fileIsDirty && (
												<span className="h-2 w-2 shrink-0 rounded-full bg-amber-300" />
											)}
										</button>
										<button
											type="button"
											onClick={(event) => {
												event.stopPropagation();
												onCloseFileTab(file.id);
											}}
											className="mr-2 grid h-5 w-5 shrink-0 place-items-center rounded-md text-zinc-500 opacity-0 transition-opacity hover:bg-white/10 hover:text-white group-hover:opacity-100"
											aria-label={t("app.fileExplorer.closeTab", {
												name: file.name,
											})}
											title={t("app.fileExplorer.closeTab", {
												name: file.name,
											})}
										>
											<IconX size={13} stroke={1.8} />
										</button>
									</div>
								);
							})
						) : (
							<span className="flex items-center px-3 text-zinc-500">
								{t("app.fileExplorer.noActiveFile")}
							</span>
						)}
					</div>
				</section>

				<div className="min-h-0 flex-1 overflow-hidden bg-[#090b10]">
					<div className="flex h-full min-h-0 flex-col overflow-hidden border border-white/10 bg-[#0b0e14] shadow-inner shadow-black/40">
						<div className="min-h-0 flex-1 overflow-hidden">
							{activeFile ? (
								<CodeEditor
									value={activeFile.content}
									language={activeFile.language}
									path={activeFile.path}
									//placeholder={editorPlaceholder}
									onChange={onFileContentChange}
									onSave={onSaveFile}
								/>
							) : (
								<div className="grid h-full place-items-center text-sm text-zinc-500">
									{t("app.fileExplorer.noActiveFile")}
								</div>
							)}
						</div>

						<div className="flex h-8 shrink-0 items-center justify-between border-t border-white/8 bg-[#11151d] px-3 font-mono text-[11px] text-zinc-500">
							<div className="flex min-w-0 items-center gap-4">
								<span>Ln 1, Col 1</span>
								<span>Spaces: 2</span>
								<span>UTF-8</span>
							</div>
							<div className="flex min-w-0 items-center gap-4">
								<span>{editorStats.lines} lines</span>
								<span>{editorStats.characters} chars</span>
								<span className="text-[#FF2D20]">
									{activeFile?.language ?? "plaintext"}
								</span>
							</div>
						</div>
					</div>
				</div>

				<footer className="h-40 shrink-0 overflow-hidden border border-white/8 bg-[#0d1016]">
					<div className="flex h-9 items-center justify-between border-b border-white/8 px-3 text-xs">
						<div className="flex items-center gap-3">
							<span className="text-zinc-500">Problems</span>
							<span className="text-zinc-500">Output</span>
							<span className="flex h-7 items-center gap-1.5 border-b border-red-400 font-medium text-zinc-200">
								<IconTerminal2 size={15} stroke={1.7} />
								Terminal
							</span>
							<span className="text-zinc-500">Ports</span>
						</div>

						<button
							type="button"
							className="grid h-7 w-7 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-white/8 hover:text-zinc-200"
							title="Executar"
							aria-label="Executar"
						>
							<IconPlayerPlay size={15} stroke={1.8} />
						</button>
					</div>

					<div className="grid h-[calc(100%-64px)] content-start gap-1 overflow-hidden px-4 py-3 font-mono text-xs leading-5 text-zinc-400">
						<span className="text-emerald-300">
							INFO  Server running on [http://127.0.0.1:8000].
						</span>
						<span>
							<span className="text-zinc-600">$</span> php artisan route:list
						</span>
						<span className="text-zinc-500">
							GET|HEAD / ........................................ welcome
						</span>
						<span className="flex items-center gap-2 text-zinc-500">
							<IconCircleDot size={12} stroke={2} />
							Aguardando comandos do projeto
						</span>
					</div>

					<div className="flex h-7 items-center justify-between bg-red-500 px-3 text-[11px] font-medium text-white">
						<div className="flex min-w-0 items-center gap-4">
							<span className="flex items-center gap-1.5">
								<IconGitBranch size={14} stroke={1.8} />
								main
							</span>
							<span>Laravel</span>
							<span>{(activeFile?.language ?? "plaintext").toUpperCase()}</span>
						</div>
						<span className="truncate text-white/80">
							{isDirty ? "Unsaved" : "Saved"}
						</span>
					</div>
				</footer>
			</div>
		</section>
	);
}
