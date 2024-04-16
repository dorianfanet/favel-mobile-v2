import { View, Text, Touchable, TouchableOpacity } from "react-native";
import React, { useEffect, useRef } from "react";
import { defaultAnimationDuration, useCamera } from "@/context/cameraContext";
import { FeatureCollection } from "@turf/turf";
import { MarkerView } from "@rnmapbox/maps";
import { BlurView } from "@/components/Themed";
import { Form, useNewTripForm } from "@/context/newTrip";
import { useTrip } from "@/context/tripContext";

interface Suggestion {
  name: string;
  coordinates: number[];
}

export default function Suggestions() {
  const { move, setAnimationDuration, animationDuration } = useCamera();
  const currentLongitude = useRef(0);
  const isMapReady = useRef(false);
  const { setInitialDestination } = useTrip();

  useEffect(() => {
    // create a infinite animation of the earth spinning
    const interval = setInterval(() => {
      if (!isMapReady.current) {
        isMapReady.current = true;
        return;
      }
      if (currentLongitude.current < 180) {
        currentLongitude.current = currentLongitude.current + 2;
      } else {
        currentLongitude.current = -180;
      }
      move({
        coordinates: [
          {
            latitude: 0,
            longitude: currentLongitude.current,
          },
        ],
        customZoom: 0,
        customEasing: "linearTo",
      });
    }, animationDuration);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const [suggestions, setSuggestions] = React.useState<Suggestion[] | null>(
    null
  );

  useEffect(() => {
    // select 10 random suggestions in data
    const randomSuggestions = data.sort(() => 0.5 - Math.random()).slice(0, 30);
    setSuggestions(randomSuggestions);
  }, []);

  return (
    <>
      {suggestions &&
        suggestions.map((suggestion, index) => (
          <MarkerView
            key={index}
            id={`${suggestion.name}-${index}`}
            coordinate={suggestion.coordinates}
          >
            <TouchableOpacity
              onPress={() => {
                setInitialDestination(suggestion.name);
              }}
            >
              <BlurView
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 10,
                  flex: 0,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontFamily: "Outfit_500Medium",
                    fontSize: 12,
                  }}
                >
                  {suggestion.name}
                </Text>
              </BlurView>
            </TouchableOpacity>
          </MarkerView>
        ))}
    </>
  );
}

const data = [
  {
    name: "Aventure en Amazonie",
    coordinates: [-74.006, -4.0008],
  },
  {
    name: "Découverte des temples d'Angkor",
    coordinates: [103.8678, 13.4131],
  },
  {
    name: "Randonnée dans les Rocheuses",
    coordinates: [-106.3171, 39.0524],
  },
  {
    name: "Détente aux Maldives",
    coordinates: [73.5, 3.2],
  },
  {
    name: "Visite de Berlin",
    coordinates: [13.3889, 52.517],
  },
  {
    name: "Observation de la faune en Afrique du Sud",
    coordinates: [31.3333, -24.5],
  },
  {
    name: "Dégustation de vins en Italie",
    coordinates: [10.75, 43.75],
  },
  {
    name: "Plongée en Australie",
    coordinates: [147.7769, -16.1478],
  },
  {
    name: "Exploration des souks au Maroc",
    coordinates: [-7.989, 31.63],
  },
  {
    name: "Pèlerinage sur le chemin de Compostelle",
    coordinates: [-2.5493, 43.35],
  },
  {
    name: "Aurores boréales en Islande",
    coordinates: [-19.0372, 64.9631],
  },
  {
    name: "Visite des châteaux en France",
    coordinates: [1.25, 47.5],
  },
  {
    name: "Découverte des ruines au Pérou",
    coordinates: [-72.545, -13.1631],
  },
  {
    name: "Relaxation à Bali",
    coordinates: [115.1461, -8.6503],
  },
  {
    name: "Navigation sur le Nil",
    coordinates: [32.6, 24.8],
  },
  {
    name: "Tradition à Kyoto",
    coordinates: [135.7688, 35.0062],
  },
  {
    name: "Randonnée en Italie",
    coordinates: [9.72, 44.1],
  },
  {
    name: "Visite des temples en Birmanie",
    coordinates: [94.8667, 21.1667],
  },
  {
    name: "Exploration des glaciers en Patagonie",
    coordinates: [-72.5, -50.0],
  },
  {
    name: "Découverte des marchés en Thaïlande",
    coordinates: [100.5018, 13.7563],
  },
  {
    name: "Aventure dans le désert en Jordanie",
    coordinates: [36.2, 31.0],
  },
  {
    name: "Détente sur les plages aux Seychelles",
    coordinates: [55.6761, -4.6796],
  },
  {
    name: "Randonnée en Nouvelle-Zélande",
    coordinates: [174.7633, -41.2865],
  },
];
