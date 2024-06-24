import { Category, TripEditType } from "@/types/types";

export const categories: Category[] = [
  "museum",
  "monument",
  "entertainment",
  "sport",
  "nature",
  "neighbourhood",
  "restaurant",
];

export const colors: Record<(typeof categories)[number], string> = {
  museum: "#244CDC",
  monument: "#7549F2",
  entertainment: "#34A3F4",
  sport: "#FF8A1E",
  nature: "#52E472",
  neighbourhood: "#5087A6",
  restaurant: "#FF5E5E",
  unknown: "#617179",
};

export const editTypes: Record<TripEditType, string> = {
  move: "#44c0e7",
  // move: "#244CDC",
  delete: "#fa9999",
  add: "#6ff18b",
};
