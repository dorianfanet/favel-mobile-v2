import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

export interface AssistantContext {
  assistant: Assistant;
  pushAssistant: (newState: Assistant) => void;
  replaceAssistant: (newState: Assistant) => void;
  popAssistant: () => void;
  clearAssistant: () => void;
  canPopAssistant: boolean;
  setConversation: React.Dispatch<
    React.SetStateAction<FullConversation | null>
  >;
  conversation: FullConversation | null;
}

const assistantContext = createContext<AssistantContext>({} as any);

const defaultAssistant: Assistant = {
  state: "default",
  placeholder: "I want to visit...",
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
        prevHistory = prevHistory.slice(0, -1);
      }
      const lastAssistant = prevHistory[prevHistory.length - 1];
      if (lastAssistant.state === "speaking") {
        setConversation((conversation) => {
          if (!conversation) return null;
          const indexInConversation = conversation.messages.findIndex(
            (message) => message.content === lastAssistant.message
          );
          if (indexInConversation && indexInConversation !== -1) {
            return {
              ...conversation,
              messages: conversation.messages.slice(0, indexInConversation + 1),
            };
          }
          return conversation;
        });
      }
      return prevHistory;
    });
  }, []);

  const clearAssistant = useCallback(() => {
    setHistory([defaultAssistant]);
  }, []);

  const assistant = history[history.length - 1];

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
      timeout?: TimeoutPopOrClear;
      key: string;
      shouldReplace?: boolean;
      modifications?: any;
    }
  | {
      state: "loading";
      key: string;
      message: string;
    };

interface BaseTimeout {
  duration: number;
}

interface TimeoutPopOrClear extends BaseTimeout {
  action: "pop" | "clear";
}

interface TimeoutReplace extends BaseTimeout {
  action: "replace";
}

export type Timeout = TimeoutPopOrClear | TimeoutReplace;

export type Action =
  | {
      type: "list";
      items: Button[];
      submit?: Button;
      checkbox?: boolean;
    }
  | {
      type: "select";
      items: (string | number)[];
      label?: string;
      button: Extract<Button, { action: "next" }>;
    };

export type Button =
  | PopFollowUpClearButton
  | PushReplaceButton
  | RetryButton
  | ResponseButton
  | CheckButton
  | CreateTrip;

interface BaseButton {
  text: string;
  icon?: string;
  timeout?: BaseTimeout;
}

interface PopFollowUpClearButton extends BaseButton {
  action: "pop" | "follow-up" | "clear";
}

interface PushReplaceButton extends BaseButton {
  action: "push" | "replace";
  assistant: Assistant;
}

interface RetryButton extends BaseButton {
  action: "retry";
  response: string;
}

interface CheckButton extends BaseButton {
  action: "check";
  timeout: undefined;
}

interface ResponseButton extends BaseButton {
  action: "response";
}

interface CreateTrip extends BaseButton {
  action: "createTrip";
}

export type FollowUp = {
  placeholder: string;
  autoFocus?: boolean;
};

export type FullConversation = Conversation & { messages: Message[] };

export type Conversation = {
  id: string;
  type: "trip" | "new";
  options?: any;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
  key?: string;
};
