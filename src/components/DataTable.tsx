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
   ScrollArea,
   Modal,
   Radio,
   Text,
   Image,
   Fieldset,
   Tooltip
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { IconDownload } from '@tabler/icons-react';
// Tauri
import { save, open } from '@tauri-apps/api/dialog';
import { invoke, convertFileSrc } from '@tauri-apps/api/tauri';
// Utils
import {JSONCliente, fetchedDataObject } from '../utils/types'
import fetchFilteredData from '../utils/fetchFilteredData';
import fetchFullClientData from '../utils/fetchAllData';
import { SelectedItems, SelectedStyle } from '../utils/types';
// Assets
import banner from "../assets/banner.png";
import Light1 from "../assets/Light1.jpg";
import Light6 from "../assets/Light6.jpg";
import Medium16 from "../assets/Medium16.jpg";






/* |-----------| */
/* | COMPONENT | */
/* |-----------| */

const DataTable: React.FC = () => {
   /* |--------| */
   /* | STATES | */
   /* |--------| */
   
   // Data states
   const [selCliId, setSelCliId] = useState<string | null>(null);
   const [selClientes, setSelClientes] = useState<Array<fetchedDataObject>>([]); // Select dropdown contents
   const [selMaquinas, setSelMaquinas] = useState<Array<fetchedDataObject>>([]); // Select dropdown contents
   const [selVFio, setSelVFio] = useState<Array<fetchedDataObject>>([]); // Select dropdown contents 
   const [selTensao, setSelTensao] = useState<Array<fetchedDataObject>>([]); // Select dropdown contents
   const [selCorrente, setSelCorrente] = useState<Array<fetchedDataObject>>([]); // Select dropdown contents
   // Filtering
   const [selectedMaquina, setSelectedMaquina] = useState<string | null>(null); // Selected dropdown value
   const [selectedVFio, setSelectedVFio] = useState<string | null>(null); // Selected dropdown value
   const [selectedTensao, setSelectedTensao] = useState<string | null>(null); // Selected dropdown value
   const [selectedCorrente, setSelectedCorrente] = useState<string | null>(null); // Selected dropdown value
   // Visibility states
   const [showMaquina, setShowMaquina] = useState(false);
   const [showVFio, setShowVFio] = useState(false);
   const [showTensao, setShowTensao] = useState(false);
   const [showCorrente, setShowCorrente] = useState(false);
   // Table data
   const [tableData, setTableData] = useState<JSONCliente | null>(null);
   const [filteredData, setFilteredData] = useState<JSONCliente | null>(null);
   const [filteredMaquina, setFilteredMaquina] = useState<JSONCliente | null>(null);
   const [filteredVFio, setFilteredVFio] = useState<JSONCliente | null>(null);
   // Checkboxes
   const [selectedItems, setSelectedItems] = useState<SelectedItems>({});
   const [renderedItems, setRenderedItems] = useState<SelectedItems>({});
   const [allChecked, setAllChecked] = useState(false);
   const [someChecked, setSomeChecked] = useState(false);
   // Export Modal
   const [opened, { open: openModal, close: closeModal }] = useDisclosure(false);
   const [selectedImage, setSelectedImage] = useState('');
   const [selectedStylePreview, setSelectedStylePreview] = useState('');
   const [selectedStyle, setSelectedStyle] = useState('Medium16');
   const [selectedImagePreview, setSelectedImagePreview] = useState('');
   // Mapping radio values to image URLs
   const imageMap: SelectedStyle = {
      Light1: Light1,
      Light6: Light6,
      Medium16: Medium16
   };





   /* |-------------------| */
   /* | UTILITY FUNCTIONS | */
   /* |-------------------| */

   // Update selectedItems when checkbox is toggled
   const toggleItemCheck = (id: string) => {
      setSelectedItems(prev => {
         const newSelectedItems = { ...prev, [id]: !prev[id] };
         return newSelectedItems;
      });
   };

   // Update all selectedItems when master checkbox is toggled
   const toggleAllItemsCheck = (checked: boolean) => {
      const newSelectedItems: SelectedItems = {};
      Object.keys(renderedItems).forEach(key => {
         newSelectedItems[key] = checked;
      });
      setSelectedItems(newSelectedItems);
   };

   // Render table rows
   const renderTableRows = () => {
      const dataToRender = filteredData || tableData;
      if (!dataToRender || !selCliId) {
         return <Table.Tr><Table.Td colSpan={10}>Selecione um cliente ou adicione dados para começar.</Table.Td></Table.Tr>;
      }

      return dataToRender.maquinas.flatMap((machine) =>
         machine.leituras.map((leitura) => {
            const voltageGroup = leitura.leitura.find(group => group.unidades === 'V');
            const ampereGroup = leitura.leitura.find(group => group.unidades === 'A');

            if (!voltageGroup || !ampereGroup) {                
               showNotification({
                  title: 'Erro',
                  message: 'Dados não encontrados.',
                  color: 'red',
               });
               return null; 
            }
            else {
               const id = `${machine.n_serie}-${leitura.data_leitura}`;
               return (
                  <Table.Tr key={id}>
                     <Table.Td>
                        <Checkbox
                           checked={!!selectedItems[id]}
                           onChange={() => toggleItemCheck(id)} />
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
   };





   /* |----------| */
   /* | HANDLERS | */
   /* |----------| */

   // Util to remove duplicate values for Select components
   const removeDuplicates = (array: fetchedDataObject[]): fetchedDataObject[] => {
      const uniqueValues = Array.from(new Set(array.map(item => item.value)));
      return uniqueValues.map(value => ({ 
         value, 
         label: array.find(item => item.value === value)!.label 
      }));
   };

   // Handlers for Select components
   const handleClienteChange = async (value: string | null) => {
      setSelCliId(value);
      setSelectedMaquina(null);
      setSelectedVFio(null);
      setSelectedTensao(null);
      setSelectedCorrente(null);
      setSelMaquinas([]);
      setSelVFio([]);
      setSelTensao([]);
      setSelCorrente([]);
      setShowMaquina(false);
      setShowVFio(false);
      setShowTensao(false);
      setShowCorrente(false);

      if (value) {
         const data = await fetchFilteredData('selMaquinas', value);
         setSelMaquinas(data.map((item: fetchedDataObject) => ({
            value: item.value,
            label: item.label
         })));
         setShowMaquina(true)

         // Fetch and set the initial table data for the selected cliente
         const initialTableData = await fetchFullClientData(value);
         setTableData(initialTableData);
         setFilteredData(initialTableData);
         setFilteredMaquina(initialTableData);
         setFilteredVFio(null);
      } else {
         setTableData(null);
         setFilteredData(null);
         setFilteredMaquina(null);
         setFilteredVFio(null);
      }
   };

   const handleMaquinaChange = async (value: string | null) => {
      setSelectedMaquina(value);
      setSelectedVFio(null);
      setSelectedTensao(null);
      setSelectedCorrente(null);
      setSelVFio([]);
      setSelTensao([]);
      setSelCorrente([]);
      setShowVFio(false);
      setShowTensao(false);
      setShowCorrente(false);

      console.log("Selected Maquina:", value);      
      if (value && tableData) {
         const filteredMaquinas = tableData.maquinas.filter(maquina => maquina.n_serie === value);
         const newFilteredData = { ...tableData, maquinas: filteredMaquinas };
         setFilteredMaquina(newFilteredData);
         setFilteredData(newFilteredData);
         setFilteredVFio(null);
         setShowVFio(true);

         const vfioData = removeDuplicates(filteredMaquinas.flatMap(maquina => 
               maquina.leituras.flatMap(leitura => 
                  leitura.leitura.map(group => ({
                     value: group.v_fio!,
                     label: group.v_fio!
                  }))
               )
         ).filter(group => group.value));
         setSelVFio(vfioData);
      } else {
         setFilteredData(tableData);
         setFilteredMaquina(null);
      }
   };

   const handleVFioChange = async (value: string | null) => {
      setSelectedVFio(value);
      setSelectedTensao(null);
      setSelectedCorrente(null);
      setSelTensao([]);
      setSelCorrente([]);
      setShowTensao(false);
      setShowCorrente(false);

      if (value && filteredMaquina) {
         const filteredMaquinas = filteredMaquina.maquinas.map(maquina => {
            if (maquina.n_serie === selectedMaquina) {
               return {
                  ...maquina,
                  leituras: maquina.leituras.filter(leitura => 
                     leitura.leitura.some(group => group.v_fio === value)
                  )
               };
            }
            return maquina;
         });
         const newFilteredData = { ...filteredMaquina, maquinas: filteredMaquinas };
         setFilteredVFio(newFilteredData);
         setFilteredData(newFilteredData);
         setShowTensao(true);
         setShowCorrente(true);

         const tensaoData = removeDuplicates(filteredMaquinas.flatMap(maquina => 
            maquina.leituras.flatMap(leitura => 
               leitura.leitura.filter(group => group.unidades === 'V').map(group => ({
                  value: group.tensao,
                  label: `${group.tensao} ${group.tensao==="-"?"":"V"}`
               }))
            )
         ));
         setSelTensao(tensaoData);

         const correnteData = removeDuplicates(filteredMaquinas.flatMap(maquina => 
            maquina.leituras.flatMap(leitura => 
               leitura.leitura.filter(group => group.unidades === 'A').map(group => ({
                  value: group.tensao,
                  label: `${group.tensao} ${group.tensao==="-"?"":"A"}`
               }))
            )
         ));
         setSelCorrente(correnteData);
      } else {
         setFilteredData(filteredMaquina);
      }
   };

   const handleTensaoChange = async (value: string | null) => {
      setSelectedTensao(value);

      if (value && filteredVFio) {
         const filteredMaquinas = filteredVFio.maquinas.map(maquina => {
            if (maquina.n_serie === selectedMaquina) {
               return {
                  ...maquina,
                  leituras: maquina.leituras.filter(leitura => 
                     leitura.leitura.some(group => group.tensao === value && group.unidades === 'V')
                  )
               };
            }
            return maquina;
         });
         const newFilteredData = { ...filteredVFio, maquinas: filteredMaquinas };
         setFilteredData(newFilteredData);

         const correnteData = removeDuplicates(filteredMaquinas.flatMap(maquina => 
            maquina.leituras.flatMap(leitura => 
               leitura.leitura.filter(group => group.unidades === 'A').map(group => ({
                  value: group.tensao,
                  label: `${group.tensao} ${group.tensao==="-"?"":"A"}`
               }))
            )
         ));
         setSelCorrente(correnteData);
      } else {
         setFilteredData(filteredVFio);
      }
   };

   const handleCorrenteChange = async (value: string | null) => {
      setSelectedCorrente(value);

      if (value && filteredVFio) {
         const filteredMaquinas = filteredVFio.maquinas.map(maquina => {
            if (maquina.n_serie === selectedMaquina) {
               return {
                  ...maquina,
                  leituras: maquina.leituras.filter(leitura => 
                     leitura.leitura.some(group => group.tensao === value && group.unidades === 'A')
                  )
               };
            }
            return maquina;
         });
         const newFilteredData = { ...filteredVFio, maquinas: filteredMaquinas };
         setFilteredData(newFilteredData);

         const tensaoData = removeDuplicates(filteredMaquinas.flatMap(maquina => 
            maquina.leituras.flatMap(leitura => 
               leitura.leitura.filter(group => group.unidades === 'V').map(group => ({
                  value: group.tensao,
                  label: `${group.tensao} ${group.tensao==="-"?"":"V"}`
               }))
            )
         ));
         setSelTensao(tensaoData);
      } else {
         setFilteredData(filteredVFio);
      }
   };




   const handleExport = async (selectedImage: string, selectedStyle: string) => {
      setSelectedImage(selectedImage);
      setSelectedStyle(selectedStyle);
      await handleExportSelected(selectedImage, selectedStyle);
   };


   const handleExportSelected = async (imagePath: string, tableStyle: string) => {
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
            else { 
               showNotification({
                  title: 'Erro',
                  message: 'Erro ao selecionar ficheiros.',
                  color: 'red',
               });
               return []; 
            } // Return an empty array if no leituras are selected
         });
         console.log("selectedItems:", selectedItems);
         if (!selectedData || selectedData.length === 0) throw new Error("No data selected");
         console.log("Selected Data:",selectedData);

         await save({ filters: [{ name: 'Excel', extensions: ['xlsx'] }], defaultPath: '~/Sem título.xlsx' })
         .then(savePath => {
            console.log("Save path received:", savePath);
            if (!savePath) throw new Error("User cancelled the save operation");
            return invoke('create_excel_file', { data: selectedData, path: savePath, imagePath, tableStyle });
         })
         .then(() => console.log("Data successfully sent to the backend"))
         .catch(err => console.error("Caught an error:", err));
      } 
      catch (error) { console.error("An error occurred in the export process:", error); }
   };





   /* |---------| */
   /* | EFFECTS | */
   /* |---------| */
   
   // Table Data initial fetch
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

   // Cliente selection data fetch and filter
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

   // Table style previews
   useEffect(() => {
      if (imageMap[selectedStyle]) {setSelectedStylePreview(imageMap[selectedStyle]);}
   }, [selectedStyle]);

   // Checkbox behaviour  
   useEffect(() => { // useEffect to update rendered items
      const newRenderedItems: SelectedItems = {};
      tableData?.maquinas.forEach(machine => {
         machine.leituras.forEach(leitura => {
            const id = `${machine.n_serie}-${leitura.data_leitura}`;
            newRenderedItems[id] = selectedItems[id] || false;
         });
      });
      setRenderedItems(newRenderedItems);
   }, [tableData, selectedItems]);    
   useEffect(() => {
      const values = Object.values(renderedItems);
      setAllChecked(values.length > 0 && values.every(Boolean));
      setSomeChecked(values.some(value => value) && !values.every(Boolean));
   }, [renderedItems]);
   useEffect(() => { setSelectedItems({}); }, [selCliId, selectedMaquina, selectedVFio]);
   useEffect(() => { return () => setSelectedItems({}); }, []);   



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
                  value={selectedMaquina}
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
                  value={selectedVFio}
                  data={selVFio}
                  onChange={handleVFioChange}
                  searchable
                  allowDeselect
                  />
               )}
               {showTensao && (
                  <Select 
                  label="Tensão"
                  placeholder='0 V'
                  className='ConSel'
                  value={selectedTensao}
                  data={selTensao}
                  onChange={handleTensaoChange}
                  searchable
                  allowDeselect
                  />
               )}
               {showCorrente && (
                  <Select 
                  label="Corrente"
                  placeholder='0 A'
                  className='ConSel'
                  value={selectedCorrente}
                  data={selCorrente}
                  onChange={handleCorrenteChange}
                  searchable
                  allowDeselect
                  />
               )}
            </Group>

            
            <Tooltip 
            label="Selecione leituras para continuar"
            openDelay={500}
            transitionProps={{ transition: 'slide-up', duration: 300 }}
            events={{ hover:(!someChecked && !allChecked), focus:false, touch:false }}>
               <Button 
               maw={200} 
               ml={"xs"} 
               onClick={openModal} 
               disabled={!someChecked && !allChecked}
               rightSection={<IconDownload size={14} />}
               >Exportar selecionados</Button>               
            </Tooltip>

            <ScrollArea offsetScrollbars >
               <Table 
               w={"auto"} 
               miw={"100%"}  
               ta="center"
               striped 
               highlightOnHover 
               withTableBorder 
               withColumnBorders 
               className='dataTable'
               >
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

         <Modal 
         opened={opened} 
         onClose={closeModal} 
         size={'xl'} 
         overlayProps={{
            backgroundOpacity: 0.1,
            blur: 1,
         }}
         title="Opções de exportação:">
            <Stack>
               <Fieldset mt={"sm"} legend="Imagem de cabeçalho" w={"100%"}>
                  <Group mt={"xs"}>
                     <Button 
                     onClick={ async () => {
                        const imagePath = await open({
                           multiple: false,
                           filters: [{ name: 'Image', extensions: ['png', 'jpeg', 'jpg', 'bmp'] }]
                        });
                        console.log(imagePath);
                        if (imagePath) { 
                           const assetUrl = convertFileSrc(imagePath as string);
                           setSelectedImage(imagePath as string); 
                           setSelectedImagePreview(assetUrl);
                        }
                     }}>Selecionar Imagem</Button>
                     <Text size='sm'>{selectedImage ? `Imagem selecionada: ${selectedImage}` : 'Nenhuma imagem selecionada (a usar imagem por defeito)'}</Text>
                  </Group>
                  <Text mt={"md"}>Imagem atual:</Text>
                  <Box p={"xs"}>
                     <Image 
                     fit='contain' 
                     h={"auto"}
                     w={"70%"} 
                     mx={"auto"} 
                     className='imagePreview'
                     src={selectedImage ? selectedImagePreview : banner} />
                  </Box>
               </Fieldset>

               <Fieldset legend="Estilos de tabela:" w={"100%"}>
                  <Group mx={"auto"} w={"100%"}>
                     <Radio.Group
                     label="Selecionar estilo"
                     value={selectedStyle}
                     onChange={setSelectedStyle} ml={"auto"}>
                        <Stack gap={5}>
                           <Radio value="Medium16" label="Intermédio 16" />
                           <Radio value="Light1" label="Claro 1" />
                           <Radio value="Light6" label="Claro 2" />
                        </Stack>
                     </Radio.Group>
                     <Image src={selectedStylePreview} mx={"auto"} />
                  </Group>
               </Fieldset>
            </Stack>

            <Group mt={"md"}>
               <Button onClick={() => handleExport(selectedImage, selectedStyle)}>Exportar</Button>
               <Button onClick={closeModal} color="red">Cancelar</Button> 
            </Group>
         </Modal>
      </Box>
   )
}

export default DataTable