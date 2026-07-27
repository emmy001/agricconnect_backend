// src/modules/notifications/templates/push/payment-received.ts
export const paymentReceivedTemplate = (data: any) => ({
  title: 'Payment Received',
  body: `KES ${data.amount} has been received for booking #${data.bookingId.slice(0, 8)}`,
  data: {
    type: 'payment_received',
    bookingId: data.bookingId,
    amount: data.amount,
  },
});