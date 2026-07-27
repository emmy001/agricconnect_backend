// src/modules/notifications/templates/sms/otp.ts
export const otpTemplate = (otp: string): string => {
  return `Your AgriConnect verification code is: ${otp}. Valid for 5 minutes.`;
};