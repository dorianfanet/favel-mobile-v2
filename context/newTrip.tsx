import { getDaysDiff } from "@/lib/utils";
import { Preferences } from "@/types/types";
import { CameraBounds } from "@rnmapbox/maps";
import { FeatureCollection, Position } from "@turf/turf";
import { createContext, useContext, useEffect, useState } from "react";

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
  flexDates: {
    duration: string | null;
    month: number | null;
  };
  destinationDataSent?: boolean;
}

export type DestinationData = {
  location: string;
  duration: number;
  bounds?: Position[];
  center: Position;
};

export interface NewTripFormContext {
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
}

const newTripFormContext = createContext<NewTripFormContext | undefined>(
  undefined
);

export const NewTripFormProvider = ({
  children,
}: {
  children: React.JSX.Element;
}) => {
  const [form, setForm] = useState<NewTripFormContext["form"]>({
    travelersPreset: null,
    preferences: {
      sport: 2,
      culture: 2,
      outdoor: 2,
      nightlife: 2,
      iconic: 2,
      relax: 2,
    },
    dates: {
      departure: new Date(new Date().setDate(new Date().getDate() + 7)),
      return: new Date(new Date().setDate(new Date().getDate() + 10)),
    },
    flexDates: {
      duration: null,
      month: null,
    },
  });

  return (
    <newTripFormContext.Provider value={{ form, setForm }}>
      {children}
    </newTripFormContext.Provider>
  );
};

export const useNewTripForm = () => {
  const context = useContext(newTripFormContext);
  if (context === undefined) {
    throw new Error("useNewTripForm must be used within a NewTripFormProvider");
  }
  return context;
};
