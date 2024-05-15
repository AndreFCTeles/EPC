import { Cliente, LeituraGrupo } from './types';

const aggregateData = (clientes: Cliente[]): Cliente => {
   const aggregatedCliente: Cliente = {
      nome_cliente: clientes[0].nome_cliente, // Assuming all clients have the same name
      maquinas: []
   };

   clientes.forEach(cliente => {
      cliente.maquinas.forEach(maquina => {
         let existingMaquina = aggregatedCliente.maquinas.find(m => m.n_serie === maquina.n_serie);
         if (!existingMaquina) {
               existingMaquina = {
                  n_serie: maquina.n_serie,
                  maquina: maquina.maquina,
                  leituras: []
               };
               aggregatedCliente.maquinas.push(existingMaquina);
         }

         maquina.leituras.forEach(leitura => {
            let existingLeitura = existingMaquina.leituras.find(l => l.data_leitura === leitura.data_leitura);
            if (!existingLeitura) {
               existingLeitura = {
                  data_leitura: leitura.data_leitura,
                  leitura: []
               };
               existingMaquina.leituras.push(existingLeitura);
            }

            // Merge V and A readings into a single 'leitura' array
            existingLeitura.leitura = mergeReadings(existingLeitura.leitura, leitura.leitura);
         });
      });
   });

   return aggregatedCliente;
};

// Merges voltage and amperage readings based on their `tensao` and `unidades` properties.
function mergeReadings(existingReadings: LeituraGrupo[], newReadings: LeituraGrupo[]) {
   newReadings.forEach(newReading => {
      let found = existingReadings.find(er => er.tensao === newReading.tensao && er.unidades === newReading.unidades);
      if (found) { found.medicoes.push(...newReading.medicoes); } // Assume we want to merge measurements under the same voltage or current
      // else { existingReadings.push(newReading); }
      else { existingReadings.push({ ...newReading, medicoes: [...newReading.medicoes] }); }
   });
   return existingReadings;
}

export default aggregateData;