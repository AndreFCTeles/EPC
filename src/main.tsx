// Dependências
import ReactDOM from "react-dom/client";
import { MantineProvider } from '@mantine/core';
import { Notifications } from "@mantine/notifications";

// Componente principal
import App from "./App";

// Estilos
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import './styles/App.css'
import './styles/styles.css';

// Inicialização de temas
const theme = {
   breakpoints: {sm: '300px' },
   navbar: {breakpoint: null}
}

// Renderizar aplicação
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
   <MantineProvider theme={theme}>
      <Notifications />
      <App />
   </MantineProvider>,
);
