// Dependencies
use crate::data_structures::*;
use std::error::Error;
use std::fs;
use std::fs::File;
use std::io::{self, Read, Write};
use std::path::{Path, PathBuf};
use tauri::api::path;
use tauri::Config;

// Function to generate sequential IDs based on context

// Calculate desvio and media
pub fn calculate_average_value(medicoes: &[Medicao]) -> f64 {
    let sum: f64 = medicoes
        .iter()
        .map(|m| m.valor.parse::<f64>().unwrap_or(0.0))
        .sum();
    let average = sum / medicoes.len() as f64;
    average.round_to(2)
}
pub fn calculate_deviation(tensao: f64, media: f64) -> f64 {
    let deviation = (tensao - media).abs();
    deviation.round_to(2)
}

// Utility trait for rounding floats to a specified number of decimal places
pub trait RoundTo {
    fn round_to(self, decimals: u32) -> Self;
}
impl RoundTo for f64 {
    fn round_to(self, decimals: u32) -> Self {
        let factor = 10f64.powi(decimals as i32);
        (self * factor).round() / factor
    }
}

// Ensure the DATA directory exists
fn ensure_directory_exists(file_path: &Path) -> io::Result<()> {
    let dir_path = file_path.parent().unwrap();
    if !dir_path.exists() {
        fs::create_dir_all(dir_path)?;
    }
    Ok(())
}

// Function to get the full path to the measurements.json file
pub fn get_measurements_file_path(config: &Config) -> io::Result<PathBuf> {
    let data_path = path::app_data_dir(config).ok_or_else(|| {
        io::Error::new(
            io::ErrorKind::NotFound,
            "Application data directory is not available",
        )
    })?;
    ensure_directory_exists(&data_path)?;
    Ok(data_path.join("measurements.json"))
}

// Function to read existing data or initialize new if file doesn't exist
pub fn read_or_initialize(config: &Config) -> Result<Vec<Cliente>, Box<dyn Error>> {
    let file_path = get_measurements_file_path(config)?;
    if file_path.exists() {
        let mut file = File::open(file_path)?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)?;
        serde_json::from_str(&contents).or_else(|_| Ok(vec![]))
    } else {
        Ok(vec![])
    }
}

// Function to write data to JSON file
pub fn write_data(clientes: &[Cliente], config: &Config) -> Result<(), Box<dyn Error>> {
    let file_path = get_measurements_file_path(config)?;
    ensure_directory_exists(&file_path)?;
    let data_json = serde_json::to_string_pretty(clientes)?;
    let mut file = File::create(file_path)?;
    file.write_all(data_json.as_bytes())?;
    Ok(())
}
