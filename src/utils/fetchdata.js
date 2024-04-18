import { invoke } from '@tauri-apps/api/tauri';

async function fetchData(dataType) {
   try {
      console.log(dataType);
      const data = await invoke('data_fetcher', { dataType: dataType });
      console.log(JSON.parse(data));
      return JSON.parse(data); // Assuming the data returned is a JSON string
   } catch (error) {
      console.error(`Failed to fetch ${dataType}:`, error);
      return null; // Or handle the error as appropriate
   }
}

export default fetchData;