import {
  AssistantDestination,
  ChatMessage,
  DestinationData,
  NewTripForm,
  NotificationsPreferences,
  Route,
  TripRoute,
  UserMetadata,
} from "@/types/types";
import { getDaysDiff } from "./utils";
import { Alert } from "react-native";
import { MMKV } from "@/app/_layout";
import { Form } from "@/context/newTrip";
import { FullConversation } from "@/context/assistantContext";

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
    console.log("JWT", this.token);
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

    console.log("response", response);
    console.log("response.ok", response.ok);

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
          error: JSON.stringify(error) || "Internal Server Error`",
          data: null,
        };
      }
    }

    return {
      data: (await response.json()) || null,
      error: null,
    };
  }

  async getUser(id: string): Promise<UserMetadata> {
    const result = await this.request(`user/get-user?id=${id}`, "GET", null);
    return result.data.user;
  }

  async updateUser(id: string, data: any): Promise<void> {
    this.request(`user/update-user?id=${id}`, "POST", { data: data });
  }

  async deleteUser(id: string): Promise<void> {
    this.request(`user/delete-user?id=${id}`, "GET", null);
  }

  async inviteUser(
    inviteId: string,
    userId: string,
    userName: string
  ): Promise<{ status: number; message: string; id: string }> {
    const result = await this.request(
      `invite-user?inviteId=${inviteId}&userId=${userId}&userName=${userName}`,
      "GET",
      null
    );
    return result.data;
  }

  async fetchDestinationData(
    destination: string,
    duration: number
  ): Promise<DestinationData> {
    const result = await this.request(`destination-funnel-groq`, "POST", {
      prompt: `${destination} - ${duration} jours.`,
    });
    return result.data;
  }

  async sendNewRouteChatMessage(
    messages: any[],
    tripId: string,
    messageId: string,
    form: any
  ): Promise<ChatMessage | { error: string }> {
    const result = await this.request(`new-trip-chat-groq`, "POST", {
      messages,
      tripId,
      messageId,
      form,
    });
    return result.data;
  }

  async sendFirstRouteChatMessage(
    prompt: string,
    tripId: string,
    messageId: string
  ): Promise<ChatMessage | { error: string }> {
    const result = await this.request(`new-trip-chat-groq/new`, "POST", {
      prompt,
      tripId,
      messageId,
    });
    return result.data;
  }

  async createTripName(
    route: TripRoute | { location: string }[],
    tripId: string
  ): Promise<void> {
    const result = await this.request(`create-name`, "POST", {
      route,
      tripId,
    });
    return result.data;
  }

  async singleDestination(
    tripId: string,
    destination: string,
    duration: number
  ): Promise<void> {
    const result = await this.request(`single-destination`, "POST", {
      tripId,
      destination,
      duration,
    });
    return result.data;
  }

  async createTrip(
    tripId: string,
    route: TripRoute,
    authorId: string,
    conversation: FullConversation
  ): Promise<void> {
    const result = await this.request(`build-trip-groq-v2`, "POST", {
      tripId,
      route,
      authorId: authorId,
      conversation: conversation.messages,
    });
    return result.data;
  }

  async sendTripChatMessage(
    tripId: string,
    userMsg: {
      id: string;
      content: string;
    },
    messageId: string
  ): Promise<void> {
    const result = await this.request(`trip-chat-groq`, "POST", {
      tripId,
      userMsg,
      messageId,
    });
    return result.data;
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
    const result = await this.request(`activity-chat`, "POST", {
      tripId,
      userMsg,
      messageId,
      activityId,
      activityName,
      authorId,
    });
    return result.data;
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
    const result = await this.request(`update-activity`, "POST", {
      id,
      params,
    });
    return result.data;
  }

  async updateImage(
    placeId: string,
    id: string
  ): Promise<{
    result: "ok" | "error";
  }> {
    const result = await this.request(
      `find-activity-image?id=${id}&placeId=${placeId}`,
      "GET",
      null
    );
    return result.data;
  }

  async revertModifications(
    tripId: string,
    editId: string,
    userMessageId: string
  ): Promise<{ result?: string }> {
    const result = await this.request(
      `revert-modifications?tripId=${tripId}&editId=${editId}&userMessageId=${userMessageId}`,
      "GET",
      null
    );
    return result.data;
  }

  async likePost(postId: string, userId: string): Promise<void> {
    const result = await this.request(
      `post/like?userId=${userId}&postId=${postId}`,
      "GET",
      null
    );
    return result.data;
  }

  async sendNotification(
    userId: string,
    title: string,
    body: string,
    data?: any,
    type?: string,
    authorId?: string
  ): Promise<void> {
    const result = await this.request(`send-notification`, "POST", {
      userId,
      title,
      body,
      data,
      type,
      authorId,
    });
    return result.data;
  }

  async createNewTripPost(
    tripId: string,
    authorId: string
  ): Promise<{ id: string }> {
    const result = await this.request(
      `create-new-trip-post?tripId=${tripId}&authorId=${authorId}`,
      "GET",
      null
    );
    return result.data;
  }

  async tripEdit(
    tripId: string,
    authorId: string,
    postId: string
  ): Promise<{ id: string }> {
    const result = await this.request(
      `trip-edit?tripId=${tripId}&authorId=${authorId}&postId=${postId}`,
      "GET",
      null
    );
    return result.data;
  }

  async tripConversationFavel(
    conversation_id: string,
    favelId: string,
    suggestions: {
      id: string;
      mentionName: string;
    }[],
    tripId: string
  ): Promise<void> {
    const result = await this.request(
      `trip-conversation-favel?conversationId=${conversation_id}&favelId=${favelId}&tripId=${tripId}`,
      "POST",
      {
        suggestions,
      }
    );
    return result.data;
  }

  async tripConversationFavelApplyModifications(
    message: string,
    tripId: string,
    messageId: string
  ): Promise<Response<any>> {
    console.log(
      "tripConversationFavelApplyModifications",
      message,
      tripId,
      messageId
    );
    return this.request(
      `trip-conversation-favel/apply-modifications?tripId=${tripId}&messageId=${messageId}`,
      "POST",
      {
        message,
      }
    );
  }

  async tripConversationFavelRevert(
    tripId: string,
    messageId: string
  ): Promise<Response<any>> {
    return this.request(
      `trip-conversation-favel/revert?tripId=${tripId}&messageId=${messageId}`,
      "GET",
      null
    );
  }

  async createTripConversation(tripId: string): Promise<{ id: string }> {
    const result = await this.request(
      `create-trip-conversation?tripId=${tripId}`,
      "GET",
      null
    );
    return result.data;
  }

  async getRouteValidationText(): Promise<
    Response<{
      list: string[];
    }>
  > {
    return this.request(`route-validation-text`, "GET", null);
  }

  assistant(signal?: AbortSignal) {
    return {
      send: async (
        conversation: FullConversation,
        tripId: string
      ): Promise<Response<any>> => {
        return await this.request(
          `assistant/send`,
          "POST",
          {
            conversation,
            tripId,
          },
          signal
        );
      },
      destination: async (
        destination: string
      ): Promise<Response<AssistantDestination>> => {
        return await this.request(
          `assistant/destination?destination=${destination}`,
          "GET",
          null,
          signal
        );
      },
      applyDuration: async (
        route: TripRoute,
        duration: number
      ): Promise<Response<TripRoute>> => {
        return await this.request(
          `assistant/apply-duration`,
          "POST",
          {
            route,
            duration,
          },
          signal
        );
      },
    };
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
