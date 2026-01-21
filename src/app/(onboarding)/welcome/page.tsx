"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WelcomeScreen } from "@/modules/onboarding/components/welcome-screen";
import { skipSetup, getSetupStatus } from "@/modules/onboarding/services/onboarding.service";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function WelcomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await getSetupStatus();
        if (result.data) {
          // If setup is already completed or skipped, redirect to dashboard
          if (result.data.isCompleted || result.data.isSkipped) {
            router.replace("/projetos");
            return;
          }
          // Set organization name as placeholder for user name
          // In a real scenario, we'd fetch the user's name
          setUserName(result.data.organizationName);
        }
      } catch (error) {
        console.error("Error checking setup status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [router]);

  const handleSkip = async () => {
    await skipSetup();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return <WelcomeScreen userName={userName} onSkip={handleSkip} />;
}
