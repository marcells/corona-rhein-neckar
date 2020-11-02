import moment from 'moment';

export const sortByDate = (array, selector) =>
  [...array].sort((first, second) => first === second ? 0 : moment(selector(first)).isBefore(moment(selector(second))) ? -1 : 1);
