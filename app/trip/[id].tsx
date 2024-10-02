import React, { useEffect } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import Map from "./(map)/Map";
import { Button, Text, View } from "@/components/Themed";
import Header from "./Header";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomSheets from "./BottomSheets";
import Assistant from "./(header)/Assistant";
import { tripUtils, useTrip } from "@/context/tripContext";
import { Trip, TripDay, TripEvent, TripNight, TripStage } from "@/types/trip";
import { supabaseClient } from "@/lib/supabaseClient";
import { useAuth } from "@clerk/clerk-expo";

export default function Index() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = React.useState(true);

  const { state, dispatch } = useTrip();

  const { getToken } = useAuth();

  // const loadTrip = (tripData: Trip) => {
  //   tripUtils.setTrip(dispatch, tripData);
  // };

  useEffect(() => {
    loadTrip();

    // Load trip data
    // const tripData: Trip = {
    //   id: "trip1",
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    //   name: "San Francisco Trip",
    //   thumbnail: "https://example.com/sf-thumbnail.jpg",
    //   departureDate: new Date("2024-09-26"),
    //   returnDate: new Date("2024-09-29"),
    //   creatorId: "user1",
    // };

    // loadTrip(tripData);

    // // Load stages
    // tripUtils.setStages(dispatch, stages);

    // // Load days
    // tripUtils.setDays(dispatch, days);

    // // Load events
    // tripUtils.setEvents(dispatch, events);

    // // Load nights
    // tripUtils.setNights(dispatch, nights);
  }, []);

  async function loadTrip() {
    await supabaseClient(getToken).then(async (supabase) => {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id);

      if (error) {
        console.error("Error fetching trip", error);
        return;
      }

      if (data.length === 0) {
        console.error("No trip found with ID", id);
        return;
      }

      const tripData: Trip = {
        id: data[0].id,
        createdAt: new Date(data[0].created_at),
        name: data[0].name,
        thumbnail: data[0].thumbnail,
        departureDate: new Date(data[0].departure_date),
        returnDate: new Date(data[0].return_date),
        creatorId: data[0].creator_id,
      };

      tripUtils.setTrip(dispatch, tripData);

      const { data: stages, error: stagesError } = await supabase
        .from("trip_stages")
        .select("*")
        .eq("trip_id", id);

      if (stagesError) {
        console.error("Error fetching stages", stagesError);
        return;
      }

      const tripStages: TripStage[] = stages.map((stage) => ({
        id: stage.id,
        createdAt: new Date(stage.created_at),
        name: stage.name,
        thumbnail: stage.thumbnail,
        tripId: stage.trip_id,
        startDate: new Date(stage.start_date),
        endDate: new Date(stage.end_date),
      }));

      tripUtils.setStages(dispatch, tripStages);

      const { data: days, error: daysError } = await supabase
        .from("trip_days")
        .select("*")
        .eq("trip_id", id);

      if (daysError) {
        console.error("Error fetching days", daysError);
        return;
      }

      const tripDays: TripDay[] = days.map((day) => ({
        id: day.id,
        createdAt: new Date(day.created_at),
        tripId: day.trip_id,
        name: day.name,
        stageId: day.stage_id,
        date: new Date(day.date),
        longitude: day.longitude,
        latitude: day.latitude,
      }));

      tripUtils.setDays(dispatch, tripDays);

      const { data: events, error: eventsError } = await supabase.rpc(
        "get_trip_events_with_place_details",
        {
          trip_id_param: id as string,
          lang_param: "en",
        }
      );

      const eventsData = events as any[];

      if (eventsError) {
        console.error("Error fetching events", eventsError);
        return;
      }

      if (eventsData && eventsData.length > 0) {
        const tripEvents: TripEvent[] = eventsData.map((event: any) => ({
          id: event.event.id,
          start: new Date(event.event.start),
          end: new Date(event.event.end),
          type: event.event.type,
          place: {
            id: event.event.place.id,
            name: event.event.place.name,
            thumbnail: event.event.place.thumbnail,
            longitude: event.event.place.longitude,
            latitude: event.event.place.latitude,
          },
        }));

        tripUtils.setEvents(dispatch, tripEvents);
      }

      const { data: nights, error: nightsError } = await supabase
        .from("trip_nights")
        .select("*")
        .eq("trip_id", id);

      if (nightsError) {
        console.error("Error fetching nights", nightsError);
        return;
      }

      if (nights && nights.length > 0) {
        const nightPlaces = nights.map(async (night) => {
          const { data: nightPlace, error: nightPlacesError } =
            await supabase.rpc("get_place_details", {
              place_id_param: night.place_id,
              lang_param: "en",
            });

          if (nightPlacesError) {
            console.error("Error fetching night place", nightPlacesError);
            return {};
          }

          const nightPlaceData = nightPlace as any;

          return {
            id: night.id,
            createdAt: new Date(night.created_at),
            startDate: new Date(night.start_date),
            endDate: new Date(night.end_date),
            stageId: night.stage_id,
            name: nightPlaceData.name,
            longitude: nightPlaceData.longitude,
            latitude: nightPlaceData.latitude,
          };
        });

        const tripNights: TripNight[] = (await Promise.all(
          nightPlaces
        )) as TripNight[];

        tripUtils.setNights(dispatch, tripNights);
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    });

    setLoading(false);
  }

  console.log("state", state);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View
        style={{
          flex: 1,
        }}
      >
        <>
          <Map />
          <BottomSheets
            tripDays={state.days}
            tripEvents={state.events}
            loading={loading}
          />
          <Header>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Assistant />
            </View>
          </Header>
        </>
        {loading ? (
          <View
            background="primary"
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <Text fontStyle="title">Loading...</Text>
          </View>
        ) : null}
        {/* <BSModals /> */}
        {/* <BSModal modalRef={modal1Ref}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>Modal 1</Text>
          </View>
        </BSModal>
        <BSModal modalRef={modal2Ref}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>Modal 2</Text>
          </View>
        </BSModal> */}
      </View>
    </>
  );
}

