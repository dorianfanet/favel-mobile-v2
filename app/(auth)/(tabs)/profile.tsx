import {
  TextInput,
  StyleSheet,
  View,
  Pressable,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { Text, View as ThemedView, Button } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Image } from "expo-image";
import { padding } from "@/constants/values";
import { Link, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { favel } from "@/lib/favelApi";

export default function profile() {
  const { user } = useUser();

  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    const { data, count } = await supabase
      .from("trips_v2")
      .select("*", { count: "exact", head: true })
      .eq("author_id", user?.id)
      .like("status", "trip%");

    await favel.updateUser(user!.id, {
      publicMetadata: {
        trips: count,
      },
    });

    await user?.reload();

    setRefreshing(false);
  }, []);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <View
        style={{
          backgroundColor: Colors.light.secondary,
          padding: padding,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            gap: 20,
          }}
        >
          <Image
            source={{ uri: user!.imageUrl }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
          <View
            style={{
              backgroundColor: "transparent",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontFamily: "Outfit_600SemiBold" }}>
              {user!.firstName} {user!.lastName}
            </Text>
            <Text style={{ fontSize: 14, opacity: 0.8 }}>
              {user!.primaryEmailAddress
                ? user!.primaryEmailAddress.emailAddress
                : ""}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
          }}
        >
          <Link
            href={"/(auth)/(tabs)/home"}
            asChild
          >
            <Pressable
              style={{
                flex: 1,
              }}
            >
              <View
                style={{
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 18, fontFamily: "Outfit_600SemiBold" }}
                >
                  {user?.publicMetadata && user.publicMetadata.trips
                    ? (user.publicMetadata.trips as number)
                    : 0}
                </Text>
                <Text style={{ fontSize: 14, opacity: 0.8 }}>Voyages</Text>
              </View>
            </Pressable>
          </Link>
          <Link
            href={"/(modals)/travelCompanions"}
            asChild
          >
            <Pressable
              style={{
                flex: 1,
              }}
            >
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 18, fontFamily: "Outfit_600SemiBold" }}
                >
                  0
                </Text>
                <Text style={{ fontSize: 14, opacity: 0.8 }}>
                  Compagnons de voyage
                </Text>
              </View>
            </Pressable>
          </Link>
        </View>
      </View>

      <View
        style={{
          marginTop: 20,
        }}
      >
        <Button
          title="Modifier le profil"
          onPress={() => {
            router.navigate("/(modals)/editProfile");
          }}
        />
      </View>
    </ScrollView>
  );
}
