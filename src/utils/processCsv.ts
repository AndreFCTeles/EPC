import { invoke } from '@tauri-apps/api/tauri';
import { showNotification } from '@mantine/notifications';
import { ClientMeasurement, SetFilesFunction } from './types';

// Extracts the file name without extension
const getFileNameWithoutExtension = (filePath: string): string => {
   const name = filePath.split(/[/\\]/).pop();
   return name ? name.split('.').slice(0, -1).join('.') : '';
};

// Utility function for processing CSV files
const processCsvFiles = async (
   filePaths: string[],
   setVoltFiles: SetFilesFunction,
   setAmpereFiles: SetFilesFunction
): Promise<void> => {
   for (const filePath of filePaths) {
      try {
         const response: ClientMeasurement[] = await invoke('parse_csv', { filePath });
         console.log("processing CSV File: ", response);
         if (response.length === 0) {
            throw new Error("No data in file");
         }

         const date = response[0].capture_date; // Use the first valid data row for the date
         //const units = response[0].units;
         const fileType = response[0]?.units.startsWith('V') ? 'volt' : 'ampere';
         const fileName = getFileNameWithoutExtension(filePath);
         const label = `${fileName} - ${date}`;

         console.log("---------------------------------------------------------------------------");
         console.log("parsing CSV File: ", fileName);
         const fileData = {
            label,
            checked: false,
            parsedData: response,
         };      

         if (fileType === 'volt') { setVoltFiles(prev => [...prev, fileData]); } 
         else if (fileType === 'ampere') { setAmpereFiles(prev => [...prev, fileData]); } 
         else { throw new Error("Unknown units or update function not provided"); }
         
         console.log("parsed file: ", fileName);
         console.log("---------------------------------------------------------------------------");
      } catch (error) {
            console.error('Error processing file:', error);
            showNotification({
               title: 'Error',
               message: `Failed to process file ${getFileNameWithoutExtension(filePath)}`,
               color: 'red',
            });
      }
   }
};

export default processCsvFiles;