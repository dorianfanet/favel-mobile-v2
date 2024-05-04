import { getDaysDiff } from "@/lib/utils";
import { Preferences } from "@/types/types";
import { CameraBounds } from "@rnmapbox/maps";
import { FeatureCollection, Position } from "@turf/turf";
import { createContext, useContext, useEffect, useState } from "react";
import { useTrip } from "./tripContext";
import { favel } from "@/lib/favelApi";

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

  const { setDestinationData } = useTrip();

  useEffect(() => {
    async function fetchDestinationData() {
      console.log(form.destination, form.flexDates.duration);
      if (form.destination) {
        const data = await favel.fetchDestinationData(
          form.destination,
          form.flexDates.duration ? parseInt(form.flexDates.duration) : 4
        );
        console.log("Destination data", data);
        setDestinationData(data);
      }
    }

    console.log("Calling fetchDestinationData");
    fetchDestinationData();
  }, [form.destination, form.dates, form.flexDates]);

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
