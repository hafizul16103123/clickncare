export const dateFormatter = (date: string): string => {
  const parsed = new Date(date);
  const year = parsed.getFullYear();
  if (isNaN(year)) throw new Error('Invalid Date');
  const parsedMonth = parsed.getMonth() + 1;
  const month =
    String(parsedMonth).length === 1 ? `0${parsedMonth}` : parsedMonth;
  const parsedDay = parsed.getDate();
  const day = String(parsedDay).length === 1 ? `0${parsedDay}` : parsedDay;
  return `${day}-${month}-${year}`;
};
