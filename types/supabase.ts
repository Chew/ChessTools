export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type TournamentJson = {
  type: string,
  eventId: string,
  section: number,
  player: number,
  opponent: number
}

type IntegrationJson = {
  id: string
  username?: string
}

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          black_player: string | null
          created_at: string
          id: string
          pgn: string | null
          tournament_info: TournamentJson | null
          user_id: string
          white_player: string | null
        }
        Insert: {
          black_player?: string | null
          created_at?: string
          id?: string
          pgn?: string | null
          tournament_info?: TournamentJson | null
          user_id: string
          white_player?: string | null
        }
        Update: {
          black_player?: string | null
          created_at?: string
          id?: string
          pgn?: string | null
          tournament_info?: TournamentJson | null
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
        Row: {
          created_at: string
          data: IntegrationJson
          id: string
          platform: string
          user_id: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          data: IntegrationJson
          id?: string
          platform: string
          user_id: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          data?: IntegrationJson
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
        Row: {
          bio: string | null
          created_at: string
          first_name: string | null
          flags: number | null
          id: string
          last_name: string | null
          username: string | null
        }
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

export type TableUser = Database["public"]["Tables"]["users"]["Row"]
export type TableIntegrations = Database["public"]["Tables"]["integrations"]["Row"]
export type TableGames = Database["public"]["Tables"]["games"]["Row"]
