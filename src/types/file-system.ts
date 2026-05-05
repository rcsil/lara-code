export type FileNodeType = "file" | "directory";

export type FileTreeNode = {
	name: string;
	path: string;
	type: FileNodeType;
	children: FileTreeNode[];
	isExpanded?: boolean;
	isLoading?: boolean;
}

export type OpenedFile = {
	id: string;
	path: string | null;
	name: string;
	content: string;
	savedContent: string;
	language: string;
}
