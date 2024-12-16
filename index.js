import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors'
import exec from "child_process"

const app = express();
const PORT = 5000;

// Middleware to parse JSON
app.use(express.json());
app.use(cors())


// Route to download a specific file
app.get('/api/download', (req, res) => {
    try {
      const filePath = decodeURIComponent(req.query.path);
  
      // Check if the path is a directory
      if (fs.lstatSync(filePath).isDirectory()) {
        return res.status(400).json({ error: 'The requested path is a directory, not a file.' });
      }
  
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }
  
      // Stream the file
      res.download(filePath, (err) => {
        if (err) {
          console.error('Error during file download:', err);
          res.status(500).json({ error: 'Failed to download file' });
        }
      });
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
// Route to list files in a local directory
app.get('/api/files', (req, res) => {
    try {
       const folderPath = path.resolve(req.query.path || '.'); // Default to current directory
   
       // Check if the folder exists
       if (!fs.existsSync(folderPath)) {
         return res.status(404).json({ error: 'Folder not found' });
       }
     
       // Read the directory
       fs.readdir(folderPath, (err, files) => {
         if (err) {
           console.error(err);
           return res.status(500).json({ error: 'Failed to read directory' });
         }
     
         // Send the list of files
         res.json({ files });
       });
    } catch (error) {
       res.status(500).json({error})
       console.log(error);
    }
   });

   app.post('/api/open', (req, res) => {
    try {
      const filePath = decodeURIComponent(req.body.path);
  
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }
  
      // Use 'exec' to open the file
      exec(`xdg-open "${filePath}"`, (err) => {
        if (err) {
          console.error('Error opening file:', err);
          return res.status(500).json({ error: 'Failed to open file' });
        }
  
        res.status(200).json({ message: 'File opened successfully!' });
      });
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
