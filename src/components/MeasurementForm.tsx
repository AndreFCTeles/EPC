/* |---------| */
/* | IMPORTS | */
/* |---------| */

// React
import React, { useState, useEffect } from 'react';
// Mantine
import { 
   Box, 
   Button, 
   Checkbox, 
   Fieldset, 
   Group, 
   Grid, 
   NumberInput, 
   Table,
   Combobox, 
   InputBase, 
   useCombobox
} from '@mantine/core'
import { DatesProvider, DateTimePicker } from '@mantine/dates';
import { showNotification } from '@mantine/notifications';
import { useForm } from '@mantine/form';
// Tauri
import { invoke } from '@tauri-apps/api/tauri';
//import { listen } from '@tauri-apps/api/event'; - moved to app.tsx
import { open } from '@tauri-apps/api/dialog';
// DayJS
import dayjs from 'dayjs';
import 'dayjs/locale/pt';
dayjs.locale('pt');
// Utils
import { FileWithContentAndCheck, SetFilesFunction } from '../utils/types';
import processCsvFiles from '../utils/processCsv';
import aggregateData from '../utils/aggregateData';
import fetchData from '../utils/fetchdata';





/* |------------| */
/* | INTERFACES | */
/* |------------| */

// Submitting
interface MeasureFormData {
   cliente: string;
   maquina: string;
   nSerie: string;
   tensaoA?: number | string;
   tensaoV?: number | string;
   vFio?: number | string;
   data?: Date | string;
}
// Fetching
interface fetchedDataObject {
   value: string;
   label: string;
}
// Drag-drop Files
interface MeasurementFormProps {
   initialFiles: string[];
   onFormSubmit: () => void;
}





/* |------------| */
/* | COMPONENTE | */
/* |------------| */

