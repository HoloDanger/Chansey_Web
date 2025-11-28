// Converted to standard React Web component
import React from "react";
import { useNavigate } from "react-router-dom";

// Gradient Text Component
interface GradientTextProps {
  colors: string[];
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const GradientText: React.FC<GradientTextProps> = ({
  colors,
  style,
  children,
}) => {
  return (
    <span
      style={{
        ...(style || {}),
        background: `linear-gradient(90deg, ${colors.join(", ")})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
};

// Icon placeholder component (replace with lucide-react or react-icons later)
const IconPlaceholder: React.FC<{ name: string }> = ({ name }) => {
  const iconMap: Record<string, string> = {
    "book-open": "📖",
    calendar: "📅",
    activity: "🧪",
    shield: "❤️",
    bell: "🔔",
    info: "ℹ️",
  };
  return <span style={{ fontSize: 48, filter: "grayscale(100%) brightness(0)" }}>{iconMap[name] || "•"}</span>;
};

export default function ChanseyDashboard() {
  const navigate = useNavigate();

  const services = [
    {
      icon: "book-open",
      title: "Health",
      subtitle: "Journal",
      gradientColors: ["#7EFD94", "#7F4EF0", "#698DFE"],
      description:
        "Access your medical history, prescriptions, and vaccinations.",
      route: "/health-journal",
    },
    {
      icon: "calendar",
      title: "Doctor",
      subtitle: "Availability",
      gradientColors: ["#7EFD94", "#7F4EF0", "#698DFE"],
      description:
        "View real-time availability of our healthcare professionals.",
      route: "/doctor-availability",
    },
    {
      icon: "activity",
      title: "Lab Test",
      subtitle: "Booking",
      gradientColors: ["#7EFD94", "#7F4EF0", "#698DFE"],
      description:
        "Order lab tests with sample collection at your doorstep or visit our partner labs.",
      route: "/lab-test-booking",
    },
    {
      icon: "shield",
      title: "Health",
      subtitle: "Plan",
      gradientColors: ["#7EFD94", "#7F4EF0", "#698DFE"],
      description:
        "Add your HMO or browse available health plans to find the perfect coverage.",
      route: "/health-plan",
    },
    {
      icon: "bell",
      title: "Notifications/",
      subtitle: "Alerts",
      gradientColors: ["#7EFD94", "#7F4EF0", "#698DFE"],
      description:
        "Stay updated with reminders, lab results, & important health alerts.",
      route: "/notifications",
    },
    {
      icon: "info",
      title: "About",
      subtitle: "Us",
      gradientColors: ["#7EFD94", "#7F4EF0", "#698DFE"],
      description:
        "Learn more about how we break down access and mission for accessible healthcare.",
      route: "/about",
    },
  ];

  return (
    <div style={styles.container as React.CSSProperties}>
      {/* Gradient Header Section */}
      <div style={styles.gradientHeader as React.CSSProperties}>
        <div style={styles.header as React.CSSProperties}>
          <img
            src="/images/chansey-light-logo.png"
            style={styles.logo as React.CSSProperties}
            alt="Chansey"
          />
        </div>

        <div style={styles.welcomeSection as React.CSSProperties}>
          <h1 style={styles.welcomeTitle as React.CSSProperties}>
            Welcome back!
          </h1>
          <p style={styles.welcomeSubtitle as React.CSSProperties}>
            How can we help with you today?
          </p>
        </div>

        <p style={styles.dashboardLabel as React.CSSProperties}>Dashboard</p>

        <button
          onClick={() => navigate("/triage")}
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: "pointer",
            width: "95%",
            display: "block",
          }}
        >
          <div
            style={
              {
                ...styles.consultationCard,
                background:
                  "linear-gradient(135deg, #86efac, #60a5fa, #a78bfa)",
              } as React.CSSProperties
            }
          >
            <div style={styles.consultationContent as React.CSSProperties}>
              <div style={styles.logoCircle as React.CSSProperties}>
                <img
                  src="/images/chansey-white.png"
                  style={styles.consultationImage as React.CSSProperties}
                  alt="Chansey"
                />
              </div>
              <div
                style={styles.consultationTextContainer as React.CSSProperties}
              >
                <span style={styles.consultationTitle as React.CSSProperties}>
                  Chansey Consultation
                </span>
                <p style={styles.consultationSubtitle as React.CSSProperties}>
                  Get an initial consultation from Chansey, our Triage Bot
                </p>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Service Cards Section */}
      <div style={styles.contentSection as React.CSSProperties}>
        <div style={styles.servicesGrid as React.CSSProperties}>
          {services.map((service, index) => (
            <div
              key={index}
              style={
                {
                  ...styles.gradientBorder,
                  background: `linear-gradient(135deg, ${service.gradientColors.join(
                    ", "
                  )})`,
                } as React.CSSProperties
              }
            >
              <button
                onClick={() => {
                  if (service.route) {
                    navigate(service.route);
                  }
                }}
                style={
                  {
                    ...styles.serviceCard,
                    border: "none",
                    cursor: "pointer",
                  } as React.CSSProperties
                }
              >
                <div style={styles.iconContainer as React.CSSProperties}>
                  <IconPlaceholder name={service.icon} />
                </div>
                <div
                  style={styles.serviceTitleContainer as React.CSSProperties}
                >
                  <GradientText
                    colors={service.gradientColors}
                    style={styles.serviceGradientTitle as React.CSSProperties}
                  >
                    {service.title}
                  </GradientText>
                  <GradientText
                    colors={service.gradientColors}
                    style={styles.serviceSubtitle as React.CSSProperties}
                  >
                    {service.subtitle}
                  </GradientText>
                </div>
                <p style={styles.serviceDescription as React.CSSProperties}>
                  {service.description}
                </p>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  gradientHeader: {
    background:
      "linear-gradient(135deg, #C8E6C9 0%, #E1F5FE 40%, #F3E5F5 100%)",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 50,
    paddingBottom: 32,
  },
  contentSection: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: "contain" as const,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: "Arboria-Medium, sans-serif",
    color: "#000000",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontFamily: "Arboria-Book, sans-serif",
    color: "#374151",
  },
  dashboardLabel: {
    fontSize: 14,
    fontFamily: "Arboria-Book, sans-serif",
    color: "#1f2937",
    marginBottom: 12,
  },
  consultationCard: {
    borderRadius: 24,
    padding: "28px 32px",
    marginBottom: 0,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
    width: "100%",
  },
  consultationContent: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    border: "3px solid rgba(255, 255, 255, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    flexShrink: 0,
  },
  consultationImage: {
    width: 70,
    height: 70,
    objectFit: "contain" as const,
  },
  consultationTextContainer: {
    display: "flex",
    flexDirection: "column" as const,
    flex: 1,
    alignItems: "flex-end",
  },
  consultationTitle: {
    fontSize: 22,
    fontFamily: "Arboria-Medium, sans-serif",
    fontWeight: 600,
    color: "#ffffff",
    marginBottom: 6,
    textAlign: "right" as const,
    display: "block",
  },
  consultationSubtitle: {
    fontSize: 13,
    fontFamily: "Arboria-Book, sans-serif",
    color: "#ffffff",
    lineHeight: 1.4,
    textAlign: "right" as const,
    maxWidth: 260,
  },
  servicesGrid: {
    display: "flex",
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "space-between",
    paddingBottom: 30,
  },
  gradientBorder: {
    width: "48%",
    borderRadius: 20,
    padding: 3,
    marginBottom: 20,
  },
  serviceCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 17,
    padding: 20,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    minHeight: 180,
    textAlign: "center" as const,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    height: 60,
  },
  serviceTitleContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    marginBottom: 10,
  },
  serviceGradientTitle: {
    fontSize: 14,
    fontFamily: "Arboria-Medium, sans-serif",
    fontWeight: 600,
    textAlign: "center" as const,
  },
  serviceSubtitle: {
    fontSize: 14,
    fontFamily: "Arboria-Medium, sans-serif",
    fontWeight: 600,
    color: "#1f2937",
    textAlign: "center" as const,
  },
  serviceDescription: {
    fontSize: 12,
    fontFamily: "Arboria-Book, sans-serif",
    color: "#6b7280",
    textAlign: "center" as const,
    lineHeight: 1.5,
  },
} as const;
