export interface MapTripDay {
  id: string;
  name?: string;
  centerPoint: {
    lat: number;
    lng: number;
  };
  dayIds: string[];
  dates: (Date | [Date, Date])[];
}
