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
//import { showNotification } from '@mantine/notifications';
import fetchFilteredData from '../utils/fetchFilteredData';
import fetchFullClientData from '../utils/fetchAllData';
import {JSONCliente, JSONMaquina, JSONVerificacao, JSONLeitura, JSONMedicao} from '../utils/types'

interface fetchedDataObject {
   value: string;
   label: string;
}

/*
type TableDataType = {
   id: string;
   n_serie: string;
   maquina: string;
   // Add additional properties as needed
};
*/


const DataTable: React.FC = () => {
   // Data states
   const [selCliId, setSelCliId] = useState<string | null>(null);
   const [selClientes, setSelClientes] = useState<Array<fetchedDataObject>>([]);
   const [selMaqNSerie, setSelMaqNSerie] = useState<string | null>(null);
   const [selMaquinas, setSelMaquinas] = useState<Array<fetchedDataObject>>([]);
   const [selVFio, setSelVFio] = useState<Array<fetchedDataObject>>([]);
   const [selTensao, setSelTensao] = useState<Array<fetchedDataObject>>([]);
   
   // Visibility states
   const [showMaquina, setShowMaquina] = useState(false);
   const [showVFio, setShowVFio] = useState(false);
   const [showTensao, setShowTensao] = useState(false);

   // Table data
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const [filterTableData, setFilterTableData] = useState(null);
   const [tableData, setTableData] = useState<JSONCliente | null>(null);
   const [tableDataMaq, setTableDataMaq] = useState<JSONMaquina[]>([]);
   const [tableDataVer, setTableDataVer] = useState<JSONVerificacao[]>([]);
   const [tableDataLei, setTableDataLei] = useState<JSONLeitura[]>([]);
   const [tableDataMed, setTableDataMed] = useState<JSONMedicao[]>([]);

      
   // Checkboxes
   //const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});
   const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
   //const allChecked = Object.values(selectedItems).every(Boolean);
   //const someChecked = Object.values(selectedItems).some(Boolean);
   //const allChecked = tableData.length > 0 && Object.keys(selectedItems).length === tableData.length && Object.values(selectedItems).every(Boolean);
   //const someChecked = tableData.length > 0 && Object.values(selectedItems).some(Boolean) && !allChecked;   
   //const allChecked = tableData.every(cliente => selectedItems[cliente.id]);
   //const someChecked = tableData.some(cliente => selectedItems[cliente.id]) && !allChecked;
   
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
               setTableData(data);
               setFilterTableData(data);  // Assume full data initially matches filtered data
            } else { throw new Error("Received no data"); }
         } catch (error) {
            console.error('Failed to fetch full client data:', error);
            setTableData(null);
            setFilterTableData(null);
         } finally { setIsLoading(false); }
      };
      fetchData();
   }, [selCliId]);
   
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
      setSelMaqNSerie(value);
      console.log("handleMaquinaChange value:", value);
      if (value && selCliId) {
         fetchFilteredData('selVFio', selCliId, value).then(data => {
            setSelVFio(data.map((vfio: fetchedDataObject) => ({ value: vfio.value, label: vfio.label })));
            setTableDataMaq(data);
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

   // Update selectedItems when checkbox is toggled
   const toggleItemCheck = (id: string) => {
      setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
   };

   // Update all selectedItems when master checkbox is toggled
   /*
   const toggleAllItemsCheck = (checked: boolean) => {
      const newSelectedItems: Record<string, boolean> = {};
      tableData.forEach((cliente: JSONCliente) => {
         newSelectedItems[cliente.id] = checked;
      });
      setSelectedItems(newSelectedItems);
   };
   */

   const renderTableRows = () => {
      if (!tableData) {
         return <Table.Tr><Table.Td colSpan={10}>No data available.</Table.Td></Table.Tr>;
      }

      // Assuming `tableData` is a single client object with a `maquinas` array
      return tableData.maquinas.flatMap(machine =>
         machine.verificacoes.flatMap(verification =>
            verification.leituras.flatMap(reading =>
                  <Table.Tr key={machine.n_serie} ta="center">
                     <Table.Td ta="left">{`${machine.n_serie} - ${machine.maquina}`}</Table.Td>
                     <Table.Td ta="center">{`${verification.v_fio} M/m`}</Table.Td>
                     <Table.Td ta="center">{`${reading.tensao} ${reading.unidades}`}</Table.Td>
                     {reading.medicoes.map((medicao, index) => (
                        <Table.Td key={`${medicao.id}-${index}`} ta="center">{`${medicao.valor} ${medicao.unidades}`}</Table.Td>
                     ))}
                     <Table.Td ta="center"></Table.Td>
                     <Table.Td ta="center"></Table.Td>
                     <Table.Td ta="center"></Table.Td>
                     <Table.Td ta="center"></Table.Td>
                     <Table.Td ta="center"></Table.Td>
                     <Table.Td ta="center"></Table.Td>
                     <Table.Td ta="center"></Table.Td>
                     <Table.Td ta="center"></Table.Td>
                     <Table.Td ta="center"></Table.Td>
                     <Table.Td ta="center"></Table.Td>
                     <Table.Td ta="center">{reading.data_leitura}</Table.Td>
                  </Table.Tr>
            )
         )
      );
   };


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

            <ScrollArea>
               <Table striped highlightOnHover withTableBorder withColumnBorders ta="center">                     
                  <Table.Thead>
                     <Table.Tr>
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