// const stages: TripStage[] = [
//   {
//     id: "stage1",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     name: "San Francisco",
//     thumbnail: "https://example.com/sf-thumbnail.jpg",
//     tripId: "trip1",
//     startDate: new Date("2024-09-26"),
//     endDate: new Date("2024-09-29"),
//   },
// ];

// const days: TripDay[] = [
//   {
//     id: "day1",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     tripId: "trip1",
//     name: "Union Square",
//     centerPoint: { lat: 37.787, lng: -122.406 }, // San Francisco center
//     areaPolygon: [
//       [37.7749, -122.4194],
//       [37.7898, -122.3958],
//       [37.7625, -122.4357],
//     ], // Example polygon
//     stageId: "stage1",
//     date: new Date("2024-09-26"),
//   },
//   {
//     id: "day2",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     tripId: "trip1",
//     name: "Golden Gate Park",
//     centerPoint: { lat: 37.768, lng: -122.476 },
//     areaPolygon: [
//       [37.7694, -122.4862],
//       [37.768, -122.5112],
//       [37.7785, -122.4547],
//     ],
//     stageId: "stage1",
//     date: new Date("2024-09-27"),
//   },
//   {
//     id: "day3",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     tripId: "trip1",
//     name: "Fisherman's Wharf and Alcatraz",
//     centerPoint: { lat: 37.815, lng: -122.4177 },
//     areaPolygon: [
//       [37.808, -122.4177],
//       [37.8113, -122.4099],
//       [37.7993, -122.4227],
//     ],
//     stageId: "stage1",
//     date: new Date("2024-09-28"),
//   },
//   {
//     id: "day4",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     tripId: "trip1",
//     name: "Mission District",
//     centerPoint: { lat: 37.758, lng: -122.42 }, // SFO Airport
//     areaPolygon: [
//       [37.6213, -122.379],
//       [37.6255, -122.3755],
//       [37.6182, -122.3842],
//     ],
//     stageId: "stage1",
//     date: new Date("2024-09-29"),
//   },
// ];

// const events: TripEvent[] = [
//   // Day 1 events
//   {
//     id: "event1.1",
//     type: "activity",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     dayId: "day1",
//     start: new Date("2024-09-26T10:00:00"),
//     end: new Date("2024-09-26T11:00:00"),
//     name: "Breakfast at Café de la Presse",
//     location: "Café de la Presse",
//     thumbnail: "https://example.com/cafe-presse-thumbnail.jpg",
//     centerPoint: { lat: 37.7902, lng: -122.4058 }, // Café de la Presse
//   },
//   {
//     id: "event1.2",
//     type: "activity",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     dayId: "day1",
//     start: new Date("2024-09-26T12:00:00"),
//     end: new Date("2024-09-26T13:30:00"),
//     name: "Shopping at Westfield San Francisco Centre",
//     location: "Westfield San Francisco Centre",
//     thumbnail: "https://example.com/westfield-thumbnail.jpg",
//     centerPoint: { lat: 37.7837, lng: -122.407 }, // Westfield San Francisco Centre
//   },
//   {
//     id: "event1.3",
//     type: "activity",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     dayId: "day1",
//     start: new Date("2024-09-26T14:30:00"),
//     end: new Date("2024-09-26T16:00:00"),
//     name: "Visit the Contemporary Jewish Museum",
//     location: "Contemporary Jewish Museum",
//     thumbnail: "https://example.com/jewish-museum-thumbnail.jpg",
//     centerPoint: { lat: 37.7857, lng: -122.4025 }, // Contemporary Jewish Museum
//   },
//   {
//     id: "event1.4",
//     type: "activity",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     dayId: "day1",
//     start: new Date("2024-09-26T18:00:00"),
//     end: new Date("2024-09-27T08:00:00"),
//     name: "Dinner at The Rotunda",
//     location: "The Rotunda at Neiman Marcus",
//     thumbnail: "https://example.com/rotunda-thumbnail.jpg",
//     centerPoint: { lat: 37.788, lng: -122.4075 }, // The Rotunda at Neiman Marcus
//   },

