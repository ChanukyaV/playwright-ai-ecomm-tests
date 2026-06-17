import { expect, test } from '@playwright/test';
import { BookerClient } from '../../api/booker-client';
import { buildBooking } from '../../api/fixtures';

const baseUrl = 'https://restful-booker.herokuapp.com';

test.describe('Restful Booker API', () => {
  test('creates an auth token', async ({ request }) => {
    const client = new BookerClient(baseUrl, request);

    const token = await client.createToken();

    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(0);
  });

  test('creates, reads, updates, and deletes a booking', async ({ request }) => {
    const client = new BookerClient(baseUrl, request);
    const booking = buildBooking();

    const created = await client.createBooking(booking);
    expect(created.bookingid).toBeGreaterThan(0);
    expect(created.booking).toMatchObject({ ...booking });

    const bookingIds = await client.getBookingIds();
    expect(bookingIds.some((entry) => entry.bookingid === created.bookingid)).toBeTruthy();

    const fetched = await client.getBooking(created.bookingid);
    expect(fetched).toMatchObject({ ...booking });

    const token = await client.createToken();
    const updatedBooking = buildBooking({
      firstname: `${booking.firstname}-updated`,
      lastname: `${booking.lastname}-updated`,
      totalprice: booking.totalprice + 50,
      depositpaid: false,
      additionalneeds: 'Late checkout',
    });

    const updated = await client.updateBooking(created.bookingid, token, updatedBooking);
    expect(updated).toMatchObject({ ...updatedBooking });

    const refetched = await client.getBooking(created.bookingid);
    expect(refetched).toMatchObject({ ...updatedBooking });

    await client.deleteBooking(created.bookingid, token);

    await expect(client.getBooking(created.bookingid)).rejects.toThrow(/404/);
  });
});