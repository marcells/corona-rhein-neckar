const got = require('got');
const jsdom = require('jsdom');
const moment = require('moment')
const PDFParser = require("pdf2json");
const { JSDOM } = jsdom;

const baseUri = 'https://www.rhein-neckar-kreis.de';
const url = `${baseUri}/start/landratsamt/coronavirus+fallzahlen.html`;

const loadData = async () => {
    const response = await got(url);
    const dom = new JSDOM(response.body, { includeNodeLocations: true });

    const dates = [...dom.window.document.getElementsByClassName('dlDate')]
    
    const rows = dates
        .filter(hasChildren)
        .map(x => ({ 
            row: x.parentNode,
            date: getDate(x.parentNode),
            size: getSize(x.parentNode),
            url: getUrl(x.parentNode)
        }))
        .filter(onlyLastSevenDays)
        .map(async x => ({
            ...x,
            additionalData: await loadPdf(x.url)
        }));
    
    const resolvedRows = await Promise.all(rows);

    // resolvedRows.forEach(x => {
    //     console.log(`${x.additionalData.length} | ${x.date} | ${x.size} | ${x.url}`)
    // });

    const stats = generateStats(resolvedRows);
    console.table(stats);
}

const generateStats = resolvedRows => {
    const interests = [{ city: 'Ilvesheim', numberOfHabitants: 9350 }];

    const getNumberOfIncreasedInfections = city => {
        const oldest = resolvedRows[0].additionalData.filter(data => data.city === city)[0];
        const newest = resolvedRows[resolvedRows.length - 1].additionalData.filter(data => data.city === city)[0];

        return newest.totalInfections - oldest.totalInfections;
    }

    const stats = interests
        .map(interest => ({
            interest: interest,
            increasedInfections: getNumberOfIncreasedInfections(interest.city)
        }))
        .map(data => ({
            ...data,
            sevenDayPer100000: data.increasedInfections / data.interest.numberOfHabitants * 100000
        }));
    
    return stats;
}

const hasChildren = node => node.children.length > 0;
const onlyLastSevenDays = data => {
    const sevenDaysAgo = moment().subtract(7, 'days');

    return moment(data.date).isSameOrAfter(sevenDaysAgo);
};

const getDate = node => moment(node.children[1].children[0].innerHTML.split(' ')[0], "YYMMDD");
const getSize = node => parseInt(node.children[3].children[0].firstChild.textContent);
const getUrl = node => `${baseUri}${node.children[1].children[0].href}`;

const loadPdf = url => {
    const promise = new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        const pdfPipe = got.stream(url).pipe(pdfParser);
    
        pdfPipe.on("pdfParser_dataError", err => reject(err));
        pdfPipe.on("pdfParser_dataReady", pdf => {
            // console.log(`Loading url: ${url}`);
    
            const textsForPages = pdf.formImage.Pages
                .filter((page, pageIndex) => pageIndex > 0)
                .map((page, pageIndex) => 
                    page.Texts
                        .filter((text, textIndex, texts) => textFilterForPage(text, pageIndex, textIndex, texts.length))
                        .map((text, textIndex) => ({ text: decodeURIComponent(text.R[0].T), textIndex })))
                .flatMap(x => x)
                .flatMap((value, index, array) => 
                    index % 3 === 0
                    ? [{
                        city: array[index].text,
                        totalInfections: parseInt(array[index + 1].text),
                        currentInfections: parseInt(array[index + 2].text) }]
                    : []);
    
            // console.log(textsForPages);
            // console.log();

            resolve(textsForPages);
        });
    });

    return promise;
};

const textFilterForPage = (text, pageIndex, textIndex, numberOfTexts) => {
    if (pageIndex == 0) {
        const ignore = [ 'Stand', 'Gemeinde', 'Gesamtzahl', '(%22aktive%20F%C3%A4lle%22)', 'Davon%20in%20Quarant%C3%A4ne%20' ];

        return !ignore.includes(text.R[0].T) && textIndex > 4 && textIndex < numberOfTexts - 2;
    }

    if (pageIndex > 0) {
        return true;
    }
};

loadData();