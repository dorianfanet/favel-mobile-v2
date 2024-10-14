export interface Place {
  id: string;
  category: PlaceCategory;
  longitude: number;
  latitude: number;
  thumbnail?: string | null;
  name: string;
}

export interface PlaceDetails extends Place {
  rating: number | null;
  totalReviews: number | null;
  description: string | null;
  openingHours: OpeningHours[] | null;
  reviews: PlaceReview[] | null;
  photos: PlacePhoto[] | null;
}

export type PlaceCategory =
  | "museum"
  | "restaurant"
  | "hotel"
  | "park"
  | "unknown";

export interface OpeningHours {
  weekDay: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  open: number;
  close: number;
}

export interface PlaceReview {
  id: string;
  rating: number;
  text: string;
  authorName: string;
  authorPhoto: string;
  source: "google";
  time: Date;
}

export interface PlacePhoto {
  id: string;
  fileKey: string;
}
