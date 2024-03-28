import {
  View,
  Pressable,
  FlatList,
  TextInput,
  ImageSourcePropType,
  ScrollView,
} from "react-native";
import React, { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import GridView from "@/components/GridView";
import { PreferencesList, QuestionType } from "@/types/types";
import { useNewTripForm } from "@/context/newTrip";
import { Image } from "expo-image";
import { borderRadius } from "@/constants/values";
import { Text } from "@/components/Themed";
import { months } from "@/constants/data";
import { capitalizeFirstLetter } from "@/lib/utils";

interface IconsMap {
  [key: string]: ImageSourcePropType;
}

const icons: IconsMap = {
  coin1: require("@/assets/icons/coin1.png"),
  coin2: require("@/assets/icons/coin2.png"),
  coin3: require("@/assets/icons/coin3.png"),
};

export default function Question({
  question,
  exiting = false,
  onNext,
}: {
  question: QuestionType;
  exiting?: boolean;
  onNext?: () => void;
}) {
  const opacity = useSharedValue(exiting ? 1 : 0);

  useEffect(() => {
    opacity.value = withDelay(
      exiting ? 300 : 800,
      withTiming(exiting ? 0 : 1, { duration: 500 })
    );
  }, [exiting]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const { form, setForm } = useNewTripForm();

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          bottom: 40,
          paddingTop: 20,
          width: "100%",
          // borderRadius: 15,
          // backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center",
        },
        animatedStyle,
      ]}
    >
      <Text
        style={{
          fontSize: 24,
          fontFamily: "Outfit_600SemiBold",
          color: "white",
          marginBottom: 20,
        }}
      >
        {question.name}
      </Text>
      {
        question.type === "radio" &&
          question.options.data.map((item: any) => (
            <RadioButton
              key={item.value}
              onPress={() => {
                setForm({
                  ...form,
                  [question.id]: item.value,
                });
                onNext && onNext();
              }}
              item={item}
              selected={form[question.id] === item.value}
            />
          ))
        //   )}
        // />
      }
      {question.type === "flexDates" && (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 30,
            height: 300,
            width: "100%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
              marginVertical: 10,
            }}
          >
            <TextInput
              style={{
                fontSize: 24,
                fontFamily: "Outfit_600SemiBold",
                color: "white",
              }}
              onChangeText={(text) => {
                const int: string = text.replace(/[^0-9]/g, "");

                setForm({
                  ...form,
                  flexDates: {
                    ...form.flexDates,
                    duration: parseInt(int) > 21 ? "21" : int,
                  },
                });
              }}
              value={
                form.flexDates.duration
                  ? form.flexDates.duration.toString()
                  : ""
              }
              placeholder="4"
              keyboardType="numeric"
            />
            <Text
              style={{
                fontSize: 24,
                fontFamily: "Outfit_600SemiBold",
                color: "white",
              }}
            >{` jours`}</Text>
          </View>
          <View
            style={{
              width: "100%",
              marginVertical: 10,
            }}
          >
            <ScrollView
              horizontal
              style={{
                width: "100%",
                height: 140,
              }}
            >
              {months.map((month, index) => (
                <RadioButton
                  key={`month-${index}`}
                  onPress={() => {
                    setForm({
                      ...form,
                      flexDates: {
                        ...form.flexDates,
                        month: index,
                      },
                    });
                    onNext && onNext();
                  }}
                  item={{
                    value: index.toString(),
                    name: month,
                  }}
                  selected={form.flexDates.month === index}
                  containerStyle={{
                    width: 120,
                    height: 120,
                  }}
                  contentStyle={{
                    flexDirection: "column",
                    justifyContent: "center",
                    paddingHorizontal: 10,
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      )}
      {/* {question.type === "dates" && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 0,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Outfit_600SemiBold",
              color: "white",
            }}
          >
            Du
          </Text>
          <DateTimePicker
            value={form.dates.departure}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, date) => {
              setForm({
                ...form,
                dates: {
                  ...form.dates,
                  departure: date || form.dates.departure,
                },
              });
            }}
          />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Outfit_600SemiBold",
              color: "white",
              marginLeft: 10,
            }}
          >
            Au
          </Text>
          <DateTimePicker
            value={form.dates.return}
            mode="date"
            display="default"
            minimumDate={form.dates.departure}
            maximumDate={
              new Date(
                new Date(form.dates.departure).setDate(
                  form.dates.departure.getDate() + 21
                )
              )
            }
            onChange={(event, date) => {
              setForm({
                ...form,
                dates: {
                  ...form.dates,
                  return: date || form.dates.return,
                },
              });
            }}
          />
        </View>
      )} */}
      {/* {question.type === "preferences" && (
        <FlatList
          data={question.options.data}
          style={{ width: "100%" }}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 2,
                backgroundColor: "#ffffff2f",
                opacity: 0.5,
              }}
            />
          )}
          renderItem={({
            item,
          }: {
            item: { value: PreferencesList; name: string };
          }) => (
            <View
              style={{
                // backgroundColor: "#ffffff",
                borderRadius: 10,
                padding: 10,
                margin: 5,
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Outfit_600SemiBold",
                  textAlign: "left",
                  color: "white",
                }}
              >
                {item.name}
              </Text>
              <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={0}
                maximumValue={5}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#ffffff2f"
                step={1}
                value={form.preferences[item.value]}
                onValueChange={(value) => {
                  setForm({
                    ...form,
                    preferences: {
                      ...form.preferences,
                      [item.value]: value,
                    },
                  });
                }}
              />
            </View>
          )}
        />
      )} */}
      {question.type === "text" && (
        <TextInput
          style={{
            height: 40,
            width: "80%",
            borderRadius: borderRadius,
            backgroundColor: "#50aece",
            padding: 10,
            margin: 10,
            color: "white",
          }}
          onChangeText={(text) => {
            setForm({
              ...form,
              [question.id]: text,
            });
          }}
          value={form[question.id] ? form[question.id]?.toString() : ""}
          placeholder="Californie, Paris, ..."
        />
      )}
    </Animated.View>
  );
}

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
          height: 60,
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
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            fontSize: 18,
            fontFamily: "Outfit_600SemiBold",
            textAlign: "center",
            color: "white",
          }}
        >
          {capitalizeFirstLetter(item.name)}
        </Text>
        {item.icon && (
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
        )}
      </Pressable>
    </Animated.View>
  );
}
