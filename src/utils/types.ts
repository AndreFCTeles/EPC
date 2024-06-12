
/* |-------------| */
/* | Process CSV | */
/* |-------------| */

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


/* |-------------| */
/* | Submit Data | */
/* |-------------| */

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


/* |------------| */
/* | Fetch Data | */
/* |------------| */

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
   id?: string;
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


/* |------------| */
/* | Components | */
/* |------------| */

// aggregates 'leitura' data to be displayed in a single table row
export interface AggregatedReading {
   machine: JSONMaquina;
   data_leitura: string;
   readings: JSONLeituraGrupo[];
}

// fetched data structure for Select input data
export interface fetchedDataObject {
   value: string;
   label: string;
}

// Data table state management
export interface SelectedItems { [key: string]: boolean; }
export interface SelectedStyle { [key: string]: string; }

// Submitting form+csv data
export interface MeasureFormData {
   cliente: string;
   maquina: string;
   nSerie: string;
   tensaoA?: number | string;
   tensaoV?: number | string;
   vFio?: number | string;
   data?: Date | string;
}

// Drag-drop Files
export interface MeasurementFormProps {
   initialFiles: string[];
   onFormSubmit: () => void;
}
