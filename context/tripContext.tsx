import {
  DestinationData,
  Trip,
  TripEdit,
  TripMetadata,
  UserActivity,
  UserActivityState,
} from "@/types/types";
import React, { createContext, useContext, useRef, useState } from "react";

export interface Loading {
  type: "new";
}

export interface TripContext {
  trip: Trip | null;
  setTrip: React.Dispatch<React.SetStateAction<Trip | null>>;
  loading: Loading | null;
  setLoading: (loading: Loading | null) => void;
  tripMetadata: TripMetadata | null;
  setTripMetadata: React.Dispatch<React.SetStateAction<TripMetadata | null>>;
  tripEdits: TripEdit[];
  setTripEdits: (tripEdits: TripEdit[]) => void;
  destinationData: DestinationData | null;
  setDestinationData: (destinationData: DestinationData | null) => void;
  userActivity: UserActivityState | null;
  setUserActivity: React.Dispatch<
    React.SetStateAction<UserActivityState | null>
  >;
  initialDestination: string | null;
  setInitialDestination: (initialDestination: string | null) => void;
}

const tripContext = createContext<TripContext>({} as any);

export const TripProvider = ({ children }: { children: React.JSX.Element }) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState<Loading | null>(null);
  const [tripMetadata, setTripMetadata] = useState<TripMetadata | null>(null);
  const [tripEdits, setTripEdits] = useState<TripEdit[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivityState | null>(
    null
  );
  const [initialDestination, setInitialDestination] = useState<string | null>(
    null
  );

  const [destinationData, setDestinationData] =
    useState<DestinationData | null>(null);

  return (
    <tripContext.Provider
      value={{
        trip,
        setTrip,
        loading,
        setLoading,
        tripMetadata,
        setTripMetadata,
        tripEdits,
        setTripEdits,
        destinationData,
        setDestinationData,
        userActivity,
        setUserActivity,
        initialDestination,
        setInitialDestination,
      }}
    >
      {children}
    </tripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(tripContext);
  if (context === undefined) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
};
