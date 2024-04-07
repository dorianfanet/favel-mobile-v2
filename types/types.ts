import { IconByKey } from "@/components/Icon";
import {
  BBox,
  Feature,
  FeatureCollection,
  Geometry,
  LineString,
  Position,
} from "@turf/turf";

export type CachedActivity = {
  data: Activity;
  expiresAt: number;
};

export type TripEditType = "move" | "delete" | "add";

export type TripEdit = {
  id?: string;
  created_at?: string;
  type: TripEditType;
  day_index?: number;
  location?: string;
  activity_id: string;
  author_id: string;
  trip_id: string;
};

export type Editor = {
  type?: "day" | "activity";
  day?: {
    center: Position;
    bounds: BBox;
    index: number;
    id?: string;
  };
};

export type SavedTrip = {
  id: string;
  name?: string;
  author_id: string;
  route?: TripRoute;
  dates?:
    | {
        type: "flexDates";
        duration: number;
        month: number;
      }
    | {
        type: "dates";
        departureDate: string;
        returnDate: string;
      };
};

export type StatusMessage = {
  message: string;
  details?: {
    icon?: IconByKey;
    title: string;
  };
};

export type TripMetadata = {
  id: string;
  trip?: Trip;
  prompt?: string;
  preferences?: Form;
  author_id?: string;
  status:
    | "new"
    | "new.form"
    | "new.route"
    | "trip"
    | "trip.init"
    | "trip.loading";
  route?: TripRoute;
  status_message?: StatusMessage;
  name?: string;
  dates?:
    | {
        type: "flexDates";
        duration: number;
        month: number;
      }
    | {
        type: "dates";
        departureDate: string;
        returnDate: string;
      };
  invited_ids?: string[];
};

export type Trip = Day[];

export type FormattedTrip = (Day | Activity)[];

export interface Day {
  id?: string;
  formattedType: "day";
  location?: string;
  country?: string;
  coordinates?: [number, number];
  day?: number;
  activities?: Activity[];
  type: "day" | "transfer";
  transfer?: boolean;
  origin?: string;
  destination?: string;
  origin_coordinates?: [number, number];
  destination_coordinates?: [number, number];
}

export interface Route {
  type: "driving" | "transit";
  distance: number;
  duration: number;
  geometry: LineString;
  origin: string;
  destination: string;
}

export interface Activity {
  formattedType: "activity";
  name?: string;
  dbName?: string;
  type?: "place" | "area" | "city" | "other" | "route";
  id?: string;
  distance?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  category?: string;
  polygon?: Feature;
  display_category?: string;
  avg_duration?: number;
  index?: number;
  route?: Route;
}

export type User = {
  id: string;
  name?: string;
  avatar_url?: string;
};

export type Traveler = {
  id?: string;
  name: string;
  temp_id: string;
};

export type Category =
  | "museum"
  | "monument"
  | "entertainment"
  | "sport"
  | "nature"
  | "neighbourhood"
  | "unknown";

export type QuestionType = {
  id:
    | "budget"
    | "dynamism"
    | "travelersPreset"
    | "preferences"
    | "dates"
    | "flexDates"
    | "destination";
  name: string;
  type: "radio" | "preferences" | "dates" | "flexDates" | "text";
  skip: boolean;
  options?: any;
};

export type Preferences = {
  sport: number;
  culture: number;
  nightlife: number;
  outdoor: number;
  relax: number;
  iconic: number;
};

export type PreferencesList =
  | "sport"
  | "culture"
  | "nightlife"
  | "outdoor"
  | "relax"
  | "iconic";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  route?: TripRoute;
  status?: "running" | "finished" | null;
};

export type TripChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  trip?: Trip;
  edits?: TripChatEditDay[];
  status: null | "loading" | "generating" | "finished";
  function?: "modifications";
};

export type TripChatEditDay = {
  day_index: number;
  actions: TripChatEdit[];
};

export type TripChatEdit = {
  name: string;
  id?: string;
  action: "add" | "delete";
};

export interface Form {
  id?: string;
  preferences: Preferences;
  destination?: string;
  travelersPreset: "friends" | "family" | "couple" | "solo" | null;
  travelers?: {
    [key: number]: {
      adults: {
        name: string;
        temp_id: string;
        id?: string;
      }[];
      children: {
        name: string;
        temp_id: string;
      }[];
    };
  };
  budget?: "low" | "medium" | "high";
  dynamism?: "chill" | "tourist" | "traveler";
  dates: {
    departure: Date;
    return: Date;
  };
  status: "initial" | "form" | "destinationFunnel" | null;
  bounds?: number[][];
  featureCollection?: FeatureCollection;
  destinationDataSent?: boolean;
}

export type TripRoute = Hotspot[];

export type Hotspot = {
  id?: string;
  location: string;
  duration: number;
  coordinates: [number, number];
};

export type DestinationData =
  | {
      result: "destination";
      destination: {
        location: string;
        duration: number;
        bounds?: Position[];
        center: Position;
      };
    }
  | {
      result: "route";
    }
  | {
      result: "single";
      destination: {
        location: string;
        duration: number;
      };
    }
  | {
      result: "unknown";
    };

export type UserMetadata = {
  id: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  publicMetadata?: {
    trips: number;
    coTravelers?: string[];
  };
  privateMetadata?: {
    origin?: string;
  };
};

export type UserActivity = {
  id: string;
  created_at: string;
  last_activity: string;
  trip_id: string;
  user_id: string;
};

export type UserActivityState = {
  count: number;
  activity: UserActivity[];
};