const MeasurementForm: React.FC<MeasurementFormProps> = ({initialFiles, onFormSubmit}) => {
   /* |---------| */
   /* | ESTADOS | */
   /* |---------| */
   
   // Date
   const dataAgora = new Date();
   const formatData = (d:Date) => dayjs(d).format("DD/MMMM/YYYY HH:mm");
   // Data states
   const [voltFiles, setVoltFiles] = useState<FileWithContentAndCheck[]>([]);
   const [ampereFiles, setAmpereFiles] = useState<FileWithContentAndCheck[]>([]);
   const [selClientes, setSelClientes] = useState<string[]>([]);
   const [selMaquinas, setSelMaquinas] = useState<string[]>([]);
   const [selNSerie, setSelNSerie] = useState<string[]>([]);
   // Interface states
   const exactlyFiveVoltsChecked = voltFiles.filter(file => file.checked).length === 5;
   const exactlyFiveAmperesChecked = ampereFiles.filter(file => file.checked).length === 5;
   const submitButtonEnabled = (exactlyFiveVoltsChecked && voltFiles.length > 0) || (exactlyFiveAmperesChecked && ampereFiles.length > 0);
   // Form states
   const form = useForm<MeasureFormData>({
      initialValues: {
         cliente: '',
         maquina: '',
         nSerie: '' ,
         tensaoA: 0,
         tensaoV: 0,
         vFio: 0,
         data: dataAgora
      },
      validate: {
         tensaoA: (value) => ampereFiles.length > 0 && !value ? 'Adicione valor de corrente' : null,
         tensaoV: (value) => voltFiles.length > 0 && !value ? 'Adicione valor de tensão' : null,
         vFio: (value) => voltFiles.length > 0 && !value ? 'Adicione uma velocidade de fio' : null,
      }
   });
   // Combobox states
   const [searchCliente, setSearchCliente] = useState('');
   const [searchMaquina, setSearchMaquina] = useState('');
   const [searchNSerie, setSearchNSerie] = useState('');
   // Combobox setup
   const comboboxCliente = useCombobox({
      onDropdownClose: () => {{
         // Ensure the input value is retained if it does not match any options
         const exactMatch = selClientes.find(c => c.toLowerCase() === searchCliente.toLowerCase());
         if (!exactMatch && searchCliente !== "") { form.setFieldValue('cliente', searchCliente); }
      }
   }});
   const comboboxMaquina = useCombobox({
      onDropdownClose: () => {
         const exactMatch = selMaquinas.find(m => m.toLowerCase() === searchMaquina.toLowerCase());
         if (!exactMatch && searchMaquina !== "") { form.setFieldValue('maquina', searchMaquina); }
      },
   });
   const comboboxNSerie = useCombobox({ 
      onDropdownClose: () => {
         const exactMatch = selNSerie.find(ns => ns.toLowerCase() === searchNSerie.toLowerCase());
         if (!exactMatch && searchNSerie !== "") { form.setFieldValue('nSerie', searchNSerie); }
      },
   });





   /* |-------------------| */
   /* | UTILITY FUNCTIONS | */
   /* |-------------------| */

   // Reset data
   const clearFiles = () => {
      setVoltFiles([]);
      setAmpereFiles([]);
      form.setValues({
         ...form.values,
         tensaoV: 0,    // Reset tensaoV
         tensaoA: 0,    // Reset tensaoA
         vFio: 0        // Reset vFio
      });
   };
   const clearVoltFiles = () => {
      setVoltFiles([]);
      form.setFieldValue('tensaoV', 0);
      form.setFieldValue('vFio', 0);
   };
   const clearAmpereFiles = () => {
      setAmpereFiles([]);
      form.setFieldValue('tensaoA', 0);
   };

   // Render Checkbox Table / list
   const renderVFilesSection = () => { return renderFilesSection(voltFiles, setVoltFiles); };
   const renderAFilesSection = () => { return renderFilesSection(ampereFiles, setAmpereFiles); };
   const renderFilesSection = (files: FileWithContentAndCheck[], setFilesFunction: SetFilesFunction) => {
      const allChecked = files.length > 0 && files.every(file => file.checked);
      const someChecked = files.some(file => file.checked);

      const toggleAllFilesCheck = (checked: boolean) => {
         const newFiles = files.map(file => ({ ...file, checked }));
         setFilesFunction(newFiles);
      };

      const toggleFileCheck = (index: number) => {
         const newFiles = files.map((file, i) => i === index ? { ...file, checked: !file.checked } : file );
         setFilesFunction(newFiles);
      };
      
      if (files.length > 0) { return (
         <Box mt={"md"}>
            <Table highlightOnHover withTableBorder>
               <Table.Thead>
                  <Table.Tr>
                     <Table.Th>
                        <Checkbox
                        aria-label={`Selecionar todos`}
                        checked={allChecked}
                        indeterminate={!allChecked && someChecked}
                        onChange={(event) => toggleAllFilesCheck(event.currentTarget.checked)}
                        />
                     </Table.Th>
                     <Table.Th>Ficheiros</Table.Th>
                  </Table.Tr>
               </Table.Thead>
               <Table.Tbody>
                  {files.map((file, index) => (
                     <Table.Tr key={index}>
                        <Table.Td>
                           <Checkbox
                           aria-label={`Select ${file.label}`}
                           checked={file.checked}
                           onChange={() => toggleFileCheck(index)}
                           />
                        </Table.Td>
                        <Table.Td>{file.label}</Table.Td>
                     </Table.Tr>
                  ))}
               </Table.Tbody>
            </Table>
         </Box>);
      } else return <Box />
   };





   /* |----------| */
   /* | HANDLERS | */
   /* |----------| */

   // Handler for form submission
   const handleSubmit = async (values: typeof form.values) => {
      console.log("Submitting data...");      
      console.log("Form values:", values);      

      // Verify valid file selections
      const selectedVoltFiles = voltFiles.filter(file => file.checked).map(file => ({ ...file, type: 'V' }));
      const selectedAmpereFiles = ampereFiles.filter(file => file.checked).map(file => ({ ...file, type: 'A' }));
      const validVoltCheck = selectedVoltFiles.length === 5;
      const validAmpereCheck = selectedAmpereFiles.length === 5;
      const selectedFiles = [...selectedVoltFiles, ...selectedAmpereFiles]; 
      console.log("Files being submitted:", selectedFiles);

      // Ensure we handle undefined safely
      const handleTensaoV = values.tensaoV?.toString() || "0";  // Default to "0" or another sensible default
      const handleTensaoA = values.tensaoA?.toString() || "0";  // Default to "0" or another sensible default
      
      if (!validVoltCheck && !validAmpereCheck) {
         console.error("Please select 5 files for at least one type of measurement to continue.");
         showNotification({
            title: 'Aviso',
            message: 'Por favor selecione cinco ficheiros de pelo menos um tipo de leitura para continuar.',
            color: 'red',
         });
         return;
      }

      // Prepare the data payload for backend processing
      const allSelectedFiles = [...selectedVoltFiles, ...selectedAmpereFiles];
      const submissionData = allSelectedFiles.map(file => ({
         nome_cliente: values.cliente,
         maquinas: [{
               n_serie: values.nSerie,
               maquina: values.maquina,
               leituras: file.parsedData.map(data => ({
                  data_leitura: values.data ? dayjs(values.data).format("DD/MM/YYYY HH:mm") : "",
                  tensao: file.type === 'V' ? handleTensaoV : handleTensaoA,
                  unidades: file.type,
                  v_fio: file.type === 'V' ? values.vFio?.toString() : undefined,  // Handle undefined explicitly
                  medicoes: [{
                     numero_ferramenta: data.model_number,
                     nome_ferramenta: data.tool_name,
                     data: data.capture_date,
                     valor: data.value,
                     unidades: data.units,
                  }]
               }))
         }]
      }));

      const aggregatedData = [aggregateData(submissionData)];

      // Submit the data
      try {
         console.log("Data being submitted:", aggregatedData);
         console.log("Data:", JSON.stringify({clientes: aggregatedData}));
         await invoke('process_and_save_data', { clientes: aggregatedData });
         console.log("Data successfully written to JSON file.");
         showNotification({
            title: 'Successo',
            message: 'Dados guardados com sucesso!',
            color: 'green',
            // onClose: return to DataTable.tsx component
         });
        form.reset();  // Reset form fields to initial values
        clearFiles();  // Clear file lists and associated data
        onFormSubmit();  // Additional actions post-submission
      } catch (error) {
         console.error("Failed to write data to JSON file:", error);
         showNotification({
            title: 'Erro',
            message: 'Erro ao guardar dados. Contacte o administrador ou tente outra vez.',
            color: 'red',
         });
      }
   };

   // Handle file input changes for dialog and drag-and-drop
   const handleFiles = async (filePaths: string[]) => {
      console.log("Handling files: ", filePaths);
      await processCsvFiles(filePaths, setVoltFiles, setAmpereFiles);
   };

   // Custom function to handle file selection through Tauri dialog
   const handleFileSelection = async () => {
      try {
         const selected = await open({
               multiple: true,
               filters: [{ name: 'CSV', extensions: ['csv'] }],
         });
         if (Array.isArray(selected)) { handleFiles(selected); } // Pass the fileType to handleFiles
         else if (selected === null) { console.log('File selection was cancelled.'); } 
         else { handleFiles([selected]); } // Handle a single file as an array         
      } catch (error) { 
         console.error('Error selecting files:', error);
         showNotification({
               title: 'Erro',
               message: 'Erro ao selecionar ficheiros.',
               color: 'red',
         });
      }
   };





   /* |---------| */
   /* | EFFECTS | */
   /* |---------| */
   
   // Effect for drag-drop
   useEffect(() => { handleFiles(initialFiles); }, [initialFiles]);

   // Effect for fetching
   useEffect(() => {
      // FILTRAR FETCHING MAQUINAS E NSERIE
      // Fetch clientes
      fetchData('selClientes').then((data) => { setSelClientes(data.map((slecli: fetchedDataObject) => slecli.label)); });
      // Fetch maquinas
      fetchData('selMaquinas').then((data) => { setSelMaquinas(data.map((selmaq: fetchedDataObject) => selmaq.label)); });
      // Fetch series -- assuming you have a similar setup for series
      fetchData('selNSerie').then((data: string[]) => { setSelNSerie(data.map((selns:string) => selns)); });
   }, []);




   /* |-----| */
   /* | JSX | */
   /* |-----| */

   return (
      <>
         <form onSubmit={form.onSubmit(handleSubmit)} style={{width: "100%", height: "100%", margin: "0 auto 0 auto", padding: "0 10% 5% 10%"}}>
            
            <Fieldset mt={"sm"}>
               <Grid align="flex-end" grow>
                  <Grid.Col span={{ base: 12, md: 6 }}>   
                     <Combobox
                     withinPortal={false}
                     store={comboboxCliente}
                     onOptionSubmit={(val) => {
                        form.setFieldValue('cliente', val);
                        setSearchCliente(val);
                        comboboxCliente.closeDropdown();
                     }}>
                        <Combobox.Target>
                           <InputBase
                           rightSection={<Combobox.Chevron />}
                           rightSectionPointerEvents="none"
                           mt="md"
                           label="Cliente"
                           placeholder="Escolher da lista ou criar novo"
                           required
                           value={searchCliente}
                           onClick={() => comboboxCliente.openDropdown()}
                           onFocus={() => comboboxCliente.openDropdown()}
                           onChange={(event) => {
                              setSearchCliente(event.currentTarget.value);
                              comboboxCliente.openDropdown();
                           }}
                           onBlur={() => {
                              const exactMatch = selClientes.find(c => c.toLowerCase() === searchCliente.toLowerCase());
                              if (exactMatch) { setSearchCliente(exactMatch); } 
                              else { form.setFieldValue('cliente', searchCliente); }
                              comboboxMaquina.closeDropdown();
                           }}
                           />
                        </Combobox.Target>
                        <Combobox.Dropdown>
                           <Combobox.Options>
                              {selClientes.length === 0 && (
                                 <Combobox.Option value="no-data" disabled>Não foram encontrados clientes. Criar novo?</Combobox.Option>
                              )}
                              {selClientes
                              .filter(item => item.toLowerCase().includes(searchCliente.toLowerCase()))
                              .map(item => ( <Combobox.Option value={item} key={item}>{item}</Combobox.Option> ))}
                           </Combobox.Options>
                        </Combobox.Dropdown>
                     </Combobox>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                     <DatesProvider settings={{ locale: 'pt', firstDayOfWeek: 0 }}>
                        <DateTimePicker
                        label="Data/Hora da medição"
                        valueFormat="DD/MM/YYYY - HH:mm"
                        placeholder={formatData(dataAgora)}
                        clearable
                        {...form.getInputProps('data')}
                        />
                     </DatesProvider>  
                  </Grid.Col>
               </Grid> 
               

               <Grid mt={{ base: 0, md: "sm" }} align="flex-end" grow>
                  <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>   
                     <Combobox
                     withinPortal={false}
                     store={comboboxMaquina}
                     onOptionSubmit={(val) => {
                        form.setFieldValue('maquina', val);
                        setSearchMaquina(val);
                        comboboxMaquina.closeDropdown();
                     }}>
                        <Combobox.Target>
                           <InputBase
                           rightSection={<Combobox.Chevron />}
                           rightSectionPointerEvents="none"
                           mt="sm"
                           label="Máquina"
                           placeholder="Escolher da lista ou criar novo"
                           required
                           value={searchMaquina}
                           onClick={() => comboboxMaquina.openDropdown()}
                           onFocus={() => comboboxMaquina.openDropdown()}
                           onChange={(event) => {
                              setSearchMaquina(event.currentTarget.value);
                              comboboxMaquina.openDropdown();
                           }}
                           onBlur={() => {
                              const exactMatch = selMaquinas.find(m => m.toLowerCase() === searchMaquina.toLowerCase());
                              if (exactMatch) { setSearchMaquina(exactMatch); } 
                              else { form.setFieldValue('maquina', searchMaquina); }
                              comboboxMaquina.closeDropdown();
                           }}
                           />
                        </Combobox.Target>
                        <Combobox.Dropdown>
                           <Combobox.Options>
                              {selNSerie.length === 0 && (
                                 <Combobox.Option value="no-data" disabled>Não foram encontradas máquinas. Criar nova?</Combobox.Option>
                              )}
                              {selMaquinas
                              .filter(item => item.toLowerCase().includes(searchMaquina.toLowerCase()))
                              .map(item => (
                                 <Combobox.Option value={item} key={item}>{item}</Combobox.Option>
                              ))}
                           </Combobox.Options>
                        </Combobox.Dropdown>
                     </Combobox>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                     <Combobox
                     withinPortal={false}
                     store={comboboxNSerie}
                     onOptionSubmit={(val) => {
                        form.setFieldValue('nSerie', val);
                        setSearchNSerie(val);
                        comboboxNSerie.closeDropdown();
                     }}>
                        <Combobox.Target>
                           <InputBase
                           rightSection={<Combobox.Chevron />}
                           rightSectionPointerEvents="none"
                           label="Número de série"
                           placeholder="Escolher da lista ou criar novo"
                           required
                           value={searchNSerie}
                           onClick={() => comboboxNSerie.openDropdown()}
                           onFocus={() => comboboxNSerie.openDropdown()}
                           onChange={(event) => {
                              comboboxNSerie.openDropdown();
                              setSearchNSerie(event.currentTarget.value);
                           }}
                           onBlur={() => {
                              const exactMatch = selNSerie.find(ns => ns.toLowerCase() === searchNSerie.toLowerCase());
                              if (exactMatch) { setSearchNSerie(exactMatch); } 
                              else { form.setFieldValue('nSerie', searchNSerie); }
                              comboboxNSerie.closeDropdown();
                           }}
                           />
                        </Combobox.Target>
                        <Combobox.Dropdown>
                           <Combobox.Options>
                              {selNSerie.length === 0 && (
                                 <Combobox.Option value="no-data" disabled>Não foram encontrados números de série em memória.</Combobox.Option>
                              )}
                              {selNSerie
                              .filter(item => item.toLowerCase().includes(searchNSerie.toLowerCase()))
                              .map(item => (<Combobox.Option value={item} key={item}>{item}</Combobox.Option>))}
                           </Combobox.Options>
                        </Combobox.Dropdown>
                     </Combobox>
                  </Grid.Col>
               </Grid>
               
               <Group justify="center" mt={"lg"}>
                  <Button onClick={() => handleFileSelection()}>Selecionar Leituras</Button>
                  <Button disabled={!voltFiles && !ampereFiles} onClick={clearFiles} color="red">Limpar listas</Button>
                  <Button disabled={!submitButtonEnabled} type='submit'>Submeter</Button>    
               </Group>
               
               
               {(voltFiles.length > 0 || ampereFiles.length > 0) && (
                  <Grid mt={"lg"}>
                     <Grid.Col span={6}>
                        {voltFiles.length > 0 && (
                           <Fieldset legend="Leituras Volt." m={0}>
                              <Button w={"100%"} onClick={clearVoltFiles} color="red">Limpar Lista</Button>                        
                              <Grid mt={"md"}>
                                 <Grid.Col span={{base: 12, md: 6}}>
                                    <NumberInput
                                    label="Leitura Volt."
                                    placeholder="0"
                                    min={0}
                                    defaultValue={0}
                                    allowNegative={false}
                                    suffix={" V"}
                                    {...form.getInputProps('tensaoV')}
                                    />
                                 </Grid.Col>
                                 <Grid.Col span={{base: 12, md: 6}}>
                                    <NumberInput
                                    label="V. de fio"
                                    placeholder="0"
                                    suffix=" M/m"
                                    min={0}
                                    defaultValue={0}
                                    allowNegative={false}
                                    allowDecimal={false}
                                    {...form.getInputProps('vFio')}
                                    /> 
                                 </Grid.Col>
                              </Grid>
                              {renderVFilesSection()}
                           </Fieldset>
                        )}
                     </Grid.Col>
                     <Grid.Col span={6}>
                        {ampereFiles.length > 0 && (
                           <Fieldset legend="Leituras Amp." m={0}>
                              <Button w={"100%"} onClick={clearAmpereFiles} color="red">Limpar Lista</Button>
                              <Grid mt={"md"}>
                                 <Grid.Col span={{base: 12, md: 6}}>
                                    <NumberInput
                                    label="Leitura Amp."
                                    placeholder="0"
                                    min={0}
                                    defaultValue={0}
                                    allowNegative={false}
                                    suffix={" A"}
                                    {...form.getInputProps('tensaoA')}
                                    required
                                    />
                                 </Grid.Col>                                 
                                 <Grid.Col span={{base: 12, md: 6}} h={0} m={0} p={0}></Grid.Col>
                              </Grid>
                              {renderAFilesSection()}
                           </Fieldset>
                        )}
                     </Grid.Col>
                  </Grid>
               )}
            </Fieldset>

         </form>
      </>
   );
};

export default MeasurementForm;