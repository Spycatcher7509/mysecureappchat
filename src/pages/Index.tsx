import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check current session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        navigate('/chat');
      }
    };
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, "Session:", session);
      setSession(session);
      
      if (event === 'SIGNED_IN') {
        toast.success("Successfully signed in!");
        navigate('/chat');
      } else if (event === 'SIGNED_OUT') {
        toast.info("Signed out successfully");
      } else if (event === 'PASSWORD_RECOVERY') {
        toast.info("Password recovery email sent");
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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

  return (
    <div 
      className="fixed inset-0 min-h-screen w-full flex items-center justify-center bg-background p-4 z-50" 
    >
      <Card className="w-full max-w-md p-6 space-y-6 shadow-lg bg-background">
        <h1 className="text-2xl font-bold text-center text-foreground mb-6">Welcome to Secure Chat</h1>
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
        <div className="text-center space-y-2">
          <Button variant="ghost" onClick={handleResendLink}>
            Resend verification link
          </Button>
          <p className="text-sm text-muted-foreground">
            If you're having trouble signing in, make sure you've verified your email address.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Index;