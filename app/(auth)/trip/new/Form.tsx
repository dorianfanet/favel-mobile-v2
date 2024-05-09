import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Keyboard,
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
import { capitalizeFirstLetter, getDaysDiff } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { newTripPrompts } from "@/data/prompts";
import { useTrip } from "@/context/tripContext";
import Colors from "@/constants/Colors";
import Question from "./Question";
import { Form as FormType, useNewTripForm } from "@/context/newTrip";
import { favel } from "@/lib/favelApi";
import { BlurView } from "@/components/Themed";
import { borderRadius, padding } from "@/constants/values";
import { destination } from "@turf/turf";
import ChatSuggestions from "../components/ChatSuggestions";
import ContainedButton from "@/components/ContainedButton";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { Picker } from "@react-native-picker/picker";
import { Image } from "expo-image";
import { AnimatePresence, View as MotiView } from "moti";

const suggestions = [
  "Balade dans les Alpes",
  "Séjour à Paris",
  "Road trip en Californie",
  "Découverte de l'Asie",
  "Je ne sais pas encore",
  "Châteaux de la Loire",
];

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

  const handleSubmit = async (
    duration: number,
    intensity: "chill" | "tourist" | "traveler"
  ) => {
    setTripMetadata((prev) => {
      return {
        ...(prev as TripMetadata),
        status: "new.route",
      };
    });
    setForm((prev) => {
      return {
        ...(prev as FormType),
        flexDates: {
          duration: duration.toString(),
          month: 0,
        },
        dynamism: intensity,
      };
    });
    const prompt = `
      Voici mes préférences :
      ${newTripPrompts.dynamism[intensity]}
    `;
    const { error } = await supabase
      .from("trips_v2")
      .update({
        preferences: {
          ...form,
          flexDates: {
            ...form.flexDates,
            duration: duration,
          },
        },
        prompt,
        dates: {
          type: "flexDates",
          duration: duration,
        },
        status: "new.route",
      })
      .eq("id", rest[0]);
    if (error) {
      console.error("Error updating trip", error);
    }
  };

  const handleSendDestination = async (duration: number) => {
    if (!form.destination) return;
    const data = await favel.fetchDestinationData(form.destination, duration);
    setDestinationData(data);
  };

  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["85%"], []);

  const { form, setForm } = useNewTripForm();

  useEffect(() => {
    if (tripMetadata!.status === "new.form") {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [tripMetadata!.status]);

  const [inputValue, setInputValue] = useState<string>("");

  const [keyboardStatus, setKeyboardStatus] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardStatus(true); // You can add your custom logic here for keyboard up event
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardStatus(false); // You can add your custom logic here for keyboard down event
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <>
      {tripMetadata!.status === "new" && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "position" : undefined}
          keyboardVerticalOffset={-100}
        >
          <View
            style={{
              position: "absolute",
              width: "100%",
              bottom: 0,
              height: 350,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: 40,
              // backgroundColor: keyboardStatus
              //   ? "transparent"
              //   : "rgba(0,0,0,0.5)",
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
            <ChatSuggestions
              data={suggestions}
              onPress={(destination) => {
                setForm((prev) => {
                  return {
                    ...(prev as FormType),
                    destination,
                  };
                });
                setTripMetadata((prev) => {
                  return {
                    ...(prev as TripMetadata),
                    status: "new.form",
                  };
                });
              }}
            />
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
                  setInputValue(text);
                }}
                value={inputValue}
                placeholder="Votre destination..."
                placeholderTextColor={"#ffffff71"}
              />
              <TouchableOpacity
                onPress={async () => {
                  setTripMetadata((prev) => {
                    return {
                      ...(prev as TripMetadata),
                      status: "new.form",
                    };
                  });
                  setForm({
                    ...form,
                    destination: inputValue,
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
            {/* <Text
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
          </Text> */}
          </View>
        </KeyboardAvoidingView>
      )}
      <FormBottomSheet
        bottomSheetRef={bottomSheetRef}
        snapPoints={snapPoints}
        handleSubmit={handleSubmit}
        handleSendDestination={handleSendDestination}
      />
    </>
  );
}

function FormBottomSheet({
  bottomSheetRef,
  snapPoints,
  handleSubmit,
  handleSendDestination,
}: {
  bottomSheetRef: React.RefObject<BottomSheet>;
  snapPoints: string[];
  handleSubmit: (
    duration: number,
    intensity: "chill" | "tourist" | "traveler"
  ) => void;
  handleSendDestination: (duration: number) => void;
}) {
  const [duration, setDuration] = useState<number | null>(null);
  const [intensity, setIntensity] = useState<
    "chill" | "tourist" | "traveler" | null
  >(null);

  const [page, setPage] = useState<number>(0);

  useEffect(() => {
    console.log(duration);
  }, [duration]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
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
          marginTop: 20,
        }}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            paddingBottom: 40,
          }}
        >
          <AnimatePresence exitBeforeEnter>
            {page === 0 ? (
              <MotiView
                from={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                }}
                exitTransition={{
                  type: "timing",
                  duration: 200,
                }}
                key="0"
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontFamily: "Outfit_600SemiBold",
                    color: "white",
                    marginBottom: 20,
                  }}
                >
                  Combien de temps partez-vous ?
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 20,
                    width: "80%",
                  }}
                >
                  <Picker
                    selectedValue={duration}
                    onValueChange={(itemValue, itemIndex) => {
                      setDuration(itemValue === -1 ? null : itemValue);
                    }}
                    style={{
                      flex: 1,
                    }}
                    itemStyle={{
                      fontSize: 22,
                      fontFamily: "Outfit_600SemiBold",
                      color: "white",
                    }}
                  >
                    <Picker.Item
                      label="---"
                      value={-1}
                    />
                    {Array.from({ length: 21 }).map((_, index) => (
                      <Picker.Item
                        key={index + 1}
                        label={(index + 1).toString()}
                        value={index + 1}
                      />
                    ))}
                  </Picker>
                  <Text
                    style={{
                      fontSize: 22,
                      fontFamily: "Outfit_600SemiBold",
                      color: "white",
                    }}
                  >
                    jours
                  </Text>
                </View>
              </MotiView>
            ) : null}
            {page === 1 ? (
              <MotiView
                from={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                }}
                exitTransition={{
                  type: "timing",
                  duration: 200,
                }}
                key="1"
                style={{
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontFamily: "Outfit_600SemiBold",
                    color: "white",
                    marginBottom: 20,
                    textAlign: "center",
                  }}
                >
                  Quelle intensité souhaitez-vous ?
                </Text>
                <View
                  style={{
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {intensityData.map((item: any) => (
                    <RadioButton
                      key={item.value}
                      onPress={async () => {
                        if (duration === null) return;
                        setIntensity(item.value);
                        await new Promise((resolve) =>
                          setTimeout(resolve, 300)
                        );
                        handleSubmit(duration, item.value);
                      }}
                      item={item}
                      selected={intensity === item.value}
                      noRadio
                    />
                  ))}
                </View>
              </MotiView>
            ) : null}
          </AnimatePresence>
        </View>
        {page === 0 ? (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ContainedButton
              title={page === 0 ? "Suivant" : "Créer mon voyage"}
              onPress={() => {
                if (!duration) return;
                setPage(1);
                handleSendDestination(duration);
              }}
              style={{
                width: "100%",
                opacity: duration ? 1 : 0.3,
              }}
              disabled={!duration}
            />
          </View>
        ) : null}
      </View>
    </BottomSheet>
  );
}

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

