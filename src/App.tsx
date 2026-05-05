import { useCallback, useEffect, useState } from "react";
import { IconFilePlus, IconFolderOpen, IconKeyboard } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import FileExplorer from "./components/FileExplorer";
import { AppLayout } from "./components/Layouts/AppLayout";
import { getFileName, getMonacoLanguage } from "./lib/files";
import { updateTreeNode } from "./lib/tree";
import {
	openFileFromPath,
	createDirectoryInProject,
	pickFilePath,
	pickFolderPath,
	pickSaveFilePath,
	readDirectory,
	saveFileToPath,
} from "./services/file-system";
import type { FileTreeNode, OpenedFile } from "./types/file-system";

function createUntitledFile(index: number): OpenedFile {
	return {
		id: `untitled-${Date.now()}-${index}`,
		path: null,
		name: index === 1 ? "new file" : `new file ${index}`,
		content: "",
		savedContent: "",
		language: "plaintext",
	};
}

function App() {
	const { t } = useTranslation();
	const [isExplorerActive, setIsExplorerActive] = useState(false);
	const [openedFiles, setOpenedFiles] = useState<OpenedFile[]>([]);
	const [activeFileId, setActiveFileId] = useState<string | null>(null);
	const [workspacePath, setWorkspacePath] = useState<string | null>(null);
	const [tree, setTree] = useState<FileTreeNode[]>([]);
	const [, setStatus] = useState(t("app.status.noFile"));
	const [isLoading, setIsLoading] = useState(false);

	const activeFile =
		openedFiles.find((file) => file.id === activeFileId) ?? openedFiles[0] ?? null;

	const refreshWorkspaceTree = useCallback(
		async (path = workspacePath) => {
			if (!path) {
				return;
			}

			const children = await readDirectory(path);
			setTree(children);
		},
		[workspacePath],
	);

	const handleNewFile = useCallback(() => {
		setOpenedFiles((files) => {
			const file = createUntitledFile(
				files.filter((item) => item.path === null).length + 1,
			);
			setActiveFileId(file.id);
			return [...files, file];
		});
		setIsExplorerActive(true);
		setStatus(t("app.status.newFile"));
	}, [t]);

	const handleOpenFile = useCallback(async () => {
		try {
			setIsLoading(true);
			setStatus(t("app.status.openingFile"));

			const selectedPath = await pickFilePath();

			if (!selectedPath) {
				setStatus(t("app.status.openCanceled"));
				return;
			}

			const file = await openFileFromPath(selectedPath);
			setOpenedFiles((files) => {
				if (files.some((item) => item.path === selectedPath)) {
					return files;
				}

				return [...files, file];
			});
			setActiveFileId(file.id);
			setIsExplorerActive(true);
			setStatus(t("app.status.fileOpened", { path: selectedPath }));
		} catch (error) {
			console.error(error);
			setStatus(t("app.status.openFileError", { error: String(error) }));
		} finally {
			setIsLoading(false);
		}
	}, [t]);

	const handleOpenFolder = useCallback(async () => {
		try {
			setIsLoading(true);
			setStatus(t("app.status.openingFolder"));

			const selectedPath = await pickFolderPath();

			if (!selectedPath) {
				setStatus(t("app.status.openCanceled"));
				return;
			}

			const children = await readDirectory(selectedPath);
			setWorkspacePath(selectedPath);
			setTree(children);
			setIsExplorerActive(true);
			setStatus(t("app.status.folderOpened", { path: selectedPath }));
		} catch (error) {
			console.error(error);
			setStatus(t("app.status.openFolderError", { error: String(error) }));
		} finally {
			setIsLoading(false);
		}
	}, [t]);

	const handleNewFolder = useCallback(async () => {
		if (!workspacePath) {
			setStatus(t("app.status.openFolderFirst"));
			return;
		}

		try {
			setIsLoading(true);
			setStatus(t("app.status.creatingFolder"));

			const folderName = getNextFolderName(tree.map((node) => node.name));
			const createdPath = await createDirectoryInProject(workspacePath, folderName);
			await refreshWorkspaceTree(workspacePath);
			setIsExplorerActive(true);
			setStatus(t("app.status.folderCreated", { path: createdPath }));
		} catch (error) {
			console.error(error);
			setStatus(t("app.status.createFolderError", { error: String(error) }));
		} finally {
			setIsLoading(false);
		}
	}, [refreshWorkspaceTree, t, tree, workspacePath]);

	const handleSaveFile = useCallback(async () => {
		if (!activeFile) {
			handleNewFile();
			return;
		}

		try {
			setIsLoading(true);
			setStatus(t("app.status.savingFile"));

			let targetPath = activeFile.path;

			if (!targetPath) {
				targetPath = await pickSaveFilePath();

				if (!targetPath) {
					setStatus(t("app.status.saveCanceled"));
					return;
				}
			}

			await saveFileToPath(targetPath, activeFile.content);
			const savedFile: OpenedFile = {
				id: targetPath,
				path: targetPath,
				name: getFileName(targetPath),
				content: activeFile.content,
				savedContent: activeFile.content,
				language: getMonacoLanguage(targetPath),
			};

			setOpenedFiles((files) =>
				files
					.filter(
						(file) => file.id === activeFile.id || file.path !== targetPath,
					)
					.map((file) => (file.id === activeFile.id ? savedFile : file)),
			);
			setActiveFileId(savedFile.id);
			await refreshWorkspaceTree();
			setIsExplorerActive(true);
			setStatus(t("app.status.fileSaved", { path: targetPath }));
		} catch (error) {
			console.error(error);
			setStatus(t("app.status.saveFileError", { error: String(error) }));
		} finally {
			setIsLoading(false);
		}
	}, [activeFile, handleNewFile, refreshWorkspaceTree, t]);

	const handleOpenTreeFile = useCallback(
		async (path: string) => {
			try {
				setIsLoading(true);
				setStatus(t("app.status.openingFile"));

				const file = await openFileFromPath(path);
				setOpenedFiles((files) => {
					if (files.some((item) => item.path === path)) {
						return files;
					}

					return [...files, file];
				});
				setActiveFileId(file.id);
				setStatus(t("app.status.fileOpened", { path }));
			} catch (error) {
				console.error(error);
				setStatus(t("app.status.openFileError", { error: String(error) }));
			} finally {
				setIsLoading(false);
			}
		},
		[t],
	);

	const handleToggleDirectory = useCallback(
		async (path: string) => {
			const target = findTreeNode(tree, path);

			if (!target || target.type !== "directory") {
				return;
			}

			if (target.isExpanded) {
				setTree((nodes) =>
					updateTreeNode(nodes, path, (node) => ({
						...node,
						isExpanded: false,
					})),
				);
				return;
			}

			if (target.children.length > 0) {
				setTree((nodes) =>
					updateTreeNode(nodes, path, (node) => ({
						...node,
						isExpanded: true,
					})),
				);
				return;
			}

			try {
				setTree((nodes) =>
					updateTreeNode(nodes, path, (node) => ({
						...node,
						isLoading: true,
					})),
				);

				const children = await readDirectory(path);
				setTree((nodes) =>
					updateTreeNode(nodes, path, (node) => ({
						...node,
						children,
						isExpanded: true,
						isLoading: false,
					})),
				);
			} catch (error) {
				console.error(error);
				setTree((nodes) =>
					updateTreeNode(nodes, path, (node) => ({
						...node,
						isLoading: false,
					})),
				);
				setStatus(t("app.status.openFolderError", { error: String(error) }));
			}
		},
		[tree, t],
	);

	const handleFileContentChange = useCallback((content: string) => {
		setOpenedFiles((files) =>
			files.map((file) =>
				file.id === activeFileId
					? {
						...file,
						content,
					}
					: file,
			),
		);
	}, [activeFileId]);

	const handleSelectFileTab = useCallback((fileId: string) => {
		setActiveFileId(fileId);
	}, []);

	const handleCloseFileTab = useCallback(
		(fileId: string) => {
			setOpenedFiles((files) => {
				const nextFiles = files.filter((file) => file.id !== fileId);

				if (activeFileId === fileId) {
					setActiveFileId(nextFiles[nextFiles.length - 1]?.id ?? null);
				}

				return nextFiles;
			});
		},
		[activeFileId],
	);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (!(event.ctrlKey || event.metaKey)) {
				return;
			}

			const key = event.key.toLowerCase();

			if (key === "n") {
				event.preventDefault();
				handleNewFile();
			}

			if (key === "o") {
				event.preventDefault();

				if (event.shiftKey) {
					void handleOpenFolder();
					return;
				}

				void handleOpenFile();
			}

			if (key === "s") {
				event.preventDefault();
				void handleSaveFile();
			}
		}

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleNewFile, handleOpenFile, handleSaveFile]);

	const actions = {
		onNewFile: handleNewFile,
		onOpenFile: handleOpenFile,
		onOpenFolder: handleOpenFolder,
		onNewFolder: handleNewFolder,
		onSaveFile: handleSaveFile,
	};

	return (
		<AppLayout actions={actions}>
			{isExplorerActive ? (
				<FileExplorer
					openedFiles={openedFiles}
					activeFile={activeFile}
					activeFileId={activeFileId}
					workspacePath={workspacePath}
					tree={tree}
					isLoading={isLoading}
					onNewFile={handleNewFile}
					onNewFolder={handleNewFolder}
					onSaveFile={handleSaveFile}
					onFileContentChange={handleFileContentChange}
					onSelectFileTab={handleSelectFileTab}
					onCloseFileTab={handleCloseFileTab}
					onOpenTreeFile={handleOpenTreeFile}
					onToggleDirectory={handleToggleDirectory}
				/>
			) : (
				<WelcomeScreen />
			)}
		</AppLayout>
	);
}

