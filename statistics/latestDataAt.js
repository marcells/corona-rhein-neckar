export const generateLatestDataAt = rnkData => {
  const last = rnkData[rnkData.length - 1];

  return last.date;
};