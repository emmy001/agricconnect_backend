// src/shared/types/index.ts
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
  timestamp: string;
};

export type Location = {
  latitude: number;
  longitude: number;
  address?: string;
};

export type Price = {
  amount: number;
  currency: string;
};

export type Contact = {
  email: string;
  phone: string;
  address?: string;
};