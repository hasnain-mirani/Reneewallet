// src/pages/onboarding.tsx (example)
import OnboardingFlow from "@/feature/onboarding/OnboardingFlow";
import { useNavigate } from "react-router-dom";

export default function OnboardingPage() {
  const nav = useNavigate();
  return <OnboardingFlow onDone={() => nav("/dashboard")} />;
}
