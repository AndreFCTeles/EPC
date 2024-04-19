// Dependencies
use crate::data_structures::*;
use crate::utilities::get_measurements_file_path;
use serde_json::Value;
use std::fs;
use tauri::AppHandle;

#[tauri::command]
pub fn filtered_data_fetcher(
    data_type: &str,
    client_id: Option<String>,
    machine_id: Option<String>,
    app: AppHandle,
) -> Result<String, String> {
    let config = app.config();
    let file_path = get_measurements_file_path(&config)
        .map_err(|e| format!("Failed to resolve file path: {}", e.to_string()))?;
    let contents = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e.to_string()))?;
    let data: Vec<Cliente> = serde_json::from_str(&contents)
        .map_err(|e| format!("Error parsing JSON data: {}", e.to_string()))?;

    let result = match data_type {
        "selMaquinas" => data
            .iter()
            .filter(|c| Some(c.id.to_string()) == client_id)
            .flat_map(|c| &c.maquinas)
            .map(|m| {
                serde_json::json!({
                    "label": m.maquina,
                    "value": m.n_serie
                })
            })
            .collect::<Vec<_>>(),
        "selVFio" => {
            if let Some(machine_id) = machine_id {
                let vfios = data
                    .iter()
                    .flat_map(|c| &c.maquinas)
                    .filter(|m| m.n_serie == machine_id)
                    .flat_map(|m| &m.verificacoes)
                    .map(|v| &v.v_fio)
                    .collect::<Vec<&String>>();
                let unique_vfios = vfios
                    .iter()
                    .collect::<std::collections::HashSet<_>>() // Use a HashSet to ensure uniqueness
                    .into_iter()
                    .map(|v_fio| {
                        serde_json::json!({
                            "label": format!("V. Fio: {}", v_fio),
                            "value": v_fio.clone()
                        })
                    })
                    .collect::<Vec<_>>();
                serde_json::to_string(&unique_vfios)
            } else {
                Err("Machine ID is required for fetching V. Fio".to_string())
            }
        }
        "selTensao" => data
            .iter()
            .flat_map(|c| &c.maquinas)
            .flat_map(|m| &m.verificacoes)
            .flat_map(|v| &v.leituras)
            .map(|l| {
                serde_json::json!({
                    "label": format!("{} {}", l.tensao, l.unidades),
                    "value": l.tensao.clone()  // Assuming tensao is unique enough to use as a value
                })
            })
            .collect::<Vec<_>>(),
        _ => return Err("Unsupported data type requested".to_string()),
    };

    serde_json::to_string(&result)
        .map_err(|e| format!("Failed to serialize data: {}", e.to_string()))
}
