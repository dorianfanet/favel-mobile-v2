import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { useTrip } from "@/context/tripContext";
import { Coordinate, useCamera } from "@/context/cameraContext";
import { Position } from "@turf/turf";

export default function Loading() {
  const { trip, tripMetadata } = useTrip();
  const { move } = useCamera();

  useEffect(() => {
    if (tripMetadata && tripMetadata.status === "trip.loading" && trip) {
      if (trip.length > 0) {
        const lastDay = trip[trip.length - 1];
        if (lastDay.transfer && lastDay.activities) {
          const lastActivity =
            lastDay.activities[lastDay.activities.length - 1];
          if (
            lastDay.activities.length === 0 &&
            lastDay.origin &&
            lastDay.origin_coordinates &&
            lastDay.coordinates
          ) {
            move({
              coordinates: [
                {
                  latitude: lastDay.origin_coordinates[1],
                  longitude: lastDay.origin_coordinates[0],
                },
                {
                  latitude: lastDay.coordinates[1],
                  longitude: lastDay.coordinates[0],
                },
              ],
            });
          } else if (lastActivity && lastActivity.route) {
            const route = lastActivity.route;
            const bounds: Coordinate[] = [];
            bounds.push({
              latitude: route.geometry.coordinates[0][1],
              longitude: route.geometry.coordinates[0][0],
            });
            bounds.push({
              latitude:
                route.geometry.coordinates[
                  route.geometry.coordinates.length - 1
                ][1],
              longitude:
                route.geometry.coordinates[
                  route.geometry.coordinates.length - 1
                ][0],
            });
            move({
              coordinates: bounds,
              customZoom: 12,
            });
          } else {
            const bounds: Coordinate[] = [];
            lastDay.activities.forEach((activity) => {
              if (!activity.route && activity.coordinates) {
                bounds.push({
                  latitude: activity.coordinates.latitude,
                  longitude: activity.coordinates.longitude,
                });
              }
            });
            move({
              coordinates: bounds,
              customZoom: 12,
            });
          }
        } else if (lastDay.activities) {
          const bounds: Coordinate[] = [];
          lastDay.activities.forEach((activity) => {
            if (activity.coordinates) {
              bounds.push({
                latitude: activity.coordinates.latitude,
                longitude: activity.coordinates.longitude,
              });
            }
          });
          move({
            coordinates: bounds,
            customZoom: 12,
          });
        }
      }
    } else if (tripMetadata && tripMetadata.route) {
      move({
        coordinates: tripMetadata.route.map((route) => {
          return {
            latitude: route.coordinates[1],
            longitude: route.coordinates[0],
          };
        }),
        customZoom: 10,
      });
    }
  }, [trip, tripMetadata?.status]);

  return <></>;
}
