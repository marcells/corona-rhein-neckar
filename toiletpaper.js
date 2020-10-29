/*
All credits to https://gist.github.com/marco79cgn/23ce08fd8711ee893a3be12d4543f2d2
*/
import got from 'got';

export const stores = [
    { city: 'Brühl', address: 'Mannheimer Landstraße 5b', id: 1327 },
    { city: 'Dossenheim', address: 'Gewerbestraße 1', id: 1188 },
    { city: 'Edingen-Neckarhausen', address: 'Treidlerstraße 1', id: 1584 },
    { city: 'Eberbach', address: 'Beim Pulverturm', id: 270 },
    { city: 'Eppelheim', address: 'Seestraße 71/2', id: 1536 },
    { city: 'Hemsbach', address: 'Berliner Straße 5', id: 1948 },
    { city: 'Hockenheim', address: 'Lußheimer Straße 8', id: 1024 },
    { city: 'Ladenburg', address: 'Wallstadter Straße 51a', id: 1403 },
    { city: 'Leimen', address: 'Stralsunder Ring 23a', id: 2104 },
    { city: 'Meckesheim', address: 'Brühlweg 15', id: 1276 },
    { city: 'Neckargemünd', address: 'Kurpfalzstraße 34', id: 1765 },
    { city: 'Rauenberg', address: 'Frankenäcker 2', id: 580 },
    { city: 'Sandhausen', address: 'Gottlieb-Daimler-Straße 9', id: 2105 },
    { city: 'Schwetzingen', address: 'Hockenheimer Landstraße 4-8', id: 38 },
    { city: 'Sinsheim', address: 'Karlsplatz 1', id: 1265 },
    { city: 'Sinsheim', address: 'Steinsbergstraße 1', id: 1899 },
    { city: 'St. Leon-Rot', address: 'Hauptstraße 208', id: 1356 },
    { city: 'Waibstadt', address: 'Neidensteiner Straße 8', id: 2476 },
    { city: 'Weinheim', address: 'Bergstraße 19-25', id: 1728 },
    { city: 'Weinheim', address: 'Berliner Platz 1', id: 2746 },
    { city: 'Weinheim', address: 'Dürrestraße 2', id: 1385 },
    { city: 'Wiesloch', address: 'Güterstraße 1', id: 1656 },
];

export const amountPerStore = async (storeId) => {
    const {city, address} = stores.find(s => s.id === storeId);

    const url = `https://products.dm.de/store-availability/DE/availability?dans=595420,708997,137425,28171,485698,799358,863567,452740,610544,846857,709006,452753,879536,452744,485695,853483,594080,504606,593761,525943,842480,535981,127048,524535&storeNumbers=${storeId}`;
    const response = await got(url);
    const storeAvailabilities = JSON.parse(response.body).storeAvailabilities;
    const amount = Object.values(storeAvailabilities)
        .map((ent) => ent[0].stockLevel)
        .reduce((prev, curr) => prev + curr, 0);
    return { city, address, amount };
};
