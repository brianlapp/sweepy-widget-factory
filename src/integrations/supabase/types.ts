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
      sweepstakes: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string
          entries_to_draw: number
          id: string
          image_url: string | null
          impression_pixel: string | null
          is_active: boolean | null
          prize_info: string | null
          start_date: string
          thank_you_headline: string | null
          thank_you_image_url: string | null
          title: string
          tracking_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          entries_to_draw?: number
          id?: string
          image_url?: string | null
          impression_pixel?: string | null
          is_active?: boolean | null
          prize_info?: string | null
          start_date?: string
          thank_you_headline?: string | null
          thank_you_image_url?: string | null
          title: string
          tracking_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          entries_to_draw?: number
          id?: string
          image_url?: string | null
          impression_pixel?: string | null
          is_active?: boolean | null
          prize_info?: string | null
          start_date?: string
          thank_you_headline?: string | null
          thank_you_image_url?: string | null
          title?: string
          tracking_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sweepstakes_entries: {
        Row: {
          age: number | null
          country: string | null
          created_at: string | null
          email: string
          first_name: string
          gender: string | null
          id: string
          is_winner: boolean | null
          last_name: string
          postal_code: string | null
          sweepstakes_id: string | null
          terms_accepted: boolean
        }
        Insert: {
          age?: number | null
          country?: string | null
          created_at?: string | null
          email: string
          first_name: string
          gender?: string | null
          id?: string
          is_winner?: boolean | null
          last_name: string
          postal_code?: string | null
          sweepstakes_id?: string | null
          terms_accepted?: boolean
        }
        Update: {
          age?: number | null
          country?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          gender?: string | null
          id?: string
          is_winner?: boolean | null
          last_name?: string
          postal_code?: string | null
          sweepstakes_id?: string | null
          terms_accepted?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "sweepstakes_entries_sweepstakes_id_fkey"
            columns: ["sweepstakes_id"]
            isOneToOne: false
            referencedRelation: "sweepstakes"
            referencedColumns: ["id"]
          },
        ]
      }
      sweepstakes_settings: {
        Row: {
          created_at: string | null
          id: string
          show_age_verification: boolean | null
          show_country_selection: boolean | null
          show_gender_selection: boolean | null
          sweepstakes_id: string | null
          updated_at: string | null
          use_beehiiv: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          show_age_verification?: boolean | null
          show_country_selection?: boolean | null
          show_gender_selection?: boolean | null
          sweepstakes_id?: string | null
          updated_at?: string | null
          use_beehiiv?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          show_age_verification?: boolean | null
          show_country_selection?: boolean | null
          show_gender_selection?: boolean | null
          sweepstakes_id?: string | null
          updated_at?: string | null
          use_beehiiv?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "sweepstakes_settings_sweepstakes_id_fkey"
            columns: ["sweepstakes_id"]
            isOneToOne: false
            referencedRelation: "sweepstakes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
