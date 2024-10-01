import React, { useMemo } from "react";
import Mapbox, { MarkerView } from "@rnmapbox/maps";
import { Feature, featureCollection, Point } from "@turf/turf";
import { MapTripDay } from "@/types/map";
import { View } from "@/components/Themed";
import useTheme from "@/hooks/useTheme";
import Colors from "@/constants/Colors";
import Icon from "@/components/Icon";
import { Text } from "@/components/Themed";
import { format } from "date-fns";
import { Svg, Text as SvgText } from "react-native-svg";
import { TouchableOpacity } from "react-native";

interface DayMarkersProps {
  days: Feature<Point, MapTripDay>[];
  onPress?: (id: string) => void;
  selectedDay?: string;
}

export default function DayMarkers({
  days,
  onPress,
  selectedDay,
}: DayMarkersProps) {
  const daysFC = useMemo(() => {
    return featureCollection(days);
  }, [days]);

  const handleOnPress = (id: string) => {
    if (onPress) {
      onPress(id);
    }
  };

  return (
    <>
      <Mapbox.ShapeSource
        id="days"
        shape={daysFC}
      >
        <Mapbox.SymbolLayer
          id="days"
          style={{
            iconImage: "harbor",
            iconAllowOverlap: true,
            textAllowOverlap: true,
            textField: "Golden Gate Park",
            textAnchor: "center",
            textOffset: [0, 2],
            iconSize: 3,
            iconOpacity: 0,
            textOpacity: 0,
          }}
        />
      </Mapbox.ShapeSource>
      {days.map((day) =>
        day.properties.id === selectedDay ? null : (
          <MarkerView
            key={day.properties.id}
            coordinate={[
              day.properties.centerPoint.lng,
              day.properties.centerPoint.lat,
            ]}
            allowOverlap={true}
            onTouchEnd={() => {
              console.log(day.properties.id);
            }}
          >
            <DayMarker
              day={day.properties}
              onPress={handleOnPress}
            />
          </MarkerView>
        )
      )}
    </>
  );
}

interface DayMarkerProps {
  day: MapTripDay;
  onPress: (id: string) => void;
}

function DayMarker({ day, onPress }: DayMarkerProps) {
  const { invertedTheme, theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => {
        console.log(day.id);
        onPress(day.id);
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
        }}
      >
        {day.dates.map((date) =>
          Array.isArray(date) ? (
            <DateRangeMarker
              key={date[0].toISOString()}
              startDate={date[0]}
              endDate={date[1]}
            />
          ) : (
            <SingleDateMarker
              key={date.toISOString()}
              date={date}
            />
          )
        )}
      </View>
      {day.name && <DayName name={day.name} />}
    </TouchableOpacity>
  );
}

interface DateRangeMarkerProps {
  startDate: Date;
  endDate: Date;
}

function DateRangeMarker({ startDate, endDate }: DateRangeMarkerProps) {
  const { invertedTheme, theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "center",
        gap: -5,
      }}
    >
      <DateBox date={endDate} />
      <DateBox date={startDate} />
      <View
        style={{
          position: "absolute",
          left: 24,
          transform: [{ rotate: "180deg" }],
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon
          icon="chevronLeftIcon"
          size={24}
          color={Colors[theme].accent}
        />
      </View>
    </View>
  );
}

interface SingleDateMarkerProps {
  date: Date;
}

function SingleDateMarker({ date }: SingleDateMarkerProps) {
  return <DateBox date={date} />;
}

interface DateBoxProps {
  date: Date;
}

function DateBox({ date }: DateBoxProps) {
  const { invertedTheme, theme } = useTheme();

  return (
    <View
      style={{
        width: 40,
        height: 40,
        padding: 5,
        borderRadius: 13,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors[invertedTheme].text.primary,
        borderWidth: 1.5,
        borderColor: Colors[theme].background.primary,
        shadowColor: Colors[theme].background.primary,
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 20,
        gap: -3,
      }}
    >
      <Text
        fontStyle="caption"
        style={{
          color: Colors[theme].accent,
          fontFamily: "Outfit_500Medium",
        }}
      >
        {format(date, "EEE")}
      </Text>
      <Text fontStyle="subtitle">{format(date, "dd")}</Text>
    </View>
  );
}

interface DayNameProps {
  name: string;
}

function DayName({ name }: DayNameProps) {
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
          fill={Colors[theme].text.primary}
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
