use serde_json::json;
use tauri::AppHandle;

#[tauri::command]
pub fn filtered_data_fetcher(
    data_type: &str,
    client_id: Option<String>,
    maquina_id: Option<String>,
    sel_v_fio: Option<String>,
    app: AppHandle,
) -> Result<String, String> {
    println!("----------------------------------------------------------------------------------------------------------------");
    println!("  ");
    println!("---------------------------------");
    println!("|--| TABLE FILTERING PARAMS: |--|");
    println!("---------------------------------");
    println!("Received data_type: {}", data_type);
    println!("Received client_id: {:?}", client_id);
    println!("Received maquina_id: {:?}", maquina_id);
    println!("Received sel_v_fio: {:?}", sel_v_fio);
    println!("---------------------------------");
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
            println!("Machine ID received: {:?}", maquina_id);
            let fio = data
                .iter()
                .filter(|c| Some(&c.id) == client_id.as_ref())
                .flat_map(|c| &c.maquinas)
                .filter(|m| Some(&m.n_serie) == maquina_id.as_ref())
                .flat_map(|m| &m.leituras)
                .flat_map(|l| &l.leitura)
                .filter_map(|lg| lg.v_fio.as_ref()) // This step ensures no None values and unwraps Some
                .map(|v| {
                    json!({
                        "label": format!("{} M/m", v),
                        "value": v
                    })
                })
                .collect::<Vec<_>>();
            println!("Filtered wire speed: {:?}", fio);
            println!("  ");
            println!("----------------------------------------------------------------------------------------------------------------");
            println!("  ");
            json!(fio)
        }

        "selTensao" => {
            println!("Wire Speed received: {:?}", sel_v_fio);
            let tens = data
                .iter()
                .filter(|c| Some(&c.id) == client_id.as_ref())
                .flat_map(|c| &c.maquinas)
                .filter(|m| Some(&m.n_serie) == maquina_id.as_ref())
                .flat_map(|m| &m.leituras)
                .flat_map(|l| &l.leitura)
                .filter(|lg| {
                    // Filter entries where v_fio matches sel_v_fio if provided
                    match (&lg.v_fio, &sel_v_fio) {
                        (Some(fio), Some(v_fio)) => fio == v_fio,
                        (None, Some(_)) => false, // Exclude if sel_v_fio is specified but lg.v_fio is None
                        (_, None) => true,        // Include all if no sel_v_fio is provided
                    }
                })
                .map(|lg| {
                    let label = format!("{} {}", lg.tensao, lg.unidades); // Create label combining tension and units
                    json!({
                        "label": label,
                        "value": lg.tensao // Use tensao as the value
                    })
                })
                .collect::<Vec<_>>();
            println!("Filtered v/a: {:?}", tens);
            println!("  ");
            println!("----------------------------------------------------------------------------------------------------------------");
            println!("  ");
            json!(tens)
        }

        _ => return Err("Unsupported data type requested".to_string()),
    };

    serde_json::to_string(&filtered_data)
        .map_err(|e| format!("Failed to serialize data: {}", e.to_string()))
}
