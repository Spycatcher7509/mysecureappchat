export interface Message {
  id: number;
  content: string | null;
  sender_id: string;
  created_at: string | null;
  file_path: string | null;
  file_type: string | null;
}