// Dependencies
use crate::data_structures::*;
use crate::json_handling::process_clientes;
use crate::utilities::{read_or_initialize, write_data};
use tauri::AppHandle;

#[tauri::command]
pub fn process_and_save_data(clientes: Vec<ClienteDTO>, app: AppHandle) {
    let config = app.config();
    let mut existing_clientes = read_or_initialize(&config).unwrap();
    process_clientes(&mut existing_clientes, clientes);
    write_data(&existing_clientes, &config).unwrap();
}
