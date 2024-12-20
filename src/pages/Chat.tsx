import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut, Send, Paperclip, Image, FileText } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Message {
  id: number;
  content: string | null;
  sender_id: string;
  created_at: string | null;
  file_path: string | null;
  file_type: string | null;
}

const Chat = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Message[];
    },
  });

  const sendMessage = useMutation({
    mutationFn: async ({ content, filePath, fileType }: { content?: string, filePath?: string, fileType?: string }) => {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            content,
            file_path: filePath,
            file_type: fileType,
            sender_id: (await supabase.auth.getUser()).data.user?.id,
          },
        ]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setNewMessage("");
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      sendMessage.mutate({ content: newMessage });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://cnwbjhuaafklcredknbo.supabase.co/functions/v1/upload-file', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      sendMessage.mutate({ 
        filePath: data.filePath,
        fileType: data.fileType,
        content: `Shared file: ${data.fileName}`
      });
      
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
      console.error('Upload error:', error);
    }
  };

  const renderMessage = (message: Message) => {
    const isCurrentUser = message.sender_id === supabase.auth.getUser().data.user?.id;
    
    return (
      <div
        key={message.id}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[70%] rounded-lg p-3 ${
            isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          {message.file_path && (
            <div className="mb-2">
              {message.file_type?.startsWith('image/') ? (
                <img
                  src={`https://cnwbjhuaafklcredknbo.supabase.co/storage/v1/object/public/chat_attachments/${message.file_path}`}
                  alt="Shared image"
                  className="max-w-full rounded"
                />
              ) : (
                <a
                  href={`https://cnwbjhuaafklcredknbo.supabase.co/storage/v1/object/public/chat_attachments/${message.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                >
                  <FileText className="h-4 w-4" />
                  Download file
                </a>
              )}
            </div>
          )}
          <p>{message.content}</p>
          <span className="text-xs opacity-70 mt-1 block">
            {new Date(message.created_at!).toLocaleTimeString()}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold">Chat</h1>
        <Button variant="ghost" onClick={() => supabase.auth.signOut()}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading messages...</p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;