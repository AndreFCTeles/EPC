use serde_json::json;
use tauri::AppHandle;

#[tauri::command]
pub fn filtered_data_fetcher(
    data_type: &str,
    client_id: Option<String>,
    machine_id: Option<String>,
    app: AppHandle,
) -> Result<String, String> {
    println!("----------------------------------------------------------------------------------------------------------------");
    println!("  ");
    println!("-------------------------");
    println!("|--| TESTING PARAMS: |--|");
    println!("-------------------------");
    println!("Received data_type: {}", data_type);
    println!("Received client_id: {:?}", client_id);
    println!("Received machine_id: {:?}", machine_id);
    println!("-------------------------");
    println!("  ");

    let config = app.config();

    let file_path = crate::utilities::get_measurements_file_path(&config)
        .map_err(|e| format!("Failed to resolve file path: {}", e.to_string()))?;
    let contents = std::fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e.to_string()))?;
    let data: Vec<crate::data_structures::Cliente> = serde_json::from_str(&contents)
        .map_err(|e| format!("Error parsing JSON data: {}", e.to_string()))?;

    let filtered_data = match data_type {
        "selClientes" => json!(data
            .iter()
            .map(|c| json!({"label": c.nome_cliente, "value": c.id}))
            .collect::<Vec<_>>()),

        "selMaquinas" => {
            println!("Client ID received: {:?}", client_id);
            let machines = data
                .iter()
                .filter(|c| client_id.as_ref().map_or(false, |id| &c.id == id))
                .flat_map(|c| &c.maquinas)
                .map(|m| json!({"label": m.maquina, "value": m.n_serie}))
                .collect::<Vec<_>>();
            println!("Filtered machines: {:?}", machines);
            println!("  ");
            println!("----------------------------------------------------------------------------------------------------------------");
            println!("  ");
            json!(machines)
        }

        "selVFio" => {
            json!(data
                .iter()
                .filter(|c| Some(&c.id) == client_id.as_ref())
                .flat_map(|c| &c.maquinas)
                .filter(|m| Some(&m.n_serie) == machine_id.as_ref())
                .flat_map(|m| &m.leituras)
                .map(|l| l.v_fio.clone())
                .collect::<std::collections::HashSet<_>>() // Ensures uniqueness
                .into_iter()
                .map(|v| json!({"label": format!("V. Fio: {:?}", v), "value": v}))
                .collect::<Vec<_>>())
        }

        "selTensao" => {
            json!(data
                .iter()
                .filter(|c| Some(&c.id) == client_id.as_ref())
                .flat_map(|c| &c.maquinas)
                .filter(|m| Some(&m.n_serie) == machine_id.as_ref())
                .flat_map(|m| &m.leituras)
                .map(|l| format!("{} {}", l.tensao, l.unidades))
                .collect::<std::collections::HashSet<_>>() // Ensures uniqueness
                .into_iter()
                .map(|t| json!({"label": t.clone(), "value": t}))
                .collect::<Vec<_>>())
        }

        _ => return Err("Unsupported data type requested".to_string()),
    };

    serde_json::to_string(&filtered_data)
        .map_err(|e| format!("Failed to serialize data: {}", e.to_string()))
}
