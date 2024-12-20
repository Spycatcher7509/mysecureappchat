import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, UserRound } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  nickname: string | null;
  online_status: boolean;
  last_seen: string | null;
}

const Index = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchProfiles();
      }
    };
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, "Session:", session);
      
      if (event === 'SIGNED_IN') {
        toast.success("Successfully signed in!");
        fetchProfiles();
      } else if (event === 'SIGNED_OUT') {
        toast.info("Signed out successfully");
        setProfiles([]);
      } else if (event === 'PASSWORD_RECOVERY') {
        toast.info("Password recovery email sent");
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('last_seen', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching profiles:', error.message);
      toast.error('Failed to load user list');
    } finally {
      setLoading(false);
    }
  };

  const handleResendLink = async () => {
    const email = prompt("Please enter your email address");
    if (!email) return;

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: 'https://lovable.dev/projects/67c142da-72c0-46bb-9a7d-cd6356951302'
        }
      });
      
      if (error) {
        console.error("Resend error:", error);
        toast.error(error.message);
      } else {
        toast.success("Verification link has been resent to your email!");
      }
    } catch (error: any) {
      console.error("Resend catch error:", error);
      toast.error("Failed to resend verification link");
    }
  };

  const startChat = (userId: string) => {
    navigate(`/chat?user=${userId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-4xl p-6 space-y-6 shadow-lg">
        <h1 className="text-2xl font-bold text-center text-foreground">Welcome to Secure Chat</h1>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : profiles.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Available Users
            </h2>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <div className="space-y-4">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} />
                        <AvatarFallback>{profile.nickname?.[0] || profile.email[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{profile.nickname || profile.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.online_status ? (
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-green-500"></span> Online
                            </span>
                          ) : (
                            'Offline'
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => startChat(profile.id)}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Chat
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(var(--primary))',
                    brandAccent: 'rgb(var(--primary))',
                  }
                }
              },
              className: {
                container: 'w-full',
                button: 'w-full px-4 py-2 rounded',
                input: 'w-full px-3 py-2 rounded border',
                message: 'text-sm text-red-500'
              }
            }}
            theme="dark"
            providers={[]}
            redirectTo="https://lovable.dev/projects/67c142da-72c0-46bb-9a7d-cd6356951302/chat"
          />
        )}
        
        {!profiles.length && (
          <div className="text-center space-y-2">
            <Button variant="ghost" onClick={handleResendLink}>
              Resend verification link
            </Button>
            <p className="text-sm text-muted-foreground">
              If you're having trouble signing in, make sure you've verified your email address.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Index;