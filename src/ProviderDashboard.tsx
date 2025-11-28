import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";

interface PatientCard {
  id: string;
  userId?: string;
  sessionId?: string;
  name: string;
  age: number;
  urgency: "High" | "Medium" | "Low";
  timestamp: string;
  specialties: string[];
  symptoms?: string;
  urgencyScore?: string;
  urgencyDescription?: string;
  suggestedActions?: string[];
  status?: string;
}

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientCard | null>(
    null
  );
  const [patientQueue, setPatientQueue] = useState<PatientCard[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"urgency" | "time">("urgency");

  // API Configuration
  // Queue API: GET /queue - Returns list of all patients (from any device)
  // Status API: GET /?userId=X&sessionId=Y - Returns individual patient status
  const STATUS_CHECK_URL =
    "https://4lfbz4mx6rede2zhzllbptkkjq0myzfs.lambda-url.us-east-1.on.aws";
  const QUEUE_API_URL =
    "https://4lfbz4mx6rede2zhzllbptkkjq0myzfs.lambda-url.us-east-1.on.aws/queue";
  const POLL_INTERVAL = 2000; // 2 seconds for individual patient updates
  const QUEUE_POLL_INTERVAL = 3000; // 3 seconds for full queue refresh  // Fetch and build patient queue from API
  const fetchPatientQueue = async () => {
    try {
      console.log("🔄 Fetching patient queue from API...");
      console.log("   URL:", QUEUE_API_URL);
      const response = await fetch(QUEUE_API_URL);

      console.log("   Response status:", response.status, response.statusText);

      if (!response.ok) {
        console.log("⚠️ Queue API not available, using mock data");
        console.log("   Status:", response.status);
        return getMockData();
      }

      const data = await response.json();
      console.log("✅ Received data from API:", data);
      console.log("   Data type:", typeof data);
      console.log("   Is array:", Array.isArray(data));

      // API returns array directly: [{ userId, sessionId, name, urgency, time, category }]
      if (Array.isArray(data) && data.length > 0) {
        console.log(`📋 Processing ${data.length} patient(s) from API...`);
        const patients: PatientCard[] = [];

        for (const item of data) {
          console.log("   Processing item:", item);

          // Parse time or use current time
          const formattedTime = item.time || "Just now";

          // Check if urgency is pending/processing
          const isPending =
            item.urgency === "Pending..." || item.urgency === "pending";

          // Map urgency from API (can be "High", "Low", "Medium", "Pending...", etc.)
          let urgencyLevel: "High" | "Medium" | "Low";
          if (isPending) {
            urgencyLevel = "Medium";
          } else if (item.urgency?.toLowerCase() === "high") {
            urgencyLevel = "High";
          } else if (item.urgency?.toLowerCase() === "low") {
            urgencyLevel = "Low";
          } else {
            urgencyLevel = "Medium";
          }

          // Map API fields to patient card format
          // API provides: name, urgency, category, summary, specialist, suggested_action, time
          const patient = {
            id: item.sessionId || item.userId,
            userId: item.userId,
            sessionId: item.sessionId,
            name: item.name || "Patient",
            age: 35, // Default age (not in API)
            urgency: urgencyLevel,
            timestamp: formattedTime,
            specialties:
              item.specialist && item.specialist !== "—"
                ? [item.specialist]
                : item.category && item.category !== "—"
                ? [item.category]
                : ["General"],
            symptoms:
              item.summary && item.summary !== "Waiting for voice input..."
                ? item.summary
                : undefined,
            urgencyScore:
              urgencyLevel === "High"
                ? "8/10"
                : urgencyLevel === "Medium"
                ? "5/10"
                : "2/10",
            urgencyDescription:
              item.summary && item.summary !== "Waiting for voice input..."
                ? item.summary
                : undefined,
            suggestedActions: item.suggested_action
              ? [item.suggested_action]
              : undefined,
            status: isPending ? "pending" : "completed",
          };

          console.log("   Created patient card:", patient);
          patients.push(patient);
        }

        console.log(
          `✅ Successfully loaded ${patients.length} patient(s) from queue API`
        );
        return patients;
      }

      console.log(
        "⚠️ API returned empty array or unexpected format, using mock data"
      );
      console.log("   Data:", data);
      return getMockData();
    } catch (error) {
      console.error("❌ Error fetching patient queue:", error);
      return getMockData();
    }
  };

  // Helper to get mock data (for development/fallback)
  const getMockData = (): PatientCard[] => {
    const mockData: PatientCard[] = [
      {
        id: "1",
        name: "Maria Santos",
        age: 42,
        urgency: "High",
        timestamp: "10 secs ago",
        specialties: ["Neurological", "Neurologist"],
        symptoms:
          "Acute onset of severe, retro-orbital headache, concurrent with blurry vision, dizziness, and subjective difficulty breathing.",
        urgencyScore: "8/10",
        urgencyDescription:
          "Sudden onset of severe neurological symptoms (headache, vision changes) paired with reported respiratory distress is highly indicative of a time-sensitive neurovascular event (e.g., CVA) or severe systemic crisis.",
        suggestedActions: [
          "Immediate EMS activation and transfer to Emergency Department (ED).",
          "Request immediate BP and SpO2 readings if caregiver present.",
          "Screen for focal neurological deficits (e.g., facial asymmetry, unilateral limb drift).",
        ],
        status: "completed",
      },
    ];

    // Also check localStorage for local web triage results
    try {
      const latestResult =
        typeof window !== "undefined"
          ? window.localStorage.getItem("latest_triage_result")
          : null;
      if (latestResult) {
        const newPatient = JSON.parse(latestResult);
        console.log("🟢 Found patient in localStorage:", newPatient);

        const timestamp = new Date(newPatient.timestamp);
        const now = new Date();
        const diffSeconds = Math.floor(
          (now.getTime() - timestamp.getTime()) / 1000
        );
        newPatient.timestamp = formatTimestamp(diffSeconds);

        mockData.unshift(newPatient);
      }
    } catch (error) {
      console.error("❌ Error loading localStorage:", error);
    }

    return mockData;
  };

  // Helper to format timestamp
  const formatTimestamp = (diffSeconds: number): string => {
    if (diffSeconds < 60) {
      return `${diffSeconds} secs ago`;
    } else if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)} mins ago`;
    } else {
      return `${Math.floor(diffSeconds / 3600)} hours ago`;
    }
  };

  // Load patient data
  const loadPatientData = async () => {
    const patients = await fetchPatientQueue();
    setPatientQueue(patients);
  };

  // Sort patients based on selected criteria
  const sortedPatientQueue = [...patientQueue].sort((a, b) => {
    if (sortBy === "urgency") {
      const urgencyOrder = { High: 0, Medium: 1, Low: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }
    // Sort by time (most recent first)
    return 0; // Already in correct order from mockData
  });

  // Fetch patient status from API
  const fetchPatientStatus = async (userId: string, sessionId: string) => {
    try {
      const response = await fetch(
        `${STATUS_CHECK_URL}?userId=${userId}&sessionId=${sessionId}`
      );
      const data = await response.json();

      if (data.status === "completed" && data.data) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching patient status:", error);
      return null;
    }
  };

  // Poll for updates on pending patients
  useEffect(() => {
    const pollPatients = async () => {
      // Get all patients that need polling (those with userId and sessionId)
      const pendingPatients = patientQueue.filter(
        (patient) =>
          patient.userId && patient.sessionId && patient.status !== "completed"
      );

      if (pendingPatients.length > 0) {
        console.log(
          `🔄 Polling ${pendingPatients.length} pending patient(s)...`
        );
      }

      for (const patient of pendingPatients) {
        console.log(
          `  → Checking status for patient ${patient.name} (userId: ${patient.userId}, sessionId: ${patient.sessionId})`
        );

        const updatedData = await fetchPatientStatus(
          patient.userId!,
          patient.sessionId!
        );

        if (updatedData) {
          console.log(
            `  ✅ Received updated data for ${patient.name}:`,
            updatedData
          );
          // Update patient with API data
          setPatientQueue((prev) =>
            prev.map((p) =>
              p.id === patient.id
                ? {
                    ...p,
                    urgency: updatedData.urgency || p.urgency,
                    symptoms: updatedData.symptoms || p.symptoms,
                    urgencyScore: updatedData.urgencyScore || p.urgencyScore,
                    urgencyDescription:
                      updatedData.urgencyDescription || p.urgencyDescription,
                    suggestedActions:
                      updatedData.suggestedActions || p.suggestedActions,
                    specialties: updatedData.specialties || p.specialties,
                    status: "completed",
                  }
                : p
            )
          );
        } else {
          console.log(`  ⏳ No update yet for ${patient.name} (still pending)`);
        }
      }
    };

    // Poll every 2 seconds if there are pending patients
    const intervalId = setInterval(pollPatients, POLL_INTERVAL);

    // Initial poll
    pollPatients();

    return () => clearInterval(intervalId);
  }, [patientQueue]);

  useEffect(() => {
    // Initial load
    setTimeout(() => loadPatientData(), 0);

    // Poll for new patients from API (detects mobile app submissions)
    const queueInterval = setInterval(() => {
      console.log("⏰ Refreshing patient queue...");
      loadPatientData();
    }, QUEUE_POLL_INTERVAL);

    return () => {
      clearInterval(queueInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const providerInfo = {
    name: "Jose Rizal",
    specialty: "Neurologist",
    avatar: null, // Replace with actual avatar URI
    notificationCount: 0,
  };

  const containerStyle: React.CSSProperties = {
    background: "#f5f5f5",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    color: "#1a1a1a",
  };

  const gradientStyle: React.CSSProperties = {
    padding: "60px 20px 40px",
    background: "linear-gradient(135deg, #C8E6C9 0%, #E8D5F5 100%)",
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  };

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "#FE805D",
    fontWeight: 600,
  };

  const specialtyBadgeBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    padding: "6px 12px",
    color: "#fff",
    fontWeight: 600,
    fontSize: 13,
    marginRight: 8,
    marginBottom: 6,
  };

  return (
    <div
      style={containerStyle}
      data-theme={theme}
      data-dark={isDark ? "true" : "false"}
    >
      <div style={gradientStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 200,
                height: 56,
                borderRadius: 28,
                background: "#e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {providerInfo.avatar ? (
                <img
                  src={providerInfo.avatar}
                  alt={providerInfo.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: 20, color: "#666" }}>👤</span>
              )}
            </div>
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1a1a1a",
                  marginBottom: 2,
                }}
              >
                {providerInfo.name}
              </div>
              <div style={{ fontSize: 13, color: "#666" }}>
                {providerInfo.specialty}
              </div>
            </div>
          </div>
          <div
            style={{
              position: "relative",
              width: 48,
              height: 48,
              borderRadius: 24,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <span role="img" aria-label="bell" style={{ fontSize: 20 }}>
              🔔
            </span>
            {providerInfo.notificationCount > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  background: "#8B5CF6",
                  border: "2px solid #fff",
                }}
              />
            )}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 8,
              color: "#1a1a1a",
            }}
          >
            Welcome back!
          </div>
          <div style={{ fontSize: 15, color: "#5a5a5a" }}>
            Ready to help your patients today?
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                background: isAvailable ? "#7EFD94" : "#999",
              }}
            />
            <div style={{ fontWeight: 600, fontSize: 15 }}>Available</div>
          </div>
          <label
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <div
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                background: isAvailable ? "#8B5CF6" : "#ccc",
                position: "relative",
                transition: "background 0.3s",
              }}
            >
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                style={{ display: "none" }}
              />
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  background: "#fff",
                  position: "absolute",
                  top: 2,
                  left: isAvailable ? 22 : 2,
                  transition: "left 0.3s",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              />
            </div>
          </label>
        </div>
      </div>

      <div
        style={{
          padding: "0 20px",
          marginTop: 20,
          marginBottom: 12,
          textAlign: "left",
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 14, color: "#999" }}>Sort By:</span>
        <button
          onClick={() => setSortBy("urgency")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            background: sortBy === "urgency" ? "#8B5CF6" : "transparent",
            color: sortBy === "urgency" ? "#fff" : "#999",
            cursor: "pointer",
            fontSize: 13,
            padding: "6px 12px",
            borderRadius: 16,
            fontWeight: 600,
            transition: "all 0.2s",
          }}
        >
          Urgency
        </button>
        <button
          onClick={() => setSortBy("time")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            background: sortBy === "time" ? "#8B5CF6" : "transparent",
            color: sortBy === "time" ? "#fff" : "#999",
            cursor: "pointer",
            fontSize: 13,
            padding: "6px 12px",
            borderRadius: 16,
            fontWeight: 600,
            transition: "all 0.2s",
          }}
        >
          Time
        </button>
      </div>

      <div style={{ padding: "0 20px" }}>
        {sortedPatientQueue.map((patient) => (
          <div
            key={patient.id}
            style={{
              ...cardStyle,
              marginBottom: 12,
              cursor: "pointer",
              padding: "20px",
              textAlign: "left",
            }}
            onClick={() => setSelectedPatient(patient)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  ...badgeStyle,
                  color:
                    patient.urgency === "High"
                      ? "#FE805D"
                      : patient.urgency === "Low"
                      ? "#7EFD94"
                      : "#FFA726",
                }}
              >
                <span role="img" aria-label="urgency" style={{ fontSize: 14 }}>
                  {patient.urgency === "High"
                    ? "⚠️"
                    : patient.urgency === "Low"
                    ? "✅"
                    : "⏱️"}
                </span>
                <span style={{ fontSize: 13 }}>
                  {patient.status === "pending"
                    ? "Pending..."
                    : patient.urgency === "High"
                    ? "Highly Urgent"
                    : patient.urgency === "Low"
                    ? "Low Priority"
                    : "Medium Priority"}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#aaa" }}>
                {patient.timestamp}
              </div>
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 6,
                color: "#1a1a1a",
              }}
            >
              {patient.name}
            </div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 14 }}>
              {patient.age} years old
            </div>

            <div>
              {patient.specialties.map((specialty, index) => (
                <span
                  key={index}
                  style={{
                    ...specialtyBadgeBase,
                    background: index === 0 ? "#8B5CF6" : "#5B8DEE",
                  }}
                >
                  <span style={{ fontSize: 12 }}>🩺</span>
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedPatient && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "60px 20px 20px",
            overflow: "auto",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 0,
              width: "100%",
              maxWidth: 420,
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            }}
          >
            {/* Header with badge and close button */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 20px 16px",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <div
                style={{
                  ...badgeStyle,
                  color:
                    selectedPatient.urgency === "High"
                      ? "#FE805D"
                      : selectedPatient.urgency === "Low"
                      ? "#7EFD94"
                      : "#FFA726",
                }}
              >
                <span role="img" aria-label="urgency" style={{ fontSize: 14 }}>
                  {selectedPatient.urgency === "High"
                    ? "⚠️"
                    : selectedPatient.urgency === "Low"
                    ? "✅"
                    : "⏱️"}
                </span>
                <span style={{ fontSize: 13 }}>
                  {selectedPatient.status === "pending"
                    ? "Pending Analysis..."
                    : selectedPatient.urgency === "High"
                    ? "High Urgency"
                    : selectedPatient.urgency === "Low"
                    ? "Low Urgency"
                    : "Medium Urgency"}
                </span>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 20,
                  color: "#999",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Patient info and content */}
            <div style={{ padding: "20px" }}>
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    marginBottom: 4,
                    color: "#1a1a1a",
                  }}
                >
                  {selectedPatient.name}
                </div>
                <div style={{ fontSize: 13, color: "#999", marginBottom: 12 }}>
                  {selectedPatient.age} years old
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {selectedPatient.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      style={{
                        ...specialtyBadgeBase,
                        background: index === 0 ? "#8B5CF6" : "#5B8DEE",
                      }}
                    >
                      <span style={{ fontSize: 12 }}>🩺</span>
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    marginBottom: 10,
                    color: "#1a1a1a",
                    textAlign: "left",
                  }}
                >
                  Symptoms
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#555",
                    lineHeight: 1.6,
                    background: "#f9f9f9",
                    padding: "14px",
                    borderRadius: 12,
                    textAlign: "left",
                  }}
                >
                  {selectedPatient.symptoms}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    marginBottom: 10,
                    color: "#1a1a1a",
                    textAlign: "left",
                  }}
                >
                  Urgency
                </div>
                {selectedPatient.urgencyScore && (
                  <div
                    style={{
                      display: "block",
                      background: "#FE805D",
                      color: "#fff",
                      borderRadius: 16,
                      padding: "6px 14px",
                      fontWeight: 600,
                      fontSize: 13,
                      marginBottom: 10,
                      width: "fit-content",
                    }}
                  >
                    {selectedPatient.urgencyScore}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 13,
                    color: "#555",
                    lineHeight: 1.6,
                    background: "#f9f9f9",
                    padding: "14px",
                    borderRadius: 12,
                    textAlign: "left",
                  }}
                >
                  {selectedPatient.urgencyDescription}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    marginBottom: 10,
                    color: "#1a1a1a",
                    textAlign: "left",
                  }}
                >
                  Suggested Action
                </div>
                <div
                  style={{
                    background: "#f9f9f9",
                    padding: "14px",
                    borderRadius: 12,
                    textAlign: "left",
                  }}
                >
                  {selectedPatient.suggestedActions?.map((action, index) => (
                    <div
                      key={index}
                      style={{
                        fontSize: 13,
                        color: "#555",
                        lineHeight: 1.6,
                        marginBottom:
                          index < selectedPatient.suggestedActions!.length - 1
                            ? 8
                            : 0,
                      }}
                    >
                      {index + 1}. {action}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate("/video")}
                style={{
                  width: "100%",
                  background:
                    "linear-gradient(135deg, #7EFD94 0%, #5DD47A 100%)",
                  color: "#1a1a1a",
                  borderRadius: 14,
                  border: "none",
                  padding: "16px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 15,
                  boxShadow: "0 4px 12px rgba(126, 253, 148, 0.3)",
                }}
              >
                Call Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
