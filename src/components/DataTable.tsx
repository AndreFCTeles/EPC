/* |---------| */
/* | IMPORTS | */
/* |---------| */

// React
import React, { useState, useEffect } from 'react';
// Mantine
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
// Utils
import {JSONCliente, JSONLeitura, fetchedDataObject, AggregatedReading} from '../utils/types'
import fetchFilteredData from '../utils/fetchFilteredData';
import fetchFullClientData from '../utils/fetchAllData';
import aggregateTableData from '../utils/aggregateTableData';





/* |------------| */
/* | COMPONENTE | */
/* |------------| */

const DataTable: React.FC = () => {
   /* |---------| */
   /* | ESTADOS | */
   /* |---------| */
   
   // Data states
   const [selCliId, setSelCliId] = useState<string | null>(null);
   const [selClientes, setSelClientes] = useState<Array<fetchedDataObject>>([]);
   //const [selMaqNSerie, setSelMaqNSerie] = useState<string | null>(null);
   const [selMaquinas, setSelMaquinas] = useState<Array<fetchedDataObject>>([]);
   const [selVFio, setSelVFio] = useState<Array<fetchedDataObject>>([]);
   const [selTensao, setSelTensao] = useState<Array<fetchedDataObject>>([]);
   // Visibility states
   const [showMaquina, setShowMaquina] = useState(false);
   const [showVFio, setShowVFio] = useState(false);
   const [showTensao, setShowTensao] = useState(false);
   // Table data
   const [isLoading, setIsLoading] = useState<boolean>(false);
   //const [filterTableData, setFilterTableData] = useState(null);
   const [tableData, setTableData] = useState<JSONCliente | null>(null);
   const [rowData, setRowData] = useState<JSONCliente[] | null>([]);
   // Checkboxes
   const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});





   /* |-------------------| */
   /* | UTILITY FUNCTIONS | */
   /* |-------------------| */

   
   // Update selectedItems when checkbox is toggled
   const toggleItemCheck = (id: string) => {
      setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
   };

   // Update all selectedItems when master checkbox is toggled
   const toggleAllItemsCheck = (checked: boolean) => {
      const newSelectedItems: Record<string, boolean> = {};
      // Assuming `tableData` holds your rows data
      if (tableData) tableData.maquinas.forEach((machine) => {
         machine.leituras.forEach((leitura) => {
               newSelectedItems[leitura.id] = checked;
         });
      });
      setSelectedItems(newSelectedItems);
   };

   // Render table rows
   const renderTableRows = () => {
      if (!tableData) {
         return <Table.Tr><Table.Td colSpan={10}>Selecione um cliente ou adicione dados para começar.</Table.Td></Table.Tr>;
      }

      const aggregatedReadings = aggregateTableData(tableData);

      // Render table rows based on aggregated data
      return aggregatedReadings.map(({ machine, data_leitura, readingV, readingA }) => (
         <Table.Tr key={`${machine.n_serie}-${data_leitura}`}>
            <Table.Td>
               <Checkbox
                  checked={!!selectedItems[`${machine.n_serie}-${data_leitura}`]}
                  onChange={() => toggleItemCheck(`${machine.n_serie}-${data_leitura}`)}
               />
            </Table.Td>
            <Table.Td>{`${machine.n_serie} - ${machine.maquina}`}</Table.Td>
            <Table.Td>{readingV?.v_fio? `${readingV?.v_fio } M/m` : '-'}</Table.Td>
            <Table.Td>{readingV ? `${readingV.tensao}${readingV.medicoes[0].unidades}` : '-'}</Table.Td>
            {Array.from({ length: 5 }).map((_, i) => (
               <Table.Td key={i}>{readingV && readingV.medicoes.length > i ? `${readingV.medicoes[i].valor}${readingV.medicoes[i].unidades}` : '-'}</Table.Td>
            ))}
            <Table.Td>{readingV?.media || '-'}</Table.Td>
            <Table.Td>{readingV?.desvio || '-'}</Table.Td>
            <Table.Td>{readingA ? `${readingA.tensao}${readingA.medicoes[0].unidades}` : '-'}</Table.Td>
            {Array.from({ length: 5 }).map((_, i) => (
               <Table.Td key={i}>{readingA && readingA.medicoes.length > i ? `${readingA.medicoes[i].valor}${readingA.medicoes[i].unidades}` : '-'}</Table.Td>
            ))}
            <Table.Td>{readingA?.media || '-'}</Table.Td>
            <Table.Td>{readingA?.desvio || '-'}</Table.Td>
            <Table.Td>{data_leitura}</Table.Td>
         </Table.Tr>
      ));
   }
   




   /* |----------| */
   /* | HANDLERS | */
   /* |----------| */

   // Handlers for Select components
   const handleClienteChange = (value: string | null) => {
      setSelCliId(value);
      if (value) {
         fetchFilteredData("selMaquinas", value).then(data => {
            setSelMaquinas(data.map((selmaq: fetchedDataObject) => ({ 
               value: selmaq.value, 
               label: selmaq.label 
            })));
            setShowMaquina(true); 

         });
      } else { setShowMaquina(false); }
   };

   const handleMaquinaChange = (value: string | null) => {
      //setSelMaqNSerie(value);
      console.log("handleMaquinaChange value:", value);
      if (value && selCliId) {
         fetchFilteredData('selVFio', selCliId, value).then(data => {
            setSelVFio(data.map((vfio: fetchedDataObject) => ({ value: vfio.value, label: vfio.label })));
            //setTableDataMaq(data);
            setShowVFio(true);
         });
      } else { setShowVFio(false); }
   };

   const handleVFioChange = (value: string | null) => {      
      if (value) {
         fetchFilteredData('selTensao', value).then(data => {
            setSelTensao(data.map((selten:fetchedDataObject) => ({ value: selten.value, label: selten.label })));
            setTableData(data);
            setShowTensao(true); // Show the Tensão select
         });   
      } else { setShowTensao(false); }
   };





   /* |---------| */
   /* | EFFECTS | */
   /* |---------| */
   
   useEffect(() => {
      // Fetch clientes
      fetchFilteredData('selClientes').then((data) => {
         const formattedData = data.map((slecli:fetchedDataObject) => ({
            value: slecli.value,
            label: slecli.label
         }));
         setSelClientes(formattedData);
         console.log('formattedData Cliente (default render): ', formattedData)
      });
   }, []);   

   useEffect(() => {
      if (!selCliId) return;
      const fetchData = async () => {
         setIsLoading(true);
         try {
            const data = await fetchFullClientData(selCliId);
            if (data) {
               console.log("Client selected. fetching data:")
               console.log("from ", selCliId, selClientes);
               console.log(data);
               console.log(JSON.stringify(data));
               setTableData(data);
               //setFilterTableData(data);  // Assume full data initially matches filtered data
            } else { throw new Error("Received no data"); }
         } catch (error) {
            console.error('Failed to fetch full client data:', error);
            setTableData(null);
            //setFilterTableData(null);
         } finally { setIsLoading(false); }
      };
      fetchData();
   }, [selCliId]);




   /* |-----| */
   /* | JSX | */
   /* |-----| */

   return (
      <Box m={0} p={0}>
         <Stack>
            <Group px={"xs"} gap={"xs"} grow>
               <Select 
               label="Cliente"
               placeholder='Cliente/Empresa'
               className='ConSel'
               value={selCliId}
               data={selClientes}
               onChange={handleClienteChange}
               searchable
               allowDeselect
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

            <ScrollArea offsetScrollbars >
               <Table 
               w={"auto"} 
               miw={"100%"}  
               ta="center"
               striped 
               highlightOnHover 
               withTableBorder 
               withColumnBorders 
               style={{ whiteSpace: 'nowrap' }}>
                  <Table.Thead>
                     <Table.Tr>
                        {showMaquina ? (<>
                           <Table.Th>
                              <Checkbox
                                 checked={Object.values(selectedItems).every(Boolean)}
                                 indeterminate={!Object.values(selectedItems).every(Boolean) && Object.values(selectedItems).some(Boolean)}
                                 onChange={(event) => toggleAllItemsCheck(event.currentTarget.checked)}
                              />
                           </Table.Th>
                           <Table.Th ta="center">Descrição</Table.Th>
                           <Table.Th ta="center">V. Fio</Table.Th>
                           <Table.Th ta="center">Leitura (Volt.)</Table.Th>
                           <Table.Th ta="center">10''</Table.Th>
                           <Table.Th ta="center">10''</Table.Th>
                           <Table.Th ta="center">10''</Table.Th>
                           <Table.Th ta="center">10''</Table.Th>
                           <Table.Th ta="center">10''</Table.Th>
                           <Table.Th ta="center">Media</Table.Th>
                           <Table.Th ta="center">Desvio</Table.Th>
                           <Table.Th ta="center">Leitura (Amp.)</Table.Th>
                           <Table.Th ta="center">10''</Table.Th>
                           <Table.Th ta="center">10''</Table.Th>
                           <Table.Th ta="center">10''</Table.Th>
                           <Table.Th ta="center">10''</Table.Th>
                           <Table.Th ta="center">10''</Table.Th>
                           <Table.Th ta="center">Media</Table.Th>
                           <Table.Th ta="center">Desvio</Table.Th>
                           <Table.Th ta="center">Data de leitura</Table.Th>
                        </> ) : <Table.Th ta="center">Tabela de leituras</Table.Th> }
                     </Table.Tr> 
                  </Table.Thead>
                  <Table.Tbody>
                     {renderTableRows()}
                  </Table.Tbody>
               </Table>
            </ScrollArea>

         </Stack>     
      </Box>
   )
}

export default DataTable