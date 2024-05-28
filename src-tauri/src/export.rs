use crate::data_structures::*;
use crate::table_elements::*;
use crate::table_generation::generate_table;
use rust_xlsxwriter::*;
use std::collections::{HashMap, HashSet};
use tauri::api::path::{resolve_path, BaseDirectory};
use tauri::{AppHandle, Manager};

struct TableInfo {
    table_index: usize,
    starting_table_row: u32,
    final_table_row: u32,
}

#[tauri::command]
pub fn create_excel_file(
    data: Vec<Maquina>,
    path: String,
    image_path: Option<String>,
    table_style: String,
    app_handle: AppHandle,
) -> Result<(), String> {
    // Logging
    println!("----------------------------------------------------------------------------------------------------------------");
    println!("  ");
    println!("-----------------------");
    println!("|--| WRITING XLSX: |--|");
    println!("-----------------------");
    println!("Received data: {:?}", data);
    println!("  ");
    println!("Received path: {:?}", path);
    println!("--------------------------");
    println!("  ");

    // ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // ;;;;;;;;;;;;;;;;;| VARIABLE DECLARATION |;;;;;;;;;;;;;;;;;
    // ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

    // Text Formatting
    let format = Format::new()
        .set_border(FormatBorder::Medium)
        .set_align(FormatAlign::Center);

    // Correctly pass references to resolve_path
    let resolved_path = resolve_path(
        &*app_handle.config(),
        app_handle.package_info(),
        &app_handle.env(),
        &path,
        Some(BaseDirectory::AppConfig), // Adjusted as per deprecation warning
    )
    .map_err(|_| "Failed to resolve file path.".to_string())?
    .to_str()
    .ok_or("Failed to convert path to string".to_string())?
    .to_owned();

    // Banner Image
    // Use provided image path or default banner

    println!("Received image: {:?}", image_path);
    let final_image_path = if let Some(path) = image_path {
        if path.is_empty() {
            resolve_path(
                &*app_handle.config(),
                app_handle.package_info(),
                &app_handle.env(),
                "assets/banner.png", // Default banner path
                Some(BaseDirectory::Resource),
            )
            .map_err(|_| "Failed to resolve default image path.".to_string())?
            .to_str()
            .ok_or("Failed to convert default image path to string".to_string())?
            .to_owned()
        } else {
            path
        }
    } else {
        resolve_path(
            &*app_handle.config(),
            app_handle.package_info(),
            &app_handle.env(),
            "assets/banner.png", // Default banner path
            Some(BaseDirectory::Resource),
        )
        .map_err(|_| "Failed to resolve default image path.".to_string())?
        .to_str()
        .ok_or("Failed to convert default image path to string".to_string())?
        .to_owned()
    };
    println!("Resolved image: {:?}", final_image_path);
    println!("  ");

    // Parse table style
    let table_style_enum = match table_style.as_str() {
        "Medium16" => TableStyle::Medium16,
        "Light1" => TableStyle::Light1,
        "Light6" => TableStyle::Light6,
        // Add more styles as needed
        _ => TableStyle::Medium16, // default style
    };

    // Worksheet declaration
    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();
    let mut current_row: u32 = 0;

    println!("--------------------------");
    println!(" ");

    println!("BUILDING WORKSHEET...");
    println!("--------------------------");

    // ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // ;;;;;;;;;;;;;;;;;| WORKSHEET BUILDING |;;;;;;;;;;;;;;;;;
    // ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

    // Extract unique v_fio values
    let unique_v_fios = extract_unique_v_fios(&data);
    // Store table information
    let mut table_info_map: HashMap<usize, TableInfo> = HashMap::new();
    let mut table_index = 0;

    // Function to create tables
    fn create_tables(
        worksheet: &mut Worksheet,
        data: &[Maquina],
        format: &Format,
        current_row: &mut u32,
        table_info_map: &mut HashMap<usize, TableInfo>,
        table_index: &mut usize,
        table_style: TableStyle,
    ) -> Result<(), String> {
        let headers = vec![
            "Nº de Série   ",
            "DESCRIÇÃO   ",
            "Vel. do Fio   ",
            "Leitura Volt.   ",
            "1) 10'' V   ",
            "2) 10'' V   ",
            "3) 10'' V   ",
            "4) 10'' V   ",
            "5) 10'' V   ",
            "Média V   ",
            "Desvio V   ",
            "Leitura Amp.   ",
            "1) 10'' A   ",
            "2) 10'' A   ",
            "3) 10'' A   ",
            "4) 10'' A   ",
            "5) 10'' A   ",
            "Média A   ",
            "Desvio A   ",
            "Data de leitura   ",
        ];

        let starting_table_row = *current_row + 10;

        // Write headers
        worksheet
            .write_row(starting_table_row, 0, headers.clone())
            .map_err(|_| "Failed to write headers.".to_string())?;

        // Generate table content and get the number of rows used
        let processed_rows = generate_table(worksheet, starting_table_row + 1, &data, &format)?;
        let final_table_row = starting_table_row + 1 + processed_rows;

        // Name the table uniquely based on table_index
        let table_name = format!("Table_{}", *table_index + 1);
        let table_columns = headers
            .iter()
            .map(|h| TableColumn::new().set_header(h.to_string()))
            .collect::<Vec<_>>();
        let table = Table::new()
            .set_name(&table_name)
            .set_style(table_style)
            .set_columns(&table_columns);
        worksheet
            .add_table(
                starting_table_row,
                0,
                final_table_row - 1,
                headers.len() as u16 - 1,
                &table,
            )
            .map_err(|e| format!("Failed to add the table: {:?}", e))?;

        // Autofit the columns for the current table data
        worksheet.autofit();

        // Store the table information
        table_info_map.insert(
            *table_index + 1,
            TableInfo {
                table_index: *table_index + 1,
                starting_table_row,
                final_table_row,
            },
        );

        // Update current_row to the next starting point
        *current_row = final_table_row + 7; // Adding 2 rows as spacers for next potential table
        *table_index += 1;

        Ok(())
    }

    // Create tables for data with v_fio
    for v_fio in &unique_v_fios {
        let filtered_data = filter_data_by_v_fio(&data, v_fio);
        create_tables(
            worksheet,
            &filtered_data,
            &format,
            &mut current_row,
            &mut table_info_map,
            &mut table_index,
            table_style_enum,
        )?;
    }

    // Create tables for data without v_fio
    let data_without_v_fio = filter_data_without_v_fio(&data);
    if !data_without_v_fio.is_empty() {
        create_tables(
            worksheet,
            &data_without_v_fio,
            &format,
            &mut current_row,
            &mut table_info_map,
            &mut table_index,
            table_style_enum,
        )?;
    }

    // Loop through the table information and call the prepare and finalize functions
    for table_info in table_info_map.values() {
        prepare_table_elements(
            worksheet,
            &final_image_path,
            table_info.starting_table_row,
            table_info.table_index,
        )?;
        finalize_table_elements(
            worksheet,
            table_info.final_table_row,
            table_info.table_index,
        )?;
    }

    println!("--------------------------");
    println!("  ");
    // Save and close the workbook
    if let Err(_) = workbook.save(&resolved_path) {
        return Err("Failed to save the workbook.".to_string());
    };
    println!("----------------------------------------------------------------------------------------------------------------");
    println!("File {:?} saved successfully!", path);
    println!("----------------------------------------------------------------------------------------------------------------");
    println!("  ");

    Ok(())
}

