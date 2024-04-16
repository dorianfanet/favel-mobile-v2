import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Stack, useLocalSearchParams, useSegments } from "expo-router";
import Icon from "@/components/Icon";
import { QuestionType, Trip, TripMetadata } from "@/types/types";
import BottomSheet from "@gorhom/bottom-sheet";
import { TextInput } from "react-native-gesture-handler";
import { getDaysDiff } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { newTripPrompts } from "@/data/prompts";
import { useTrip } from "@/context/tripContext";
import Colors from "@/constants/Colors";
import Question from "./Question";
import { Form as FormType, useNewTripForm } from "@/context/newTrip";
import { favel } from "@/lib/favelApi";
import { BlurView } from "@/components/Themed";
import { borderRadius } from "@/constants/values";
import { destination } from "@turf/turf";

export default function Form() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);

  const {
    setTripMetadata,
    tripMetadata,
    setDestinationData,
    initialDestination,
  } = useTrip();

  useEffect(() => {
    if (initialDestination) {
      setForm((prev) => {
        return {
          ...(prev as FormType),
          destination: initialDestination,
        };
      });
    }
  }, [initialDestination]);

  const { rest } = useLocalSearchParams();

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setPrevIndex(currentIndex);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = async () => {
    if (currentIndex < data.length - 1) {
      setPrevIndex(currentIndex);
      setCurrentIndex((prev) => prev + 1);
      if (currentIndex === 0 && form.destination) {
        const data = await favel.fetchDestinationData(
          form.destination,
          form.flexDates.duration ? parseInt(form.flexDates.duration) : 4
        );
        console.log("Destination data", data);
        setDestinationData(data);
      }
    } else if (currentIndex === data.length - 1) {
      const diffTime = Math.abs(
        form.dates.departure.getTime() - form.dates.return.getTime()
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const prompt = `
        Voici mes préférences :
        ${Object.keys(form.preferences).map((key) => {
          const value = form.preferences[key as keyof typeof form.preferences];
          // @ts-ignore
          return newTripPrompts.preferences[key][value];
        })}
        ${
          form.travelersPreset && newTripPrompts.travelers[form.travelersPreset]
        }
        ${form.dynamism && newTripPrompts.dynamism[form.dynamism]}
        ${form.budget && newTripPrompts.budget[form.budget]}
      `;
      const { error } = await supabase
        .from("trips_v2")
        .update({
          preferences: {
            ...form,
            flexDates: {
              ...form.flexDates,
              duration: form.flexDates.duration
                ? parseInt(form.flexDates.duration)
                : 4,
            },
          },
          prompt,
          dates: {
            type: "flexDates",
            duration: form.flexDates.duration
              ? parseInt(form.flexDates.duration)
              : 4,
            month: form.flexDates.month,
          },
          status: "new.route",
        })
        .eq("id", rest[0]);
      if (error) {
        console.error("Error updating trip", error);
      }
    }
  };

  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["85%"], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const { form, setForm } = useNewTripForm();

  useEffect(() => {
    if (tripMetadata!.status === "new.form") {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [tripMetadata!.status]);

  return (
    <>
      {tripMetadata!.status === "new" && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={30}
          style={{
            position: "absolute",
            width: "100%",
            bottom: 0,
            height: 350,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: 40,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontFamily: "Outfit_600SemiBold",
              color: "white",
              marginBottom: 20,
            }}
          >
            Où partez-vous ?
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              margin: 10,
              marginHorizontal: 20,
            }}
          >
            <TextInput
              style={{
                height: 40,
                borderRadius: borderRadius,
                backgroundColor: "#1C344B",
                padding: 10,
                color: "white",
                flex: 1,
              }}
              onChangeText={(text) => {
                setForm({
                  ...form,
                  destination: text,
                });
              }}
              value={form.destination ? form.destination.toString() : ""}
              placeholder="Asie"
            />
            <TouchableOpacity
              onPress={async () => {
                setTripMetadata((prev) => {
                  return {
                    ...(prev as TripMetadata),
                    status: "new.form",
                  };
                });
              }}
              style={{
                backgroundColor: Colors.light.accent, // Button color
                // backgroundColor: "#0A84FF", // Button color
                height: 40,
                paddingHorizontal: 20,
                borderRadius: borderRadius,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontFamily: "Outfit_600SemiBold",
                }}
              >
                Valider
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Outfit_600SemiBold",
              color: "white",
              textAlign: "center",
              margin: 10,
              opacity: 0.8,
              width: "70%",
            }}
          >
            Vous pouvez indiquer ce que vous voulez, une ou plusieurs villes,
            une région, un pays, un continent... Si vous ne savez-pas dites "Je
            ne sais pas"
          </Text>
        </KeyboardAvoidingView>
      )}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backgroundStyle={styles.bottomSheet}
        backgroundComponent={(props) => (
          <View
            style={{
              flex: 1,
              padding: 0,
              margin: 0,
            }}
            {...props}
          >
            <BlurView />
          </View>
        )}
        handleIndicatorStyle={{
          backgroundColor: "white",
        }}
      >
        <View
          style={{
            position: "relative",
            flex: 1,
            marginBottom: 40,
            marginHorizontal: 15,
            marginTop: 0,
          }}
        >
          {prevIndex !== null && (
            <Question
              key={prevIndex}
              question={data[prevIndex]}
              exiting
            />
          )}
          <Question
            key={currentIndex}
            question={data[currentIndex]}
            onNext={handleNext}
          />
          <View
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: 30,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {currentIndex > 0 ? (
              <Pressable
                onPress={handlePrevious}
                style={styles.navigation}
              >
                <Icon
                  icon="chevronLeftIcon"
                  size={20}
                  color="white"
                />
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontFamily: "Outfit_600SemiBold",
                  }}
                >
                  Précédent
                </Text>
              </Pressable>
            ) : (
              <View />
            )}
            {data[currentIndex].skip && (
              <Pressable
                onPress={handleNext}
                style={styles.navigation}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontFamily: "Outfit_600SemiBold",
                  }}
                >
                  {currentIndex === data.length - 1
                    ? "Créer mon voyage"
                    : "Suivant"}
                </Text>
                <Icon
                  icon="chevronLeftIcon"
                  size={20}
                  color="white"
                  style={{
                    transform: [{ rotate: "180deg" }],
                  }}
                />
              </Pressable>
            )}
          </View>
        </View>
      </BottomSheet>
    </>
  );
}

