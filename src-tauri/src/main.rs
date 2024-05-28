// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use csv_parsing::parse_csv;
use export::create_excel_file;
use filter_get_data::filtered_data_fetcher;
use get_data::get_data;
use get_json_data::full_cliente_data;
use process_data::process_and_save_data;

mod csv_parsing;
mod data_structures;
mod export;
mod filter_get_data;
mod get_data;
mod get_json_data;
mod json_handling;
mod process_data;
mod table_elements;
mod table_generation;
mod utilities;

// ------------------- Run the application -------------------

fn main() {
    tauri::Builder::default()
        // Register the command for use in the frontend.
        .invoke_handler(tauri::generate_handler![
            parse_csv,
            process_and_save_data,
            get_data,
            filtered_data_fetcher,
            full_cliente_data,
            create_excel_file
        ])
        // Setup and run the Tauri application.
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
