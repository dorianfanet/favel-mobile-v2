import { Alert } from "react-native";
import { MMKV } from "@/app/_layout";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/database.types";

export type Response<T> = {
  error: string | null;
  data: T | null;
};

export type TableList = keyof Database["public"]["Tables"];

export class ApiClient {
  private baseUrl: string;
  private token: string;
  private supabase: SupabaseClient<Database>;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.supabase = supabaseClient(token);
  }

  private async request(
    endpoint: string,
    method: string,
    data: any,
    signal?: AbortSignal
  ): Promise<Response<any>> {
    console.log("Request", endpoint, method, data);
    return {
      error: null,
      data: endpoint,
    };
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "X-Favel-Api-Key": process.env.EXPO_PUBLIC_FAVEL_API_KEY!,
        "accept-language": MMKV.getString("language") || "en",
        Authorization: `Bearer ${this.token}`,
      },
      body: data ? JSON.stringify(data) : null,
      signal,
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        console.error(`Favel Error ${response.status}: ${error.message}`);
        return {
          error: error.message || "Internal Server Error`",
          data: null,
        };
      } catch (error) {
        console.error(`Favel Error ${response.status}: ${error}`);
        return {
          error: JSON.stringify(error) || "Internal Server Error",
          data: null,
        };
      }
    }

    return {
      data: (await response.json()) || null,
      error: null,
    };
  }

  private async query<T>(
    table: TableList,
    query: (q: any) => any
  ): Promise<Response<T>> {
    try {
      const { data, error } = await query(this.supabase.from(table));
      if (error) throw error;
      return { error: null, data: data as T };
    } catch (error) {
      return { error: JSON.stringify(error), data: null };
    }
  }

  trip(id: string) {
    return {
      get: this.query.bind(this, "trips", (q) => q.select("*").eq("id", id)),
    };
  }

  async hello(name: string): Promise<Response<{ message: string }>> {
    return await this.request(`hello?id=${name}`, "GET", null);
  }
}

// class Trip {
//   private client: ApiClient;
//   private tripId: string;

//   constructor(client: ApiClient, tripId: string) {
//     this.client = client;
//     this.tripId = tripId;
//   }

//   // Events method for this trip
//   events(eventId?: string) {
//     if (eventId) {
//       return this.client.request(
//         `trips/${this.tripId}/events/${eventId}`,
//         "GET",
//         null
//       );
//     } else {
//       return this.client.request(`trips/${this.tripId}/events`, "GET", null);
//     }
//   }
// }

export async function favelClient(getToken: any) {
  const token = await getToken({ template: "supabase-v2" });

  if (token) {
    return new ApiClient(`${process.env.EXPO_PUBLIC_API_URL}/api`, token);
  } else {
    Alert.alert("Error", "Une erreur s'est produite. Veuillez réessayer.");
    throw new Error("No token found");
  }
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

function supabaseClient(token: any) {
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
