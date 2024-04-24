import { invoke } from '@tauri-apps/api/tauri';

const fetchFullClientData = async (clientId) => {
   try {
      const data = await invoke('full_cliente_data', { clientId: clientId });
      console.log('Full Client Data:', JSON.parse(data));
      return JSON.parse(data);
   } catch (error) {
      console.error('Error fetching full client data:', error);
      return null;
   }
};

export default fetchFullClientData;