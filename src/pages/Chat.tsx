import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { Message } from "@/types/chat";

const Chat = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>();
  const [currentUserEmail, setCurrentUserEmail] = useState<string>();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/");
      } else {
        setCurrentUserId(session.user.id);
        setCurrentUserEmail(session.user.email);
      }
    });

    // Set initial user ID and email
    supabase.auth.getUser().then(({ data: { user }}) => {
      if (user) {
        setCurrentUserId(user.id);
        setCurrentUserEmail(user.email);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const sendDiscordNotification = async (content: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await supabase.functions.invoke('discord-notification', {
        body: {
          type: 'new_message',
          content,
          username: currentUserEmail
        }
      });

      if (response.error) {
        console.error('Discord notification error:', response.error);
      }
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }
  };

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
            sender_id: currentUserId,
          },
        ]);
      
      if (error) throw error;

      // Send Discord notification for new message
      if (content) {
        await sendDiscordNotification(content);
      }
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold">Chat</h1>
        <Button variant="ghost" onClick={() => supabase.auth.signOut()}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <MessageList 
        messages={messages}
        currentUserId={currentUserId}
        isLoading={isLoading}
      />

      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        handleFileUpload={handleFileUpload}
      />
    </div>
  );
};

export default Chat;