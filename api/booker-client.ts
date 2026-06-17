import { APIRequestContext, APIResponse } from '@playwright/test';
import { buildBooking } from './fixtures';

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds: string;
}

export interface BookingCreatedResponse {
  bookingid: number;
  booking: Booking;
}

export class BookerClient {
  constructor(
    private readonly baseUrl: string,
    private readonly request: APIRequestContext,
  ) {}

  private endpoint(path: string): string {
    return new URL(path, this.baseUrl).toString();
  }

  private async parseJson<T>(response: APIResponse): Promise<T> {
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Request failed with status ${response.status()}: ${body}`);
    }

    return (await response.json()) as T;
  }

  async createToken(): Promise<string> {
    const response = await this.request.post(this.endpoint('/auth'), {
      data: {
        username: 'admin',
        password: 'password123',
      },
    });

    const body = await this.parseJson<{ token: string }>(response);
    return body.token;
  }

  async getBookingIds(): Promise<Array<{ bookingid: number }>> {
    const response = await this.request.get(this.endpoint('/booking'));
    return this.parseJson<Array<{ bookingid: number }>>(response);
  }

  async getBooking(id: number): Promise<Booking> {
    const response = await this.request.get(this.endpoint(`/booking/${id}`));
    return this.parseJson<Booking>(response);
  }

  async createBooking(booking: Booking = buildBooking()): Promise<BookingCreatedResponse> {
    const response = await this.request.post(this.endpoint('/booking'), {
      data: booking,
    });

    return this.parseJson<BookingCreatedResponse>(response);
  }

  async updateBooking(id: number, token: string, booking: Booking = buildBooking()): Promise<Booking> {
    const response = await this.request.put(this.endpoint(`/booking/${id}`), {
      headers: {
        Cookie: `token=${token}`,
      },
      data: booking,
    });

    return this.parseJson<Booking>(response);
  }

  async deleteBooking(id: number, token: string): Promise<void> {
    const response = await this.request.delete(this.endpoint(`/booking/${id}`), {
      headers: {
        Cookie: `token=${token}`,
      },
    });

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Request failed with status ${response.status()}: ${body}`);
    }
  }
}