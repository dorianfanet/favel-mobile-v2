import { TripEdit, TripEditType } from "@/types/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@clerk/clerk-expo";
import { favelClient } from "./favelApi";

export async function newTripEdit({
  day_index,
  location,
  activity_id,
  author_id,
  trip_id,
  type,
  post_id,
  getToken,
}: {
  type: TripEditType;
  day_index?: number;
  location?: string;
  activity_id: string;
  author_id: string;
  trip_id: string;
  post_id: string;
  getToken: any;
}) {
  console.log(
    "newTripEdit",
    type,
    day_index,
    location,
    activity_id,
    author_id,
    trip_id
  );

  const { data, error } = await supabase
    .from("tripv2_edits")
    .insert([{ type, day_index, location, activity_id, author_id, trip_id }]);

  if (error) {
    console.log("error", error);
  }

  await favelClient(getToken).then((favel) => {
    favel.tripEdit(trip_id, author_id, post_id);
  });

  return data;
}
