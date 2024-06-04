import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";
import React, { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Post } from "@/types/types";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import PostCard from "@/components/Post/PostCard";
import { padding } from "@/constants/values";
import ContainedButton from "@/components/ContainedButton";
import { useRouter } from "expo-router";
import { v4 as uuidv4 } from "uuid";
import { supabaseClient } from "@/lib/supabaseClient";

export default function home() {
  const { user } = useUser();

  const [posts, setPosts] = React.useState<{ post_json: Post }[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [scrollLoading, setScrollLoading] = React.useState<
    "loading" | "last" | null
  >(null);
  const isPostEndReached = React.useRef(false);

  const router = useRouter();

  const { getToken } = useAuth();

  async function fetchFollowedUserPosts() {
    if (!user) return;
    return await supabaseClient(getToken).then(async (supabase) => {
      const { data, error } = await supabase.rpc("get_posts", {
        user_id: user.id,
        page_number: 0,
      });

      if (error) {
        console.error("Error:", error);
        setLoading(false);
        setError("Une erreur est survenue.");
      } else {
        console.log("Data:", data);
        setPosts(data);
        setLoading(false);
        setError(null);
      }

      return data;
    });
  }

  useEffect(() => {
    fetchFollowedUserPosts();
  }, []);

  async function handleEndReached() {
    if (!user) return;
    if (isPostEndReached.current) return;
    setScrollLoading("loading");
    return await supabaseClient(getToken).then(async (supabase) => {
      const { data, error } = await supabase.rpc("get_posts", {
        user_id: user.id,
        page_number: page + 1,
      });

      if (error) {
        console.error("Error:", error);
        setScrollLoading(null);
        setError("Une erreur est survenue.");
      } else if (data.length === 0) {
        setScrollLoading("last");
        setError(null);
        isPostEndReached.current = true;
      } else {
        console.log("Data:", data);
        setPosts([...posts!, ...data]);
        setScrollLoading(null);
        setError(null);
        setPage(page + 1);
      }

      return data;
    });
  }

  return loading ? (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.light.background,
      }}
    >
      <ActivityIndicator
        animating
        size="large"
      />
    </View>
  ) : posts && posts.length > 0 ? (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.post_json.id}
      renderItem={({ item }) => <PostCard post={item.post_json} />}
      style={{
        backgroundColor: Colors.light.background,
        // padding: padding,
      }}
      contentContainerStyle={{
        rowGap: 10,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchFollowedUserPosts();
            setRefreshing(false);
          }}
          colors={[Colors.light.primary]}
          tintColor={Colors.light.primary}
        />
      }
      onEndReached={handleEndReached}
      ListFooterComponent={
        <View style={{ height: 60, justifyContent: "center" }}>
          {scrollLoading === "loading" && (
            <ActivityIndicator
              animating
              size="small"
            />
          )}
          {scrollLoading === "last" && (
            <Text
              style={{
                textAlign: "center",
              }}
            >
              Aucune autre publication à afficher
            </Text>
          )}
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
      {error ? (
        <>
          <Text
            style={{
              fontSize: 18,
              color: Colors.light.primary,
              fontFamily: "Outfit_600SemiBold",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            Une erreur est survenue, veuillez réessayer. Si le problème
            persiste, contactez le support.
          </Text>
          <ContainedButton
            title="Rafrachir"
            onPress={async () => {
              setLoading(true);
              await new Promise((resolve) => setTimeout(resolve, 200));
              await fetchFollowedUserPosts();
              setLoading(false);
            }}
          />
        </>
      ) : (
        <>
          <Text
            style={{
              fontSize: 18,
              color: Colors.light.primary,
              fontFamily: "Outfit_600SemiBold",
              marginBottom: 20,
            }}
          >
            Aucune publication à afficher pour le moment
          </Text>
          <ContainedButton
            title="Créer un voyage"
            onPress={() => {
              const id = uuidv4();
              router.navigate(`/(auth)/trip/${id}`);
            }}
          />
          <ContainedButton
            title="Rafraîchir"
            onPress={async () => {
              setLoading(true);
              await fetchFollowedUserPosts();
              setLoading(false);
            }}
            type="ghost"
            style={{
              marginTop: 10,
            }}
          />
        </>
      )}
    </View>
  );
}

// export default function home() {
//   const { user } = useUser();
//   const router = useRouter();

//   useEffect(() => {
//     track("Home page viewed");
//   }, []);

//   const [trips, setTrips] = React.useState<SavedTrip[] | []>([]);

//   const [refreshing, setRefreshing] = React.useState(false);
//   const page = useRef(0);
//   const [scrollLoading, setScrollLoading] = React.useState<
//     "loading" | "last" | null
//   >(null);
//   const [lastOpenedTrip, setLastOpenedTrip] = React.useState<string | null>(
//     null
//   );
//   const [loading, setLoading] = React.useState(true);

//   const onRefresh = React.useCallback(async () => {
//     setRefreshing(true);
//     const newTrips = await getTrips(0);
//     page.current = 0;
//     if (newTrips) {
//       setTrips(newTrips);
//     }
//     setRefreshing(false);
//   }, []);

//   async function getTrips(currentPage: number) {
//     if (!user) return;
//     const coTravelers: string[] =
//       (user?.publicMetadata?.coTravelers as string[]) || [];
//     const { data: trips, error } = await supabase
//       .from("trips_v2")
//       .select("id, name, route, dates, author_id, updated_at, invited_ids")
//       .or(
//         `author_id.eq.${user?.id},invited_ids.cs.{${
//           user!.id
//         }},author_id.in.(${coTravelers
//           .map((traveler) => `"${traveler}"`)
//           .join(",")})`
//       )
//       .like("status", "trip%")
//       .order("updated_at", { ascending: false })
//       .range(currentPage * 5, currentPage * 5 + 4);

//     if (error) {
//       Alert.alert("Error", error.message);
//       console.log(error);
//     } else return trips;
//   }

//   async function addTrips() {
//     const newTrips = await getTrips(page.current + 1);
//     if (newTrips) {
//       setTrips([...trips, ...newTrips]);
//       page.current += 1;
//     }
//   }

//   useEffect(() => {
//     async function fetchTrips() {
//       const trips = await getTrips(page.current);
//       if (trips) {
//         setTrips(trips);
//       }
//       setLoading(false);
//     }
//     fetchTrips();
//   }, []);

//   useEffect(() => {
//     async function checkLastOpenedTrip() {
//       console.log("checking last opened trip");
//       const lastOpenedTripId = await MMKV.getStringAsync("lastOpenedTrip");
//       console.log("last opened trip", lastOpenedTripId);
//       if (lastOpenedTripId) setLastOpenedTrip(lastOpenedTripId);
//     }
//     checkLastOpenedTrip();
//   });

//   const renderHeader = useCallback(() => {
//     return (
//       <>
//         {lastOpenedTrip ? <LastOpened tripId={lastOpenedTrip} /> : null}
//         <Text
//           style={{
//             fontSize: 18,
//             color: Colors.light.primary,
//             fontFamily: "Outfit_600SemiBold",
//             marginTop: 20,
//           }}
//         >
//           Fil d'actualité
//         </Text>
//       </>
//     );
//   }, [lastOpenedTrip]);

//   return loading ? (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: Colors.light.background,
//       }}
//     >
//       <ActivityIndicator
//         animating
//         size="large"
//       />
//     </View>
//   ) : (
//     <>
//       {trips.length > 0 ? (
//         <FlatList
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               colors={[Colors.light.primary]}
//               tintColor={Colors.light.primary}
//             />
//           }
//           contentContainerStyle={{
//             rowGap: 10,
//             paddingBottom: 60,
//           }}
//           style={{
//             paddingHorizontal: padding,
//             backgroundColor: Colors.light.background,
//           }}
//           data={trips}
//           keyExtractor={(item) => item.id}
//           renderItem={({ item }) => (
//             <TripCardMemo
//               key={item.id}
//               trip={item}
//             />
//           )}
//           onEndReached={() => {
//             setScrollLoading("loading");
//             addTrips();
//             setScrollLoading(null);
//           }}
//           ListHeaderComponent={renderHeader}
//           ListFooterComponent={
//             <View style={{ marginTop: 10 }}>
//               {scrollLoading === "loading" && (
//                 <ActivityIndicator
//                   animating
//                   size="large"
//                 />
//               )}
//               <Text
//                 style={{
//                   textAlign: "center",
//                 }}
//               >
//                 {scrollLoading === "last" &&
//                   "Il n'y a plus de voyages à afficher"}
//               </Text>
//             </View>
//           }
//         />
//       ) : (
//         <View
//           style={{
//             flex: 1,
//             justifyContent: "center",
//             alignItems: "center",
//             backgroundColor: Colors.light.background,
//           }}
//         >
//           <Text>Vous n'avez pas encore de voyages sauvegardés</Text>
//           <Button
//             onPress={() => {
//               const id = uuidv4();
//               router.navigate(`/(auth)/trip/${id}`);
//             }}
//             title="Créer un voyage"
//           ></Button>
//           <Button
//             onPress={onRefresh}
//             title="Rafraîchir"
//           ></Button>
//         </View>
//       )}
//     </>
//   );
// }

// const TripCardMemo = React.memo(TripCard, (prevProps, nextProps) => {
//   return prevProps.trip.id === nextProps.trip.id;
// });

// function LastOpened({ tripId }: { tripId: string }) {
//   const [trip, setTrip] = React.useState<SavedTrip | null>(null);

//   useEffect(() => {
//     async function fetchTrip() {
//       const { data: trips, error } = await supabase
//         .from("trips_v2")
//         .select("id, name, route, dates, author_id, updated_at, invited_ids")
//         .eq("id", tripId);
//       if (error) {
//         Alert.alert("Error", error.message);
//         console.log(error);
//       } else {
//         setTrip(trips[0]);
//       }
//     }
//     fetchTrip();
//   }, []);

//   return trip ? (
//     <>
//       <Text
//         style={{
//           fontSize: 18,
//           color: Colors.light.primary,
//           fontFamily: "Outfit_600SemiBold",
//           marginTop: 20,
//           marginBottom: 10,
//         }}
//       >
//         Reprenez là où vous en êtiez
//       </Text>
//       <TripCard
//         key={tripId}
//         trip={trip}
//       />
//     </>
//   ) : null;
// }
