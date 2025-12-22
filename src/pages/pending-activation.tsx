import { Clock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { users } from "@/constants";

export default function PendingActivation() {
  const navigate = useNavigate();

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <PageTransition
        className="bg-card w-full max-w-md space-y-6 rounded-lg border p-8 shadow-lg"
        disableStagger
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-primary/10 text-primary rounded-full p-4">
            <Clock className="h-12 w-12" />
          </div>

          <h1 className="text-foreground text-center text-2xl font-bold">
            {users.pendingActivation.title}
          </h1>

          <div className="text-muted-foreground space-y-3 text-center">
            <p>{users.pendingActivation.message}</p>
            <div className="bg-muted flex items-start gap-2 rounded-lg p-4 text-right">
              <Mail className="text-primary mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm">{users.pendingActivation.instruction}</p>
            </div>
          </div>

          <Button
            onClick={() => navigate("/login")}
            className="w-full"
            size="lg"
          >
            {users.pendingActivation.backToLogin}
          </Button>
        </div>
      </PageTransition>
    </div>
  );
}
