import React from "react";
import { useNavigate } from "react-router-dom";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>🚧 {title}</h1>
        <p style={styles.subtitle}>Coming Soon</p>
        {description && <p style={styles.description}>{description}</p>}
        <button onClick={() => navigate("/")} style={styles.backButton}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
  },
  content: {
    textAlign: "center",
    maxWidth: "600px",
    backgroundColor: "white",
    borderRadius: "24px",
    padding: "48px 32px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  title: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "16px",
  },
  subtitle: {
    fontSize: "24px",
    color: "#6b7280",
    marginBottom: "24px",
    fontWeight: "500",
  },
  description: {
    fontSize: "16px",
    color: "#9ca3af",
    marginBottom: "32px",
    lineHeight: "1.6",
  },
  backButton: {
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
};
