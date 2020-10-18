import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import moment from 'moment';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const cacheDirectory = path.join(currentDirectory, '.crawlerCache');

export const getOrSave = async (date, action) => {
    const fileName = path.join(cacheDirectory, moment(date).format('YYYY_MM_DD'));
    
    createDirectoryIfNotExists(cacheDirectory);

    if (fs.existsSync(fileName)) {
        const cachedData = await fs.promises.readFile(fileName);

        return JSON.parse(cachedData);
    } else {
        const data = await action();

        await fs.promises.writeFile(fileName, JSON.stringify(data));

        return data;
    }
}

const createDirectoryIfNotExists = path => {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}