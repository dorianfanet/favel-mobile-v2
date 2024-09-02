import { favelClient } from "@/lib/favelApi";
import { useAuth } from "@clerk/clerk-expo";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useTrip } from "./tripContext";
import { TripMetadata } from "@/types/types";
import { useTranslation } from "react-i18next";

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
  sendMessage: (
    tripId: string,
    textResponse: string,
    customConversation?: FullConversation | null,
    avoidConversationUpdate?: boolean
  ) => void;
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
  const { t } = useTranslation();

  const [history, setHistory] = useState<Assistant[]>([defaultAssistant]);
  const [conversation, setConversation] = useState<FullConversation | null>(
    null
  );

  const { setTripMetadata } = useTrip();

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

  const { getToken } = useAuth();

  async function sendMessage(
    tripId: string,
    textResponse: string,
    customConversation?: FullConversation | null,
    avoidConversationUpdate?: boolean
  ) {
    // if (abortController) {
    //   abortController.abort(); // Abort any previous request
    // }

    const newAbortController = new AbortController();
    // setAbortController(newAbortController);

    const signal = newAbortController.signal;

    const value = textResponse;
    if (assistant.state === "speaking" && assistant.shouldReplace) {
      replaceAssistant({
        state: "loading",
        key: `loading`,
        message: t("assistant.thinking"),
      });
    } else {
      pushAssistant({
        state: "loading",
        key: `loading`,
        message: t("assistant.thinking"),
      });
    }
    let conversationCopy: FullConversation;
    if (customConversation) {
      conversationCopy = customConversation;
    } else {
      conversationCopy = conversation
        ? JSON.parse(JSON.stringify(conversation))
        : {
            id: uuidv4(),
            type: "trip",
            messages: [],
          };
    }
    console.log("value, ", value);
    favelClient(getToken).then(async (favel) => {
      if (!avoidConversationUpdate) {
        if (
          conversationCopy.messages[conversationCopy.messages.length - 1]
            ?.role === "user"
        ) {
          conversationCopy.messages[
            conversationCopy.messages.length - 1
          ].content = value;
        } else {
          conversationCopy.messages.push({
            role: "user",
            content: value,
            key: assistant.key,
          });
        }
      }
      const { data, error } = await favel
        .assistant(signal)
        .send(conversationCopy, tripId);
      9;
      let messageData = data;
      if (error) {
        replaceAssistant({
          state: "loading",
          key: `loading-retry`,
          message: t("assistant.loading_retry"),
        });
        const { data, error } = await favel
          .assistant(signal)
          .send(conversationCopy, tripId);
        messageData = data;
        if (error) {
          replaceAssistant({
            state: "speaking",
            key: `speaking-${uuidv4()}`,
            message: t("assistant.loading_error"),
            action: {
              type: "list",
              items: [
                {
                  text: t("assistant.loading_error_retry"),
                  action: "retry",
                  response: value,
                },
              ],
            },
            shouldReplace: true,
          });
        }
      }
      console.log("messageData", messageData);
      if (messageData) {
        replaceAssistant({
          state: "speaking",
          key: `speaking-${uuidv4()}`,
          message: messageData.message,
          action: messageData.action,
          followUp: messageData.followUp,
          timeout: messageData.timeout,
          modifications: messageData.modifications,
        });
        conversationCopy.messages.push({
          role: "assistant",
          content: messageData.message,
          key: messageData.key || undefined,
        });
        if (messageData.route) {
          setTripMetadata((metadata) => {
            return {
              ...(metadata as TripMetadata),
              route: messageData.route,
            };
          });
        }
        // }
      }
    });
    setConversation(conversationCopy);
  }

  // const nextForm = async (
  //   key: string,
  //   value: string
  // ): Promise<{
  //   state: string;
  //   conversation: FullConversation;
  // } | null> => {
  //   let shouldReplace = false;

  //   console.log("nextForm: ", key, value);

  //   try {
  //     if (key === "destination") {
  //       pushAssistant({
  //         state: "loading",
  //         key: "loading-destination",
  //         message: "Je réfléchis à votre destination...",
  //       });

  //       shouldReplace = true;

  //       await favelClient(getToken).then(async (favel) => {
  //         const { data, error } = await favel.assistant("").destination(value);

  //         console.log("data", data);

  //         if (error) {
  //           console.error(error);
  //           setForm((form) => {
  //             return {
  //               ...form,
  //               destination: {
  //                 type: "unknown",
  //               },
  //             };
  //           });

  //           throw new Error(
  //             "Nous faisons face à une forte affluence pour le moment. Veuillez réessayer ultérieurement."
  //           );
  //         }

  //         if (data) {
  //           setForm((form) => {
  //             return {
  //               ...form,
  //               destination: data,
  //             };
  //           });
  //           if (data.route) {
  //             setTripMetadata((metadata) => {
  //               return {
  //                 ...(metadata as TripMetadata),
  //                 route: data.route,
  //               };
  //             });
  //           }
  //         }

  //         await new Promise((resolve) => setTimeout(resolve, 2000));
  //       });
  //     } else if (key === "duration") {
  //       setForm((form) => {
  //         return {
  //           ...form,
  //           duration: parseInt(value),
  //         };
  //       });
  //       if (form?.destination && form.destination.type === "city") {
  //         setTripMetadata((metadata) => {
  //           if (!metadata || !metadata.route) return null;
  //           return {
  //             ...(metadata as TripMetadata),
  //             route: metadata?.route.map((route) => {
  //               return {
  //                 ...route,
  //                 duration: parseInt(value),
  //               };
  //             }),
  //           };
  //         });
  //       } else if (
  //         form?.destination &&
  //         form.destination.type === "multi-city"
  //       ) {
  //         favelClient(getToken).then(async (favel) => {
  //           if (!tripMetadata || !tripMetadata.route) return;

  //           const { data, error } = await favel
  //             .assistant("")
  //             .applyDuration(tripMetadata.route!, parseInt(value));

  //           if (error) {
  //             console.error(error);
  //             return;
  //           }

  //           if (data) {
  //             setTripMetadata((metadata) => {
  //               return {
  //                 ...(metadata as TripMetadata),
  //                 route: data,
  //               };
  //             });
  //           }
  //         });
  //       }
  //     }

  //     const formIndex = newTripForm.findIndex((form) => form.key === key);
  //     if (formIndex === -1) {
  //       // find something to do here
  //       return null;
  //     }

  //     const conversationCopy: FullConversation = conversation
  //       ? JSON.parse(JSON.stringify(conversation))
  //       : {
  //           id: uuidv4(),
  //           messages: [],
  //         };

  //     console.log("conversationCopy", conversationCopy);

  //     const question = newTripForm[formIndex].message;

  //     conversationCopy.messages.push({
  //       role: "assistant",
  //       content: question,
  //     });

  //     conversationCopy.messages.push({
  //       role: "user",
  //       content: value,
  //     });

  //     console.log("conversationCopyNew", conversationCopy);

  //     const nextForm = newTripForm[formIndex + 1];

  //     setConversation(conversationCopy);

  //     if (nextForm) {
  //       if (shouldReplace) {
  //         replaceAssistant(nextForm);
  //       } else {
  //         pushAssistant(nextForm);
  //       }

  //       setConversation((conversation) => {
  //         const question = newTripForm[formIndex].message;
  //         const newMessage: Message = {
  //           role: "assistant",
  //           content: question,
  //         };
  //         const userMessage: Message = {
  //           role: "user",
  //           content: value,
  //         };
  //         if (!conversation) {
  //           return {
  //             id: uuidv4(),
  //             messages: [newMessage, userMessage],
  //           };
  //         } else {
  //           return {
  //             ...conversation,
  //             messages: [...conversation.messages, newMessage, userMessage],
  //           };
  //         }
  //       });
  //       return null;
  //     } else {
  //       return {
  //         state: "response",
  //         conversation: conversationCopy,
  //       };
  //     }
  //   } catch (error: any) {
  //     replaceAssistant({
  //       state: "speaking",
  //       key: "error",
  //       message: error ? error : "Une erreur est survenue...",
  //     });
  //     return null;
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
        sendMessage,
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
