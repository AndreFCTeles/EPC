use crate::utilities::get_measurements_file_path;
use serde_json;
use std::fs;
use tauri::AppHandle;

#[tauri::command]
pub fn get_data(data_type: &str, app: AppHandle) -> Result<String, String> {
    println!("Resolved data_type: {}", data_type);

    let config = app.config();
    let file_path = get_measurements_file_path(&config)
        .map_err(|e| format!("Failed to resolve file path: {}", e.to_string()))?;

    println!("Resolved file path: {:?}", file_path);

    if !file_path.exists() {
        return Err("File not found".to_string());
    }

    let contents = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e.to_string()))?;

    println!(
        "File read successfully. Contents length: {}",
        contents.len()
    );

    let data = serde_json::from_str::<Vec<serde_json::Value>>(&contents)
        .map_err(|e| format!("Error parsing JSON data: {}", e.to_string()))?;

    println!("JSON parsed successfully with {} entries", data.len());

    match data_type {
        "selClientes" => {
            let client_names: Vec<_> = data
                .iter()
                .map(|c| {
                    serde_json::json!({
                        "label": c["nome_cliente"].as_str().unwrap_or("Unknown client"),
                        "value": c["id"].as_str().unwrap_or("")
                    })
                })
                .collect();
            serde_json::to_string(&client_names)
                .map_err(|e| format!("Failed to serialize client names: {}", e.to_string()))
        }
        "selMaquinas" => {
            let machines: Vec<_> = data
                .iter()
                .flat_map(|c| c["maquinas"].as_array().cloned().unwrap_or_else(Vec::new))
                .map(|m| {
                    serde_json::json!({
                        "label": m["maquina"].as_str().unwrap_or("Unknown machine"),
                        "value": m["n_serie"].as_str().unwrap_or("")
                    })
                })
                .collect();
            serde_json::to_string(&machines)
                .map_err(|e| format!("Failed to serialize machine data: {}", e.to_string()))
        }
        "selNSerie" => {
            let series: Vec<String> = data
                .iter()
                .flat_map(|c| c["maquinas"].as_array().cloned().unwrap_or_else(Vec::new))
                .map(|m| {
                    m["n_serie"]
                        .as_str()
                        .unwrap_or("Unknown series")
                        .to_string()
                })
                .collect();
            serde_json::to_string(&series)
                .map_err(|e| format!("Failed to serialize series data: {}", e.to_string()))
        }
        _ => Err("Unsupported data type requested".to_string()),
    }
}
