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
      try {
        window.localStorage.setItem(
          "latest_triage_result",
          JSON.stringify(result)
        );
      } catch {
        /* ignore storage write errors */
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
