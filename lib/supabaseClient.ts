import { Database } from "@/database.types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Alert } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export async function supabaseClient(getToken: any) {
  const token = await getToken({ template: "supabase-v2" });

  if (token) {
    return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  } else {
    Alert.alert("Error", "Une erreur s'est produite. Veuillez réessayer.");
    throw new Error("No token found");
  }
}
