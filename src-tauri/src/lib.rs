use std::path::PathBuf;

use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct FileTreeNode {
    name: String,
    path: String,
    #[serde(rename = "type")]
    node_type: String,
    children: Vec<FileTreeNode>,
    is_expanded: bool,
    is_loading: bool,
}

fn should_ignore_file_system_entry(name: &str) -> bool {
    matches!(
        name,
        ".git"
            | "node_modules"
            | "vendor"
            | "target"
            | "dist"
            | "build"
            | ".tauri"
            | ".next"
            | ".nuxt"
    )
}

#[tauri::command]
fn read_directory(path: String) -> Result<Vec<FileTreeNode>, String> {
    let mut nodes = Vec::new();

    for entry in std::fs::read_dir(PathBuf::from(path)).map_err(|error| error.to_string())? {
        let entry = entry.map_err(|error| error.to_string())?;
        let name = entry.file_name().to_string_lossy().to_string();

        if should_ignore_file_system_entry(&name) {
            continue;
        }

        let file_type = entry.file_type().map_err(|error| error.to_string())?;
        let node_type = if file_type.is_dir() {
            "directory"
        } else {
            "file"
        };

        nodes.push(FileTreeNode {
            name,
            path: entry.path().to_string_lossy().to_string(),
            node_type: node_type.to_string(),
            children: Vec::new(),
            is_expanded: false,
            is_loading: false,
        });
    }

    nodes.sort_by(|a, b| {
        if a.node_type != b.node_type {
            return if a.node_type == "directory" {
                std::cmp::Ordering::Less
            } else {
                std::cmp::Ordering::Greater
            };
        }

        a.name.to_lowercase().cmp(&b.name.to_lowercase())
    });

    Ok(nodes)
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(PathBuf::from(path)).map_err(|error| error.to_string())
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    std::fs::write(PathBuf::from(path), content).map_err(|error| error.to_string())
}

#[tauri::command]
fn create_directory(path: String, name: String) -> Result<String, String> {
    let folder_path = PathBuf::from(path).join(name);
    std::fs::create_dir(&folder_path).map_err(|error| error.to_string())?;
    Ok(folder_path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            read_directory,
            read_file,
            write_file,
            create_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
