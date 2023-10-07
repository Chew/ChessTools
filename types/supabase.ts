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
      games: {
        Row: TableGames
        Insert: {
          black_player?: string | null
          created_at?: string
          id?: string
          pgn?: string | null
          result?: number | null
          user_id: string
          white_player?: string | null
        }
        Update: {
          black_player?: string | null
          created_at?: string
          id?: string
          pgn?: string | null
          result?: number | null
          user_id?: string
          white_player?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_black_player_fkey"
            columns: ["black_player"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_white_player_fkey"
            columns: ["white_player"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      integrations: {
        Row: TableIntegrations
        Insert: {
          created_at?: string
          data: Json
          id?: string
          platform: string
          user_id: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          platform?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "integrations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
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

export interface TableIntegrations {
  created_at: string
  data: { id: number, username?: string }
  id: string
  platform: string
  user_id: string | null
  verified: boolean
}

export interface TableGames {
  black_player: string | null
  created_at: string
  id: string
  pgn: string
  result: number | null
  user_id: string
  white_player: string | null
}
