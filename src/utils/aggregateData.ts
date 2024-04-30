import { Cliente } from './types';

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
            let existingLeitura  = existingMaquina.leituras.find(l => l.data_leitura === leitura.data_leitura && l.tensao === leitura.tensao && l.unidades === leitura.unidades);
            if (!existingLeitura ) {
               existingLeitura  = {
                  data_leitura: leitura.data_leitura,
                  tensao: leitura.tensao,
                  unidades: leitura.unidades,
                  v_fio: leitura.v_fio,
                  medicoes: []
               };
               existingMaquina.leituras.push(existingLeitura);
            }
            
            // Aggregate all Medicoes into the found or newly created leitura
            existingLeitura.medicoes.push(...leitura.medicoes);
         });
      });
   });

   return aggregatedCliente;
};

export default aggregateData;