import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { FormattedTrip, Trip } from "@/types/types";

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
