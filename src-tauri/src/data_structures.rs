use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::utilities::{calculate_average_value, calculate_deviation};

// -------------- Data Structures for CSV Parsing --------------

#[derive(Debug, Serialize, Deserialize)]
pub struct Measurement {
    pub model_number: String,
    pub tool_name: String,
    pub capture_date: String,
    pub value: String,
    pub units: String,
}

// -------------- Data Structures for JSON Handling --------------

// Data Structures for frontend input (without IDs) - DTO: Data Transfer Object

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClienteDTO {
    pub nome_cliente: String,
    pub maquinas: Vec<MaquinaDTO>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MaquinaDTO {
    pub n_serie: String,
    pub maquina: String,
    pub verificacoes: Vec<VerificacaoDTO>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VerificacaoDTO {
    pub v_fio: String,
    pub leituras: Vec<LeituraDTO>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LeituraDTO {
    pub data_leitura: String,
    pub tensao: String,
    pub unidades: String,
    pub medicoes: Vec<MedicaoDTO>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MedicaoDTO {
    pub numero_ferramenta: String,
    pub nome_ferramenta: String,
    pub data: String,
    pub valor: String,
    pub unidades: String,
}

// Data Structures for storing data (with IDs)

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Cliente {
    pub id: String, // Now using UUIDs
    pub nome_cliente: String,
    pub maquinas: Vec<Maquina>,
}
impl Cliente {
    pub fn from_dto(dto: ClienteDTO) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            nome_cliente: dto.nome_cliente,
            maquinas: dto.maquinas.into_iter().map(Maquina::from_dto).collect(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Maquina {
    pub n_serie: String,
    pub maquina: String,
    pub verificacoes: Vec<Verificacao>,
}
impl Maquina {
    pub fn from_dto(dto: MaquinaDTO) -> Self {
        Self {
            n_serie: dto.n_serie,
            maquina: dto.maquina,
            verificacoes: dto
                .verificacoes
                .into_iter()
                .map(Verificacao::from_dto)
                .collect(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Verificacao {
    pub v_fio: String,
    pub leituras: Vec<Leitura>,
}
impl Verificacao {
    pub fn from_dto(dto: VerificacaoDTO) -> Self {
        Self {
            v_fio: dto.v_fio,
            leituras: dto.leituras.into_iter().map(Leitura::from_dto).collect(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Leitura {
    pub id: String, // Now using UUIDs
    pub data_leitura: String,
    pub tensao: String,
    pub unidades: String,
    pub medicoes: Vec<Medicao>,
    pub media: Option<String>,
    pub desvio: Option<String>,
}
impl Leitura {
    pub fn from_dto(dto: LeituraDTO) -> Self {
        // First, convert all `MedicaoDTO` to `Medicao` and collect them into a vector.
        let medicoes: Vec<Medicao> = dto.medicoes.into_iter().map(Medicao::from_dto).collect();

        // Now that `medicoes` is available, calculate `media` and `desvio`.
        let media = calculate_average_value(&medicoes).to_string(); // Convert to string after calculation
        let tensao_parsed = dto.tensao.parse::<f64>().unwrap_or_default(); // Safe parse with fallback to default (0.0)
        let desvio =
            calculate_deviation(tensao_parsed, calculate_average_value(&medicoes)).to_string(); // Convert to string after calculation

        Self {
            id: Uuid::new_v4().to_string(),
            data_leitura: dto.data_leitura,
            tensao: dto.tensao,
            unidades: dto.unidades,
            medicoes,
            media: Some(media),
            desvio: Some(desvio),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Medicao {
    pub id: String, // Now using UUIDs
    pub numero_ferramenta: String,
    pub nome_ferramenta: String,
    pub data: String,
    pub valor: String,
    pub unidades: String,
}
impl Medicao {
    pub fn from_dto(dto: MedicaoDTO) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            numero_ferramenta: dto.numero_ferramenta,
            nome_ferramenta: dto.nome_ferramenta,
            data: dto.data,
            valor: dto.valor,
            unidades: dto.unidades,
        }
    }
}
