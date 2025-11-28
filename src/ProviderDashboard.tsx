import React, { useState, useEffect } from "react";
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
  const { theme, isDark } = useTheme();
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientCard | null>(
    null
  );
  const [patientQueue, setPatientQueue] = useState<PatientCard[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);

  // API Configuration
  const STATUS_CHECK_URL =
    "https://4lfbz4mx6rede2zhzllbptkkjq0myzfs.lambda-url.us-east-1.on.aws";
  const POLL_INTERVAL = 2000; // 2 seconds

  // Load patient data helper function
  const loadPatientData = async () => {
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

    // Check for latest triage result
    try {
      const latestResult =
        typeof window !== "undefined"
          ? window.localStorage.getItem("latest_triage_result")
          : null;
      if (latestResult) {
        const newPatient = JSON.parse(latestResult);
        const timestamp = new Date(newPatient.timestamp);
        const now = new Date();
        const diffSeconds = Math.floor(
          (now.getTime() - timestamp.getTime()) / 1000
        );

        if (diffSeconds < 60) {
          newPatient.timestamp = `${diffSeconds} secs ago`;
        } else if (diffSeconds < 3600) {
          newPatient.timestamp = `${Math.floor(diffSeconds / 60)} mins ago`;
        } else {
          newPatient.timestamp = `${Math.floor(diffSeconds / 3600)} hours ago`;
        }

        // Add to queue at the beginning
        mockData.unshift(newPatient);
      }
    } catch (error) {
      console.error("Error loading triage result:", error);
    }

    setPatientQueue(mockData);
  };

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

      for (const patient of pendingPatients) {
        const updatedData = await fetchPatientStatus(
          patient.userId!,
          patient.sessionId!
        );

        if (updatedData) {
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
    setTimeout(() => loadPatientData(), 0);
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
                width: 56,
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
        }}
      >
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            background: "transparent",
            color: "#999",
            cursor: "pointer",
            fontSize: 14,
            padding: 0,
          }}
        >
          <span style={{ fontSize: 16 }}>⚙️</span>
          <span>Sort By</span>
        </button>
      </div>

      <div style={{ padding: "0 20px" }}>
        {patientQueue.map((patient) => (
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
              <div style={badgeStyle}>
                <span role="img" aria-label="warning" style={{ fontSize: 14 }}>
                  ⚠️
                </span>
                <span style={{ fontSize: 13 }}>Highly Urgent</span>
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
              <div style={badgeStyle}>
                <span role="img" aria-label="warning" style={{ fontSize: 14 }}>
                  ⚠️
                </span>
                <span style={{ fontSize: 13 }}>High Urgency</span>
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
