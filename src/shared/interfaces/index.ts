// src/shared/interfaces/index.ts
export interface IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  status: string;
}

export interface IBooking {
  id: string;
  farmerId: string;
  professionalId: string;
  status: string;
  estimatedPrice: number;
  finalPrice: number;
  pickupLocation: Location;
  dropoffLocation: Location;
  requestedAt: Date;
}

export interface IPayment {
  id: string;
  userId: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
}

export interface INotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}