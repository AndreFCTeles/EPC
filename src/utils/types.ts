
// Process CSV

export interface ClientMeasurement {
   model_number: string;
   tool_name: string;
   capture_date: string;
   value: string;
   units: string;
}

export interface FileWithContentAndCheck {
   label: string; // Includes file name and date
   checked: boolean; // For UI checkbox handling
   parsedData: ClientMeasurement[]; // Directly use ClientMeasurement for parsed CSV data
}


// Parsed CSV + Form data, for submission

export interface Cliente {
   nome_cliente: string;
   maquinas: Maquina[];
}

export interface Maquina {
   n_serie: string;
   maquina: string;
   verificacoes: Verificacao[];
}

export interface Verificacao {
   v_fio: string;
   leituras: Leitura[];
}

export interface Leitura {
   data_leitura: string;
   tensao: string;
   unidades: string;
   medicoes: Medicao[];
}

export interface Medicao {
   numero_ferramenta: string;
   nome_ferramenta: string;
   data: string;
   valor: string;
   unidades: string;
}