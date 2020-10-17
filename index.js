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
    // https://www.rhein-neckar-kreis.de/site/Rhein-Neckar-Kreis-2016/get/documents_E1249267876/rhein-neckar-kreis/Daten/Infomaterial/Bev%C3%B6lkerungsfortschreibung.pdf

    const interests = [
        { city: 'Altlußheim', numberOfHabitants: 6204 },
        { city: 'Angelbachtal', numberOfHabitants: 5110 },
        { city: 'Bammental', numberOfHabitants: 6594 },
        { city: 'Brühl', numberOfHabitants: 14337 },
        { city: 'Dielheim', numberOfHabitants: 9095 },
        { city: 'Dossenheim', numberOfHabitants: 12574 },
        { city: 'Eberbach', numberOfHabitants: 14390 },
        { city: 'Edingen-Neckarhausen', numberOfHabitants: 14171 },
        { city: 'Epfenbach', numberOfHabitants: 2388 },
        { city: 'Eppelheim', numberOfHabitants: 15356 },
        { city: 'Eschelbronn', numberOfHabitants: 2664 },
        { city: 'Gaiberg', numberOfHabitants: 2407 },
        { city: 'Heddesbach', numberOfHabitants: 463 },
        { city: 'Heddesheim', numberOfHabitants: 11745 },
        { city: 'Heiligkreuzsteinach', numberOfHabitants: 2641 },
        { city: 'Helmstadt-Bargen', numberOfHabitants: 3802 },
        { city: 'Hemsbach', numberOfHabitants: 11691 },
        { city: 'Hirschberg', numberOfHabitants: 9883 },
        { city: 'Hockenheim', numberOfHabitants: 21743 },
        { city: 'Ilvesheim', numberOfHabitants: 9339 },
        { city: 'Ketsch', numberOfHabitants: 12887 },
        { city: 'Ladenburg', numberOfHabitants: 11776 },
        { city: 'Laudenbach', numberOfHabitants: 6382 },
        { city: 'Leimen', numberOfHabitants: 26979 },
        { city: 'Lobbach', numberOfHabitants: 2366 },
        { city: 'Malsch', numberOfHabitants: 3445 },
        { city: 'Mauer', numberOfHabitants: 4067 },
        { city: 'Meckesheim', numberOfHabitants: 5166 },
        { city: 'Mühlhausen', numberOfHabitants: 8650 },
        { city: 'Neckarbischofsheim', numberOfHabitants: 4050 },
        { city: 'Neckargemünd', numberOfHabitants: 13388 },
        { city: 'Neidenstein', numberOfHabitants: 1739 },
        { city: 'Neulußheim', numberOfHabitants: 7136 },
        { city: 'Nußloch', numberOfHabitants: 11271 },
        { city: 'Oftersheim', numberOfHabitants: 12234 },
        { city: 'Plankstadt', numberOfHabitants: 10407 },
        { city: 'Rauenberg', numberOfHabitants: 8770 },
        { city: 'Reichartshausen', numberOfHabitants: 2078 },
        { city: 'Reilingen', numberOfHabitants: 7816 },
        { city: 'Sandhausen', numberOfHabitants: 15276 },
        { city: 'Schönau', numberOfHabitants: 4392 },
        { city: 'Schönbrunn', numberOfHabitants: 2880 },
        { city: 'Schriesheim', numberOfHabitants: 14953 },
        { city: 'Schwetzingen', numberOfHabitants: 21592 },
        { city: 'Sinsheim', numberOfHabitants: 35398 },
        { city: 'Spechbach', numberOfHabitants: 1719 },
        { city: 'St. Leon-Rot', numberOfHabitants: 13729 },
        { city: 'Waibstadt', numberOfHabitants: 5616 },
        { city: 'Walldorf', numberOfHabitants: 15446 },
        { city: 'Weinheim', numberOfHabitants: 45317 },
        { city: 'Wiesenbach', numberOfHabitants: 3109 },
        { city: 'Wiesloch', numberOfHabitants: 26706 },
        { city: 'Wilhelmsfeld', numberOfHabitants: 3171 },
        { city: 'Zuzenhausen', numberOfHabitants: 2180 }
    ];

    const getNumberOfIncreasedInfections = city => {
        const first = resolvedRows[0];
        const last = resolvedRows[resolvedRows.length - 1];

        const oldest = first.additionalData.filter(data => data.city === city)[0];
        const newest = last.additionalData.filter(data => data.city === city)[0];

        return {
            from: first.date,
            to: last.date,
            increasedInfections: newest.totalInfections - oldest.totalInfections
        };
    }

    const stats = interests
        .map(interest => ({
            interest: interest,
            ...getNumberOfIncreasedInfections(interest.city)
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