/* |---------| */
/* | IMPORTS | */
/* |---------| */

// React
import React, { useState, useEffect } from 'react';
// Mantine
import { useDisclosure } from '@mantine/hooks';
import { 
   AppShell, 
   Button, 
   Title,
   Drawer,
   Flex,
   Box,
   Text
} from '@mantine/core';
// Tauri
import { listen } from '@tauri-apps/api/event';
// Componentes
import MeasurementForm from './components/MeasurementForm';
import DataTable from './components/DataTable';

/* |------------| */
/* | COMPONENTE | */
/* |------------| */

const App: React.FC = () => {
   // States
   const [opened, { open, close }] = useDisclosure(false);
   const [files, setFiles] = useState<string[]>([]);
   const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
   const [formSubmitted, setFormSubmitted] = useState<boolean>(false);




   
   /* |--------| */
   /* | LÓGICA | */
   /* |--------| */

   // Detetar drag-drop para mudar componente
   useEffect(() => {
      // Set up a global listener for drag-and-drop events
      const unsubscribe = listen('tauri://file-drop', async (event) => {
         if (event.payload && Array.isArray(event.payload)) {
            setFiles(event.payload);
            setIsFormVisible(true);
            setFormSubmitted(false)
         }
      });

      // Clean up the event listener when the component unmounts
      return () => { unsubscribe.then(fn => fn()); };
   }, []);


   useEffect(() => {
      let timer:number;
      if (formSubmitted) {
         timer = setTimeout(() => {
            setFiles([]);
            setIsFormVisible(false);
            setFormSubmitted(false); // Reset form submission status
         }, 2000); // Wait 2 seconds before hiding form
      }
      return () => clearTimeout(timer);
   }, [formSubmitted]);

   const handleFormSubmit = () => {
      setFormSubmitted(true); // Set form as submitted
   };



   

   /* |-----| */
   /* | JSX | */
   /* |-----| */

   return (
      <>
         <AppShell
         header={{ height:60 }}
         navbar={{ width: {sm: 200, md: 200, lg: 200}, breakpoint: 'sm' }}
         >

            <AppShell.Header p={"xs"}>  
               <Title order={2} ml={0}>Param Companion</Title> 
            </AppShell.Header>

            <AppShell.Navbar p={"sm"}>
               
               <Flex direction="column" justify="space-between" w={"100%"} h={"100%"}>
                  <Box w={"100%"}>
                     <Button 
                     onClick={() => setIsFormVisible(false)} 
                     disabled={!isFormVisible} 
                     variant={isFormVisible ? 'filled' : 'outline'} 
                     w={"100%"} 
                     >Consultar</Button>
                     <Button 
                     onClick={() => setIsFormVisible(true)} 
                     disabled={isFormVisible} 
                     variant={!isFormVisible ? 'filled' : 'outline'} 
                     w={"100%"}
                     mt={"sm"}
                     >Nova Medição</Button>
                  </Box>
                  <Box w={"100%"}>
                     <Button 
                     onClick={open} 
                     mb={0}
                     w={"100%"}  
                     mt={"sm"}
                     >Definições</Button>
                  </Box>
               </Flex>
            </AppShell.Navbar>

            <AppShell.Main>
               <Drawer 
               opened={opened} 
               onClose={close} 
               title="Definições"
               position="right"
               size={"50%"}
               overlayProps={{ backgroundOpacity: 0.2, blur: 1 }}
               >
                  <Text>Em desenvolvimento</Text>
               {/* Drawer content */}
               </Drawer>
               {
                  isFormVisible 
                     ? ( <MeasurementForm initialFiles={files} onFormSubmit={handleFormSubmit} /> ) 
                     : ( <DataTable /> )
               }               
            </AppShell.Main>
         </AppShell>
      </>
   );
};

export default App;