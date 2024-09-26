import { View, Text } from "react-native";
import React, { useCallback } from "react";
import {
  Action as ActionType,
  Button as ButtonType,
  useAssistant,
} from "@/context/assistantContext";
import Button from "./Button";

function Action({
  action,
  onResponse,
}: {
  action: ActionType;
  onResponse?: (response: string) => void;
}) {
  const {
    assistant,
    pushAssistant,
    replaceAssistant,
    clearAssistant,
    popAssistant,
  } = useAssistant();

  const handlePress = useCallback(async (item: ButtonType) => {
    switch (item.action) {
      case "clear":
        clearAssistant();
        break;
      case "pop":
        popAssistant();
        break;
      case "follow-up":
        if (assistant.state === "speaking") {
          replaceAssistant({
            ...assistant,
            followUp: {
              placeholder: "Écrivez votre réponse...",
              autoFocus: true,
            },
            action: null,
          });
        }
        break;
      case "push":
        pushAssistant(item.assistant);
        break;
      case "replace":
        replaceAssistant(item.assistant);
        break;
      case "retry":
        onResponse && onResponse(item.response);
        break;
      case "response":
        onResponse && onResponse(item.text);
        break;
      default:
        // Handle any other cases or errors
        break;
    }
  }, []);

  return action.type === "list" ? (
    <View
      style={{
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 10,
        marginTop: 8,
      }}
    >
      {action.items.map((item, index) => (
        <Button
          key={index}
          item={item}
          index={index}
          onPress={() => {
            if (action.checkbox) {
              // setChecked((checked) => {
              //   if (checked?.includes(item.text)) {
              //     // if (checked.length === 1) return null;
              //     return checked?.filter((i) => i !== item.text);
              //   } else {
              //     return checked ? [...checked, item.text] : [item.text];
              //   }
              // });
            } else {
              // handleButtonClick(item);
            }
          }}
          // selected={checked?.includes(item.text)}
        />
      ))}
    </View>
  ) : null;
}

export default React.memo(Action);
