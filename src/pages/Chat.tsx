import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

const Chat = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-end p-4">
        <Button variant="ghost" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-foreground">Chat Page</h1>
        <p className="text-muted-foreground">You are now signed in!</p>
      </div>
    </div>
  );
};

export default Chat;