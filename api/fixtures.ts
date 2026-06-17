import { Booking, BookingDates } from './booker-client';

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

export function buildBookingDates(): BookingDates {
  const today = new Date();

  return {
    checkin: formatDate(addDays(today, 1)),
    checkout: formatDate(addDays(today, 5)),
  };
}

export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const timestamp = Date.now();
  const booking: Booking = {
    firstname: `John-${timestamp}`,
    lastname: `Doe-${timestamp}`,
    totalprice: 123,
    depositpaid: true,
    bookingdates: buildBookingDates(),
    additionalneeds: 'Breakfast',
  };

  return {
    ...booking,
    ...overrides,
    bookingdates: overrides.bookingdates ?? booking.bookingdates,
  };
}