import { View, Text } from "react-native";
import React from "react";
import { AnimatePresence, MotiView } from "moti";
import { useAssistant } from "@/context/assistantContext";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon, { IconProps } from "@/components/Icon";
import Colors from "@/constants/Colors";
import { logRender } from "@/lib/utils";

function HeaderButton({
  icon,
  rotate,
  onPress,
  right,
  backgroundColor,
}: {
  icon: IconProps["icon"];
  rotate?: number;
  onPress: () => void;
  right?: boolean;
  backgroundColor?: string;
}) {
  // logRender("HeaderButton");

  return (
    <View
      style={{
        width: 35,
        height: "100%",
      }}
    >
      <AnimatePresence>
        <MotiView
          exit={{
            opacity: 0,
            translateX: right ? 10 : -10,
          }}
          animate={{
            opacity: 1,
            translateX: 0,
          }}
          from={{
            opacity: 0,
            translateX: right ? 10 : -10,
          }}
          transition={{
            type: "timing",
            duration: 200,
            delay: 100,
          }}
          exitTransition={{
            type: "timing",
            duration: 200,
            delay: 0,
          }}
          key={icon}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
          }}
        >
          <TouchableOpacity
            onPress={onPress}
            style={{
              width: 35,
              height: 35,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 20,
              backgroundColor: backgroundColor
                ? backgroundColor
                : "transparent",
            }}
          >
            <Icon
              icon={icon}
              size={20}
              color={Colors.light.primary}
              style={{
                transform: [
                  {
                    rotate: `${rotate || 0}deg`,
                  },
                ],
              }}
            />
          </TouchableOpacity>
        </MotiView>
      </AnimatePresence>
    </View>
  );
}

export default React.memo(HeaderButton);
