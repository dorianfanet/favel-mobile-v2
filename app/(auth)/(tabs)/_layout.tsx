import Icon from "@/components/Icon";
import TabButton from "@/components/TabButton";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { padding } from "@/constants/values";
import { useAuth } from "@clerk/clerk-expo";
import { Tabs, useRouter } from "expo-router";
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

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
  });

  const renderHeaderBackground = useCallback(() => {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.accent,
        }}
      />
    );
  }, []);

  const router = useRouter();

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
          title: "",
          headerLeft: () => (
            <View style={styles.headerLeft}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Outfit_600SemiBold",
                  color: "#fff",
                }}
              >
                Voyages
              </Text>
            </View>
          ),
          headerBackground: renderHeaderBackground,
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
            router.navigate(`/(auth)/trip/${id}`);
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
          title: "",
          headerLeft: () => (
            <View style={styles.headerLeft}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Outfit_600SemiBold",
                  color: "#fff",
                }}
              >
                Profil
              </Text>
            </View>
          ),
          headerBackground: renderHeaderBackground,
          headerRight: () => <LogoutButton />,
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

export function LogoutButton() {
  const { isLoaded, signOut } = useAuth();
  if (!isLoaded) {
    return null;
  }
  return (
    <Pressable
      style={{
        paddingHorizontal: padding,
        backgroundColor: "transparent",
      }}
      onPress={() => signOut()}
    >
      <Icon
        icon={"logoutIcon"}
        size={24}
        color={"#fff"}
      />
    </Pressable>
  );
}
