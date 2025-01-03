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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate('/chat');
      }
    });

    // Log the current URL for debugging
    console.log("Current URL:", window.location.href);
    console.log("Current origin:", window.location.origin);
    console.log("Base URL:", document.baseURI);

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
          emailRedirectTo: new URL('/chat', window.location.origin).toString()
        }
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification link has been resent to your email!");
      }
    } catch (error) {
      toast.error("Failed to resend verification link");
      console.error("Resend error:", error);
    }
  };

  return (
    <div className="app-content absolute inset-0 w-full h-full flex items-center justify-center bg-background">
      <div className="relative w-full h-full flex items-center justify-center">
        <Card className="w-full max-w-md p-6 space-y-6 shadow-lg">
          <div className="w-full flex flex-col space-y-4 pt-4">
            <div className="w-full max-w-[200px] mx-auto mt-4">
              <img 
                src="/lovable-uploads/a4de23b8-4aa3-45c1-8de3-4f3ca7840248.png"
                alt="Dover Beach Humor"
                className="w-full h-auto object-contain rounded-lg shadow-sm"
              />
            </div>
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
            redirectTo={new URL('/chat', window.location.origin).toString()}
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