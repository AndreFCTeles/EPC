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
// Tauri
import { save } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api/tauri';
// Utils
import {JSONCliente, fetchedDataObject } from '../utils/types'
import fetchFilteredData from '../utils/fetchFilteredData';
import fetchFullClientData from '../utils/fetchAllData';

interface SelectedItems { [key: string]: boolean; }




/* |------------| */
/* | COMPONENTE | */
/* |------------| */

const DataTable: React.FC = () => {
   /* |---------| */
   /* | ESTADOS | */
   /* |---------| */
   
   // Data states
   const [selCliId, setSelCliId] = useState<string | null>(null);
   const [selClientes, setSelClientes] = useState<Array<fetchedDataObject>>([]); // Select dropdown contents
   const [selMaquinas, setSelMaquinas] = useState<Array<fetchedDataObject>>([]); // Select dropdown contents
   const [selVFio, setSelVFio] = useState<Array<fetchedDataObject>>([]); // Select dropdown contents 
   const [selTensao, setSelTensao] = useState<Array<fetchedDataObject>>([]); // Select dropdown contents
   // Filtering
   //const [selectedCliente, setSelectedCliente] = useState<string | null>(null); // Selected dropdown value
   const [selectedMaquina, setSelectedMaquina] = useState<string | null>(null); // Selected dropdown value
   const [selectedVFio, setSelectedVFio] = useState<string | null>(null); // Selected dropdown value
   const [selectedTensao, setSelectedTensao] = useState<string | null>(null); // Selected dropdown value
   // Visibility states
   const [showMaquina, setShowMaquina] = useState(false);
   const [showVFio, setShowVFio] = useState(false);
   const [showTensao, setShowTensao] = useState(false);
   // Table data
   //const [isLoading, setIsLoading] = useState<boolean>(false);
   //const [filterTableData, setFilterTableData] = useState(null);
   const [tableData, setTableData] = useState<JSONCliente | null>(null);
   //const [rowData, setRowData] = useState<JSONCliente[] | null>([]);
   // Checkboxes
   const [selectedItems, setSelectedItems] = useState<SelectedItems>({});
   const allChecked = Object.values(selectedItems).length > 0 && Object.values(selectedItems).every(Boolean);
   const someChecked = Object.values(selectedItems).some(Boolean) && !allChecked;






   /* |-------------------| */
   /* | UTILITY FUNCTIONS | */
   /* |-------------------| */

   
   // Update selectedItems when checkbox is toggled
   const toggleItemCheck = (id:string) => {
      setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
   };

   // Update all selectedItems when master checkbox is toggled
   const toggleAllItemsCheck = (checked:boolean) => {
      const newSelectedItems: SelectedItems = {};
      tableData?.maquinas.forEach(machine => {
         machine.leituras.forEach(leitura => {
            const id = `${machine.n_serie}-${leitura.data_leitura}`;
            newSelectedItems[id] = checked;
         });
      });
      setSelectedItems(newSelectedItems);
   };

   // Render table rows
   const renderTableRows = () => {
      if (!tableData || !selCliId) {
         return <Table.Tr><Table.Td colSpan={10}>Selecione um cliente ou adicione dados para começar.</Table.Td></Table.Tr>;
      }

      /*
      console.log("test", selMaquinas)
      let filteredMaquinas = tableData.maquinas;
      if (selMaquinas) {
         filteredMaquinas = filteredMaquinas.filter(maquina => maquina.n_serie === selMaquinas[0].value);
      }
      */
      console.log("test", tableData.maquinas)
      
      return tableData.maquinas.flatMap((machine) =>
         machine.leituras.map((leitura) => {
            const voltageGroup = leitura.leitura.find(group => group.unidades === 'V');
            const ampereGroup = leitura.leitura.find(group => group.unidades === 'A');

            if (!voltageGroup || !ampereGroup) { return; }
            else {
               return (
                  <Table.Tr key={`${machine.n_serie}-${leitura.data_leitura}`}>
                     <Table.Td>
                        <Checkbox
                        checked={!!selectedItems[`${machine.n_serie}-${leitura.data_leitura}`]}
                        onChange={() => toggleItemCheck(`${machine.n_serie}-${leitura.data_leitura}`)}
                        />
                     </Table.Td>
                     <Table.Td>{`${machine.n_serie} - ${machine.maquina}`}</Table.Td>
                     <Table.Td>{voltageGroup.v_fio === "-" ? "-" : `${voltageGroup.v_fio} M/m`}</Table.Td>
                     <Table.Td>{voltageGroup.tensao === "-" ? "-" : `${voltageGroup.tensao} V`}</Table.Td>
                     {Array.from({ length: 5 }).map((_, i) => (
                        <Table.Td key={i}>{
                           voltageGroup.medicoes[i].valor === "-" 
                           ? "-" 
                           : `${voltageGroup.medicoes[i].valor} ${voltageGroup.medicoes[i].unidades}`
                        }</Table.Td>
                     ))}
                     <Table.Td>{voltageGroup.media === "0" ? '-' : voltageGroup.media}</Table.Td>
                     <Table.Td>{voltageGroup.desvio === "0" ? '-' : voltageGroup.desvio}</Table.Td>
                     
                     <Table.Td>{ampereGroup.tensao === "-" ? '-' : `${ampereGroup.tensao} A`}</Table.Td>
                     {Array.from({ length: 5 }).map((_, i) => (
                        <Table.Td key={i}>{
                           ampereGroup.medicoes[i].valor === "-" 
                           ? "-" 
                           : `${ampereGroup.medicoes[i].valor} ${ampereGroup.medicoes[i].unidades}`
                        }</Table.Td>
                     ))}
                     <Table.Td>{ampereGroup.media === "0" ? '-' : ampereGroup.media}</Table.Td>
                     <Table.Td>{ampereGroup.desvio === "0" ? '-' : ampereGroup.desvio}</Table.Td>
                     <Table.Td>{leitura.data_leitura}</Table.Td>
                  </Table.Tr>
               );
            }
         })
      );
   }



   /* |----------| */
   /* | HANDLERS | */
   /* |----------| */

   // Handlers for Select components
   const handleClienteChange = (value: string | null) => {
      setSelCliId(value);
      //setSelectedCliente(value);
      if (value) {
         fetchFilteredData("selMaquinas", value).then(data => {
            setSelMaquinas(data.map((selmaq: fetchedDataObject) => ({ 
               value: selmaq.value, 
               label: selmaq.label 
            })));
            setSelVFio([]);
            setSelTensao([]);
            setShowMaquina(true); 
            setShowVFio(false);
            setShowTensao(false);
         });
      } else { setShowMaquina(false); }
   };

   const handleMaquinaChange = (value: string | null) => {
      setSelectedMaquina(value);
      console.log("handleMaquinaChange selCliId:", selCliId);
      console.log("handleMaquinaChange value:", value);
      if (value && selCliId) {
         fetchFilteredData('selVFio', selCliId, value).then(data => {
            setSelVFio(data.map((vfio: fetchedDataObject) => ({ 
               value: vfio.value, 
               label: vfio.label 
            })));
            setSelTensao([]);
            setShowVFio(true);
            setShowTensao(false);

            // Filtering logic

         });
      } else { setShowVFio(false); }
   };

   const handleVFioChange = (value: string | null) => {     
      setSelectedVFio(value);
      console.log("handleVFioChange selCliId:", selCliId);
      console.log("handleVFioChange selectedMaquina:", selectedMaquina);
      console.log("handleVFioChange value:", value); 

      if (value && selCliId && selectedMaquina) {
         fetchFilteredData('selTensao', selCliId, selectedMaquina, value).then(data => {
            setSelTensao(data.map((selten:fetchedDataObject) => ({ 
               value: selten.value, 
               label: selten.label })));
            setShowTensao(true); 
         });   

         // Filtering logic


      } else { setShowTensao(false); }
   };

   // handleTensaoChange
   const handleTensaoChange = (value: string | null) => {     
      setSelectedTensao(value);
      console.log("handleTensaoChange value:", value); 
      console.log("handleTensaoChange selCliId:", selCliId);
      console.log("handleTensaoChange selectedMaquina:", selectedMaquina);
      console.log("handleTensaoChange selectedVFio:", selectedVFio);

      // Filtering logic
   };

   const handleExportSelected = async () => {
      console.log("Exporting process started");      
      try {
         console.log("Trying to export...");     
         console.log(tableData);

         // Collect selected data
         if (!tableData?.maquinas) throw new Error("Table data is not loaded"); 
         const selectedData = tableData.maquinas.flatMap(machine => {
            // Filter leituras based on whether they are selected
            const filteredLeituras = machine.leituras.filter(leitura => 
               selectedItems[`${machine.n_serie}-${leitura.data_leitura}`]
            );

            // Return the machine object with only the selected leituras if there are any
            if (filteredLeituras.length > 0) { return [{ ...machine, leituras: filteredLeituras }]; } 
            else { return []; } // Return an empty array if no leituras are selected
         });
         console.log("selectedItems:", selectedItems);
         if (!selectedData || selectedData.length === 0) throw new Error("No data selected");
         console.log("Selected Data:",selectedData);

         await save({ filters: [{ name: 'Excel', extensions: ['xlsx'] }], defaultPath: '~/untitled.xlsx' })
         .then(savePath => {
            console.log("Save path received:", savePath);
            if (!savePath) throw new Error("User cancelled the save operation");
            return invoke('create_excel_file', { data: selectedData, path: savePath });
         })
         .then(() => console.log("Data successfully sent to the backend"))
         .catch(err => console.error("Caught an error:", err));
      } 
      catch (error) { console.error("An error occurred in the export process:", error); }
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
         //setIsLoading(true);
         try {
            const data = await fetchFullClientData(selCliId);
            if (data) {
               console.log("Client selected. fetching data:")
               console.log(data);
               setTableData(data);
            } else { throw new Error("Received no data"); }
         } catch (error) {
            console.error('Failed to fetch full client data:', error);
            setTableData(null);
         } //finally { setIsLoading(false); }
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
                  onChange={handleTensaoChange}
                  searchable
                  allowDeselect
                  />
               )}
            </Group>

            <Button maw={200} ml={"xs"} onClick={handleExportSelected}>Exportar selecionados</Button>

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
                              checked={allChecked}
                              indeterminate={someChecked}
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