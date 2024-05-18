import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import {
  Activity,
  CachedActivity,
  CachedDescription,
  FormattedTrip,
  Trip,
} from "@/types/types";
import { MMKV } from "@/app/_layout";

console.log("supabaseUrl", process.env.EXPO_PUBLIC_SUPABASE_URL);

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function updateTripFromFormatted(
  formattedTrip: FormattedTrip,
  tripId: string
) {
  let tempTrip: Trip = [];

  formattedTrip.forEach((item) => {
    if (item.formattedType === "day") {
      tempTrip.push({
        ...item,
        activities: [],
      });
    } else {
      // @ts-ignore
      tempTrip[tempTrip.length - 1].activities.push(item);
    }
  });

  const { error } = await supabase
    .from("trips_v2")
    .update({ trip: tempTrip })
    .eq("id", tripId);

  if (error) {
    console.log("error", error);
  }
}

export async function getActivity(
  activity: Activity,
  forceRefresh = false
): Promise<Activity> {
  let activityData = activity;

  if (forceRefresh) {
    MMKV.removeItem(`activity-${activity.id}`);
  }

  async function fetchActivityFromDb() {
    const { data, error } = await supabase
      .from("activities")
      .select(
        "avg_duration, category, name, display_category, coordinates, g_maps_id"
      )
      .eq("id", activity.id)
      .single();

    if (error) {
      console.log(error);
    }

    if (data) {
      activityData = { ...activityData, ...data };
      console.log("caching", activityData);
      MMKV.setStringAsync(
        `activity-${activity.id}`,
        JSON.stringify({
          data: activityData,
          expiresAt: new Date().getTime() + 720000,
          // expiresAt: new Date().getTime() + 60000,
        })
      );
    }
  }

  const cachedActivity = await MMKV.getStringAsync(`activity-${activity.id}`);

  if (cachedActivity) {
    console.log("in cache");
    const { data, expiresAt } = JSON.parse(cachedActivity) as CachedActivity;
    if (expiresAt < new Date().getTime()) {
      await fetchActivityFromDb();
    } else {
      console.log("cached data", data);
      activityData = { ...activityData, ...data };
    }
  } else {
    console.log("not in cache");
    await fetchActivityFromDb();
  }

  return activityData;
}

export async function getActivityDescription(
  activityId: string
): Promise<string | null> {
  let descriptionData: string | null = null;

  async function fetchActivityFromDb() {
    const { data, error } = await supabase
      .from("activities")
      .select("description")
      .eq("id", activityId)
      .single();

    if (error) {
      console.log(error);
    }

    if (data) {
      descriptionData = data.description;
      MMKV.setStringAsync(
        `activity_description-${activityId}`,
        JSON.stringify({
          description: descriptionData,
          expiresAt: new Date().getTime() + 86400000,
        })
      );
    }
  }

  const cachedDescription = await MMKV.getStringAsync(
    `activity_description-${activityId}`
  );

  if (cachedDescription) {
    console.log("in cache");
    const { description, expiresAt } = JSON.parse(
      cachedDescription
    ) as CachedDescription;
    if (expiresAt < new Date().getTime()) {
      fetchActivityFromDb();
    } else {
      descriptionData = description;
    }
  } else {
    console.log("not in cache");
    fetchActivityFromDb();
  }

  return descriptionData;
}
