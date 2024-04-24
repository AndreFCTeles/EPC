import { invoke } from '@tauri-apps/api/tauri';

async function fetchData(dataType) {
   try {
      const data = await invoke('get_data', { dataType: dataType });
      return JSON.parse(data); // Assuming the data returned is a JSON string
   } catch (error) {
      console.error(`Failed to fetch ${dataType}:`, error);
      return null; // Or handle the error as appropriate
   }
}

export default fetchData;