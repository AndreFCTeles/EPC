import { invoke } from '@tauri-apps/api/tauri';

// Define the function with TypeScript type annotations
async function fetchFilteredData(
   dataType: string,
   clientId?: string,
   maquinaId?: string,
   selVFio?: string
): Promise<any | null> {
   try {
      // Prepare the parameters for the Tauri invoke function
      const params = {
         dataType,
         clientId:clientId,
         maquinaId:maquinaId,
         selVFio:selVFio
      };
      
      // Logging the parameters to be sent to the Rust backend
      console.log(" ");
      console.log("---------------------------------------------------------------------------------");
      console.log("fetchFilteredData received params: ");
      console.log("dataType:",dataType," clientId", clientId, "maquinaId:", maquinaId, "vFio:", selVFio);
      console.log("Sending parameters:", params);

      // Calling the Tauri invoke function with the command name and parameters
      const data = JSON.parse(await invoke('filtered_data_fetcher', params));
      console.log("---------------------------------------------------------------------------------");
      console.log(" ");

      // Parsing the returned JSON data
      return data;
   } catch (error) {
      // Logging error in case the fetch operation fails
      console.error(`Failed to fetch ${dataType}:`, error);
      console.log("---------------------------------------------------------------------------------");
      console.log(" ");
      return null;
   }
}

// Exporting the function as default
export default fetchFilteredData;
