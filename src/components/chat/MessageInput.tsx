import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send } from "lucide-react";
import { useRef } from "react";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MessageInput = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleFileUpload,
}: MessageInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
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
  );
};