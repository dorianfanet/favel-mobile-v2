import { ChatMessage, TripChatMessage } from "@/types/types";
import React, { createContext } from "react";

export interface TripChatContext {
  messages: TripChatMessage[];
  setMessages: (messages: TripChatMessage[]) => void;
}

const tripChatContext = createContext({} as any);

export const TripChatProvider = ({
  children,
}: {
  children: React.JSX.Element;
}) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  return (
    <tripChatContext.Provider
      value={{
        messages,
        setMessages,
      }}
    >
      {children}
    </tripChatContext.Provider>
  );
};

export const useTripChat = () => {
  const context = React.useContext(tripChatContext);
  if (context === undefined) {
    throw new Error("useTripChat must be used within a TripChatProvider");
  }
  return context;
};
