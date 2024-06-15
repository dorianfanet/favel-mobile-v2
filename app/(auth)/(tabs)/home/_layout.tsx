import { View, Text, Pressable, TouchableOpacity } from "react-native";
import React, { useCallback, useEffect } from "react";
import { Link, Stack, useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import Icon from "@/components/Icon";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { supabaseClient } from "@/lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";

export default function ProfileLayout() {
  const router = useRouter();

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

  return (
    <Stack
      screenOptions={{
        title: "",
        headerBackground: renderHeaderBackground,
        headerTitleStyle: {
          fontFamily: "Outfit_600SemiBold",
          fontSize: 18,
          color: "#fff",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Accueil",
          // headerLeft: () => (
          //   <View
          //     style={{
          //       flexDirection: "row",
          //       alignItems: "center",
          //       gap: 10,
          //       backgroundColor: Colors.light.accent,
          //     }}
          //   >
          //     <Text
          //       style={{
          //         fontSize: 18,
          //         fontFamily: "Outfit_600SemiBold",
          //         color: "#fff",
          //       }}
          //     >
          //       Accueil
          //     </Text>
          //   </View>
          // ),
          headerBackground: renderHeaderBackground,
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 20,
                width: 60,
              }}
            >
              <NotificationsIcon />
              <Link
                href="/(auth)/conversations"
                asChild
              >
                <TouchableOpacity>
                  <Icon
                    icon="messageDotsIcon"
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </Link>
            </View>
          ),
          // headerLeft: () => (
          //   <TouchableOpacity
          //     onPress={() => router.push("/(modals)/onboarding")}
          //   >
          //     <Icon
          //       icon={"menuIcon"}
          //       size={24}
          //       color={"#fff"}
          //     />
          //   </TouchableOpacity>
          // ),
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: "Notifications",
          headerTitleStyle: {
            fontFamily: "Outfit_600SemiBold",
            fontSize: 18,
            color: "#fff",
          },
          // headerLeft: () => (
          //   <TouchableOpacity
          //     style={{
          //       flexDirection: "row",
          //       alignItems: "center",
          //       gap: 5,
          //       backgroundColor: "transparent",
          //     }}
          //     onPress={() => router.back()}
          //   >
          //     <Icon
          //       icon={"chevronLeftIcon"}
          //       color={"#fff"}
          //       size={22}
          //     />
          //     <Text
          //       style={{
          //         fontSize: 16,
          //         fontFamily: "Outfit_500Medium",
          //         color: "#fff",
          //       }}
          //     >
          //       Retour
          //     </Text>
          //   </TouchableOpacity>
          // ),
          headerTintColor: "#fff",
          headerBackTitle: "Retour",
        }}
      />
    </Stack>
  );
}

function NotificationsIcon() {
  const router = useRouter();

  const [notificationsCount, setNotificationsCount] = React.useState<number>(0);

  const { user } = useUser();

  const { getToken } = useAuth();
  const [token, setToken] = React.useState<string | null>(null);

  async function checkNotificationCount() {
    console.log("Checking notifications count");
    supabaseClient(getToken).then(async (supabase) => {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)
        .eq("is_read", false);

      if (error) {
        console.error(error);
        return;
      }

      setNotificationsCount(count ? count : 0);
    });
  }

  useEffect(() => {
    if (token) return;
    async function init() {
      const token = await getToken();
      setToken(token);
    }
    init();
  }, []);

  useEffect(() => {
    if (!token) return;

    const supabase = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    checkNotificationCount();

    const channel = supabase
      .channel(`notifications-${user?.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          console.log("New notification");
          checkNotificationCount();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [token]);

  function handlePress() {
    setNotificationsCount(0);
    router.navigate("/home/notifications");
  }

  return (
    <Pressable
      style={{
        backgroundColor: "transparent",
      }}
      onPress={handlePress}
    >
      <Icon
        icon={"bellIcon"}
        size={24}
        color={"#fff"}
      />
      {notificationsCount > 0 && (
        <View
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            width: 18,
            height: 18,
            borderRadius: 10,
            backgroundColor: Colors.light.primary,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 10,
              fontFamily: "Outfit_700Bold",
              textAlign: "center",
            }}
          >
            {notificationsCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
