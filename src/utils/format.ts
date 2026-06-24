export const formatFCFA = (price: number): string => {
  return new Intl.NumberFormat('en-US').format(price) + ' FCFA';
};
