export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          sort_order: number | null
          subtitle: string | null
          subtitle_bn: string | null
          title: string | null
          title_bn: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          sort_order?: number | null
          subtitle?: string | null
          subtitle_bn?: string | null
          title?: string | null
          title_bn?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          sort_order?: number | null
          subtitle?: string | null
          subtitle_bn?: string | null
          title?: string | null
          title_bn?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          name_bn: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          name_bn: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          name_bn?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cms_pages: {
        Row: {
          content: string | null
          content_bn: string | null
          id: string
          is_active: boolean | null
          meta_description: string | null
          meta_title: string | null
          slug: string
          title: string
          title_bn: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          content_bn?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          title: string
          title_bn?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          content_bn?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          title?: string
          title_bn?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_value: number | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_value?: number | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_value?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      courier_services: {
        Row: {
          api_key: string | null
          api_secret: string | null
          created_at: string | null
          free_delivery_min_order: number | null
          id: string
          inside_dhaka_charge: number | null
          is_active: boolean | null
          name: string
          outside_dhaka_charge: number | null
          type: string
        }
        Insert: {
          api_key?: string | null
          api_secret?: string | null
          created_at?: string | null
          free_delivery_min_order?: number | null
          id?: string
          inside_dhaka_charge?: number | null
          is_active?: boolean | null
          name: string
          outside_dhaka_charge?: number | null
          type: string
        }
        Update: {
          api_key?: string | null
          api_secret?: string | null
          created_at?: string | null
          free_delivery_min_order?: number | null
          id?: string
          inside_dhaka_charge?: number | null
          is_active?: boolean | null
          name?: string
          outside_dhaka_charge?: number | null
          type?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price: number
          product_id: string | null
          product_name: string
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price: number
          product_id?: string | null
          product_name: string
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          area: string | null
          city: string
          courier_name: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          discount: number | null
          id: string
          notes: string | null
          order_number: string
          order_status: string | null
          payment_method: string
          payment_status: string | null
          serial_number: number | null
          shipping_address: string
          shipping_cost: number | null
          subtotal: number
          total: number
          tracking_number: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          area?: string | null
          city: string
          courier_name?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          discount?: number | null
          id?: string
          notes?: string | null
          order_number: string
          order_status?: string | null
          payment_method: string
          payment_status?: string | null
          serial_number?: number | null
          shipping_address: string
          shipping_cost?: number | null
          subtotal: number
          total: number
          tracking_number?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          area?: string | null
          city?: string
          courier_name?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          discount?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          order_status?: string | null
          payment_method?: string
          payment_status?: string | null
          serial_number?: number | null
          shipping_address?: string
          shipping_cost?: number | null
          subtotal?: number
          total?: number
          tracking_number?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_number: string | null
          created_at: string | null
          id: string
          instructions: string | null
          instructions_bn: string | null
          is_active: boolean | null
          name: string
          name_bn: string
          sort_order: number | null
          type: string
        }
        Insert: {
          account_number?: string | null
          created_at?: string | null
          id?: string
          instructions?: string | null
          instructions_bn?: string | null
          is_active?: boolean | null
          name: string
          name_bn: string
          sort_order?: number | null
          type: string
        }
        Update: {
          account_number?: string | null
          created_at?: string | null
          id?: string
          instructions?: string | null
          instructions_bn?: string | null
          is_active?: boolean | null
          name?: string
          name_bn?: string
          sort_order?: number | null
          type?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          description_bn: string | null
          how_to_use: string | null
          how_to_use_bn: string | null
          id: string
          images: string[] | null
          ingredients: string | null
          ingredients_bn: string | null
          is_active: boolean | null
          is_featured: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          name_bn: string
          price: number
          sale_price: number | null
          slug: string
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          description_bn?: string | null
          how_to_use?: string | null
          how_to_use_bn?: string | null
          id?: string
          images?: string[] | null
          ingredients?: string | null
          ingredients_bn?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          name_bn: string
          price: number
          sale_price?: number | null
          slug: string
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          description_bn?: string | null
          how_to_use?: string | null
          how_to_use_bn?: string | null
          id?: string
          images?: string[] | null
          ingredients?: string | null
          ingredients_bn?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          name_bn?: string
          price?: number
          sale_price?: number | null
          slug?: string
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_name: string
          id: string
          is_approved: boolean | null
          product_id: string | null
          rating: number | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_name: string
          id?: string
          is_approved?: boolean | null
          product_id?: string | null
          rating?: number | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_name?: string
          id?: string
          is_approved?: boolean | null
          product_id?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_admin: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_coupon_usage: {
        Args: { coupon_code_param: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "staff"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff"],
    },
  },
} as const
