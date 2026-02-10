export interface Hours {
  open?: string;
  close?: string;
}

export interface Place {
  placeId: string;
  name: string;
  type: 'cafe' | 'library' | string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  priceLevel: number;
  hours?: Hours;
  features?: string[];
  noiseLevel: number;
  occupancyLevel: number;
  wifiQuality: number;
  outletAvailability: number;
  parkingAvailability: number;
  hasFood: boolean;
  hasStudyRooms: boolean;
  maxGroupSize: number;
}

export interface Filters {
  minRating: number;
  preferredType: string;
  maxGroupSize?: number;
  minParking?: number;
  minOutlets?: number;
  minWifi?: number;
  requireFood: boolean;
  requireStudyRooms: boolean;
  onlyOpenNow: boolean;
  query: string;
}

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface Bookmark {
  placeId: string;
  name?: string;
}