//   // Day 2 events
//   {
//     id: "event2.1",
//     type: "activity",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     dayId: "day2",
//     start: new Date("2024-09-27T10:00:00"),
//     end: new Date("2024-09-27T13:00:00"),
//     name: "Explore Golden Gate Park",
//     location: "Golden Gate Park",
//     thumbnail: "https://example.com/golden-gate-park-thumbnail.jpg",
//     centerPoint: { lat: 37.7694, lng: -122.4862 },
//   },
//   {
//     id: "event2.2",
//     type: "activity",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     dayId: "day2",
//     start: new Date("2024-09-27T14:30:00"),
//     end: new Date("2024-09-27T16:00:00"),
//     name: "Visit California Academy of Sciences",
//     location: "California Academy of Sciences",
//     thumbnail: "https://example.com/academy-thumbnail.jpg",
//     centerPoint: { lat: 37.7632, lng: -122.4661 },
//   },
//   {
//     id: "event2.3",
//     type: "activity",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     dayId: "day2",
//     start: new Date("2024-09-27T17:00:00"),
//     end: new Date("2024-09-27T19:00:00"),
//     name: "Stroll through Japanese Tea Garden",
//     location: "Japanese Tea Garden",
//     thumbnail: "https://example.com/tea-garden-thumbnail.jpg",
//     centerPoint: { lat: 37.7702, lng: -122.4702 },
//   },

//   // Day 3 events
//   {
//     id: "event3.1",
//     type: "activity",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     dayId: "day3",
//     start: new Date("2024-09-28T09:00:00"),
//     end: new Date("2024-09-28T11:00:00"),
//     name: "Alcatraz Island",
//     location: "Alcatraz Island",
//     thumbnail: "https://example.com/alcatraz-thumbnail.jpg",
//     centerPoint: { lat: 37.8267, lng: -122.423 },
//   },
//   {
//     id: "event3.2",
//     type: "activity",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     dayId: "day3",
//     start: new Date("2024-09-28T15:00:00"),
//     end: new Date("2024-09-28T17:00:00"),
//     name: "Pier 39",
//     location: "Pier 39",
//     thumbnail: "https://example.com/pier39-thumbnail.jpg",
//     centerPoint: { lat: 37.8087, lng: -122.4098 },
//   },
//   {
//     id: "event3.3",
//     type: "activity",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     dayId: "day3",
//     start: new Date("2024-09-28T12:00:00"),
//     end: new Date("2024-09-28T14:00:00"),
//     name: "Fisherman's Wharf",
//     location: "Fisherman's Wharf",
//     thumbnail: "https://example.com/fisherman-thumbnail.jpg",
//     centerPoint: { lat: 37.808, lng: -122.4177 },
//   },

//   // Day 4 event
//   {
//     id: "event4.1",
//     type: "activity",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     dayId: "day4",
//     start: new Date("2024-09-29T09:30:00"),
//     end: new Date("2024-09-29T11:00:00"),
//     name: "Breakfast at Tartine Bakery",
//     location: "Tartine Bakery",
//     thumbnail: "https://example.com/tartine-bakery-thumbnail.jpg",
//     centerPoint: { lat: 37.7615, lng: -122.4241 }, // Tartine Bakery
//   },
//   {
//     id: "event4.2",
//     type: "activity",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     dayId: "day4",
//     start: new Date("2024-09-29T11:30:00"),
//     end: new Date("2024-09-29T13:00:00"),
//     name: "Visit Mission Dolores Park",
//     location: "Mission Dolores Park",
//     thumbnail: "https://example.com/mission-dolores-park-thumbnail.jpg",
//     centerPoint: { lat: 37.7596, lng: -122.4269 }, // Mission Dolores Park
//   },
//   {
//     id: "event4.3",
//     type: "activity",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     dayId: "day4",
//     start: new Date("2024-09-29T13:30:00"),
//     end: new Date("2024-09-29T15:00:00"),
//     name: "Explore the murals on Balmy Alley",
//     location: "Balmy Alley",
//     thumbnail: "https://example.com/balmy-alley-thumbnail.jpg",
//     centerPoint: { lat: 37.7523, lng: -122.413 }, // Balmy Alley Murals
//   },
//   {
//     id: "event4.4",
//     type: "activity",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     dayId: "day4",
//     start: new Date("2024-09-29T17:00:00"),
//     end: new Date("2024-09-29T19:00:00"),
//     name: "Dinner at Foreign Cinema",
//     location: "Foreign Cinema",
//     thumbnail: "https://example.com/foreign-cinema-thumbnail.jpg",
//     centerPoint: { lat: 37.7566, lng: -122.4194 }, // Foreign Cinema
//   },
// ];

// const nights: TripNight[] = [
//   {
//     id: "night1",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     startDate: new Date("2024-09-26"),
//     endDate: new Date("2024-09-29"),
//     stageId: "stage1",
//     name: "The Grove Inn",
//     centerPoint: { lat: 37.77692001973226, lng: -122.43125654014332 },
//   },
// ];
