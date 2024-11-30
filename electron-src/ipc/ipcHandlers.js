// ipc/ipcHandlers.js
const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { exec } = require('child_process');
const imagemagick = require('imagemagick');



function setupIpcHandlers() {
  ipcMain.on("message", (event) => event.reply("reply6437821", "pong"));

  ipcMain.on("get-files", (event, dirPath) => {
    console.log("get-files", dirPath);
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        event.reply("get-files-reply", { error: err.message });
      } else {
        convertTifToPng(dirPath, files);
        const pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.png');
        const filePaths = pngFiles.map(file => path.join(dirPath, file));
        event.reply("get-files-reply", { files: filePaths });
      }
    });
  });
}

function convertTifToPng(dirPath, files) {
    const cacheDir = path.join(dirPath, 'cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    const tifFiles = files.filter(file => path.extname(file).toLowerCase() === '.tif');
    tifFiles.forEach(async tifFile => {
        const inputFilePath = path.join(dirPath, tifFile);
        const image = sharp(inputFilePath);
        const metadata = await image.metadata();
        const pages = metadata.pages || 1;

        for (let i = 0; i < pages; i++) {
            const filename = `${path.basename(tifFile, '.tif')}_page${i + 1}.png`;
            const outputFilePath = path.join(cacheDir, filename);
            await sharp(inputFilePath, { page: i })
                .png()
                .toFile(outputFilePath);
            console.log(`Converted ${tifFile} page ${i + 1} to ${outputFilePath}`);
        }
    });
}


ipcMain.on("deskew-image", (event, filePath) => {
  const baseFolder = path.join(__dirname, '../../..' ); // Or any fixed folder path
  const documentsDir = path.join(baseFolder, 'DOCUMENTS'); // Always point back to the DOCUMENTS directory

  const cacheDir = path.join(documentsDir, 'cache');
  const deskewDir = path.join(cacheDir, 'deskew-images');

  // Ensure the 'deskew-images' folder exists
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }
  if (!fs.existsSync(deskewDir)) {
    fs.mkdirSync(deskewDir);
  }

  // Generate a unique output file name with timestamp for versioning
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Replace forbidden characters in file names
  const outputFilePath = path.join(
    deskewDir,
    `${path.basename(filePath, path.extname(filePath))}_deskewed_${timestamp}.png`
  );

  // Deskew the image and save it to 'deskew-images'
  const command = `magick "${filePath}" -deskew 40% "${outputFilePath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Deskew failed:", stderr || error.message);
      event.reply("deskew-image-reply", { error: stderr || error.message });
    } else {
      console.log("Deskew successful:", outputFilePath);

      // Reply with the path of the latest deskewed image
      event.reply("deskew-image-reply", { filePath: outputFilePath });
    }
  });
});

ipcMain.on('save-canvas', (event, dataURL) => {
  // Decode the base64 Data URL
  const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');

  // Define the save location
  const baseFolder = path.join(__dirname, '../../..'); // Or any fixed folder path
  const documentsDir = path.join(baseFolder, 'DOCUMENTS'); // Always point back to the DOCUMENTS directory
  const cacheDir = path.join(documentsDir, 'cache');
  console.log(cacheDir);

  const savePath = path.join(cacheDir, 'output', `canvas_${Date.now()}.png`);

  // Ensure the output directory exists
  const outputDir = path.dirname(savePath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the decoded image data to a PNG file
  fs.writeFile(savePath, base64Data, 'base64', (err) => {
    if (err) {
      console.error('Error saving canvas image:', err);
      event.reply('save-canvas-reply', { error: err.message });
    } else {
      console.log('Canvas image saved successfully:', savePath);
      event.reply('save-canvas-reply', { filePath: savePath });
    }
  });
});

module.exports = { setupIpcHandlers };
