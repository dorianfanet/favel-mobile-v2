import {
  TextInput,
  StyleSheet,
  View,
  Pressable,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Text, View as ThemedView, Button } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Image } from "expo-image";
import { padding } from "@/constants/values";
import { Link, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { favel } from "@/lib/favelApi";

export default function profile() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    const { data, error } = await supabase
      .from("trips_v2")
      .select("author_id, invited_ids")
      .or(`author_id.eq.${user?.id},invited_ids.cs.{${user!.id}}`)
      .like("status", "trip%");

    if (error) {
      console.error(error);
      setRefreshing(false);
      return;
    }

    if (data) {
      let travelers = data.map((trip: any) => {
        let temp = [];
        if (trip.author_id) temp.push(trip.author_id);
        if (trip.invited_ids) temp.push(...trip.invited_ids);
        return temp;
      });

      const userMetadata = await favel.getUser(user!.id);

      if (
        userMetadata &&
        userMetadata.publicMetadata &&
        userMetadata.publicMetadata.coTravelers
      ) {
        travelers.push(userMetadata.publicMetadata.coTravelers);
      }

      const coTravelers = Array.from(
        new Set(travelers.flat().filter((id: string) => id !== user!.id))
      );

      console.log("trips", data.length);
      console.log("coTravelersCountr", coTravelers.length);
      console.log("coTravelers", coTravelers);

      await favel.updateUser(user!.id, {
        publicMetadata: {
          trips: data.length,
          coTravelers: coTravelers,
        },
      });

      await user?.reload();
    }

    setRefreshing(false);
  }, []);

  const handleDeleteAccount = async () => {
    favel.deleteUser(user!.id);
    await signOut();
  };

  const showConfirmationDialog = () => {
    Alert.alert(
      "Supprimer le compte",
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
      [
        {
          text: "Oui",
          onPress: () => {
            handleDeleteAccount();
          },
          style: "destructive",
        },
        {
          text: "Non",
          onPress: () => {},
          style: "cancel",
        },
      ],
      { cancelable: false }
    );
  };

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
          colors={[Colors.light.primary]}
          tintColor={Colors.light.primary}
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
                  {user &&
                  user.publicMetadata &&
                  user.publicMetadata.coTravelers
                    ? (user.publicMetadata.coTravelers as string[]).length
                    : 0}
                </Text>
                <Text style={{ fontSize: 14, opacity: 0.8 }}>Covoyageurs</Text>
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
        <Button
          title="Supprimer mon compte"
          color={"#ff0000"}
          onPress={showConfirmationDialog}
        />
      </View>
    </ScrollView>
  );
}