function RadioButton({
  onPress,
  item,
  selected = false,
  noRadio = false,
  containerStyle,
  contentStyle,
}: {
  onPress: () => void;
  item: {
    value: string;
    name: string;
    subTitle: string;
    emoji?: string;
    icon?: string;
  };
  selected: boolean;
  noRadio?: boolean;
  containerStyle?: any;
  contentStyle?: any;
}) {
  const animatedValue = useDerivedValue(() => {
    return selected ? 1 : 0;
  }, [selected]);

  const animatedStyles = useAnimatedStyle(() => {
    const borderColor = animatedValue.value === 1 ? "#44c0e7" : "#557594";
    const backgroundColor =
      animatedValue.value === 1 ? "#44c1e73b" : "transparent";
    const scale = animatedValue.value === 1 ? 1.05 : 1;

    return {
      borderColor: withTiming(borderColor, { duration: 300 }),
      backgroundColor: withTiming(backgroundColor, { duration: 300 }),
      transform: [{ scale: withTiming(scale, { duration: 300 }) }],
    };
  });

  const radioAnimatedStyles = useAnimatedStyle(() => {
    const backgroundColor = animatedValue.value === 1 ? "#44c0e7" : "#557594";

    return {
      backgroundColor: withTiming(backgroundColor, { duration: 300 }),
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: "90%",
          height: 70,
          borderRadius: borderRadius,
          margin: 10,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 4,
          borderColor: "#557594",
        },
        containerStyle,
        animatedStyles,
      ]}
    >
      <Pressable
        onPress={onPress}
        style={[
          {
            flexDirection: "row",
            width: "100%",
            height: "100%",
            paddingHorizontal: 20,
            gap: 20,
            justifyContent: "flex-start",
            alignItems: "center",
            position: "relative",
          },
          contentStyle,
        ]}
      >
        {!noRadio && (
          <Animated.View
            style={[
              {
                width: 16,
                height: 16,
                borderRadius: 20,
                backgroundColor: "#557594",
              },
              radioAnimatedStyles,
            ]}
          />
        )}
        <Text
          style={{
            fontSize: 30,
          }}
        >
          {item.emoji}
        </Text>
        <View>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontSize: 18,
              fontFamily: "Outfit_600SemiBold",
              color: "white",
            }}
          >
            {capitalizeFirstLetter(item.name)}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontSize: 14,
              fontFamily: "Outfit_500Medium",
              color: "white",
              opacity: 0.8,
            }}
          >
            {item.subTitle}
          </Text>
        </View>
        {/* {item.icon && (
          <View
            style={{
              position: "absolute",
              right: 20,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={icons[item.icon]}
              style={{
                width: 50,
                height: 20,
              }}
              contentFit="contain"
            />
          </View>
        )} */}
        {/* {item.emoji && (
          <View
            style={{
              position: "absolute",
              left: 20,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 30,
              }}
            >{item.emoji}</Text>
          </View>
        )} */}
      </Pressable>
    </Animated.View>
  );
}

const intensityData = [
  {
    value: "chill",
    name: "Faible",
    subTitle: "1 à 2 activités par jour",
    emoji: "🧘",
  },
  {
    value: "tourist",
    name: "Moyenne",
    subTitle: "2 à 3 activités par jour",
    emoji: "😎",
  },
  {
    value: "traveler",
    name: "Forte",
    subTitle: "3 activités et plus",
    emoji: "🔥",
  },
];
