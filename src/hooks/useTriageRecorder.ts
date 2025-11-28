import { useCallback, useMemo, useRef, useState } from "react";

// Minimal stub for web; replace with real audio + backend integration later
export type TriageStatus = "idle" | "recording" | "processing";

interface TriageResult {
  urgency: "High" | "Medium" | "Low";
  symptoms?: string;
  urgencyScore?: string;
  urgencyDescription?: string;
  suggestedActions?: string[];
  specialties?: string[];
  timestamp: string;
}

export function useTriageRecorder() {
  const [status, setStatus] = useState<TriageStatus>("idle");
  const [lastResult, setLastResult] = useState<TriageResult | null>(null);
  const timerRef = useRef<number | null>(null);

  const startRecording = useCallback(() => {
    if (status !== "idle") return;
    setStatus("recording");
  }, [status]);

  const stopRecording = useCallback(() => {
    if (status !== "recording") return;
    setStatus("processing");
    // Simulate processing and a result
    timerRef.current = window.setTimeout(() => {
      const now = new Date();
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userId = `user_${Math.random().toString(36).substr(2, 9)}`;
      
      const result: TriageResult = {
        urgency: "High",
        symptoms:
          "Severe headache, blurred vision, dizziness, difficulty breathing",
        urgencyScore: "8/10",
        urgencyDescription:
          "Symptoms suggest time-sensitive neurovascular event or severe systemic crisis.",
        suggestedActions: [
          "Activate EMS and transfer to ED",
          "Request BP and SpO2 if caregiver present",
          "Screen for focal neurological deficits",
        ],
        specialties: ["Neurological", "Neurologist"],
        timestamp: now.toISOString(),
      };
      
      // Create patient card with all required fields for ProviderDashboard
      const patientCard = {
        id: sessionId,
        userId: userId,
        sessionId: sessionId,
        name: "New Patient",
        age: 35,
        urgency: result.urgency,
        timestamp: now.toISOString(),
        specialties: result.specialties,
        symptoms: result.symptoms,
        urgencyScore: result.urgencyScore,
        urgencyDescription: result.urgencyDescription,
        suggestedActions: result.suggestedActions,
        status: "pending", // Will be updated by API polling
      };
      
      console.log("🔵 Triage completed! Generated IDs:");
      console.log("  userId:", userId);
      console.log("  sessionId:", sessionId);
      console.log("  Full patient card:", patientCard);
      console.log("  API URL:", `https://4lfbz4mx6rede2zhzllbptkkjq0myzfs.lambda-url.us-east-1.on.aws?userId=${userId}&sessionId=${sessionId}`);
      
      try {
        window.localStorage.setItem(
          "latest_triage_result",
          JSON.stringify(patientCard)
        );
        console.log("✅ Saved to localStorage: latest_triage_result");
      } catch (error) {
        console.error("❌ Failed to save to localStorage:", error);
      }
      setLastResult(result);
      setStatus("idle");
    }, 1500);
  }, [status]);

  const api = useMemo(
    () => ({ status, lastResult, startRecording, stopRecording }),
    [status, lastResult, startRecording, stopRecording]
  );

  return api;
}
