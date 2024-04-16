import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { SavedTrip } from "@/types/types";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from "react-native";
import TripCard from "@/components/TripCard";
import { useUser } from "@clerk/clerk-expo";
import { track } from "@amplitude/analytics-react-native";

export default function home() {
  const { user } = useUser();

  useEffect(() => {
    track("Home page viewed");
  }, []);

  const [trips, setTrips] = React.useState<SavedTrip[] | []>([]);

  const [refreshing, setRefreshing] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [scrollLoading, setScrollLoading] = React.useState<
    "loading" | "last" | null
  >(null);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    const newTrips = await getTrips();
    if (newTrips) {
      setTrips(newTrips);
    }
    setRefreshing(false);
  }, []);

  async function getTrips(forcePage?: number) {
    if (!user) return;
    const { data: trips, error } = await supabase.rpc("get_trips_v2", {
      user_id_param: user.id,
      page_limit: 5,
      page_index: forcePage || page,
    });
    if (error) {
      Alert.alert("Error", error.message);
      console.log(error);
    } else return trips;
  }

  async function addTrips() {
    const newTrips = await getTrips(page + 1);
    if (newTrips) {
      setTrips([...trips, ...newTrips]);
    }
  }

  useEffect(() => {
    async function fetchTrips() {
      const trips = await getTrips();
      if (trips) {
        setTrips(trips);
      }
    }
    fetchTrips();
  }, []);

  return (
    <>
      {trips.length > 0 ? (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.light.primary]}
              tintColor={Colors.light.primary}
            />
          }
          contentContainerStyle={{
            rowGap: 10,
            paddingBottom: 60,
          }}
          style={{
            padding: 0,
            backgroundColor: Colors.light.background,
          }}
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TripCard
              key={item.id}
              trip={item}
            />
          )}
          onEndReached={() => {
            setScrollLoading("loading");
            addTrips();
            setPage(page + 1);
            setScrollLoading(null);
          }}
          ListFooterComponent={
            <View style={{ marginTop: 10 }}>
              {scrollLoading === "loading" && (
                <ActivityIndicator
                  animating
                  size="large"
                />
              )}
              <Text
                style={{
                  textAlign: "center",
                }}
              >
                {/* {!scrollLoading &&
                  "Descendez encore pour charger d'autres voyages"} */}
                {scrollLoading === "last" &&
                  "Il n'y a plus de voyages à afficher"}
              </Text>
            </View>
          }
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Colors.light.background,
          }}
        >
          <Text>Vous n'avez pas encore de voyages sauvegardés</Text>
          <Button
            onPress={onRefresh}
            title="Rafraîchir"
          ></Button>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 200,
    backgroundColor: "#fff",
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  blockA: {
    flex: 2, // 67% (2/3)
    backgroundColor: "red",
  },
  blockB: {
    flex: 1, // 33% (1/3)
    backgroundColor: "blue",
  },
  blockC: {
    flex: 1, // 33% (1/3)
    backgroundColor: "green",
  },
});
