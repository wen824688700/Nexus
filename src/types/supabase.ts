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
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      verification_codes: {
        Row: {
          id: string
          email: string
          code: string
          type: string
          created_at: string
          expires_at: string
          used: boolean
        }
        Insert: {
          id?: string
          email: string
          code: string
          type?: string
          created_at?: string
          expires_at: string
          used?: boolean
        }
        Update: {
          id?: string
          email?: string
          code?: string
          type?: string
          created_at?: string
          expires_at?: string
          used?: boolean
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
