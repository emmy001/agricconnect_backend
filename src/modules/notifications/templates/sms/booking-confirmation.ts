// src/modules/notifications/templates/sms/booking-confirmation.ts
export const bookingConfirmationSms = (data: any): string => {
  return `AgriConnect: Booking confirmed! ID: ${data.bookingId.slice(0, 8)}. Professional: ${data.professionalName} will arrive at ${data.arrivalTime}.`;
};