import { Trip, TripDay, TripEvent, TripStage } from "@/types/trip";
import React, { createContext, useContext, useReducer, Dispatch } from "react";

// Define the state structure
interface TripState {
  trip: Trip | null;
  stages: TripStage[];
  days: TripDay[];
  events: TripEvent[];
}

// Define action types
type TripAction =
  | { type: "SET_TRIP"; payload: Trip | null }
  | { type: "SET_STAGES"; payload: TripStage[] }
  | { type: "SET_DAYS"; payload: TripDay[] }
  | { type: "SET_EVENTS"; payload: TripEvent[] }
  | { type: "UPDATE_STAGE"; payload: TripStage }
  | { type: "UPDATE_DAY"; payload: TripDay }
  | { type: "UPDATE_EVENT"; payload: TripEvent }
  | { type: "ADD_STAGE"; payload: TripStage }
  | { type: "ADD_DAY"; payload: TripDay }
  | { type: "ADD_EVENT"; payload: TripEvent }
  | { type: "REMOVE_STAGE"; payload: string }
  | { type: "REMOVE_DAY"; payload: string }
  | { type: "REMOVE_EVENT"; payload: string };

// Define the initial state
const initialState: TripState = {
  trip: null,
  stages: [],
  days: [],
  events: [],
};

// Create the context
const TripContext = createContext<
  | {
      state: TripState;
      dispatch: Dispatch<TripAction>;
    }
  | undefined
>(undefined);

// Reducer function
const tripReducer = (state: TripState, action: TripAction): TripState => {
  switch (action.type) {
    case "SET_TRIP":
      return { ...state, trip: action.payload };
    case "SET_STAGES":
      return { ...state, stages: action.payload };
    case "SET_DAYS":
      return { ...state, days: action.payload };
    case "SET_EVENTS":
      return { ...state, events: action.payload };
    case "UPDATE_STAGE":
      return {
        ...state,
        stages: state.stages.map((stage) =>
          stage.id === action.payload.id ? action.payload : stage
        ),
      };
    case "UPDATE_DAY":
      return {
        ...state,
        days: state.days.map((day) =>
          day.id === action.payload.id ? action.payload : day
        ),
      };
    case "UPDATE_EVENT":
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        ),
      };
    case "ADD_STAGE":
      return { ...state, stages: [...state.stages, action.payload] };
    case "ADD_DAY":
      return { ...state, days: [...state.days, action.payload] };
    case "ADD_EVENT":
      return { ...state, events: [...state.events, action.payload] };
    case "REMOVE_STAGE":
      return {
        ...state,
        stages: state.stages.filter((stage) => stage.id !== action.payload),
      };
    case "REMOVE_DAY":
      return {
        ...state,
        days: state.days.filter((day) => day.id !== action.payload),
      };
    case "REMOVE_EVENT":
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
      };
    default:
      return state;
  }
};

// Provider component
export const TripProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  return (
    <TripContext.Provider value={{ state, dispatch }}>
      {children}
    </TripContext.Provider>
  );
};

// Custom hook for using the trip context
export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
};

// Utility functions for common operations
export const tripUtils = {
  setTrip: (dispatch: Dispatch<TripAction>, trip: Trip | null) => {
    dispatch({ type: "SET_TRIP", payload: trip });
  },
  setStages: (dispatch: Dispatch<TripAction>, stages: TripStage[]) => {
    dispatch({ type: "SET_STAGES", payload: stages });
  },
  setDays: (dispatch: Dispatch<TripAction>, days: TripDay[]) => {
    dispatch({ type: "SET_DAYS", payload: days });
  },
  setEvents: (dispatch: Dispatch<TripAction>, events: TripEvent[]) => {
    dispatch({ type: "SET_EVENTS", payload: events });
  },
  updateStage: (dispatch: Dispatch<TripAction>, stage: TripStage) => {
    dispatch({ type: "UPDATE_STAGE", payload: stage });
  },
  updateDay: (dispatch: Dispatch<TripAction>, day: TripDay) => {
    dispatch({ type: "UPDATE_DAY", payload: day });
  },
  updateEvent: (dispatch: Dispatch<TripAction>, event: TripEvent) => {
    dispatch({ type: "UPDATE_EVENT", payload: event });
  },
  addStage: (dispatch: Dispatch<TripAction>, stage: TripStage) => {
    dispatch({ type: "ADD_STAGE", payload: stage });
  },
  addDay: (dispatch: Dispatch<TripAction>, day: TripDay) => {
    dispatch({ type: "ADD_DAY", payload: day });
  },
  addEvent: (dispatch: Dispatch<TripAction>, event: TripEvent) => {
    dispatch({ type: "ADD_EVENT", payload: event });
  },
  removeStage: (dispatch: Dispatch<TripAction>, stageId: string) => {
    dispatch({ type: "REMOVE_STAGE", payload: stageId });
  },
  removeDay: (dispatch: Dispatch<TripAction>, dayId: string) => {
    dispatch({ type: "REMOVE_DAY", payload: dayId });
  },
  removeEvent: (dispatch: Dispatch<TripAction>, eventId: string) => {
    dispatch({ type: "REMOVE_EVENT", payload: eventId });
  },
};
