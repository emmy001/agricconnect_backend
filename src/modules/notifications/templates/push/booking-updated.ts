// src/modules/notifications/templates/push/booking-updated.ts
export const bookingUpdatedTemplate = (data: any) => ({
  title: 'Booking Updated',
  body: `Your booking #${data.bookingId.slice(0, 8)} is now ${data.status}`,
  data: {
    type: 'booking_update',
    bookingId: data.bookingId,
    status: data.status,
  },
});