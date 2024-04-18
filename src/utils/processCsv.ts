import { invoke } from '@tauri-apps/api/tauri';
import { showNotification } from '@mantine/notifications';
import { ClientMeasurement, FileWithContentAndCheck } from './types';

// Extracts the file name without extension
const getFileNameWithoutExtension = (filePath: string): string => {
   const name = filePath.split(/[/\\]/).pop();
   return name ? name.split('.').slice(0, -1).join('.') : '';
};

// Utility function for processing CSV files
const processCsvFiles = async (
   filePaths: string[],
   setFiles: React.Dispatch<React.SetStateAction<FileWithContentAndCheck[]>>
): Promise<void> => {
   for (const filePath of filePaths) {
      try {
            const response: ClientMeasurement[] = await invoke('parse_csv', { filePath });
            console.log("processing CSV File: ", response);
            const date = response[0].capture_date; // Use the first valid data row for the date
            const fileName = getFileNameWithoutExtension(filePath);
            const label = `${fileName} - ${date}`;

            setFiles(currentFiles => [...currentFiles, {
               label,
               checked: false,
               parsedData: response, // This is now an array of ClientMeasurement excluding the first header row
            }]);
      } catch (error) {
            console.error('Error processing file:', error);
            // Assuming showNotification is a utility function to display errors to the user
            showNotification({
               title: 'Error',
               message: `Failed to process file ${getFileNameWithoutExtension(filePath)}`,
               color: 'red',
            });
      }
   }
};

export default processCsvFiles;