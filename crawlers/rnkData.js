import got from 'got';
import moment from 'moment';
import PDFParser from "pdf2json";
import { JSDOM } from 'jsdom';
import { sortByDate } from '../helper.js';
import { getOrSaveFileStream } from '../crawlerCache.js';

const baseUri = 'https://www.rhein-neckar-kreis.de';
const url = `${baseUri}/start/landratsamt/coronavirus+fallzahlen.html`;

export const crawlRnkData = async () => {
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
  const sortedCrawledData = sortByDate(crawledData, x => x.date);

  autocorrectionOfMissingDays(sortedCrawledData);

  console.log();
  console.log('Finished loading.')
  console.log();

  return sortedCrawledData;
};

const hasChildren = node => node.children.length > 0;
const onlyValidData = data => data.size > 100;

const getDate = node => moment(node.children[1].children[0].innerHTML.split(' ')[0], "YYMMDD");
const getSize = node => parseInt(node.children[3].children[0].firstChild.textContent);
const getUrl = node => `${baseUri}${node.children[1].children[0].href}`;

const loadPdf = url => {
    const promise = new Promise(async (resolve, reject) => {
        const pdfParser = new PDFParser();
        const inputStream = await getOrSaveFileStream(url, () => got.stream(url));
        const pdfPipe = inputStream.pipe(pdfParser);

        process.stdout.write('.');

        pdfPipe.on("pdfParser_dataError", err => reject(err));
        pdfPipe.on("pdfParser_dataReady", pdf => {
            // console.log(`Loading url: ${url}`);
    
            const rawTextsForPages = pdf.formImage.Pages
                .filter((_, pageIndex) => pageIndex > 0)
                .map((page, pageIndex) => 
                    page.Texts
                        .filter((text, textIndex, texts) => textFilterForPage(text, pageIndex, textIndex, texts.length))
                        .map((text, textIndex) => ({ text: decodeURIComponent(text.R[0].T), textIndex })));
            
            autocorrectionOfMissingTexts(rawTextsForPages);

            const textsForPages = rawTextsForPages
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
        const ignoredTexts = [ 'Stand', 'Gemeinde', 'Gesamtzahl', '(%22aktive%20F%C3%A4lle%22)', 'Davon%20in%20Quarant%C3%A4ne%20', '"', 'aktive Fälle', '%22', '(', ')', 'aktive%20F%C3%A4lle' ];

        return !ignoredTexts.includes(text.R[0].T) && textIndex > 4 && textIndex < numberOfTexts - 2;
    }

    if (pageIndex > 0) {
        return true;
    }
};

const autocorrectionOfMissingTexts = (rawTextsForPages) => {
  for(let rawTextsForPage of rawTextsForPages) {
    for(let index = 0; index < rawTextsForPage.length; index++) {
      const isLabel = isNaN(rawTextsForPage[index].text);

      if (!isLabel) {
        continue;
      }

      const isAssumedTotalInfectionsANumber = isNaN(rawTextsForPage[index + 1].text);
      const isAssumedCurrentInfectionsANumber = isNaN(rawTextsForPage[index + 2].text);

      if (isAssumedTotalInfectionsANumber) {
        throw new Error('Total infections have to be given in PDF.')
      }

      if (isAssumedCurrentInfectionsANumber) {
        rawTextsForPage.splice(index + 2, 0, { text: '0', autoCorrection: true});
      }
    }
  }
}

const autocorrectionOfMissingDays = (sortedCrawledData) => {
  for(let index = 1; index < sortedCrawledData.length; index++) {
    const currentDate = moment(sortedCrawledData[index].date);
    const previousDate = moment(sortedCrawledData[index - 1].date);
    const expectedPreviousDate = moment(currentDate).subtract(1, 'day');

    if (!previousDate.isSame(expectedPreviousDate)) {
      sortedCrawledData.splice(index, 0, {
        date: expectedPreviousDate,
        size: 0,
        url: null,
        additionalData: sortedCrawledData[index - 1].additionalData.map(x => ({ ...x })),
      });
    }
  }
};