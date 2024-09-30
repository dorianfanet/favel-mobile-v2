import { useColorScheme } from "react-native";
import React, { useEffect, useMemo } from "react";
import { useTrip } from "@/context/tripContext";
import { TripDay, TripEvent } from "@/types/trip";
import Mapbox, { MarkerView } from "@rnmapbox/maps";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { format } from "date-fns";
import useTheme from "@/hooks/useTheme";
import { Svg, Text as SvgText } from "react-native-svg";
import { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import {
  buffer,
  convex,
  Feature,
  LineString,
  Polygon,
  Properties,
} from "@turf/turf";

export default function Days() {
  const { state } = useTrip();

  const [days, setDays] = React.useState<TripDay[]>([]);
  // const [dayPolygons, setDayPolygons] = React.useState<
  //   Feature<Polygon, Properties>[]
  // >([]);

  useEffect(() => {
    setDays(state.days);
  }, [state.days]);

  const dayPolygons: Feature<Polygon, Properties>[] = useMemo(() => {
    const convexs: (Feature<Polygon, Properties> | null)[] = days.map((day) => {
      const dayEvent = state.events.filter((event) => event.dayId === day.id);
      return convex({
        type: "Feature",
        properties: {},
        geometry: {
          type: "MultiPoint",
          coordinates: dayEvent.map((event) => [
            event.centerPoint.lng,
            event.centerPoint.lat,
          ]),
        },
      });
    });

    return convexs.map((polygon) => {
      return buffer(polygon!, 0.5, { units: "kilometers" });
    });
  }, [days]);

  const geojsonDays: FeatureCollection<Geometry, GeoJsonProperties> =
    useMemo(() => {
      return {
        type: "FeatureCollection",
        features: days.map((day) => ({
          type: "Feature",
          properties: {
            id: day.id,
            name: day.name,
          },
          geometry: {
            type: "Point",
            coordinates: [day.centerPoint.lng, day.centerPoint.lat],
          },
        })),
      };
    }, [days]);

  const { invertedTheme, theme } = useTheme();

  return (
    <>
      <Mapbox.ShapeSource
        id="days"
        shape={geojsonDays}
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
      <Mapbox.ShapeSource
        id="dayPolygons"
        shape={{
          type: "FeatureCollection",
          features: dayPolygons,
        }}
      >
        <Mapbox.FillLayer
          id="dayPolygons"
          style={{
            fillColor: Colors[theme].accent,
            fillOpacity: 0.2,
          }}
        />
        <Mapbox.LineLayer
          id="dayPolygonsOutline"
          style={{
            lineColor: Colors[theme].accent,
            lineWidth: 2,
          }}
        />
      </Mapbox.ShapeSource>
      {days.map((day) => (
        <MarkerView
          key={day.id}
          coordinate={[day.centerPoint.lng, day.centerPoint.lat]}
          allowOverlap={true}
        >
          <View>
            <View
              style={{
                width: 40,
                height: 40,
                padding: 5,
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: Colors[invertedTheme].text.primary,
                borderWidth: 1,
                borderColor: Colors[theme].background.primary,
                shadowColor: Colors[theme].background.primary,
                shadowOffset: {
                  width: 0,
                  height: 0,
                },
                shadowOpacity: 0.5,
                shadowRadius: 10,
                elevation: 20,
              }}
            >
              <Text
                fontStyle="caption"
                style={{
                  color: Colors[theme].accent,
                  fontFamily: "Outfit_500Medium",
                }}
              >
                {format(day.date, "EEE")}
              </Text>
              <Text fontStyle="subtitle">{format(day.date, "dd")}</Text>
            </View>
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
                  {getTextWidth(day.name, 14)}
                </SvgText>
                <SvgText
                  fill={Colors[theme].text.primary}
                  fontSize="14"
                  x="70"
                  y="20"
                  textAnchor="middle"
                  fontFamily="Outfit_500Medium"
                >
                  {getTextWidth(day.name, 14)}
                </SvgText>
              </Svg>
            </View>
          </View>
        </MarkerView>
      ))}
    </>
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
