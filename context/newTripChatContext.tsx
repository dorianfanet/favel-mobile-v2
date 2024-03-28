import { ChatMessage } from "@/types/types";
import React, { createContext } from "react";

export interface NewTripChatContext {
  messages: ChatMessage[];
  setMessages: (messages: any) => void;
}

const newTripChatContext = createContext({} as any);

export const NewTripChatProvider = ({
  children,
}: {
  children: React.JSX.Element;
}) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  return (
    <newTripChatContext.Provider
      value={{
        messages,
        setMessages,
      }}
    >
      {children}
    </newTripChatContext.Provider>
  );
};

export const useNewTripChat = () => {
  const context = React.useContext(newTripChatContext);
  if (context === undefined) {
    throw new Error("useNewTripChat must be used within a NewTripChatProvider");
  }
  return context;
};
