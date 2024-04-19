import { invoke } from '@tauri-apps/api/tauri';

async function fetchFilteredData(dataType, clientId, machineId) {
   try {
      const params = { dataType, clientId, machineId };
      const data = await invoke('filtered_data_fetcher', params);
      return JSON.parse(data);
   } catch (error) {
      console.error(`Failed to fetch ${dataType}:`, error);
      return null;
   }
}

export default fetchFilteredData;