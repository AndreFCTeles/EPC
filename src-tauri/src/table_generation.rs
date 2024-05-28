use crate::data_structures::*;
use rust_xlsxwriter::*;

/// Writes the machine data to the worksheet and returns the number of processed rows.
pub fn generate_table(
    worksheet: &mut Worksheet,
    row: u32,
    data: &[Maquina],
    format: &Format,
) -> Result<u32, String> {
    let mut current_row = row;

    for machine in data {
        println!("Processing machines...");
        println!("Current machine: {} - {}", machine.n_serie, machine.maquina);
        println!(" ");
        for leitura in &machine.leituras {
            println!("Processing readings...");
            println!("Current reading: {}", leitura.id);
            let mut values = Vec::new();

            print!("Serial Number... ");
            values.push(machine.n_serie.clone());
            println!("DONE!");

            print!("Description... ");
            values.push(machine.maquina.clone());
            println!("DONE!");

            for group in &leitura.leitura {
                println!(" ");
                println!("READING GROUP... ");
                let v_fio = group.v_fio.clone().unwrap_or_else(String::new);
                println!("Processing group with v_fio: {:?}", group.v_fio);
                if !v_fio.is_empty() {
                    print!("- Wire... ");
                    if v_fio == "-" {
                        values.push(v_fio.clone());
                    } else {
                        values.push(format!("{}M/m", v_fio));
                    }
                    println!("DONE!");
                }

                print!("- Volt/Amp... ");
                if &group.tensao == "-" {
                    values.push(group.tensao.clone());
                } else {
                    values.push(format!("{}{}", group.tensao, group.unidades));
                }
                println!("DONE!");

                print!("- Measurements... ");
                let measurement_values: Vec<String> = group
                    .medicoes
                    .iter()
                    .map(|m| {
                        if m.valor == "-" {
                            "-".to_string()
                        } else {
                            format!("{}{}", m.valor, m.unidades)
                        }
                    })
                    .collect();
                values.extend(measurement_values);
                println!("DONE!");

                print!("- Average... ");
                if group.media == "0" {
                    values.push("-".to_string());
                } else {
                    values.push(group.media.clone());
                }
                println!("DONE!");

                print!("- Deviation... ");
                if group.desvio == "0" {
                    values.push("-".to_string());
                } else {
                    values.push(group.desvio.clone());
                }
                println!("DONE!"); // Move to next set of data (next group: either voltage or ampere)

                println!("READING GROUP... DONE!");
            }

            print!("Reading date... ");
            values.push(leitura.data_leitura.clone());
            println!("DONE!");

            println!("--------------------------");
            println!("Writing values to row {}", current_row);
            println!(" ");
            println!("--------------------------");
            worksheet
                .write_row_with_format(current_row, 0, &values, format)
                .map_err(|_| "Failed to write row data.".to_string())?;
            current_row += 1;
        }
    }

    Ok(current_row - row)
}
