/* |---------| */
/* | IMPORTS | */
/* |---------| */

// React
import React, { useState } from 'react';
// Mantine
import { 
   AppShell, 
   Button, 
   Title
} from '@mantine/core'
import MeasurementForm from './components/MeasurementForm';
import DataTable from './components/DataTable';

/* |------------| */
/* | COMPONENTE | */
/* |------------| */

const App: React.FC = () => {
   const [displayForm, setDisplayForm] = useState(false);







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
               <Button onClick={() => setDisplayForm(false)} disabled={!displayForm} variant={displayForm ? 'filled' : 'outline'}>Consultar</Button>
               <Button onClick={() => setDisplayForm(true)} disabled={displayForm} variant={!displayForm ? 'filled' : 'outline'} mt={"sm"}>Nova Medição</Button>
            </AppShell.Navbar>

            <AppShell.Main>
               {displayForm ? <MeasurementForm /> : <DataTable />}
            </AppShell.Main>
         </AppShell>
      </>
   );
};

export default App;