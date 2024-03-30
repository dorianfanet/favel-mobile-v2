import { TripEdit, TripEditType } from "@/types/types";
import { supabase } from "@/lib/supabase";

export async function newTripEdit({
  day_index,
  location,
  activity_id,
  author_id,
  trip_id,
  type,
}: {
  type: TripEditType;
  day_index?: number;
  location?: string;
  activity_id: string;
  author_id: string;
  trip_id: string;
}) {
  const { data, error } = await supabase
    .from("tripv2_edits")
    .insert([{ type, day_index, location, activity_id, author_id, trip_id }]);
  if (error) {
    console.log("error", error);
  }
  return data;
}
