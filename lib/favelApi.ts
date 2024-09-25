import { Alert } from "react-native";
import { MMKV } from "@/app/_layout";

type Response<T> = {
  error: string | null;
  data: T | null;
};

class ApiClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async request(
    endpoint: string,
    method: string,
    data: any,
    signal?: AbortSignal
  ): Promise<Response<any>> {
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

  async hello(name: string): Promise<Response<{ message: string }>> {
    return await this.request(`hello?id=${name}`, "GET", null);
  }
}

export async function favelClient(getToken: any) {
  const token = await getToken();

  if (token) {
    return new ApiClient(`${process.env.EXPO_PUBLIC_API_URL}/api`, token);
  } else {
    Alert.alert("Error", "Une erreur s'est produite. Veuillez réessayer.");
    throw new Error("No token found");
  }
}
