import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";

export interface AssistantContext {
  assistant: Assistant;
  pushAssistant: (newState: Assistant) => void;
  replaceAssistant: (newState: Assistant) => void;
  popAssistant: () => void;
  clearAssistant: () => void;
  canPopAssistant: boolean;
  // addMessage: (message: Message, force?: boolean) => FullConversation;
  setConversation: React.Dispatch<
    React.SetStateAction<FullConversation | null>
  >;
  conversation: FullConversation | null;
  nextForm: (
    key: string,
    value: string
  ) => {
    state: string;
    conversation: FullConversation;
  } | null;
}

const assistantContext = createContext<AssistantContext>({} as any);

const defaultAssistant: Assistant = {
  state: "default",
  placeholder: "Je voudrais visiter plus de musées...",
  key: "initial",
};

export const AssistantProvider = ({
  children,
}: {
  children: React.JSX.Element;
}) => {
  const [history, setHistory] = useState<Assistant[]>([defaultAssistant]);
  const [conversation, setConversation] = useState<FullConversation | null>(
    null
  );

  useEffect(() => {
    console.log("AssistantProvider", history);
  }, [history]);

  const pushAssistant = useCallback((newState: Assistant) => {
    setHistory((prevHistory) => [...prevHistory, newState]);
  }, []);

  const replaceAssistant = useCallback((newState: Assistant) => {
    setHistory((prevHistory) => {
      const newHistory = [...prevHistory];
      newHistory[newHistory.length - 1] = newState;
      return newHistory;
    });
  }, []);

  const popAssistant = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.length > 1) {
        console.log("history", prevHistory);
        prevHistory = prevHistory.slice(0, -1);
        console.log("historyNow", prevHistory);
      }
      const lastAssistant = prevHistory[prevHistory.length - 1];
      console.log("lastAssistant", lastAssistant);
      if (lastAssistant.state === "speaking") {
        setConversation((conversation) => {
          if (!conversation) return null;
          const indexInConversation = conversation.messages.findIndex(
            (message) => message.content === lastAssistant.message
          );
          // only keep message up to the last assistant message
          if (indexInConversation && indexInConversation !== -1) {
            return {
              ...conversation,
              messages: conversation.messages.slice(0, indexInConversation + 1),
            };
          }
          return conversation;
        });
      }
      return prevHistory; // Keep at least the default state in the stack
    });
  }, []);

  const clearAssistant = useCallback(() => {
    setHistory([defaultAssistant]);
  }, []);

  const assistant = history[history.length - 1];

  const nextForm = (key: string, value: string) => {
    const formIndex = newTripForm.findIndex((form) => form.key === key);
    if (formIndex === -1) {
      // find something to do here
      return null;
    }

    const conversationCopy: FullConversation = conversation
      ? JSON.parse(JSON.stringify(conversation))
      : {
          id: uuidv4(),
          messages: [],
        };

    console.log("conversationCopy", conversationCopy);

    const question = newTripForm[formIndex].message;

    conversationCopy.messages.push({
      role: "assistant",
      content: question,
    });

    conversationCopy.messages.push({
      role: "user",
      content: value,
    });

    console.log("conversationCopyNew", conversationCopy);

    const nextForm = newTripForm[formIndex + 1];

    setConversation(conversationCopy);

    if (nextForm) {
      pushAssistant(nextForm);

      // setConversation((conversation) => {
      //   const question = newTripForm[formIndex].message;
      //   const newMessage: Message = {
      //     role: "assistant",
      //     content: question,
      //   };
      //   const userMessage: Message = {
      //     role: "user",
      //     content: value,
      //   };
      //   if (!conversation) {
      //     return {
      //       id: uuidv4(),
      //       messages: [newMessage, userMessage],
      //     };
      //   } else {
      //     return {
      //       ...conversation,
      //       messages: [...conversation.messages, newMessage, userMessage],
      //     };
      //   }
      // });
      return null;
    } else {
      return {
        state: "response",
        conversation: conversationCopy,
      };
    }
  };

  useEffect(() => {
    console.log("new conversation", conversation);
  }, [conversation]);

  // const addMessage = (message: Message, force?: boolean) => {
  //   let newConversation: FullConversation;

  //   console.log("conversation in context", conversation);

  //   if (!conversation) {
  //     newConversation = {
  //       id: uuidv4(),
  //       messages: [message],
  //     };
  //     setConversation(newConversation);
  //     return newConversation;
  //   } else {
  //     if (
  //       conversation.messages[conversation.messages.length - 1].role ===
  //         message.role &&
  //       !force
  //     ) {
  //       newConversation = {
  //         ...conversation,
  //         messages: [...conversation.messages.slice(0, -1), message],
  //       };
  //     } else {
  //       newConversation = {
  //         ...conversation,
  //         messages: [...conversation.messages, message],
  //       };
  //     }
  //     setConversation(newConversation);
  //     return newConversation;
  //   }
  // };

  useEffect(() => {
    if (history.length < 2) {
      setConversation(null);
    }
  }, [history]);

  return (
    <assistantContext.Provider
      value={{
        assistant,
        pushAssistant,
        replaceAssistant,
        popAssistant,
        clearAssistant,
        canPopAssistant: history.length > 1,
        setConversation,
        conversation,
        nextForm,
      }}
    >
      {children}
    </assistantContext.Provider>
  );
};

