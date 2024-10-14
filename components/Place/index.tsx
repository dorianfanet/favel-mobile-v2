import { Dimensions, FlatList } from "react-native";
import React from "react";
import ImageWithFallback from "../ImageWithFallback";
import Hero from "./Hero";
import Section from "./Section";
import { Text, View } from "../Themed";

const { height } = Dimensions.get("window");

interface PlaceProps {
  heroHeight: number;
}

export default function Place({ heroHeight }: PlaceProps) {
  return (
    <>
      <Hero heroHeight={heroHeight} />
      <View
        style={{
          height: 50,
        }}
      />
      <Section
        title="Photos"
        link="View all"
      >
        <FlatList
          horizontal
          data={sampleActivity.photos}
          renderItem={({ item }) => (
            <ImageWithFallback
              source={{
                uri: "https://t0.gstatic.com/images?q=tbn:ANd9GcQhTcxFEt1I1oDT-LW8smNaJV9_-SFtiUMfJ9QSRD-awVC0xkg4",
              }}
              style={{
                width: 110,
                height: 160,
                borderRadius: 15,
                marginRight: 10,
              }}
            />
          )}
          keyExtractor={(item) => item}
        />
      </Section>
      <Section title="Description">
        <Text>
          Golden Gate Park, located in San Francisco, California, United States,
          is a large urban park consisting of 1,017 acres of public grounds. It
          is administered by the San Francisco Recreation & Parks Department,
          which began in 1871 to oversee the development of Golden Gate Park.
          Configured as a rectangle, it is similar in shape to but 20 percent
          larger than Central Park in New York City, to which it is often
          compared. It is over three miles long east to west, and about half a
          mile north to south. With 24 million visitors annually, Golden Gate is
          the third most visited city park in the United States after Central
          Park and the Lincoln Memorial.
        </Text>
      </Section>
      <View
        style={{
          height: 30,
        }}
      />
    </>
  );
}

const sampleActivity = {
  id: "eaec6f69-5395-4d60-ada8-5d084c50a0b2",
  createdAt: "2024-10-02T20:32:46.715006+00:00",
  updatedAt: null,
  coordinates: "0101000020E610000018EE5C18E99E5EC081DDFAFA6BE24240",
  category: "nature",
  rating: 4.8,
  totalReviews: 43439,
  longitude: -122.482977,
  latitude: 37.7689203,
  thumbnail: null,
  gmapsPlaceId: "ChIJY_dFYHKHhYARMKc772iLvnE",
  lang: "en",
  name: "Golden Gate Park",
  description: null,
  openingHours: null,
  reviews: [
    {
      id: 11,
      createdAt: "2024-10-02T20:32:46.886997+00:00",
      updatedAt: null,
      rating: 5,
      text: "Golden Gate Park is a fantastic spot to enjoy the outdoors. I visited specifically to see the beautiful dahlias, and they did not disappoint! The park itself is expansive and offers so much more than just gardens, including concerts and a wide variety of events throughout the year. Whether you’re there for a peaceful stroll or to enjoy a lively event, the park provides a perfect backdrop for any outdoor activity. Definitely worth a visit!",
      authorName: "Cara H.",
      authorPhoto:
        "https://lh3.googleusercontent.com/a-/ALV-UjVV9xtv528VuhaS_vlAYez-LMydEi_1I-6LBHldx41TSYQeJG8pNA=s128-c0x00000000-cc-rp-mo-ba5",
      source: "google",
      time: "1970-01-20T23:53:49.463+00:00",
      language: "en",
      originalLanguage: "en",
      translated: false,
    },
    {
      id: 12,
      createdAt: "2024-10-02T20:32:46.886997+00:00",
      updatedAt: null,
      rating: 5,
      text: "An amazing park. If you want to be alone with nature, listen to birds singing, watch ducks, hear the rustle of the wind, and just have a good time with friends, this large, beautiful, well-maintained park is the place for you.\n\nWe enjoyed a 3-hour walk in the park, saw beautiful plants, and had our lunch on a green lawn. Nature always brings a boost of energy and tranquility. You will love it.",
      authorName: "Arpik Khanakhian",
      authorPhoto:
        "https://lh3.googleusercontent.com/a-/ALV-UjVAaFhX-dpy7vhhw9ixz7v6M2EN0VNHpm8Kafx-3A-i_tEUTd0=s128-c0x00000000-cc-rp-mo-ba4",
      source: "google",
      time: "1970-01-20T21:37:03.884+00:00",
      language: "en",
      originalLanguage: "en",
      translated: false,
    },
    {
      id: 13,
      createdAt: "2024-10-02T20:32:46.886997+00:00",
      updatedAt: null,
      rating: 5,
      text: "My family & I are visiting San Francisco & we came to Golden Gate Park to go  see the Japanese Gardens & park is so beautiful & it has 2 museums & botanical gardens & lots to do!! You definitely need a full day to go sight seeing here! It's beyond gorgeous! Green lush grass & beautiful flowers! Pathway to walk & Dog friendly!",
      authorName: "Josie Federico",
      authorPhoto:
        "https://lh3.googleusercontent.com/a-/ALV-UjUT0ugOn9kSbxQJfVJLtPj6L3gyrgAlGmMLKHTrOlkKDieS2zv8Kw=s128-c0x00000000-cc-rp-mo-ba3",
      source: "google",
      time: "1970-01-20T22:35:56.926+00:00",
      language: "en",
      originalLanguage: "en",
      translated: false,
    },
    {
      id: 14,
      createdAt: "2024-10-02T20:32:46.886997+00:00",
      updatedAt: null,
      rating: 5,
      text: "Just so Beautiful and so many different routes to walk. Various different terrains and things to look at. Lots of wildlife, places to play sports, lovely lakes. Massive trees. We spent hours here just wondering around. We walked all the way through and ended up at a beach at the end of it. Stopping off for dinner at a spot not far from the beach. We Loved it.",
      authorName: "Karen Whittard",
      authorPhoto:
        "https://lh3.googleusercontent.com/a/ACg8ocLpaorVh54fkRRmS0xgSV-1ZoyP0mEwRXGBBNw-Nh4WdzIfA=s128-c0x00000000-cc-rp-mo-ba5",
      source: "google",
      time: "1970-01-20T21:19:41.239+00:00",
      language: "en",
      originalLanguage: "en",
      translated: false,
    },
    {
      id: 15,
      createdAt: "2024-10-02T20:32:46.886997+00:00",
      updatedAt: null,
      rating: 5,
      text: "Golden Gate Park is a very beautiful park to spend an entire day. It has interesting museums, exhibits, and gardens. It’s so large that you’ll need the whole day to explore it, but there are many spots to unwind with family. It also has good areas for picnicking, and there are places where you can buy food and drinks.",
      authorName: "Hecvi V",
      authorPhoto:
        "https://lh3.googleusercontent.com/a/ACg8ocIFbqeSyQ5bjOZfEur47ZORHA_5iFsPiEE906iDfOFs4ZImMVM=s128-c0x00000000-cc-rp-mo-ba5",
      source: "google",
      time: "1970-01-20T22:35:10.948+00:00",
      language: "en",
      originalLanguage: "en",
      translated: false,
    },
  ],
  photos: ["1", "2", "3", "4", "5", "6", "7"],
};
