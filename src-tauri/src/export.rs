use crate::data_structures::*;
use crate::table_generation::generate_table;
use rust_xlsxwriter::*;
use tauri::api::path::{resolve_path, BaseDirectory};
use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn create_excel_file(
    data: Vec<Maquina>,
    path: String,
    app_handle: AppHandle,
) -> Result<(), String> {
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
    let image_path = resolve_path(
        &*app_handle.config(),
        app_handle.package_info(),
        &app_handle.env(),
        "assets/banner.png", // Adjust path as necessary
        Some(BaseDirectory::Resource),
    )
    .map_err(|_| "Failed to resolve image path.".to_string())?
    .to_str()
    .ok_or("Failed to convert image path to string".to_string())?
    .to_owned();

    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();
    let mut row: u32 = 10;

    println!("--------------------------");
    print!("Setting headers... ");
    // Set the headers
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
    println!("DONE!");

    if let Err(_) = worksheet.write_row(row, 0, headers.clone()) {
        return Err("Failed to add the table.".to_string());
    };
    row += 1;

    let processed_rows = generate_table(worksheet, row, &data, &format)?;
    row += processed_rows;

    let table_columns = headers
        .iter()
        .map(|&h| TableColumn::new().set_header(h.to_string())) // Convert each &str to String
        .collect::<Vec<_>>();
    let table = Table::new()
        .set_name("Leituras")
        .set_style(TableStyle::Medium16)
        .set_columns(&table_columns); // Use a reference to the new vector of table columns
    println!(
        "Trying to add table at row: {}, column: {}, to row: {}, column: {}",
        10,
        0,
        row - 1,
        headers.len() as u16 - 1
    );

    // Add the table to the worksheet with adjusted columns and rows
    if let Err(e) = worksheet.add_table(10, 0, row - 1, headers.len() as u16 - 1, &table) {
        println!("Error adding table: {:?}", e);
        return Err("Failed to add the table:".to_string());
    };

    worksheet.autofit();

    // Nota
    let format_right = Format::new().set_align(FormatAlign::Right).set_bold();
    if let Err(_) = worksheet.write_string_with_format(row + 1, 1, "Nota:", &format_right) {
        return Err("Failed to write Nota.".to_string());
    };

    // Footers
    if let Err(_) = worksheet.write(row + 4, 1, "O Coordenador Técnico ATB") {
        return Err("Failed to add extra Footer1.".to_string());
    };
    if let Err(_) = worksheet.write(row + 6, 1, "________________________________") {
        return Err("Failed to add extra Footer1.".to_string());
    };

    // over-headers
    if let Err(_) = worksheet.write_string_with_format(9, 3, "TENSÃO", &format) {
        return Err("Failed to add extra Header.".to_string());
    };
    if let Err(_) = worksheet.merge_range(9, 4, 9, 10, "LEITURA DA PINÇA MULTIMÉTRICA", &format) {
        return Err("Failed to add extra Header.".to_string());
    };
    if let Err(_) = worksheet.write_string_with_format(9, 11, "CORRENTE", &format) {
        return Err("Failed to add extra Header.".to_string());
    };
    if let Err(_) = worksheet.merge_range(9, 12, 9, 18, "LEITURA DA PINÇA MULTIMÉTRICA", &format)
    {
        return Err("Failed to add extra Header.".to_string());
    };

    // After autofit, then add the image and title
    let image = Image::new(&image_path).map_err(|_| "Failed to load image.".to_string())?;
    worksheet
        .insert_image(1, 1, &image) // Adjust row and column as needed
        .map_err(|_| "Failed to insert image.".to_string())?;

    let format_titulo = Format::new().set_bold();
    let titulo = "Verificação/Aferição dos Reóstatos de Regulação dos Parâmetros Eléctricos das Fontes de Energia";
    if let Err(_) = worksheet.write_string_with_format(7, 1, titulo, &format_titulo) {
        return Err("Failed to write Titulo.".to_string());
    };

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
