import { TripDay } from "@/types/trip";
import { Sheets } from "@/types/tripSheets";
import React, { createContext, useReducer, useContext, ReactNode } from "react";

interface Location {
  latitude: number;
  longitude: number;
}

interface Activity {
  id: string;
  name: string;
  location: Location;
}

export interface NavigationState {
  // type: string;
  bottomSheet: Sheets;
  selectedDay?: TripDay | null;
  selectedTransportId?: string | null;
  // bottomSheetData?: any;
  // mapCenter?: Location;
  // activities?: Activity[];
  // route?: Location[];
}

interface NavigationContextState {
  stack: NavigationState[];
  currentIndex: number;
}

type Action =
  | { type: "PUSH"; payload: Partial<NavigationState> }
  | { type: "POP" }
  | { type: "NEXT" };

const TripNavigationContext = createContext<
  | {
      state: NavigationContextState;
      dispatch: React.Dispatch<Action>;
    }
  | undefined
>(undefined);

const initialState: NavigationContextState = {
  stack: [
    {
      // type: "default",
      bottomSheet: "calendar",
    },
  ],
  currentIndex: 0,
};

function tripNavigationReducer(
  state: NavigationContextState,
  action: Action
): NavigationContextState {
  switch (action.type) {
    case "PUSH":
      const currentState = state.stack[state.currentIndex];
      const newState: NavigationState = { ...currentState, ...action.payload };
      return {
        ...state,
        stack: [...state.stack.slice(0, state.currentIndex + 1), newState],
        currentIndex: state.currentIndex + 1,
      };
    case "POP":
      if (state.currentIndex > 0) {
        return {
          ...state,
          currentIndex: state.currentIndex - 1,
        };
      }
      return state;
    case "NEXT":
      if (state.currentIndex < state.stack.length - 1) {
        return {
          ...state,
          currentIndex: state.currentIndex + 1,
        };
      }
      return state;
    default:
      return state;
  }
}

export function TripNavigationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripNavigationReducer, initialState);

  return (
    <TripNavigationContext.Provider value={{ state, dispatch }}>
      {children}
    </TripNavigationContext.Provider>
  );
}

export function useTripNavigation() {
  const context = useContext(TripNavigationContext);
  if (context === undefined) {
    throw new Error(
      "useTripNavigation must be used within a TripNavigationProvider"
    );
  }
  return context;
}
