// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use csv_parsing::parse_csv;
use filter_get_data::filtered_data_fetcher;
use get_data::get_data;
use get_json_data::full_cliente_data;
use process_data::process_and_save_data;
//use xlsx_data_exporter::datasheet_exporter;

mod csv_parsing;
mod data_structures;
mod filter_get_data;
mod get_data;
mod get_json_data;
mod json_handling;
mod process_data;
mod utilities;
//mod xlsx_data_exporter;

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
            //datasheet_exporter
        ])
        // Setup and run the Tauri application.
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
