use image::GenericImageView;
use rust_xlsxwriter::*;

pub fn prepare_table_elements(
    worksheet: &mut Worksheet,
    image_path: &str,
    starting_table_row: u32,
    table_index: usize,
) -> Result<(), String> {
    println!("Writing Header elements to Table {}", table_index);

    // Desired height in pixels
    let target_height = 110.0;

    // Load the image using the image crate to get its original dimensions
    let img = image::open(image_path).map_err(|_| "Failed to load image.".to_string())?;
    let (orig_width, orig_height) = img.dimensions();

    // Calculate the scaling factor for height
    let height_scale = target_height / orig_height as f64;
    // Calculate the corresponding width to maintain aspect ratio
    let target_width = orig_width as f64 * height_scale;

    // Create the image with rust_xlsxwriter and set the scale to size
    let mut image = Image::new(image_path).map_err(|_| "Failed to load image.".to_string())?;
    image.set_scale_to_size(target_width as u32, target_height as u32, true);
    // Insert the image with scaling at "starting_table_row - 9"
    worksheet
        .insert_image(starting_table_row - 9, 1, &image)
        .map_err(|_| "Failed to insert image.".to_string())?;

    // Place the title at "starting_table_row - 3"
    let format_titulo: Format = Format::new().set_bold();
    let titulo = "Verificação/Aferição dos Reóstatos de Regulação dos Parâmetros Eléctricos das Fontes de Energia";
    worksheet
        .write_string_with_format(starting_table_row - 3, 1, titulo, &format_titulo)
        .map_err(|_| "Failed to write Titulo.".to_string())?;

    // Place over-headers at "starting_table_row - 1"
    let format_over_headers = Format::new()
        .set_border(FormatBorder::Medium)
        .set_align(FormatAlign::Center)
        .set_bold();
    worksheet
        .write_string_with_format(starting_table_row - 1, 3, "TENSÃO", &format_over_headers)
        .map_err(|_| "Failed to add TENSÃO header.".to_string())?;
    worksheet
        .merge_range(
            starting_table_row - 1,
            4,
            starting_table_row - 1,
            10,
            "LEITURA DA PINÇA MULTIMÉTRICA",
            &format_over_headers,
        )
        .map_err(|_| "Failed to merge TENSÃO range.".to_string())?;
    worksheet
        .write_string_with_format(starting_table_row - 1, 11, "CORRENTE", &format_over_headers)
        .map_err(|_| "Failed to add CORRENTE header.".to_string())?;
    worksheet
        .merge_range(
            starting_table_row - 1,
            12,
            starting_table_row - 1,
            18,
            "LEITURA DA PINÇA MULTIMÉTRICA",
            &format_over_headers,
        )
        .map_err(|_| "Failed to merge CORRENTE range.".to_string())?;

    Ok(())
}

pub fn finalize_table_elements(
    worksheet: &mut Worksheet,
    final_table_row: u32,
    table_index: usize,
) -> Result<(), String> {
    println!("Writing Footer elements to Table {}", table_index);
    let format_note = Format::new().set_align(FormatAlign::Right).set_bold();
    worksheet
        .write_string_with_format(final_table_row + 1, 1, "Nota:", &format_note)
        .map_err(|_| "Failed to write Nota.".to_string())?;
    worksheet
        .write(final_table_row + 3, 1, "O Coordenador Técnico ATB")
        .map_err(|_| "Failed to add extra Footer1.".to_string())?;
    worksheet
        .write(final_table_row + 5, 1, "________________________________")
        .map_err(|_| "Failed to add extra Footer2.".to_string())?;

    Ok(())
}
