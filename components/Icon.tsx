import { SvgXml } from "react-native-svg";
import { ColorValue } from "react-native";
import * as icons from "../constants/icons";

export type IconByKey = keyof typeof icons;

export interface IconProps {
  color: ColorValue;
  icon: IconByKey;
  strokeWidth?: number;
  size?: number;
  style?: any;
  pointerEvents?: "auto" | "none";
}

const Icon = ({
  icon,
  size = 32,
  strokeWidth = 2,
  color,
  style,
  pointerEvents,
}: IconProps) => {
  let iconSvg = icons[icon];

  iconSvg = iconSvg.replace("customStrokeWidth", strokeWidth.toString());

  return (
    <SvgXml
      xml={iconSvg}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      color={color}
      style={style}
      pointerEvents={pointerEvents}
    />
  );
};

export default Icon;
