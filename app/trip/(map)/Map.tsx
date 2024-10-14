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

export default function Map() {
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

  const [selectedDay, setSelectedDay] = useState<TripDay | null>(null);

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
    console.log(JSON.stringify(transports, null, 2));
    const transportFeatures = transports.map((event) => {
      return lineString(
        [
          [
            event.transport.departureCoordinates.lng,
            event.transport.departureCoordinates.lat,
          ],
          [
            event.transport.arrivalCoordinates.lng,
            event.transport.arrivalCoordinates.lat,
          ],
        ],
        event
      );
    });
    return {
      selectedActivities: featureCollection(activitiesFeatures),
      selectedTransports: featureCollection(transportFeatures),
    };
  }, [selectedDay, state.days, state.events]);

  return (
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
      onPress={() => setSelectedDay(null)}
    >
      {/* Lines and Polygons */}
      <DayPolygons
        days={days}
        state={state}
      />
      <TransportMarkers
        transportEvents={selectedTransports}
        mapRef={mapRef}
      />

      {/* Markers */}
      <NightMarkers nights={state.nights} />
      <DayMarkers
        days={days}
        onPress={(id: string) => {
          setSelectedDay(state.days.find((day) => day.id === id) || null);
        }}
        selectedDay={selectedDay ? selectedDay.id : undefined}
      />
      <EventMarkers events={selectedActivities} />
    </MapView>
  );
}
