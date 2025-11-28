import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTriageRecorder } from "../hooks/useTriageRecorder";

export default function TriageScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { status, lastResult, startRecording, stopRecording } = useTriageRecorder();

  const userName = user?.displayName || user?.email?.split("@")[0] || "User";
  const isRecording = status === "recording";
  const isProcessing = status === "processing";

  // Animation state for pulse effect
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    if (lastResult && status === "idle") {
      navigate("/doctor-dashboard");
    }
  }, [lastResult, status, navigate]);

  // Pulse animation when recording
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setPulseScale((prev) => (prev >= 1.3 ? 1 : prev + 0.05));
      }, 50);
      return () => clearInterval(interval);
    } else {
      setTimeout(() => setPulseScale(1), 0);
    }
  }, [isRecording]);

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #C8E6C9 0%, #E8D5F5 100%)",
    display: "flex",
    flexDirection: "column",
  };

  const scrollContentStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    paddingBottom: 20,
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  };

  const backButtonStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  };

  const logoContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const mainContentStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 40,
    paddingBottom: 40,
    minHeight: 500,
  };

  const pulseContainerStyle: React.CSSProperties = {
    width: 280,
    height: 280,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 40,
  };

  const waveCircleStyle = (scale: number, opacity: number): React.CSSProperties => ({
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: "50%",
    backgroundColor: "#A78BFA",
    opacity: isRecording ? opacity : 0.1,
    transform: `scale(${isRecording ? scale : 1})`,
    transition: "all 1.5s ease-in-out",
  });

  const centerCircleStyle: React.CSSProperties = {
    width: 200,
    height: 200,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 50%, #7C3AED 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 0 30px rgba(139, 92, 246, 0.3)",
    position: "relative",
    zIndex: 10,
  };

  const innerWaveStyle: React.CSSProperties = {
    width: 160,
    height: 160,
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  };

  const bottomControlsStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 30,
    paddingBottom: 30,
  };

  const iconButtonStyle: React.CSSProperties = {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  };

  const micButtonStyle: React.CSSProperties = {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: isRecording ? "#7C3AED" : "#8B5CF6",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: isProcessing ? "not-allowed" : "pointer",
    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
    opacity: isProcessing ? 0.6 : 1,
    transform: isRecording ? "scale(0.95)" : "scale(1)",
    transition: "all 0.2s ease",
  };

  const micCircleStyle: React.CSSProperties = {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 32,
    color: "#fff",
  };

  return (
    <div style={containerStyle}>
      <div style={scrollContentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <button onClick={() => navigate(-1)} style={backButtonStyle}>
            ←
          </button>
          <div style={logoContainerStyle}>
            <img
              src="/images/chansey-logo.png"
              alt="Chansey"
              style={{ width: 44, height: 44 }}
            />
            <div style={{ fontSize: 26, fontWeight: 600, color: "#1a1a1a" }}>
              Chansey
            </div>
          </div>
          <div style={{ width: 40 }} />
        </div>

        {/* Main Content */}
        <div style={mainContentStyle}>
          {/* Pulsing Circle with Waves */}
          <div style={pulseContainerStyle}>
            {/* Wave circles */}
            <div style={waveCircleStyle(pulseScale * 1.8, 0.1)} />
            <div style={waveCircleStyle(pulseScale * 1.4, 0.15)} />
            <div style={waveCircleStyle(pulseScale, 0.2)} />

            {/* Center gradient circle */}
            <div style={centerCircleStyle}>
              <div style={innerWaveStyle} />
            </div>
          </div>

          {/* Status Text */}
          <div style={{ marginTop: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 16, textAlign: "center" }}>
              <span style={{ color: "#8B5CF6", fontWeight: 600 }}>Chansey</span>
              <span style={{ color: "#666" }}>
                {isProcessing
                  ? " is processing..."
                  : isRecording
                  ? " is listening"
                  : " is ready"}
              </span>
            </div>
          </div>

          {/* User Message */}
          <div style={{ paddingLeft: 30, paddingRight: 30, marginBottom: 30 }}>
            {isProcessing ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ marginBottom: 12, fontSize: 24 }}>⏳</div>
                <div style={{ fontSize: 18, color: "#333", lineHeight: 1.6 }}>
                  Analyzing your symptoms...
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 18, color: "#333", textAlign: "center", lineHeight: 1.6 }}>
                {isRecording
                  ? "I'm listening..."
                  : `Hi, ${userName}. Tell me how you're feeling today.`}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Controls */}
        <div style={bottomControlsStyle}>
          <button style={iconButtonStyle}>
            💬
          </button>

          <button
            onMouseDown={() => !isProcessing && startRecording()}
            onMouseUp={() => !isProcessing && stopRecording()}
            disabled={isProcessing}
            style={micButtonStyle}
          >
            <div style={micCircleStyle}>🎤</div>
          </button>

          <button style={iconButtonStyle}>
            ⚙️
          </button>
        </div>
      </div>
    </div>
  );
}
