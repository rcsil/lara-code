import { open, save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import type { FileTreeNode, OpenedFile } from "../types/file-system";
import {
  getFileName,
  getMonacoLanguage
} from "../lib/files";

const codeFileExtensions = [
  "php",
  "blade.php",
  "js",
  "jsx",
  "ts",
  "tsx",
  "json",
  "css",
  "scss",
  "html",
  "md",
  "txt",
  "env",
  "yml",
  "yaml",
  "xml",
  "sql"
];

export async function pickFilePath(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    directory: false,
    filters: [
      {
        name: "Arquivos de código",
        extensions: codeFileExtensions
      }
    ]
  });

  if (!selected || Array.isArray(selected)) {
    return null;
  }

  return selected;
}

export async function pickFolderPath(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    directory: true
  });

  if (!selected || Array.isArray(selected)) {
    return null;
  }

  return selected;
}

export async function pickSaveFilePath(): Promise<string | null> {
  const selected = await save({
    filters: [
      {
        name: "PHP",
        extensions: ["php"]
      },
      {
        name: "Blade",
        extensions: ["blade.php"]
      },
      {
        name: "TypeScript",
        extensions: ["ts", "tsx"]
      },
      {
        name: "JavaScript",
        extensions: ["js", "jsx"]
      },
      {
        name: "Todos",
        extensions: codeFileExtensions
      }
    ]
  });

  return selected;
}

export async function openFileFromPath(path: string): Promise<OpenedFile> {
  const content = await invoke<string>("read_file", { path });

  return {
    id: path,
    path,
    name: getFileName(path),
    content,
    savedContent: content,
    language: getMonacoLanguage(path)
  };
}

export async function saveFileToPath(path: string, content: string): Promise<void> {
  await invoke("write_file", { path, content });
}

export async function createDirectoryInProject(path: string, name: string): Promise<string> {
  return invoke<string>("create_directory", { path, name });
}

export async function readDirectory(path: string): Promise<FileTreeNode[]> {
  return invoke<FileTreeNode[]>("read_directory", { path });
}