const data: QuestionType[] = [
  // {
  //   id: "destination",
  //   name: "Où partez-vous ?",
  //   type: "text",
  //   skip: true,
  // },
  // {
  //   id: "dates",
  //   name: "À quelles dates partez-vous ?",
  //   type: "dates",
  //   skip: true,
  // },
  {
    id: "flexDates",
    name: "À quel moment partez-vous ?",
    type: "flexDates",
    skip: false,
  },
  {
    id: "budget",
    name: "Quel est votre budget ?",
    type: "radio",
    skip: false,
    options: {
      columns: 3,
      data: [
        {
          value: "low",
          name: "Petit",
          icon: "coin1",
        },
        {
          value: "medium",
          name: "Moyen",
          icon: "coin2",
        },
        {
          value: "high",
          name: "Élevé",
          icon: "coin3",
        },
      ],
    },
  },
  {
    id: "dynamism",
    name: "Dynamisme",
    type: "radio",
    skip: false,
    options: {
      columns: 3,
      data: [
        {
          value: "chill",
          name: "Tranquille",
        },
        {
          value: "tourist",
          name: "Touristique",
        },
        {
          value: "traveler",
          name: "Grand voyageur",
        },
      ],
    },
  },
  {
    id: "travelersPreset",
    name: "Avec qui partez-vous ?",
    type: "radio",
    skip: false,
    options: {
      data: [
        {
          value: "friends",
          name: "Entre amis",
        },
        {
          value: "family",
          name: "En famille",
        },
        {
          value: "couple",
          name: "En couple",
        },
        {
          value: "solo",
          name: "Seul",
        },
      ],
    },
  },
  // {
  //   id: "preferences",
  //   name: "Quelles sont vos envies ?",
  //   type: "preferences",
  //   skip: true,
  //   options: {
  //     data: [
  //       {
  //         value: "iconic",
  //         name: "Lieux incontournables",
  //       },
  //       {
  //         value: "outdoor",
  //         name: "Plein air",
  //       },
  //       {
  //         value: "culture",
  //         name: "Art et culture",
  //       },
  //       {
  //         value: "nightlife",
  //         name: "Vie nocturne",
  //       },
  //       {
  //         value: "sport",
  //         name: "Sport",
  //       },
  //       {
  //         value: "relax",
  //         name: "Détente",
  //       },
  //     ],
  //   },
  // },
];

const styles = StyleSheet.create({
  navigation: {
    flexDirection: "row",
    gap: 5,
  },
  bottomSheet: {
    // backgroundColor: Colors.light.background,
    // opacity: 0.5,
    // backgroundColor: "#1c344bd5",
  },
  list: {
    // paddingHorizontal: 15,
  },
});
