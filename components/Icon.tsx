import { SvgXml } from "react-native-svg";
import { ColorValue } from "react-native";
import * as icons from "../constants/icons";

export type IconByKey = keyof typeof icons;

export interface IconProps {
  color: ColorValue;
  icon: IconByKey;
  size?: number;
  style?: any;
  pointerEvents?: "auto" | "none";
}

const Icon = ({ icon, size = 32, color, style, pointerEvents }: IconProps) => {
  return (
    <SvgXml
      xml={icons[icon]}
      width={size}
      height={size}
      color={color}
      style={style}
      pointerEvents={pointerEvents}
    />
  );
};

export default Icon;
