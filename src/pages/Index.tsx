import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const Index = () => {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar - Conversations List */}
      <div className="w-80 border-r border-border">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Messages</h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            {[1, 2, 3].map((conversation) => (
              <Card
                key={conversation}
                className="mb-2 p-3 hover:bg-accent transition-colors cursor-pointer animate-fade-in"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${conversation}`} />
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">User {conversation}</p>
                    <p className="text-xs text-muted-foreground">Last message...</p>
                  </div>
                  <div className="text-xs text-muted-foreground">2m ago</div>
                </div>
              </Card>
            ))}
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://avatar.vercel.sh/chat" />
              <AvatarFallback>CH</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">Chat Room</h2>
              <p className="text-sm text-muted-foreground">2 participants</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((message) => (
              <div
                key={message}
                className={`flex ${
                  message % 2 === 0 ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 animate-fade-in ${
                    message % 2 === 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">This is a sample message {message}</p>
                  <span className="text-xs opacity-70">12:34 PM</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;