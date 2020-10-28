import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import moment from 'moment';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const cacheDirectory = path.join(currentDirectory, '.crawlerCache');

export const reset = async (date) => {
    const fileName = getFileName(date);

    if (fs.existsSync(fileName)) {
        await fs.promises.unlink(fileName);
    }
}

export const getOrSave = async (date, action) => {
    const fileName = getFileName(date);
    
    createDirectoryIfNotExists(cacheDirectory);

    if (fs.existsSync(fileName)) {
        console.log(`Read from cache ${fileName}`);

        const cachedData = await fs.promises.readFile(fileName);

        return JSON.parse(cachedData);
    } else {
        const data = await action();

        await fs.promises.writeFile(fileName, JSON.stringify(data));

        console.log(`Saved in cache ${fileName}`);
        return data;
    }
}

const createDirectoryIfNotExists = path => {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

const getFileName = date => path.join(cacheDirectory, moment(date).format('YYYY_MM_DD_HH'));