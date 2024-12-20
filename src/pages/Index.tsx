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
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) navigate('/chat');
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (event === 'SIGNED_IN') {
        toast.success("Successfully signed in!");
        navigate('/chat');
      } else if (event === 'SIGNED_OUT') {
        toast.info("Signed out successfully");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleResendLink = async () => {
    const email = prompt("Please enter your email address");
    if (!email) return;

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification link has been resent to your email!");
      }
    } catch {
      toast.error("Failed to resend verification link");
    }
  };

  return (
    <div className="app-content absolute inset-0 w-full h-full flex items-center justify-center bg-background">
      <div className="relative w-full h-full flex items-center justify-center">
        <Card className="w-full max-w-md p-6 space-y-6 shadow-lg">
          <div className="w-full flex justify-center mb-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/3/37/Flag_of_the_Royal_Corps_of_Signals.svg"
              alt="Royal Corps of Signals Flag"
              className="w-full h-32 object-contain rounded-lg mb-4"
            />
          </div>
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
            redirectTo={`${window.location.origin}/chat`}
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
    </div>
  );
};

export default Index;