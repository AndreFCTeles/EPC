// Dependencies
use crate::data_structures::Measurement;
use crate::utilities::RoundTo;
use csv::ReaderBuilder;
use serde_json;
use std::collections::HashSet;
use std::fs::File;

// ------------------- Parsing CSV files -------------------

#[tauri::command]
// Declaration of the `parse_csv` function with a parameter `file_path` of type `String`
pub fn parse_csv(file_path: String) -> Result<Vec<Measurement>, String> {
    println!("  ");
    println!("----------------------------------------------------------------------------------------------------------------");
    println!("  ");
    println!("----------------------");
    println!("|--| PARSING CSV: |--|");
    println!("----------------------");
    println!("  ");

    let file = File::open(&file_path).map_err(|e| e.to_string())?;
    let mut rdr = ReaderBuilder::new()
        .has_headers(false)
        .flexible(true)
        .from_reader(file);

    let mut lines_iter = rdr.records().map(|r| r.map_err(|e| e.to_string()));
    let mut timestamp_set = HashSet::new();
    let mut value_total = 0.0;
    let mut measurement_count = 0;

    // Processing each line in the CSV file
    let model_number_line = lines_iter.next().ok_or("Missing 'Model Number' line")??;
    let model_number = model_number_line
        .get(1)
        .ok_or("Missing 'Model Number' value")?
        .to_string();

    let tool_name_line = lines_iter.next().ok_or("Missing 'Tool Name' line")??;
    let tool_name = tool_name_line
        .get(1)
        .ok_or("Missing 'Tool Name' value")?
        .to_string();

    // Skip the header line
    let _ = lines_iter.next();

    // Extracting the actual data lines and ensuring unique timestamps
    let first_record = lines_iter.next().ok_or("No measurement records found")??;
    let first_capture_date = first_record
        .get(0)
        .ok_or("Missing 'Capture Date'")?
        .to_string();
    let first_units = first_record.get(2).ok_or("Missing 'Units'")?.to_string();

    for result in lines_iter {
        if let Ok(record) = result {
            if record.is_empty() || measurement_count >= 10 {
                break; // Break if the record is empty or we've reached 10 measurements
            }

            let capture_date = &record.get(0).ok_or("Missing 'Capture Date'")?.to_string();
            if !timestamp_set.insert(capture_date.to_string()) {
                continue; // If this timestamp is already seen, skip to the next
            }

            let value_str = record.get(1).ok_or("Missing 'Value'")?;
            let value: f64 = value_str
                .parse()
                .map_err(|_| "Invalid number format for 'Value'")?;
            println!("Value parsed: {}", value);
            value_total += value;
            measurement_count += 1;
        }
    }

    if measurement_count == 0 {
        return Err("No valid measurements found.".to_string());
    }

    println!("Total value sum: {}", value_total); // Debugging total sum
    println!("Measurement count: {}", measurement_count); // Debugging count

    /*
    let value = (value_total / measurement_count as f64)
        .round_to(2)
        .to_string();
    */

    let average = value_total / measurement_count as f64;
    println!("Calculated average before rounding: {}", average);

    let rounded_average = average.round_to(2);
    println!("Rounded average: {}", rounded_average);

    let measurement = Measurement {
        model_number,
        tool_name,
        capture_date: first_capture_date,
        value: rounded_average.to_string(),
        units: first_units,
    };

    println!(
        "CSV file was parsed. Serialized data: {}",
        serde_json::to_string(&measurement).unwrap_or_else(|_| "Failed to serialize".into())
    );

    println!("  ");
    println!("----------------------------------------------------------------------------------------------------------------");
    println!("  ");

    Ok(vec![measurement])
}