function findTreeNode(nodes: FileTreeNode[], path: string): FileTreeNode | null {
	for (const node of nodes) {
		if (node.path === path) {
			return node;
		}

		const child = findTreeNode(node.children, path);

		if (child) {
			return child;
		}
	}

	return null;
}

function getNextFolderName(existingNames: string[]): string {
	const baseName = "new-folder";

	if (!existingNames.includes(baseName)) {
		return baseName;
	}

	let index = 2;

	while (existingNames.includes(`${baseName}-${index}`)) {
		index += 1;
	}

	return `${baseName}-${index}`;
}

function WelcomeScreen() {
	const { t } = useTranslation();

	return (
		<section className="ml-2 flex min-w-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/8 bg-[#0c0e12] px-6 text-zinc-100 shadow-2xl shadow-black/25">
			<div className="flex w-full max-w-xl flex-col items-center text-center">
				<div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/6 text-[#FF2D20]">
					<IconFilePlus size={28} stroke={1.5} />
				</div>
				<h1 className="text-2xl font-semibold text-white">
					{t("app.welcome.title")}
				</h1>
				<p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
					{t("app.welcome.message")}
				</p>
				<div className="mt-6 flex flex-col items-center justify-center gap-3 text-sm text-zinc-300">
					<div className="flex flex-wrap items-center justify-center gap-2">
						<span className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/6 px-3">
							<IconFilePlus size={16} stroke={1.7} />
							{t("app.welcome.newAction")}
						</span>
						<span className="text-zinc-600">{t("app.welcome.with")}</span>
						<span className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/6 px-3">
							<IconKeyboard size={16} stroke={1.7} />
							<kbd className="font-mono text-xs text-zinc-100">
								{t("app.welcome.shortcut")}
							</kbd>
						</span>
						<span className="text-zinc-600">{t("app.welcome.or")}</span>
						<span className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-white/6 px-3">
							{t("app.welcome.newMenuPath")}
						</span>
					</div>

					<div className="flex flex-wrap items-center justify-center gap-2">
						<span className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/6 px-3">
							<IconFolderOpen size={16} stroke={1.7} />
							{t("app.welcome.openAction")}
						</span>
						<span className="text-zinc-600">{t("app.welcome.with")}</span>
						<span className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/6 px-3">
							<IconKeyboard size={16} stroke={1.7} />
							<kbd className="font-mono text-xs text-zinc-100">
								{t("app.welcome.openShortcut")}
							</kbd>
						</span>
						<span className="text-zinc-600">{t("app.welcome.or")}</span>
						<span className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-white/6 px-3">
							{t("app.welcome.openMenuPath")}
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}

export default App;
