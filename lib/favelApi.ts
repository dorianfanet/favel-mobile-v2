import {
  ChatMessage,
  DestinationData,
  NotificationsPreferences,
  Route,
  TripRoute,
  UserMetadata,
} from "@/types/types";
import { getDaysDiff } from "./utils";
import { Alert } from "react-native";
import { MMKV } from "@/app/_layout";

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
    data: any
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "X-Favel-Api-Key": process.env.EXPO_PUBLIC_FAVEL_API_KEY!,
        Authorization: `Bearer ${this.token}`,
      },
      body: data ? JSON.stringify(data) : null,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`Favel Error ${response.status}: ${error.message}`);
      return error;
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
    inviteId: string,
    userId: string,
    userName: string
  ): Promise<{ status: number; message: string; id: string }> {
    return this.request(
      `invite-user?inviteId=${inviteId}&userId=${userId}&userName=${userName}`,
      "GET",
      null
    );
  }

  async fetchDestinationData(
    destination: string,
    duration: number
  ): Promise<DestinationData> {
    return this.request(`destination-funnel-groq`, "POST", {
      prompt: `${destination} - ${duration} jours.`,
    });
  }

  async sendNewRouteChatMessage(
    messages: any[],
    tripId: string,
    messageId: string,
    form: any
  ): Promise<ChatMessage | { error: string }> {
    return this.request(`new-trip-chat-groq`, "POST", {
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
  ): Promise<ChatMessage | { error: string }> {
    return this.request(`new-trip-chat-groq/new`, "POST", {
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
    tripId: string,
    route: TripRoute,
    authorId: string
  ): Promise<void> {
    return this.request(`build-trip-groq`, "POST", {
      tripId,
      route,
      authorId: authorId,
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
    return this.request(`trip-chat-groq`, "POST", {
      tripId,
      userMsg,
      messageId,
    });
  }

  async sendActivityChatMessage(
    tripId: string,
    userMsg: {
      id: string;
      content: string;
    },
    messageId: string,
    activityId: string,
    activityName: string,
    authorId: string
  ): Promise<void> {
    return this.request(`activity-chat`, "POST", {
      tripId,
      userMsg,
      messageId,
      activityId,
      activityName,
      authorId,
    });
  }

  async updateActivity(
    id: string,
    params: {
      metadata?: boolean;
      description?: boolean;
    }
  ): Promise<{
    metadata?: {
      avg_duration: number;
      category: string;
      display_category: string;
    };
    description?: string;
  }> {
    return this.request(`update-activity`, "POST", {
      id,
      params,
    });
  }

  async updateImage(
    placeId: string,
    id: string
  ): Promise<{
    result: "ok" | "error";
  }> {
    return this.request(
      `find-activity-image?id=${id}&placeId=${placeId}`,
      "GET",
      null
    );
  }

  async revertModifications(
    tripId: string,
    editId: string,
    userMessageId: string
  ): Promise<{ result?: string }> {
    return this.request(
      `revert-modifications?tripId=${tripId}&editId=${editId}&userMessageId=${userMessageId}`,
      "GET",
      null
    );
  }

  async likePost(postId: string, userId: string): Promise<void> {
    return this.request(
      `post/like?userId=${userId}&postId=${postId}`,
      "GET",
      null
    );
  }

  async sendNotification(
    userId: string,
    title: string,
    body: string,
    data?: any,
    type?: string,
    authorId?: string
  ): Promise<void> {
    return this.request(`send-notification`, "POST", {
      userId,
      title,
      body,
      data,
      type,
      authorId,
    });
  }

  async createNewTripPost(
    tripId: string,
    authorId: string
  ): Promise<{ id: string }> {
    return this.request(
      `create-new-trip-post?tripId=${tripId}&authorId=${authorId}`,
      "GET",
      null
    );
  }

  async tripEdit(
    tripId: string,
    authorId: string,
    postId: string
  ): Promise<{ id: string }> {
    return this.request(
      `trip-edit?tripId=${tripId}&authorId=${authorId}&postId=${postId}`,
      "GET",
      null
    );
  }
}

export async function favelClient(getToken: any) {
  const token = await getToken({ template: "supabase" });

  if (token) {
    return new ApiClient(`${process.env.EXPO_PUBLIC_API_URL}/api`, token);
  } else {
    Alert.alert("Error", "Une erreur s'est produite. Veuillez réessayer.");
    throw new Error("No token found");
  }
}
