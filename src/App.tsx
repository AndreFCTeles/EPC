/* |---------| */
/* | IMPORTS | */
/* |---------| */

// React
import React, { useState, useEffect } from 'react';
// Mantine
import { 
   AppShell, 
   Button, 
   //Title,
   Flex,
   Box,
   Switch,
   useMantineTheme,
   useMantineColorScheme,
   useComputedColorScheme
} from '@mantine/core';
// Tabler icons
import { IconSun, IconMoonStars } from '@tabler/icons-react';
// Tauri
import { listen } from '@tauri-apps/api/event';
// Components
import MeasurementForm from './components/MeasurementForm';
import DataTable from './components/DataTable';

/* |-----------| */
/* | COMPONENT | */
/* |-----------| */

const App: React.FC = () => {
   // States
   const [files, setFiles] = useState<string[]>([]);
   const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
   const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
   const {setColorScheme} = useMantineColorScheme()
   const userColorScheme = useComputedColorScheme();
   const [isDarkMode, setIsDarkMode] = useState<boolean>(userColorScheme === 'dark');
   const theme = useMantineTheme();   

   // Component declarations
   const sunIcon = (
      <IconSun
      className='dmIcon'
      stroke={2.5}
      color={theme.colors.yellow[4]} />
   );
   const moonIcon = (
      <IconMoonStars
      className='dmIcon'
      stroke={2.5}
      color={theme.colors.blue[6]} />
   );
   const appShellHeader = { height:0 }; // anteriormente 60
   const appShellNavbar = { width: {sm: 200, md: 200, lg: 200}, breakpoint: 'sm' }

   
   /* |-------| */
   /* | LOGIC | */
   /* |-------| */

   
   const handleColorSchemeToggle = () => {
      setColorScheme(userColorScheme === "dark" ? "light" : "dark" );      
      setIsDarkMode(!isDarkMode);
   };
   

   const handleFormSubmit = () => {
      setFormSubmitted(true); // Set form as submitted
   };

   // Detect drag and drop to change component
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

    // Update the switch state when the application loads
   useEffect(() => {
      setIsDarkMode(userColorScheme === 'dark');
   }, [userColorScheme]);


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



   

   /* |-----| */
   /* | JSX | */
   /* |-----| */

   return (
      <>
         <AppShell
         header={appShellHeader}
         navbar={appShellNavbar}
         >

            {/*<AppShell.Header p={"xs"}><Title order={2} ml={0}>Param Companion</Title></AppShell.Header>*/}

            <AppShell.Navbar p={"sm"}>
               
               <Flex direction="column" justify="space-between" w={"100%"} h={"100%"}>
                  <Box w={"100%"}>
                     <Button 
                     onClick={() => setIsFormVisible(true)} 
                     disabled={isFormVisible} 
                     variant={!isFormVisible ? 'filled' : 'outline'} 
                     w={"100%"}
                     >Nova Medição</Button>
                     <Button 
                     onClick={() => setIsFormVisible(false)} 
                     mt={"sm"}
                     disabled={!isFormVisible} 
                     variant={isFormVisible ? 'filled' : 'outline'} 
                     w={"100%"} 
                     >Consultar</Button>
                  </Box>
                  <Flex w={"100%"} px={"auto"}>
                     <Switch 
                     checked={isDarkMode}
                     onChange={handleColorSchemeToggle} 
                     onLabel={sunIcon} 
                     offLabel={moonIcon}
                     color="dark.4"
                     mx={"auto"}
                     labelPosition='left'
                     label="Modo Escuro" />
                  </Flex>
               </Flex>
            </AppShell.Navbar>

            <AppShell.Main>
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