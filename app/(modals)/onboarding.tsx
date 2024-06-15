import { View, Text, Dimensions, SafeAreaView, Platform } from "react-native";
import React, { useEffect } from "react";
import Colors from "@/constants/Colors";
import { MMKV } from "../_layout";
import { Image } from "expo-image";
import { padding } from "@/constants/values";
import ContainedButton from "@/components/ContainedButton";
import { AnimatePresence, MotiView } from "moti";
import ParsedText from "react-native-parsed-text";
import { useRouter } from "expo-router";

const data = [
  {
    title: "**Glissez vers la gauche** pour **supprimer** les activités",
    image: require(`@/assets/images/onboarding/delete.png`),
  },
  {
    title: "**Glissez en haut ou en bas** pour **déplacer** les activités",
    image: require(`@/assets/images/onboarding/move.png`),
  },
  {
    title: "**Invitez** vos co-voyageurs, **planifiez ensemble**.",
    image:
      Platform.OS === "ios"
        ? require(`@/assets/images/onboarding/invite_ios.png`)
        : require(`@/assets/images/onboarding/invite_android.png`),
  },
  {
    title: "**Modifiez** votre voyage **à plusieurs, en temps réel**.",
    image: require(`@/assets/images/onboarding/modify.png`),
  },
  {
    title:
      "**Mentionnez @Favel** pour faire des **modifications** et obtenir des **informations**.",
    image: require(`@/assets/images/onboarding/mention.png`),
  },
  {
    title: "**Partagez vos voyages** avec vos proches.",
    image:
      Platform.OS === "ios"
        ? require(`@/assets/images/onboarding/share_ios.png`)
        : require(`@/assets/images/onboarding/share_android.png`),
  },
  {
    title: "**Suivez vos amis** pour voir leurs voyages.",
    image: require(`@/assets/images/onboarding/follow.png`),
  },
  {
    title: "**Revenez ici** dès que vous en avez besoin.",
    image: require(`@/assets/images/onboarding/help.png`),
  },
];

export default function onboarding() {
  useEffect(() => {
    MMKV.setStringAsync("onboardingSeen1", "true");
  }, []);

  // const player = useVideoPlayer(videoSource, (player) => {
  //   player.loop = true;
  //   player.play();
  // });

  const [currentPage, setCurrentPage] = React.useState(0);

  const [width, setWidth] = React.useState(0);

  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.light.accent,
      }}
    >
      <Image
        source={require("@/assets/images/gradient-bg.jpg")}
        style={{
          width: "100%",
          height: "100%",
          resizeMode: "cover",
        }}
      />
      <SafeAreaView
        style={{
          flex: 1,
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      >
        <View
          style={{
            flex: 1,
            padding: padding,
          }}
        >
          <View style={{}}>
            <Text
              style={{
                fontFamily: "Outfit_600SemiBold",
                fontSize: 18,
                color: "white",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              {currentPage + 1} sur {data.length}
            </Text>
            <View
              style={{
                position: "relative",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: 7,
                  backgroundColor: "white",
                  opacity: 0.5,
                  borderRadius: 7,
                }}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  setWidth(width);
                }}
              />
              <MotiView
                from={{
                  width: 0,
                }}
                animate={{
                  width: (width / data.length) * (currentPage + 1),
                }}
                transition={{
                  type: "timing",
                  duration: 500,
                }}
                style={{
                  // width: (width / data.length) * (currentPage + 1),
                  height: 7,
                  backgroundColor: "white",
                  borderRadius: 7,
                  position: "absolute",
                }}
              />
            </View>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <AnimatePresence
              initial={false}
              exitBeforeEnter
            >
              <MotiView
                key={currentPage}
                from={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  type: "timing",
                  duration: 250,
                }}
                style={{
                  flex: 1,
                  justifyContent: "flex-start",
                  alignItems: "center",
                  paddingTop: 20,
                }}
              >
                <ParsedText
                  style={{
                    fontFamily: "Outfit_400Regular",
                    fontSize: 28,
                    color: "white",
                    marginTop: 20,
                    width: "100%",
                  }}
                  parse={[
                    {
                      pattern: /\*\*(.*?)\*\*/,
                      style: {
                        fontFamily: "Outfit_700Bold",
                      },
                      renderText(matchingString, matches) {
                        return matchingString.replace(/\*\*/g, "");
                      },
                    },
                  ]}
                >
                  {data[currentPage].title}
                </ParsedText>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Image
                    source={data[currentPage].image}
                    style={{
                      width: "100%",
                      height: 400,
                      resizeMode: "contain",
                    }}
                  />
                  <View
                    style={{
                      height: 100,
                    }}
                  />
                </View>
              </MotiView>
            </AnimatePresence>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {currentPage > 0 ? (
              <ContainedButton
                title="Précédent"
                onPress={() => {
                  if (currentPage === 0) {
                    return;
                  } else {
                    setCurrentPage(currentPage - 1);
                  }
                }}
                style={{
                  backgroundColor: Colors.light.primary,
                }}
              />
            ) : (
              <View />
            )}
            <ContainedButton
              title={currentPage === data.length - 1 ? "Fermer" : "Suivant"}
              onPress={() => {
                if (currentPage === data.length - 1) {
                  router.dismiss();
                } else {
                  setCurrentPage(currentPage + 1);
                }
              }}
            />
          </View>
        </View>
      </SafeAreaView>
      {/* <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <Image
          source={require("@/assets/images/Screenshot 2024-06-08 at 17.16.43.jpeg")}
          style={{
            width: width - padding * 2,
            height: width - padding * 2,
            resizeMode: "contain",
          }}
        />
        <View
          style={{
            marginTop: 50,
          }}
        >
          <Text
            style={{
              fontFamily: "Outfit_600SemiBold",
              fontSize: 24,
              color: Colors.dark.primary,
              marginTop: 20,
              textAlign: "center",
            }}
          >
            Feature title
          </Text>
          <Text
            style={{
              fontFamily: "Outfit_400Regular",
              fontSize: 16,
              color: Colors.dark.primary,
              marginTop: 10,
              textAlign: "center",
            }}
          >
            Feature description
          </Text>
        </View>
      </View>
      <SafeAreaView
        style={{
          backgroundColor: "green",
        }}
      >
        <View
          style={{
            height: 50,
            backgroundColor: "red",
          }}
        ></View>
      </SafeAreaView> */}
    </View>
  );
}
