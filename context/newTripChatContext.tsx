import { favelClient } from "@/lib/favelApi";
import { ChatMessage } from "@/types/types";
import { useAuth } from "@clerk/clerk-expo";
import React, { createContext } from "react";

export interface NewTripChatContext {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  retryMessage: (
    messageId: string,
    tripId: string,
    form: any,
    tempMessages: ChatMessage[]
  ) => Promise<void>;
}

const newTripChatContext = createContext({} as NewTripChatContext);

export const NewTripChatProvider = ({
  children,
}: {
  children: React.JSX.Element;
}) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  const { getToken } = useAuth();

  async function retryMessage(
    messageId: string,
    tripId: string,
    form: any,
    tempMessages: ChatMessage[]
  ) {
    setMessages((currentMessages: ChatMessage[]) => [
      ...currentMessages.slice(0, currentMessages.length - 1), // assuming you want to keep the rest of the messages
      {
        id: messageId,
        role: "assistant",
        status: "running",
        content: "Je réfléchis à votre itinéraire...",
      },
    ]);
    const newMessage = await favelClient(getToken).then(async (favel) => {
      return await favel.sendNewRouteChatMessage(
        tempMessages,
        tripId,
        messageId,
        form
      );
    });
    if ("error" in newMessage) {
      setMessages((currentMessages: ChatMessage[]) => [
        ...currentMessages.slice(0, currentMessages.length - 1), // assuming you want to keep the rest of the messages
        {
          id: messageId,
          role: "assistant",
          status: "error",
          content: "Une erreur est survenue. Veuillez réessayer.",
        },
      ]);
    } else {
      console.log("First message sent: ", newMessage);
      setMessages((currentMessages: ChatMessage[]) => [
        ...currentMessages.slice(0, currentMessages.length - 1), // assuming you want to keep the rest of the messages
        {
          id: messageId,
          role: "assistant",
          status: "finished",
          content: newMessage.content,
          route: newMessage.route,
        },
      ]);
    }
  }

  return (
    <newTripChatContext.Provider
      value={{
        messages,
        setMessages,
        retryMessage,
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
