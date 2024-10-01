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
} from "@turf/turf";
import DayMarkers from "./DayMarkers";
import DayPolygons from "./DayPolygons";
import { clusterDays, createOgGeojsonDays } from "@/utils/map";
import { MapTripDay } from "@/types/map";
import NightMarkers from "./NightMarkers";
import EventMarkers from "./EventMarkers";
import { TripEvent, TripEventActivity } from "@/types/trip";

export default function Map() {
  const {
    easing,
    padding,
    zoom,
    minZoom,
    maxZoom,
    centerOrBounds,
    animationDuration,
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

  const [selectedDay, setSelectedDay] = useState<MapTripDay["id"] | null>(null);

  const selectedEvents: FeatureCollection<Point, TripEvent> = useMemo(() => {
    console.log("selectedDay", selectedDay);
    if (!selectedDay) return featureCollection([]);
    const events = state.events.filter((event) => event.dayId === selectedDay);
    const features = events.map((event) => {
      return point([event.centerPoint.lng, event.centerPoint.lat], event);
    });
    return featureCollection(features);
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
    >
      {/* Lines and Polygons */}
      <DayPolygons
        days={days}
        state={state}
      />

      {/* Markers */}
      <NightMarkers nights={state.nights} />
      <DayMarkers
        days={days}
        onPress={(id: string) => {
          console.log("id", id);
          setSelectedDay(id);
        }}
        selectedDay={selectedDay ? selectedDay : undefined}
      />
      <EventMarkers events={selectedEvents} />
    </MapView>
  );
}
