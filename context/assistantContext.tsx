import React, { createContext, useContext, useState, useCallback } from "react";

export interface AssistantContext {
  assistant: Assistant;
  pushAssistant: (newState: Assistant) => void;
  replaceAssistant: (newState: Assistant) => void;
  popAssistant: () => void;
  clearAssistant: () => void;
  canPopAssistant: boolean;
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
        return prevHistory.slice(0, -1);
      }
      return prevHistory; // Keep at least the default state in the stack
    });
  }, []);

  const clearAssistant = useCallback(() => {
    setHistory([defaultAssistant]);
  }, []);

  const assistant = history[history.length - 1];

  return (
    <assistantContext.Provider
      value={{
        assistant,
        pushAssistant,
        replaceAssistant,
        popAssistant,
        clearAssistant,
        canPopAssistant: history.length > 1,
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
      action: Action | null;
      followUp?: FollowUp | null;
      key: string;
    }
  | {
      state: "loading";
      key: string;
      message: string;
    };

export type Action =
  | {
      type: "boolean";
      primary: Button;
      secondary: Button;
    }
  | {
      type: "list";
      items: string[];
    };

export type ListItem = {
  text: string;
  icon: string;
  action: "next";
};

export type Button =
  | {
      text: string;
      action: "pop" | "follow-up" | "clear";
    }
  | {
      text: string;
      action: "push" | "replace";
      assistant: Assistant;
    };

export type FollowUp = {
  placeholder: string;
  autoFocus?: boolean;
  // action: string; todo
};
