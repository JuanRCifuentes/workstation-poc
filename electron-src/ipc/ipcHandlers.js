// ipc/ipcHandlers.js
const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

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

module.exports = { setupIpcHandlers };