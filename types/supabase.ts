export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: TableUser
        Insert: {
          bio?: string | null
          created_at?: string
          first_name?: string | null
          flags?: number | null
          id?: string
          last_name?: string | null
          username?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          first_name?: string | null
          flags?: number | null
          id?: string
          last_name?: string | null
          username?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export interface TableUser {
  bio: string | null
  created_at: string
  first_name: string | null
  flags: number | null
  id: string
  last_name: string | null
  username: string | null
}
