export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          permanent_credits: number;
          daily_credits: number;
          role: string;
          last_daily_credit_at: string | null;
          invited_by: string | null;
          invite_code: string | null;
          invited_count: number;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          permanent_credits?: number;
          daily_credits?: number;
          role?: string;
          last_daily_credit_at?: string | null;
          invited_by?: string | null;
          invite_code?: string | null;
          invited_count?: number;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          permanent_credits?: number;
          daily_credits?: number;
          role?: string;
          last_daily_credit_at?: string | null;
          invited_by?: string | null;
          invite_code?: string | null;
          invited_count?: number;
        };
      };
      verification_codes: {
        Row: {
          id: string;
          email: string;
          code: string;
          type: string;
          created_at: string;
          expires_at: string;
          used: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          code: string;
          type?: string;
          created_at?: string;
          expires_at: string;
          used?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          code?: string;
          type?: string;
          created_at?: string;
          expires_at?: string;
          used?: boolean;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          credit_type: string;
          transaction_type: string;
          description: string | null;
          related_agent: string | null;
          related_code: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          credit_type: string;
          transaction_type: string;
          description?: string | null;
          related_agent?: string | null;
          related_code?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          credit_type?: string;
          transaction_type?: string;
          description?: string | null;
          related_agent?: string | null;
          related_code?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      redemption_codes: {
        Row: {
          id: string;
          code: string;
          credits: number;
          expires_at: string;
          used_by: string | null;
          used_at: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          credits: number;
          expires_at: string;
          used_by?: string | null;
          used_at?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          credits?: number;
          expires_at?: string;
          used_by?: string | null;
          used_at?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
      invitations: {
        Row: {
          id: string;
          inviter_id: string;
          invitee_id: string;
          invite_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          inviter_id: string;
          invitee_id: string;
          invite_code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          inviter_id?: string;
          invitee_id?: string;
          invite_code?: string;
          created_at?: string;
        };
      };
      ip_registrations: {
        Row: {
          id: string;
          ip_address: string;
          user_id: string;
          registered_at: string;
        };
        Insert: {
          id?: string;
          ip_address: string;
          user_id: string;
          registered_at?: string;
        };
        Update: {
          id?: string;
          ip_address?: string;
          user_id?: string;
          registered_at?: string;
        };
      };
    };
    Functions: {
      deduct_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_agent_key: string;
          p_operation_type?: string | null;
        };
        Returns: string;
      };
      refund_credits: {
        Args: {
          p_transaction_id: string;
        };
        Returns: void;
      };
      add_permanent_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_type: string;
          p_description: string;
          p_related_code?: string | null;
        };
        Returns: void;
      };
      grant_daily_credits: {
        Args: {
          p_user_id: string;
        };
        Returns: void;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
