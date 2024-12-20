import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import { Message } from "@/types/chat";

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  isLoading: boolean;
}

export const MessageList = ({ messages, currentUserId, isLoading }: MessageListProps) => {
  const renderMessage = (message: Message) => {
    const isCurrentUser = message.sender_id === currentUserId;
    
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
    <ScrollArea className="flex-1 p-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <p>Loading messages...</p>
        </div>
      ) : (
        messages.map(renderMessage)
      )}
    </ScrollArea>
  );
};