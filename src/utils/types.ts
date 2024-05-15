
// Process CSV

export interface ClientMeasurement {
   model_number: string;
   tool_name: string;
   capture_date: string;
   value: string;
   units: string;
}

export interface FileWithContentAndCheck {
   label: string; 
   checked: boolean;
   parsedData: ClientMeasurement[];
}
export type SetFilesFunction = React.Dispatch<React.SetStateAction<FileWithContentAndCheck[]>>;

// Parsed CSV + Form data, for submission

export interface Cliente {
   nome_cliente: string;
   maquinas: Maquina[];
}

export interface Maquina {
   n_serie: string;
   maquina: string;
   leituras: Leitura[];
}

export interface Leitura {
   data_leitura: string;
   leitura: LeituraGrupo[];
}

// Introducing a new type to handle groups of measurements under the same timestamp
export interface LeituraGrupo {
   tensao: string;
   unidades: string;
   v_fio?: string;
   medicoes: Medicao[];
}

export interface Medicao {
   numero_ferramenta: string;
   nome_ferramenta: string;
   data: string;
   valor: string;
   unidades: string;
}


// Fetched JSON Data

export interface JSONCliente {
   id: string;
   nome_cliente: string;
   maquinas: JSONMaquina[];
}

export interface JSONMaquina {
   n_serie: string;
   maquina: string;
   leituras: JSONLeitura[];
}

export interface JSONLeitura {
   id: string;
   data_leitura: string;
   leitura: JSONLeituraGrupo[];
}

export interface JSONLeituraGrupo {
   id?: string; // Optional if each group isn't uniquely identified
   tensao: string;
   unidades: 'V' | 'A';
   v_fio?: string;
   medicoes: JSONMedicao[];
   media: string;
   desvio: string;
}

export interface JSONMedicao {
   id: string;
   numero_ferramenta: string;
   nome_ferramenta: string;
   data: string;
   valor: string;
   unidades: 'V' | 'A' | string;
}

export interface AggregatedReading {
   machine: JSONMaquina;
   data_leitura: string;
   readings: JSONLeituraGrupo[];
}

export interface fetchedDataObject {
   value: string;
   label: string;
}
