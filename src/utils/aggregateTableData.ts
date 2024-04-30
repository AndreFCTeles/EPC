import { JSONCliente, JSONMaquina, JSONLeitura, AggregatedReading } from "./types";
const aggregateTableData = (tableData: JSONCliente) => {
   if (!tableData) { return []; }

   const aggregatedData: AggregatedReading[] = [];
   const indices: number[] = [];

   tableData.maquinas.forEach((machine: JSONMaquina) => {
      const readingsByDate: { [key: string]: AggregatedReading } = {};

      machine.leituras.forEach((reading: JSONLeitura) => {
         const key = reading.data_leitura;

         if (key in readingsByDate) {
            const existing = readingsByDate[key];
            if (reading.unidades === 'V') { existing.readingV = reading; } 
            else { existing.readingA = reading; }
         } else {
            readingsByDate[key] = {
               machine,
               data_leitura: reading.data_leitura,
               [reading.unidades === 'V' ? 'readingV' : 'readingA']: reading
            };
         }
      });

      for (const date in readingsByDate) { 
         aggregatedData.push(readingsByDate[date]);
         indices.push(aggregatedData.length - 1);
      }
   });

   console.log("aggregatedData:", aggregatedData)

   
   // Sort the indices array based on the sorting criteria
      indices.sort((a, b) => {
      const readingA = aggregatedData[a];
      const readingB = aggregatedData[b];

      // Your sorting logic here
      
      // Check if v_fio is null, undefined, or an empty string
      const v_fioExistsA = !!readingA.readingV?.v_fio;
      const v_fioExistsB = !!readingB.readingV?.v_fio;

      // Nested ordering based on conditions
      if (v_fioExistsA && v_fioExistsB) {
         // Sort by v_fio (ascending order)
         if (readingA.readingV!.v_fio! < readingB.readingV!.v_fio!) return -1;
         if (readingA.readingV!.v_fio! > readingB.readingV!.v_fio!) return 1;

         // If v_fio is equal, sort by readingV.tensao
         if (readingA.readingV!.tensao < readingB.readingV!.tensao) return -1;
         if (readingA.readingV!.tensao > readingB.readingV!.tensao) return 1;

         // If readingV.tensao is equal, sort by readingV.medicoes.unidades
         if (readingA.readingV!.medicoes[0].unidades < readingB.readingV!.medicoes[0].unidades) return -1;
         if (readingA.readingV!.medicoes[0].unidades > readingB.readingV!.medicoes[0].unidades) return 1;

         // If readingV.medicoes.unidades is equal, check for readingA and sort accordingly
         if (readingA.readingA && readingB.readingA) {
            if (readingA.readingA.tensao < readingB.readingA.tensao) return -1;
            if (readingA.readingA.tensao > readingB.readingA.tensao) return 1;
            if (readingA.readingA.medicoes[0].unidades < readingB.readingA.medicoes[0].unidades) return -1;
            if (readingA.readingA.medicoes[0].unidades > readingB.readingA.medicoes[0].unidades) return 1;
         }
      } else if (v_fioExistsA && !v_fioExistsB) {
         return -1; // Place entry with v_fio before entry without v_fio
      } else if (!v_fioExistsA && v_fioExistsB) {
         return 1; // Place entry without v_fio after entry with v_fio
      }

      // If v_fio doesn't exist, order by readingA.tensao, followed by readingA.medicoes.unidades
      if (readingA.readingA && readingB.readingA) {
         if (readingA.readingA.tensao < readingB.readingA.tensao) return -1;
         if (readingA.readingA.tensao > readingB.readingA.tensao) return 1;
         if (readingA.readingA.medicoes[0].unidades < readingB.readingA.medicoes[0].unidades) return -1;
         if (readingA.readingA.medicoes[0].unidades > readingB.readingA.medicoes[0].unidades) return 1;
      }

      return 0; // Default: no change in order
   });
   
   const sortedAggregatedData: AggregatedReading[] = [];
   indices.forEach(index => { sortedAggregatedData.push(aggregatedData[index]); });
   
   console.log("sorted aggregatedData:", sortedAggregatedData)

   return sortedAggregatedData;
};

export default aggregateTableData;