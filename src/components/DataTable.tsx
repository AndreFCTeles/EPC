import React, { useState, useEffect } from 'react';
import fetchData from '../utils/fetchdata';
import { 
   Box,
   Group, 
   Stack, 
   Table, 
   Checkbox, 
   Combobox, 
   InputBase, 
   useCombobox,
   Select
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';

const DataTable: React.FC = () => {
   const [selClientes, setSelClientes] = useState<Array<{value: string, label: string}>>([]);
   const [selMaquinas, setSelMaquinas] = useState<Array<{value: string, label: string}>>([]);
   const [selNSerie, setSelNSerie] = useState<Array<{value: string, label: string}>>([]);
   const [selVFio, setSelVFio] = useState<Array<{value: string, label: string}>>([]);
   const [selTensao, setSelTensao] = useState<Array<{value: string, label: string}>>([]);

   const [showMaquina, setShowMaquina] = useState(false);
   const [showVFio, setShowVFio] = useState(false);
   const [showTensao, setShowTensao] = useState(false);
   
   // Combobox states
   const [searchCliente, setSearchCliente] = useState('');
   const [searchMaquina, setSearchMaquina] = useState('');
   const [searchNSerie, setSearchNSerie] = useState('');
   const [searchVFio, setSearchVFio] = useState('');
   const [searchTensao, setSearchTensao] = useState('');

   // Combobox setup
   const comboboxCliente = useCombobox({
      onDropdownClose: () => {
         if (!selClientes.some(c => c.label === searchCliente)) { setSearchCliente(''); }
         comboboxCliente.resetSelectedOption();
      },
   });
   const comboboxMaquina = useCombobox({
      onDropdownClose: () => {
         if (!selMaquinas.some(c => c.label === searchMaquina)) { setSearchMaquina(''); }
         comboboxMaquina.resetSelectedOption();
      },
   });

   useEffect(() => {
      // Fetch clientes
      fetchData('selClientes').then((data: string[]) => {
         const formattedData = data.map(slecli => ({
            value: slecli,
            label: slecli
         }));
         setSelClientes(formattedData);
      });

      // Fetch maquinas
      fetchData('selMaquinas').then((data: string[]) => {
         const formattedData = data.map(selmaq => ({
            value: selmaq,
            label: selmaq
         }));
         setSelMaquinas(formattedData);
      });

      // Fetch series -- assuming you have a similar setup for series
      fetchData('selNSerie').then((data: string[]) => {
         const formattedData = data.map(selns => ({
            value: selns,
            label: selns
         }));
         setSelNSerie(formattedData);
      });

      // Fetch series -- assuming you have a similar setup for series
      fetchData('selVFio').then((data: string[]) => {
         const formattedData = data.map(selns => ({
            value: selns,
            label: selns
         }));
         setSelVFio(formattedData);
      });

      // Fetch series -- assuming you have a similar setup for series
      fetchData('selTensao').then((data: string[]) => {
         const formattedData = data.map(selns => ({
            value: selns,
            label: selns
         }));
         setSelTensao(formattedData);
      });
   }, []);   
   
   return (
      <Box m={0} p={0}>
         <Stack>
               <Group px={"xs"} gap={"xs"} grow>
                  <Select 
                  label="Cliente"
                  searchable
                  />
                  <Select 
                  label="Maquina"
                  searchable
                  />
                  <Select 
                  label="V. Fio"
                  searchable
                  />
                  <Select 
                  label="Tensão"
                  searchable
                  />
               </Group>
               <Table highlightOnHover withTableBorder>
                  <Table.Thead>
                     <Table.Tr>
                        <Table.Th>
                           <Checkbox
                           label="Todos"
                           aria-label="Selecionar todas as verificações"
                           />
                        </Table.Th>
                        <Table.Th>Ficheiros</Table.Th>
                     </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                  </Table.Tbody>
               </Table>   

         </Stack>     
      </Box>
   )
}

export default DataTable