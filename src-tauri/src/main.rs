// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use csv_parsing::parse_csv;
use get_data::data_fetcher;
use process_data::process_and_save_data;

mod csv_parsing;
mod data_structures;
mod get_data;
mod json_handling;
mod process_data;
mod utilities;

// ------------------- Run the application -------------------

fn main() {
    tauri::Builder::default()
        // Register the command for use in the frontend.
        .invoke_handler(tauri::generate_handler![
            parse_csv,
            process_and_save_data,
            data_fetcher
        ])
        // Setup and run the Tauri application.
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
