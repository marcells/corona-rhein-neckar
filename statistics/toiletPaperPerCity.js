import interests from '../interests.js';

export const generateToiletPaperPerCity = toiletPaperData =>
  interests
    .map(interest => ({
        interest,
        amount: getToiletPaperAmountForCity(toiletPaperData, interest.city),
      }));

const getToiletPaperAmountForCity = (toiletPaperData, city) => {
  const toiletPaper = toiletPaperData.find(data => data.store.city === city);

  return toiletPaper !== undefined ? toiletPaper.amount : null;
}