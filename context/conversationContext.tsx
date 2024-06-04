import {
  Conversation,
  ConversationMessage,
  ConversationParticipant,
} from "@/types/types";
import { createContext, useContext, useState } from "react";

export interface ConversationContext {
  messages: ConversationMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ConversationMessage[]>>;
  participants: ConversationParticipant[];
  setParticipants: React.Dispatch<
    React.SetStateAction<ConversationParticipant[]>
  >;
  currentParticipant: string | null;
  setCurrentParticipant: React.Dispatch<React.SetStateAction<string | null>>;
  conversation: Conversation | null;
  setConversation: React.Dispatch<React.SetStateAction<Conversation | null>>;
}

const conversationContext = createContext<ConversationContext>({} as any);

export const ConversationProvider = ({
  children,
}: {
  children: React.JSX.Element;
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [participants, setParticipants] = useState<ConversationParticipant[]>(
    []
  );
  const [currentParticipant, setCurrentParticipant] = useState<string | null>(
    null
  );
  const [conversation, setConversation] = useState<Conversation | null>(null);

  return (
    <conversationContext.Provider
      value={{
        messages,
        setMessages,
        participants,
        setParticipants,
        currentParticipant,
        setCurrentParticipant,
        conversation,
        setConversation,
      }}
    >
      {children}
    </conversationContext.Provider>
  );
};

export const useConversation = () => {
  const context = useContext(conversationContext);
  if (context === undefined) {
    throw new Error(
      "useConversation must be used within a ConversationProvider"
    );
  }
  return context;
};
