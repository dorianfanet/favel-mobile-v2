export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      place_opening_hours: {
        Row: {
          close: string;
          created_at: string;
          id: string;
          open: string;
          place_id: string;
          week_day: number;
        };
        Insert: {
          close: string;
          created_at?: string;
          id?: string;
          open: string;
          place_id?: string;
          week_day: number;
        };
        Update: {
          close?: string;
          created_at?: string;
          id?: string;
          open?: string;
          place_id?: string;
          week_day?: number;
        };
        Relationships: [
          {
            foreignKeyName: "opening_hours_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          }
        ];
      };
      place_photos: {
        Row: {
          attributions: Json | null;
          created_at: string;
          id: string;
          place_id: string;
          uri: string;
        };
        Insert: {
          attributions?: Json | null;
          created_at?: string;
          id?: string;
          place_id: string;
          uri: string;
        };
        Update: {
          attributions?: Json | null;
          created_at?: string;
          id?: string;
          place_id?: string;
          uri?: string;
        };
        Relationships: [
          {
            foreignKeyName: "place_photos_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          }
        ];
      };
      place_reviews: {
        Row: {
          author_name: string | null;
          author_photo: string | null;
          created_at: string;
          id: number;
          language: string | null;
          original_language: string | null;
          place_id: string;
          rating: number;
          source: string;
          text: string;
          time: string | null;
          translated: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          author_name?: string | null;
          author_photo?: string | null;
          created_at?: string;
          id?: number;
          language?: string | null;
          original_language?: string | null;
          place_id: string;
          rating: number;
          source: string;
          text: string;
          time?: string | null;
          translated?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          author_name?: string | null;
          author_photo?: string | null;
          created_at?: string;
          id?: number;
          language?: string | null;
          original_language?: string | null;
          place_id?: string;
          rating?: number;
          source?: string;
          text?: string;
          time?: string | null;
          translated?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "place_reviews_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          }
        ];
      };
      place_translations: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          lang: string;
          name: string;
          place_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          lang: string;
          name: string;
          place_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          lang?: string;
          name?: string;
          place_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "place_translations_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          }
        ];
      };
      places: {
        Row: {
          category: string | null;
          coordinates: unknown;
          created_at: string;
          gmaps_place_id: string | null;
          id: string;
          latitude: number;
          longitude: number;
          rating: number | null;
          thumbnail: string | null;
          total_reviews: number | null;
          updated_at: string | null;
        };
        Insert: {
          category?: string | null;
          coordinates: unknown;
          created_at?: string;
          gmaps_place_id?: string | null;
          id?: string;
          latitude: number;
          longitude: number;
          rating?: number | null;
          thumbnail?: string | null;
          total_reviews?: number | null;
          updated_at?: string | null;
        };
        Update: {
          category?: string | null;
          coordinates?: unknown;
          created_at?: string;
          gmaps_place_id?: string | null;
          id?: string;
          latitude?: number;
          longitude?: number;
          rating?: number | null;
          thumbnail?: string | null;
          total_reviews?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "places_thumbnail_fkey";
            columns: ["thumbnail"];
            isOneToOne: false;
            referencedRelation: "place_photos";
            referencedColumns: ["id"];
          }
        ];
      };
      trip_activities: {
        Row: {
          created_at: string;
          day_id: string;
          id: string;
          place_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          day_id: string;
          id?: string;
          place_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          day_id?: string;
          id?: string;
          place_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "trip_activities_day_id_fkey";
            columns: ["day_id"];
            isOneToOne: false;
            referencedRelation: "trip_days";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trip_activities_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          }
        ];
      };
      trip_days: {
        Row: {
          center_point: unknown;
          created_at: string;
          date: string;
          id: string;
          latitude: number;
          longitude: number;
          name: string;
          stage_id: string;
          trip_id: string;
          updated_at: string | null;
        };
        Insert: {
          center_point: unknown;
          created_at?: string;
          date: string;
          id?: string;
          latitude: number;
          longitude: number;
          name: string;
          stage_id: string;
          trip_id?: string;
          updated_at?: string | null;
        };
        Update: {
          center_point?: unknown;
          created_at?: string;
          date?: string;
          id?: string;
          latitude?: number;
          longitude?: number;
          name?: string;
          stage_id?: string;
          trip_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "trip_days_stage_id_fkey";
            columns: ["stage_id"];
            isOneToOne: false;
            referencedRelation: "trip_stages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trip_days_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          }
        ];
      };
      trip_events: {
        Row: {
          created_at: string;
          end: string;
          end_day_id: string | null;
          id: string;
          place_id: string | null;
          start: string;
          start_day_id: string;
          trip_id: string;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          end: string;
          end_day_id?: string | null;
          id?: string;
          place_id?: string | null;
          start: string;
          start_day_id: string;
          trip_id: string;
          type: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          end?: string;
          end_day_id?: string | null;
          id?: string;
          place_id?: string | null;
          start?: string;
          start_day_id?: string;
          trip_id?: string;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "trip_events_end_day_id_fkey";
            columns: ["end_day_id"];
            isOneToOne: false;
            referencedRelation: "trip_days";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trip_events_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trip_events_start_day_id_fkey";
            columns: ["start_day_id"];
            isOneToOne: false;
            referencedRelation: "trip_days";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trip_events_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          }
        ];
      };
      trip_members: {
        Row: {
          created_at: string;
          id: string;
          nickname: string | null;
          trip_id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          nickname?: string | null;
          trip_id: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          nickname?: string | null;
          trip_id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trip_members_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trip_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      trip_nights: {
        Row: {
          created_at: string;
          end_date: string;
          id: string;
          place_id: string;
          stage_id: string;
          start_date: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          end_date: string;
          id?: string;
          place_id: string;
          stage_id: string;
          start_date: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          end_date?: string;
          id?: string;
          place_id?: string;
          stage_id?: string;
          start_date?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "trip_nights_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trip_nights_stage_id_fkey";
            columns: ["stage_id"];
            isOneToOne: false;
            referencedRelation: "trip_stages";
            referencedColumns: ["id"];
          }
        ];
      };
      trip_stages: {
        Row: {
          created_at: string;
          end_date: string;
          id: string;
          name: string;
          start_date: string;
          thumbnail: string | null;
          trip_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          end_date: string;
          id?: string;
          name: string;
          start_date: string;
          thumbnail?: string | null;
          trip_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          end_date?: string;
          id?: string;
          name?: string;
          start_date?: string;
          thumbnail?: string | null;
          trip_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "trip_stages_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          }
        ];
      };
      trip_transports: {
        Row: {
          created_at: string;
          id: string;
          duration: number;
          length: number;
          departure_coordinates: {
            lat: number;
            lng: number;
          };
          arrival_coordinates: {
            lat: number;
            lng: number;
          };
        };
        Insert: {
          created_at?: string;
          id?: string;
          duration: number;
          length: number;
          departure_coordinates: {
            lat: number;
            lng: number;
          };
          arrival_coordinates: {
            lat: number;
            lng: number;
          };
        };
        Update: {
          created_at?: string;
          id?: string;
          duration: number;
          length: number;
          departure_coordinates: {
            lat: number;
            lng: number;
          };
          arrival_coordinates: {
            lat: number;
            lng: number;
          };
        };
        Relationships: [
          {
            foreignKeyName: "trip_transports_related_event_fkey";
            columns: ["related_event"];
            isOneToOne: false;
            referencedRelation: "trip_events";
            referencedColumns: ["id"];
          }
        ];
      };
      trips: {
        Row: {
          created_at: string;
          creator_id: string;
          departure_date: string;
          id: string;
          name: string;
          return_date: string;
          thumbnail: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          creator_id?: string;
          departure_date: string;
          id?: string;
          name: string;
          return_date: string;
          thumbnail: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          creator_id?: string;
          departure_date?: string;
          id?: string;
          name?: string;
          return_date?: string;
          thumbnail?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "trips_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          created_at: string;
          email: string;
          first_name: string | null;
          id: string;
          last_name: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_place_details: {
        Args: {
          place_id_param: string;
          lang_param?: string;
        };
        Returns: Json;
      };
      get_trip_events_with_place_details: {
        Args: {
          trip_id_param: string;
          lang_param: string;
        };
        Returns: Json;
      };
      requesting_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;
