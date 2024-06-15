import Icon, { IconByKey } from "./Icon";
import {
  AccessibilityState,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../constants/Colors";

interface IButtonIconProps {
  icon: IconByKey;
  onPress?: any;
  accessibilityState?: AccessibilityState | undefined;
}

const TabButton = ({ icon, accessibilityState, onPress }: IButtonIconProps) => {
  const isFocused = accessibilityState?.selected;

  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
    >
      <View style={{ ...styles.button, opacity: isFocused ? 1 : 0.4 }}>
        <Icon
          color={isFocused ? colors.light.accent : colors.light.primary}
          icon={icon}
          size={isFocused ? 30 : 26}
        />
      </View>
    </Pressable>
  );
};

export default TabButton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
  },
  text: {
    marginLeft: 8,
    fontWeight: "bold",
  },
});
