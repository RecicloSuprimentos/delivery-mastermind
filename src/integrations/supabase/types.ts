export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agent_locations: {
        Row: {
          agent_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          route_id: string | null
          route_stop_id: string | null
          timestamp: string | null
        }
        Insert: {
          agent_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          route_id?: string | null
          route_stop_id?: string | null
          timestamp?: string | null
        }
        Update: {
          agent_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          route_id?: string | null
          route_stop_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_locations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "system_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_locations_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_locations_route_stop_id_fkey"
            columns: ["route_stop_id"]
            isOneToOne: false
            referencedRelation: "route_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string | null
          updated_at: string
          user_type: string | null
        }
        Insert: {
          created_at?: string
          id: string
          is_active?: boolean | null
          name?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Relationships: []
      }
      route_stops: {
        Row: {
          created_at: string | null
          distance_from_previous: number | null
          duration_from_previous: number | null
          estimated_arrival_time: string | null
          estimated_departure_time: string | null
          id: string
          route_id: string | null
          sequence_number: number
          service_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          distance_from_previous?: number | null
          duration_from_previous?: number | null
          estimated_arrival_time?: string | null
          estimated_departure_time?: string | null
          id?: string
          route_id?: string | null
          sequence_number: number
          service_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          distance_from_previous?: number | null
          duration_from_previous?: number | null
          estimated_arrival_time?: string | null
          estimated_departure_time?: string | null
          id?: string
          route_id?: string | null
          sequence_number?: number
          service_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          agent_id: string | null
          created_at: string | null
          end_location_reference: string
          end_location_type: Database["public"]["Enums"]["location_type"]
          id: string
          name: string
          start_location_reference: string
          start_location_type: Database["public"]["Enums"]["location_type"]
          start_time: string
          status: string | null
          total_distance: number | null
          total_duration: number | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          end_location_reference: string
          end_location_type: Database["public"]["Enums"]["location_type"]
          id?: string
          name: string
          start_location_reference: string
          start_location_type: Database["public"]["Enums"]["location_type"]
          start_time: string
          status?: string | null
          total_distance?: number | null
          total_duration?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          end_location_reference?: string
          end_location_type?: Database["public"]["Enums"]["location_type"]
          id?: string
          name?: string
          start_location_reference?: string
          start_location_type?: Database["public"]["Enums"]["location_type"]
          start_time?: string
          status?: string | null
          total_distance?: number | null
          total_duration?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "system_users"
            referencedColumns: ["id"]
          },
        ]
      }
      service_checklists: {
        Row: {
          collected_items: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          observations: string | null
          payment_method_id: string | null
          responsible_name: string
          service_id: string
          type: Database["public"]["Enums"]["service_type"]
          updated_at: string | null
        }
        Insert: {
          collected_items?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          observations?: string | null
          payment_method_id?: string | null
          responsible_name: string
          service_id: string
          type: Database["public"]["Enums"]["service_type"]
          updated_at?: string | null
        }
        Update: {
          collected_items?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          observations?: string | null
          payment_method_id?: string | null
          responsible_name?: string
          service_id?: string
          type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_checklists_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_checklists_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_failure_reasons: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_other: boolean | null
          latitude: number | null
          longitude: number | null
          observations: string | null
          reason: string
          reason_id: string | null
          service_id: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_other?: boolean | null
          latitude?: number | null
          longitude?: number | null
          observations?: string | null
          reason: string
          reason_id?: string | null
          service_id?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_other?: boolean | null
          latitude?: number | null
          longitude?: number | null
          observations?: string | null
          reason?: string
          reason_id?: string | null
          service_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_failure_reasons_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          address: string
          complement: string | null
          created_at: string | null
          customer_name: string
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          observations: string | null
          phone: string
          service_id: string
          status: string | null
          time_window: string | null
          type: Database["public"]["Enums"]["service_type"]
        }
        Insert: {
          address: string
          complement?: string | null
          created_at?: string | null
          customer_name: string
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          observations?: string | null
          phone: string
          service_id: string
          status?: string | null
          time_window?: string | null
          type: Database["public"]["Enums"]["service_type"]
        }
        Update: {
          address?: string
          complement?: string | null
          created_at?: string | null
          customer_name?: string
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          observations?: string | null
          phone?: string
          service_id?: string
          status?: string | null
          time_window?: string | null
          type?: Database["public"]["Enums"]["service_type"]
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          google_maps_key: string | null
          id: string
          operational_base_address: string | null
          operational_base_latitude: number | null
          operational_base_longitude: number | null
          service_default_duration: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          google_maps_key?: string | null
          id?: string
          operational_base_address?: string | null
          operational_base_latitude?: number | null
          operational_base_longitude?: number | null
          service_default_duration?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          google_maps_key?: string | null
          id?: string
          operational_base_address?: string | null
          operational_base_latitude?: number | null
          operational_base_longitude?: number | null
          service_default_duration?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_type: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_type: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      location_type: "operational_base" | "service"
      service_type: "coleta" | "entrega"
      user_type: "admin" | "user" | "agent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
