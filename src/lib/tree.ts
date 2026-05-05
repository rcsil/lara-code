import type { FileTreeNode } from "../types/file-system";

export function updateTreeNode(
	nodes: FileTreeNode[],
	targetPath: string,
	updater: (node: FileTreeNode) => FileTreeNode
): FileTreeNode[] {
	return nodes.map((node) => {
		if (node.path === targetPath) {
			return updater(node);
		}

		if (node.children) {
			return {
				...node,
				children: updateTreeNode(node.children, targetPath, updater)
			};
		}

		return node;
	});
}