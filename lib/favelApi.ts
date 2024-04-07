import { DestinationData, Route, TripRoute, UserMetadata } from "@/types/types";
import { getDaysDiff } from "./utils";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request(
    endpoint: string,
    method: string,
    data: any
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "X-Favel-Api-Key": process.env.EXPO_PUBLIC_FAVEL_API_KEY!,
      },
      body: data ? JSON.stringify(data) : null,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`Favel Error ${response.status}: ${error.message}`);
    }

    return response.json();
  }

  async getUser(id: string): Promise<UserMetadata> {
    const result = await this.request(`user/get-user?id=${id}`, "GET", null);
    return result.user;
  }

  async updateUser(id: string, data: any): Promise<void> {
    return this.request(`user/update-user?id=${id}`, "POST", { data: data });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request(`user/delete-user?id=${id}`, "GET", null);
  }

  async inviteUser(
    tripId: string,
    userId: string
  ): Promise<{ status: number; message: string }> {
    return this.request(
      `invite-user?tripId=${tripId}&userId=${userId}`,
      "GET",
      null
    );
  }

  async fetchDestinationData(
    destination: string,
    duration: number
  ): Promise<DestinationData> {
    return this.request(`destination-funnel`, "POST", {
      prompt: `${destination} - ${duration} jours.`,
    });
  }

  async sendNewRouteChatMessage(
    messages: any[],
    tripId: string,
    messageId: string,
    form: any
  ): Promise<DestinationData> {
    return this.request(`new-trip-chat`, "POST", {
      messages,
      tripId,
      messageId,
      form,
    });
  }

  async sendFirstRouteChatMessage(
    prompt: string,
    tripId: string,
    messageId: string
  ): Promise<DestinationData> {
    return this.request(`new-trip-chat/new`, "POST", {
      prompt,
      tripId,
      messageId,
    });
  }

  async createTripName(
    route: TripRoute | { location: string }[],
    tripId: string
  ): Promise<void> {
    return this.request(`create-name`, "POST", {
      route,
      tripId,
    });
  }

  async singleDestination(
    tripId: string,
    destination: string,
    duration: number
  ): Promise<void> {
    return this.request(`single-destination`, "POST", {
      tripId,
      destination,
      duration,
    });
  }

  async createTrip(
    prompt: string,
    tripId: string,
    route: TripRoute
  ): Promise<void> {
    return this.request(`new-trip-back`, "POST", {
      prompt,
      tripId,
      route,
    });
  }

  async sendTripChatMessage(
    tripId: string,
    userMsg: {
      id: string;
      content: string;
    },
    messageId: string
  ): Promise<void> {
    return this.request(`trip-chat`, "POST", {
      tripId,
      userMsg,
      messageId,
    });
  }
}

export const favel = new ApiClient(`${process.env.EXPO_PUBLIC_API_URL}/api`);
