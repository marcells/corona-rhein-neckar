import got from 'got';
import moment from 'moment';
import PDFParser from "pdf2json";
import { JSDOM } from 'jsdom';
import { generateStats } from './statistics.js';
import { getOrSave } from './crawlerCache.js';
import { stores, amountPerStore } from './toiletpaper.js';

const baseUri = 'https://www.rhein-neckar-kreis.de';
const url = `${baseUri}/start/landratsamt/coronavirus+fallzahlen.html`;

const crawlData = async () => {
    const rnkData = await crawlRnkData();
    const toiletPaperData = await crawlToiletPaperData();

    const stats = generateStats(rnkData, toiletPaperData);

    return {
        availableData: rnkData,
        toiletPaperData,
        stats
    };
}

const crawlToiletPaperData = async () =>
  await getOrSave('toiletpaper', new Date(), async () => {
    console.log(`Loading toiletpaper amount...`);

    const crawledAvailableData = stores
        .map(async x => ({
            store: x,
            amountPerStoreResult: await amountPerStore(x.id)
        }));

    const crawledData = await Promise.all(crawledAvailableData);

    console.log();
    console.log('Finished loading.')
    console.log();

    return crawledData.map(x => ({
      store: x.store,
      amount: x.amountPerStoreResult.amount
    }));
  });

const crawlRnkData = async () =>
  await getOrSave('rnk', new Date(), async () => {
    console.log(`Loading ${url}...`);

    const response = await got(url);
    const dom = new JSDOM(response.body, { includeNodeLocations: true });
    const dates = [...dom.window.document.getElementsByClassName('dlDate')]

    console.log(`Loading pdfs and parsing data `);

    const crawledAvailableData = dates
        .filter(hasChildren)
        .map(x => ({
            date: getDate(x.parentNode),
            size: getSize(x.parentNode),
            url: getUrl(x.parentNode)
        }))
        .filter(onlyValidData)
        .map(async x => ({
            ...x,
            additionalData: await loadPdf(x.url)
        }));

    const crawledData = await Promise.all(crawledAvailableData);

    console.log();
    console.log('Finished loading.')
    console.log();

    return crawledData;
  });

const hasChildren = node => node.children.length > 0;
const onlyValidData = data => data.size > 100;

const getDate = node => moment(node.children[1].children[0].innerHTML.split(' ')[0], "YYMMDD");
const getSize = node => parseInt(node.children[3].children[0].firstChild.textContent);
const getUrl = node => `${baseUri}${node.children[1].children[0].href}`;

const loadPdf = url => {
    const promise = new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        const pdfPipe = got.stream(url).pipe(pdfParser);

        process.stdout.write('.');

        pdfPipe.on("pdfParser_dataError", err => reject(err));
        pdfPipe.on("pdfParser_dataReady", pdf => {
            // console.log(`Loading url: ${url}`);
    
            const textsForPages = pdf.formImage.Pages
                .filter((_, pageIndex) => pageIndex > 0)
                .map((page, pageIndex) => 
                    page.Texts
                        .filter((text, textIndex, texts) => textFilterForPage(text, pageIndex, textIndex, texts.length))
                        .map((text, textIndex) => ({ text: decodeURIComponent(text.R[0].T), textIndex })))
                .flatMap(x => x)
                .flatMap((_, index, array) => 
                    index % 3 === 0
                    ? [{
                        city: array[index].text,
                        totalInfections: parseInt(array[index + 1].text),
                        currentInfections: parseInt(array[index + 2].text) }]
                    : []);
    
            // console.log(textsForPages);
            // console.log();
            process.stdout.write('.');

            resolve(textsForPages);
        });
    });

    return promise;
};

const textFilterForPage = (text, pageIndex, textIndex, numberOfTexts) => {
    if (pageIndex == 0) {
        const ignoredTexts = [ 'Stand', 'Gemeinde', 'Gesamtzahl', '(%22aktive%20F%C3%A4lle%22)', 'Davon%20in%20Quarant%C3%A4ne%20' ];

        return !ignoredTexts.includes(text.R[0].T) && textIndex > 4 && textIndex < numberOfTexts - 2;
    }

    if (pageIndex > 0) {
        return true;
    }
};

export default crawlData;