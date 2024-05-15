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
    pub leituras: Vec<LeituraDTO>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LeituraDTO {
    pub data_leitura: String,
    pub leitura: Vec<LeituraGrupoDTO>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LeituraGrupoDTO {
    pub tensao: String,
    pub unidades: String,
    pub v_fio: Option<String>,
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
    pub id: String,
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
    pub leituras: Vec<Leitura>,
}
impl Maquina {
    pub fn from_dto(dto: MaquinaDTO) -> Self {
        Self {
            n_serie: dto.n_serie,
            maquina: dto.maquina,
            leituras: dto.leituras.into_iter().map(Leitura::from_dto).collect(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Leitura {
    pub id: String,
    pub data_leitura: String,
    pub leitura: Vec<LeituraGrupo>,
}
impl Leitura {
    pub fn from_dto(dto: LeituraDTO) -> Self {
        let leitura_grupos: Vec<LeituraGrupo> = dto
            .leitura
            .into_iter()
            .map(LeituraGrupo::from_dto)
            .collect();

        Self {
            id: Uuid::new_v4().to_string(),
            data_leitura: dto.data_leitura,
            leitura: leitura_grupos,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LeituraGrupo {
    pub tensao: String,
    pub unidades: String,
    pub v_fio: Option<String>,
    pub medicoes: Vec<Medicao>,
    pub media: String,
    pub desvio: String,
}
impl LeituraGrupo {
    pub fn from_dto(dto: LeituraGrupoDTO) -> Self {
        let medicoes: Vec<Medicao> = dto.medicoes.into_iter().map(Medicao::from_dto).collect();

        let media = calculate_average_value(&medicoes).to_string();
        let tensao_parsed = dto.tensao.parse::<f64>().unwrap_or_default();
        let desvio =
            calculate_deviation(tensao_parsed, calculate_average_value(&medicoes)).to_string();

        Self {
            tensao: dto.tensao,
            unidades: dto.unidades,
            v_fio: dto.v_fio,
            medicoes,
            media: media,
            desvio: desvio,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Medicao {
    pub id: String,
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
