use crate::data_structures::*;
use crate::utilities::get_measurements_file_path;
use std::fs;
use tauri::AppHandle;

#[tauri::command]
pub fn full_cliente_data(client_id: String, app: AppHandle) -> Result<String, String> {
    let config = app.config();
    let file_path = get_measurements_file_path(&config)
        .map_err(|e| format!("Failed to resolve file path: {}", e.to_string()))?;

    let contents = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e.to_string()))?;

    let data: Vec<Cliente> = serde_json::from_str(&contents)
        .map_err(|e| format!("Error parsing JSON data: {}", e.to_string()))?;

    // Filter the data to find the specific client
    let client_data = data
        .into_iter()
        .find(|c| c.id == client_id)
        .ok_or_else(|| format!("Client with ID {} not found", client_id))?;

    // Serialize the complete client data to JSON
    serde_json::to_string(&client_data)
        .map_err(|e| format!("Failed to serialize client data: {}", e.to_string()))
}
