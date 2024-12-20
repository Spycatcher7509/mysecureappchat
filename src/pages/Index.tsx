import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event);
      if (event === 'SIGNED_IN') {
        toast.success("Successfully signed in!");
        navigate("/chat");
      } else if (event === 'SIGNED_OUT') {
        toast.info("Signed out");
      } else if (event === 'USER_UPDATED') {
        console.log("User updated:", session?.user);
      } else if (event === 'USER_DELETED') {
        toast.error("User account has been deleted");
      } else if (event === 'PASSWORD_RECOVERY') {
        toast.info("Password recovery email sent");
      }
    });

    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session check error:", error);
        toast.error(error.message);
      }
      if (session) {
        navigate("/chat");
      }
    };
    checkUser();

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
          emailRedirectTo: window.location.origin
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 space-y-6 shadow-lg">
        <h1 className="text-2xl font-bold text-center text-foreground">Welcome to Secure Chat</h1>
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
          redirectTo={`${window.location.origin}/chat`}
          onError={(error) => {
            console.error("Auth error:", error);
            toast.error(error.message);
          }}
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