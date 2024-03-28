import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { FormattedTrip, Trip } from "@/types/types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
