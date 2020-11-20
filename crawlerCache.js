import path from 'path';
import fs, { stat } from 'fs';
import { fileURLToPath } from 'url';
import moment from 'moment';
import filenamifyUrl from 'filenamify-url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const cacheDirectory = path.join(currentDirectory, '.crawlerCache');
const fileCacheDirectory = path.join(cacheDirectory, 'files');

export const reset = async (key, date) => {
    const fileName = getFileName(cacheDirectory, key, date);

    if (fs.existsSync(fileName)) {
        await fs.promises.unlink(fileName);
    }
}

export const getOrSave = async (key, date, action) => {
    const fileName = getFileName(cacheDirectory, key, date);
    
    createDirectoryIfNotExists(cacheDirectory);

    if (fs.existsSync(fileName)) {
        console.log(`Read from cache ${fileName} [${await getFileSize(fileName)} bytes]`);

        const cachedData = await fs.promises.readFile(fileName);

        return JSON.parse(cachedData);
    } else {
        const data = await action();
        
        await fs.promises.writeFile(fileName, JSON.stringify(data));

        console.log(`Saved in cache ${fileName} [${await getFileSize(fileName)} bytes]`);
        return data;
    }
}

export const getOrSaveFileStream = async (url, action) => {
    const key = filenamifyUrl(url);
    const fileName = path.join(fileCacheDirectory, key);
    
    createDirectoryIfNotExists(fileCacheDirectory);

    if (fs.existsSync(fileName)) {
        return fs.createReadStream(fileName);
    } else {
        const writeStream = fs.createWriteStream(fileName);
        const inputStream = action();

        inputStream.pipe(writeStream);
        writeStream.on('finish', async () => console.log(`Saved file in cache ${fileName} [${await getFileSize(fileName)} bytes]`));
        
        return inputStream;
    }
}

const createDirectoryIfNotExists = path => {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

const getFileName = (directory, key, date) => path.join(directory, `${moment(date).format('YYYY_MM_DD_HH')}-${key}`);

const getFileSize = async fileName => {
  const stats = await fs.promises.stat(fileName);

  return stats.size;
}