fn extract_unique_v_fios(data: &[Maquina]) -> HashSet<String> {
    let mut unique_v_fios = HashSet::new();
    for machine in data {
        for leitura in &machine.leituras {
            for group in &leitura.leitura {
                if let Some(ref v_fio) = group.v_fio {
                    unique_v_fios.insert(v_fio.clone());
                }
            }
        }
    }
    unique_v_fios
}

// Filter data by v_fio while keeping all measurement data
fn filter_data_by_v_fio(data: &[Maquina], v_fio_value: &str) -> Vec<Maquina> {
    data.iter()
        .map(|machine| {
            let filtered_leituras = machine
                .leituras
                .iter()
                .map(|leitura| {
                    let has_v_fio = leitura
                        .leitura
                        .iter()
                        .any(|group| group.v_fio.as_deref() == Some(v_fio_value));

                    if has_v_fio {
                        Some(Leitura {
                            id: leitura.id.clone(),
                            data_leitura: leitura.data_leitura.clone(),
                            leitura: leitura.leitura.clone(),
                        })
                    } else {
                        None
                    }
                })
                .filter_map(|leitura| leitura)
                .collect::<Vec<_>>();

            if !filtered_leituras.is_empty() {
                Some(Maquina {
                    n_serie: machine.n_serie.clone(),
                    maquina: machine.maquina.clone(),
                    leituras: filtered_leituras,
                })
            } else {
                None
            }
        })
        .filter_map(|machine| machine)
        .collect::<Vec<_>>()
}

// Filter data without v_fio
fn filter_data_without_v_fio(data: &[Maquina]) -> Vec<Maquina> {
    data.iter()
        .map(|machine| {
            let filtered_leituras = machine
                .leituras
                .iter()
                .map(|leitura| {
                    let has_v_fio = leitura.leitura.iter().any(|group| group.v_fio.is_some());

                    if !has_v_fio {
                        Some(Leitura {
                            id: leitura.id.clone(),
                            data_leitura: leitura.data_leitura.clone(),
                            leitura: leitura.leitura.clone(),
                        })
                    } else {
                        None
                    }
                })
                .filter_map(|leitura| leitura)
                .collect::<Vec<_>>();

            if !filtered_leituras.is_empty() {
                Some(Maquina {
                    n_serie: machine.n_serie.clone(),
                    maquina: machine.maquina.clone(),
                    leituras: filtered_leituras,
                })
            } else {
                None
            }
        })
        .filter_map(|machine| machine)
        .collect::<Vec<_>>()
}
