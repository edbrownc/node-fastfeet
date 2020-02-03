import { parseISO, isBefore, isAfter } from 'date-fns';

function isWithinBusinessHours(startDate) {
  const busHoursStart = parseISO(startDate).setHours(8, 0, 0, 0); // 08:00 for the same day as start date
  const busHoursEnd = parseISO(startDate).setHours(18, 0, 0, 0); // 18:00 for the same day as end date

  const parsedStartDate = parseISO(startDate);

  return (
    isBefore(parsedStartDate, busHoursStart) ||
    isAfter(parsedStartDate, busHoursEnd)
  );
}

export default isWithinBusinessHours;
