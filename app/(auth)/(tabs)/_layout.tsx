import Icon from "@/components/Icon";
import TabButton from "@/components/TabButton";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { padding } from "@/constants/values";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Stack, Tabs, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  Button,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
} from "react-native";
import { v4 as uuidv4 } from "uuid";
import "react-native-get-random-values";

export default function Layout() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  // useEffect(() => {
  //   if (user) {
  //     favel.getUser(user.id).then((res) => {
  //       console.log("res", res);
  //       if (!res.privateMetadata || !res.privateMetadata.origin) {
  //         MMKV.setString(
  //           `mandatoryInfos-${user.id}`,
  //           JSON.stringify({
  //             firstName: user.firstName ? false : true,
  //             origin: true,
  //           })
  //         );
  //         router.push("/(modals)/mandatoryInfos");
  //       }
  //     });
  //   }
  // }, [user]);

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
  });

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: Platform.OS === "ios" ? 80 : 65,
          paddingBottom: Platform.OS === "ios" ? 10 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarButton: (props) => {
            return (
              <TabButton
                icon={"tripsIcon"}
                {...props}
              />
            );
          },
        }}
        redirect={!isSignedIn}
      />
      <Tabs.Screen
        name="newTrip"
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            const id = uuidv4();
            console.log("id", id);
            router.push(`/(auth)/trip/${id}`);
          },
        })}
        options={{
          headerShown: false,
          tabBarButton: (props) => {
            return (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                  backgroundColor: "#fff",
                }}
              >
                <Pressable
                  {...props}
                  style={{
                    backgroundColor: Colors.light.accent,
                    width: 45,
                    height: 45,
                    borderRadius: 18,
                    shadowColor: Colors.light.accent,
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.5,
                    shadowRadius: 12,
                    elevation: 8,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Icon
                    icon={"plusIcon"}
                    color={"#fff"}
                    size={22}
                  />
                </Pressable>
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarButton: (props) => {
            return (
              <TabButton
                icon={"profileIcon"}
                {...props}
              />
            );
          },
        }}
        redirect={!isSignedIn}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    paddingHorizontal: padding,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.light.accent,
  },
});
