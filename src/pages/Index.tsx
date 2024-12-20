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
      if (session) {
        toast.success("Successfully signed in!");
        navigate("/chat");
      }
    });

    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification link has been resent to your email!");
      }
    } catch (error) {
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
            }
          }}
          theme="dark"
          providers={[]}
        />
        <div className="text-center">
          <Button variant="ghost" onClick={handleResendLink}>
            Resend verification link
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Index;