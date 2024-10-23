import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCamera } from "@/context/cameraContext";
import MapView from "@/components/Map/MapView";
import Mapbox from "@rnmapbox/maps";
import { useTrip } from "@/context/tripContext";
import {
  featureCollection,
  Feature,
  Point,
  Polygon,
  FeatureCollection,
  point,
  LineString,
  lineString,
} from "@turf/turf";
import DayMarkers from "./DayMarkers";
import DayPolygons from "./DayPolygons";
import { clusterDays, createOgGeojsonDays } from "@/utils/map";
import { MapTripDay } from "@/types/map";
import NightMarkers from "./NightMarkers";
import EventMarkers from "./EventMarkers";
import {
  TripDay,
  TripEvent,
  TripEventActivity,
  TripEventTransport,
} from "@/types/trip";
import TransportMarkers from "./TransportMarkers";
import { useTripNavigationActions } from "@/hooks/useTripNavigationActions";
import { PanResponder, Pressable } from "react-native";
import PressOnly from "@/components/PressOnly";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { View } from "@/components/Themed";
import { runOnJS, useSharedValue } from "react-native-reanimated";

type MapProps = {
  selectedDay?: TripDay | null;
  selectedTransportId?: string | null;
};

function Map({ selectedDay, selectedTransportId }: MapProps) {
  const {
    easing,
    padding,
    zoom,
    minZoom,
    maxZoom,
    centerOrBounds,
    animationDuration,
    move,
  } = useCamera();

  const mapRef = useRef<Mapbox.MapView>(null);
  const [prevZoomLevel, setPrevZoomLevel] = useState(0);
  const lastLogTime = useRef(Date.now());

  const { state } = useTrip();
  const [days, setDays] = useState<Feature<Point, MapTripDay>[]>([]);

  const ogGeojsonDays = useMemo(
    () => createOgGeojsonDays(state.days),
    [state.days]
  );

  useEffect(() => {
    setDays(ogGeojsonDays.features);
    move({
      coordinates: [
        {
          latitude: 37.724,
          longitude: -122.4556,
        },
      ],
      customZoom: 10,
    });
  }, [ogGeojsonDays]);

  const onRegionIsChanging = useCallback(async () => {
    const currentZoomLevel = await mapRef.current?.getZoom();
    // console.log("currentZoomLevel", currentZoomLevel);
    const roundedZoomLevel = Math.round(currentZoomLevel! * 2) / 2;

    const now = Date.now();
    const timeSinceLastLog = now - lastLogTime.current;

    if (roundedZoomLevel !== prevZoomLevel && timeSinceLastLog > 100) {
      setPrevZoomLevel(roundedZoomLevel);
      lastLogTime.current = now;

      const bounds = await mapRef.current?.getVisibleBounds();
      if (bounds) {
        const clusteredDays = await clusterDays(
          ogGeojsonDays,
          bounds,
          state.days
        );
        setDays(clusteredDays);
      }
    }
  }, [prevZoomLevel, ogGeojsonDays, state.days]);

  const {
    selectedActivities,
    selectedTransports,
  }: {
    selectedActivities: FeatureCollection<Point, TripEventActivity>;
    selectedTransports: FeatureCollection<LineString, TripEventTransport>;
  } = useMemo(() => {
    if (!selectedDay)
      return {
        selectedActivities: featureCollection([]),
        selectedTransports: featureCollection([]),
      };
    const events = state.events.filter((event) => {
      const dayStart = new Date(
        selectedDay.date.setHours(0, 0, 0, 0)
      ).getTime();
      const dayEnd = new Date(
        selectedDay.date.setHours(23, 59, 59, 999)
      ).getTime();

      const eventStart = new Date(event.start).getTime();
      const eventEnd = new Date(event.end).getTime();

      return eventStart <= dayEnd && eventEnd >= dayStart;
    });
    const activities = events.filter(
      (event) => event.type === "activity"
    ) as TripEventActivity[];
    const activitiesFeatures = activities.map((event) => {
      return point([event.place.longitude, event.place.latitude], event);
    });
    const transports = events.filter(
      (event) => event.type === "transport"
    ) as TripEventTransport[];
    // console.log(JSON.stringify(transports, null, 2));
    // const transportFeatures = transports.map((event) => {
    //   return lineString(
    //     [
    //       [
    //         event.transport.departureCoordinates.lng,
    //         event.transport.departureCoordinates.lat,
    //       ],
    //       [
    //         event.transport.arrivalCoordinates.lng,
    //         event.transport.arrivalCoordinates.lat,
    //       ],
    //     ],
    //     event
    //   );
    // });
    const transportFeatures = [
      lineString(
        [
          [
            transports[0].transport.departureCoordinates.lng,
            transports[0].transport.departureCoordinates.lat,
          ],
          [
            transports[0].transport.arrivalCoordinates.lng,
            transports[0].transport.arrivalCoordinates.lat,
          ],
        ],
        transports[0]
      ),
    ];
    return {
      selectedActivities: featureCollection(activitiesFeatures),
      selectedTransports: featureCollection(transportFeatures),
    };
  }, [selectedDay, state.days, state.events]);

  const { push, canPop, pop } = useTripNavigationActions();

  return (
    // <PressOnly
    //   onPress={(event) => {
    //     // if (canPop) {
    //     //   pop();
    //     // }
    //     console.log("Pressable pressed");
    //   mapRef.current?.queryRenderedFeaturesAtPoint(
    //     [event.x, event.y],
    //     ["days"], // Replace with your actual marker layer ID
    //     (err, features) => {
    //       if (err) {
    //         console.error(err);
    //         return;
    //       }

    //       // If no features (markers) were tapped, handle the map tap
    //       if (features.length === 0) {
    //         console.log("Map tapped at:");
    //         // Handle your map tap logic here
    //       }
    //     }
    //   );
    // }}
    // >

    <GestureDetector
      gesture={Gesture.Simultaneous(Gesture.Pan(), Gesture.Pinch())}
    >
      <Pressable
        onPress={() => {
          // console.log("Pressable pressed");
          if (canPop) {
            pop();
          }
        }}
        // disabled={isPanning}
        style={{
          flex: 1,
        }}
      >
        <MapView
          mapRef={mapRef}
          easing={easing}
          padding={padding}
          zoom={zoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          centerOrBounds={centerOrBounds}
          animationDuration={animationDuration}
          onCameraChanged={onRegionIsChanging}
        >
          {/* Lines and Polygons */}
          <DayPolygons
            days={days}
            state={state}
            mapRef={mapRef}
          />
          <TransportMarkers
            transportEvents={selectedTransports}
            mapRef={mapRef}
            onPress={() => {
              // console.log("Transport pressed");
            }}
            selectedTransportId={selectedTransportId}
          />

          {/* Markers */}
          <NightMarkers nights={state.nights} />
          <DayMarkers
            days={days}
            onPress={(id: string) => {
              push({
                bottomSheet: "calendar",
                selectedDay: state.days.find((day) => day.id === id) || null,
              });
            }}
            selectedDay={selectedDay ? selectedDay.id : undefined}
          />
          <EventMarkers events={selectedActivities} />
        </MapView>
        {/* // <PressOnly */}
        {/* //   onPress={() => {
    //     console.log("Pressable pressed");
    //   }}
    // >
    // <Pressable
    //   onPress={() => {
    //     console.log("Pressable pressed");
    //   }}
    //   style={{
    //     flex: 1,
    //   }}
    // > */}
      </Pressable>
    </GestureDetector>
  );
}

export default React.memo(Map);