export const useAssistant = () => {
  const context = useContext(assistantContext);
  if (context === undefined) {
    throw new Error("useAssistant must be used within a AssistantProvider");
  }
  return context;
};

const newTripForm: Extract<Assistant, { state: "speaking" }>[] = [
  {
    state: "speaking",
    key: "duration",
    message: "Combien de temps partez-vous ?",
    action: {
      type: "list",
      items: [{ text: "test", action: "next" }],
    },
  },
  {
    state: "speaking",
    key: "destination",
    message: "Où partez-vous ?",
    action: {
      type: "list",
      items: [{ text: "Californie", action: "next" }],
    },
  },
  // {
  //   state: "speaking",
  //   key: "budget",
  //   message: "Quel est votre budget ?",
  //   action: {
  //     type: "list",
  //     items: [{ text: "1000€", action: "next" }],
  //   },
  // },
  // {
  //   state: "speaking",
  //   key: "interests",
  //   message: "Quels sont vos centres d'intérêt ?",
  //   action: {
  //     type: "list",
  //     items: [{ text: "Musées", action: "next" }],
  //   },
  // },
];

export type Assistant =
  | {
      state: "default";
      placeholder: string;
      key: string;
    }
  | {
      state: "speaking";
      message: string;
      action?: Action | null;
      followUp?: FollowUp | null;
      timeout?: number;
      key: string;
      shouldReplace?: boolean;
    }
  | {
      state: "loading";
      key: string;
      message: string;
    };

export type Action =
  // | {
  //     type: "boolean";
  //     primary?: Button;
  //     secondary?: Button;
  //   }
  // |
  | {
      type: "list";
      items: Button[];
    }
  | {
      type: "select";
      items: (string | number)[];
      label?: string;
      button: Extract<Button, { action: "next" }>;
    };

// export type ListItem =
//   | {
//       text: string;
//     }
//   | {
//       text: string;
//       action: "next";
//       // key: string;
//     };

export type Button =
  | {
      text: string;
      action: "pop" | "follow-up" | "clear";
    }
  | {
      text: string;
      action: "push" | "replace";
      assistant: Assistant;
    }
  | {
      text: string;
      action: "retry";
      response: string;
    }
  | {
      text: string;
      action: "next";
      value?: any;
    }
  | {
      text: string;
      action: "response";
    };

export type FollowUp = {
  placeholder: string;
  autoFocus?: boolean;
  // action: string; todo
};

export type FullConversation = Conversation & { messages: Message[] };

export type Conversation = {
  id: string;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
};
