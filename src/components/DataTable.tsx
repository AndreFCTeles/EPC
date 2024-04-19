import React, { useState, useEffect } from 'react';
import fetchData from '../utils/fetchdata';
import { 
   Box,
   Group, 
   Stack, 
   Table, 
   Checkbox, 
   Select,
   Button,
   ScrollArea
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import fetchFilteredData from '../utils/fetchFilteredData';

interface fetchedDataObject {
   value: string;
   label: string;
}

const DataTable: React.FC = () => {
   // Data states
   const [selClientes, setSelClientes] = useState<Array<fetchedDataObject>>([]);
   const [selMaquinas, setSelMaquinas] = useState<Array<fetchedDataObject>>([]);
   const [selCliId, setSelCliId] = useState('');
   const [selMaqNSerie, setSelMaqNSerie] = useState('');
   const [selVFio, setSelVFio] = useState<Array<fetchedDataObject>>([]);
   const [selTensao, setSelTensao] = useState<Array<fetchedDataObject>>([]);
   
   // Visibility states
   const [showMaquina, setShowMaquina] = useState(false);
   const [showVFio, setShowVFio] = useState(false);
   const [showTensao, setShowTensao] = useState(false);

   // Table data
   const [tableData, setTableData] = useState([]);
   
   useEffect(() => {
      // Fetch clientes
      fetchData('selClientes').then((data) => {
         const formattedData = data.map((slecli:fetchedDataObject) => ({
            value: slecli.value,
            label: slecli.label
         }));
         setSelClientes(formattedData);
      });
   }, []);   

   // Handlers for Select components
   const handleClienteChange = (value:string|null) => {
      // Fetch Maquinas related to the selected Cliente
      setSelCliId(value);
      fetchFilteredData('selMaquinas', value).then(data => {
         setSelMaquinas(data.map((selmaq:fetchedDataObject) => ({ value: selmaq.value, label: selmaq.label })));
         setShowMaquina(true); // Show the Maquina select
      });
   };

   const handleMaquinaChange = (value: string) => {
      setSelMaqNSerie(value); // Storing selected machine ID
      fetchFilteredData('selVFio', selMaqNSerie).then(data => {
         setSelVFio(data.map((vfio:fetchedDataObject) => ({ value: vfio.value, label: vfio.label })));
         setShowVFio(true); // Assuming you control the visibility of the next dropdown
      }).catch(error => {
         console.error('Failed to fetch V. Fio:', error);
         showNotification({
            title: 'Erro',
            message: 'Falha ao carregar velocidades de fio. Tente outra vez ou contacte o administrador.',
            color: 'red',
         });
      });
   };

   const handleVFioChange = (value:string|null) => {
      // Fetch Tensao related to the selected V. Fio
      fetchFilteredData('selTensao', value).then(data => {
         setSelTensao(data.map((selten:fetchedDataObject) => ({ value: selten.value, label: selten.label })));
         setShowTensao(true); // Show the Tensão select
      });
   };

   useEffect(() => {
      if (selClientes) {
         // Replace 'fetchDetailsForCliente' with your actual data fetching function
         fetchFilteredData('fetchDetailsForCliente', { cliente: selClientes })
         .then(data => setTableData(data))
         .catch(error => console.error('Error fetching data:', error));
      }
   }, [selClientes]);

   return (
      <Box m={0} p={0}>
         <Stack>
               <Group px={"xs"} gap={"xs"} grow>
                  <Select 
                  label="Cliente"
                  placeholder='Cliente/Empresa'
                  className='ConSel'
                  value={setSelCliId}
                  data={selClientes}
                  onChange={handleClienteChange}
                  searchable
                  />
                  {showMaquina && (
                     <Select 
                        label="Maquina"
                        placeholder='Tipo de Maquina'
                        className='ConSel'
                        data={selMaquinas}
                        onChange={handleMaquinaChange}
                        searchable
                        allowDeselect
                     />
                  )}
                  {showVFio && (
                     <Select 
                        label="V. Fio"
                        placeholder='0 M/m'
                        className='ConSel'
                        data={selVFio}
                        onChange={handleVFioChange}
                        searchable
                        allowDeselect
                     />
                  )}
                  {showTensao && (
                     <Select 
                        label="Tensão"
                        placeholder='0 V/A'
                        className='ConSel'
                        data={selTensao}
                        searchable
                        allowDeselect
                     />
                  )}
               </Group>

               <Button maw={200} ml={"xs"}>Exportar selecionados</Button>

               <ScrollArea>
                  <Table highlightOnHover withTableBorder>
                     <Table.Thead>
                        <Table.Tr>
                           <Table.Th>
                           <Checkbox
                              checked={allChecked}
                              indeterminate={!allChecked && someChecked}
                              onChange={(event) => toggleAllItemsCheck(event.currentTarget.checked)}
                              aria-label="Selecionar todas as verificações"
                           />
                           </Table.Th>
                           {/* ... other headers ... */}
                        </Table.Tr>
                     </Table.Thead>
                     <Table.Tbody>
                        {clienteData.map((cliente) => (
                           <Table.Tr key={cliente.id}>
                           <Table.Td>
                              <Checkbox
                                 checked={selectedItems[cliente.id] || false}
                                 onChange={() => toggleItemCheck(cliente.id)}
                                 aria-label={`Select ${cliente.maquina}`}
                              />
                           </Table.Td>
                           {/* ... other cells ... */}
                           </Table.Tr>
                        ))}
                     </Table.Tbody>
                  </Table>
               </ScrollArea>

         </Stack>     
      </Box>
   )
}

export default DataTable