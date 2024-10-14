import Icon, { IconProps } from "@/components/Icon";
import { View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import useTheme from "@/hooks/useTheme";
import { MarkerView } from "@rnmapbox/maps";
import { Position } from "@turf/turf";
import React from "react";
import { Svg, Text as SvgText } from "react-native-svg";

function MapMarker({
  id,
  name,
  coordinates,
  icon,
  color,
}: {
  id: string;
  name: string;
  coordinates: Position;
  icon?: IconProps["icon"];
  color?: string;
}) {
  const { theme } = useTheme();

  return (
    <MarkerView
      key={id}
      coordinate={coordinates}
      allowOverlap={true}
    >
      <View
        style={{
          zIndex: 20,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: color ? color : Colors[theme].background.primary,
            borderWidth: 2,
            borderColor: Colors[theme].background.secondary,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: color ? color : "transparent",
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: 0.2,
            shadowRadius: 10,
          }}
        >
          {icon ? (
            <Icon
              icon={icon}
              size={20}
              color={Colors[theme].background.secondary}
              strokeWidth={2}
              // style={{ marginTop: 8, marginLeft: 8 }}
            />
          ) : null}
        </View>
        <Name
          name={name}
          color={color}
        />
      </View>
    </MarkerView>
  );
}

export default React.memo(MapMarker);

function Name({ name, color }: { name: string; color?: string }) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        position: "absolute",
        left: -80,
        top: 40,
        width: 200,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Svg
        height="60"
        width="140"
      >
        <SvgText
          fill="none"
          stroke={Colors[theme].background.secondary}
          strokeWidth={2}
          fontSize="14"
          x="70"
          y="20"
          textAnchor="middle"
          fontFamily="Outfit_500Medium"
        >
          {getTextWidth(name, 14)}
        </SvgText>
        <SvgText
          fill={color ? color : Colors[theme].text.primary}
          fontSize="14"
          x="70"
          y="20"
          textAnchor="middle"
          fontFamily="Outfit_500Medium"
        >
          {getTextWidth(name, 14)}
        </SvgText>
      </Svg>
    </View>
  );
}

function getTextWidth(text: string, fontSize: number) {
  const fontWidth = text.length * fontSize;

  if (fontWidth > 250) {
    return text.slice(0, 18) + "...";
  } else {
    return text;
  }
}
