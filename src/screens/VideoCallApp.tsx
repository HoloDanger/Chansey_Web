// Web-friendly video consult using Agora Web SDK (dynamic import)
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Type definitions for Agora SDK
/* eslint-disable @typescript-eslint/no-explicit-any */
type AgoraRTCType = any;
type IAgoraRTCClient = any;
type IAgoraRTCRemoteUser = any;
type ILocalAudioTrack = any;
type ILocalVideoTrack = any;
type MediaType = "video" | "audio";

interface CameraDevice {
  deviceId: string;
  label: string;
}

// Agora Web SDK will be loaded dynamically at runtime if needed
let AgoraRTC: AgoraRTCType | null = null;

// Agora Configuration
const AGORA_CONFIG = {
  appId: "a4bbf1d27589458d96d9bc8eaa6600e4",
  token: "007eJxTYMj8v2S9rPREJ4E/thUzcg94PFqVWXR2VsRXF6VpvwX2JMgoMCSaJCWlGaYYmZtaWJqYWqRYmqVYJiVbpCYmmpkZGKSaVKZqZDYEMjK47kplZGSAQBCfl6GkKDMxPTW+KD8/N96QgQEAmWgi3Q==",
  channelName: "triage_room_1",
};

export default function VideoCallApp() {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);

  const client = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrack = useRef<ILocalAudioTrack | null>(null);
  const localVideoTrack = useRef<ILocalVideoTrack | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const isWeb = typeof window !== 'undefined';

  const initAgora = useCallback(async () => {
    if (!isWeb) {
      console.log("Agora Web SDK only works on web platform");
      return;
    }

    try {
      if (!AgoraRTC) {
        const mod = await import("agora-rtc-sdk-ng");
        AgoraRTC = mod.default || mod;
      }

      client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

      client.current.on(
        "user-published",
        async (user: IAgoraRTCRemoteUser, mediaType: MediaType) => {
          await client.current!.subscribe(user, mediaType);
          console.log("✅ Remote user published:", mediaType);
          console.log("Remote UID:", user.uid);

          if (mediaType === "video") {
            setRemoteUid(user.uid);
            console.log("🎥 Remote video track received");

            setTimeout(() => {
              if (remoteVideoRef.current) {
                user.videoTrack?.play(remoteVideoRef.current);
                console.log("🎥 Playing remote video");
              }
            }, 100);
          }

          if (mediaType === "audio") {
            user.audioTrack?.play();
            console.log("🔊 Playing remote audio");
          }
        }
      );

      client.current.on("user-unpublished", (user: IAgoraRTCRemoteUser) => {
        console.log("User unpublished:", user.uid);
        setRemoteUid((uid) => (uid === user.uid ? null : uid));
      });

      await client.current.join(
        AGORA_CONFIG.appId,
        AGORA_CONFIG.channelName,
        AGORA_CONFIG.token,
        null
      );

      setIsJoined(true);
      console.log("Joined channel successfully");

      localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
      localVideoTrack.current = await AgoraRTC.createCameraVideoTrack();

      await client.current.publish([
        localAudioTrack.current,
        localVideoTrack.current,
      ]);
      console.log("Published local tracks");

      if (localVideoRef.current) {
        localVideoTrack.current.play(localVideoRef.current);
      }
      
      console.log("✅ Video call initialized successfully");
      console.log("Channel:", AGORA_CONFIG.channelName);
      console.log("Waiting for remote user to join...");
    } catch (error) {
      console.error("❌ Error initializing Agora:", error);
    }
  }, [isWeb]);

  const leaveChannel = useCallback(async () => {
    try {
      localAudioTrack.current?.stop();
      localAudioTrack.current?.close();
      localVideoTrack.current?.stop();
      localVideoTrack.current?.close();

      await client.current?.leave();

      setIsJoined(false);
      setRemoteUid(null);
      console.log("Left channel successfully");
    } catch (error) {
      console.error("Error leaving channel:", error);
    }
  }, []);

  useEffect(() => {
    initAgora();
    return () => {
      leaveChannel();
    };
  }, [initAgora, leaveChannel]);

  const toggleMute = async () => {
    try {
      const newMutedState = !isMuted;
      if (localAudioTrack.current) {
        await localAudioTrack.current.setEnabled(!newMutedState);
      }
      setIsMuted(newMutedState);
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  const toggleVideo = async () => {
    try {
      const newVideoOffState = !isVideoOff;
      if (localVideoTrack.current) {
        await localVideoTrack.current.setEnabled(!newVideoOffState);
      }
      setIsVideoOff(newVideoOffState);
    } catch (error) {
      console.error("Error toggling video:", error);
    }
  };

  const switchCamera = async () => {
    try {
      if (localVideoTrack.current && AgoraRTC) {
        const cameras = await AgoraRTC.getCameras();
        if (cameras.length > 1) {
          const currentLabel = localVideoTrack.current.getTrackLabel();
          const nextCamera = cameras.find((cam: CameraDevice) => cam.label !== currentLabel) || cameras[0];
          if (nextCamera) {
            await localVideoTrack.current.setDevice(nextCamera.deviceId);
            console.log("Switched camera to:", nextCamera.label);
          }
        }
      }
    } catch (error) {
      console.error("Error switching camera:", error);
    }
  };

  const container: React.CSSProperties = {
    background: "linear-gradient(135deg, #E8F5E9 0%, #E1BEE7 100%)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  };
  const header: React.CSSProperties = { padding: "56px 24px 24px" };
  const headerRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };
  const headerLeft: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
  };
  const phoneIcon: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #7EFD94 0%, #5DD47A 100%)",
    color: "#fff",
    fontSize: 18,
    boxShadow: "0 2px 8px rgba(126, 253, 148, 0.3)",
  };
  const videoArea: React.CSSProperties = {
    position: "relative",
    padding: "0 24px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  };
  const avatar: React.CSSProperties = {
    width: 160,
    height: 160,
    borderRadius: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    background: "linear-gradient(135deg,#8B5CF6,#EC4899,#F59E0B)",
    color: "#fff",
    fontSize: 48,
    fontWeight: 600,
    boxShadow: "0 8px 24px rgba(139, 92, 246, 0.4)",
    border: "4px solid #fff",
  };
  const doctorName: React.CSSProperties = {
    color: "#1a1a1a",
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 12,
  };
  const controlsWrap: React.CSSProperties = { 
    padding: "0 24px 48px",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    borderRadius: "32px 32px 0 0",
    boxShadow: "0 -4px 16px rgba(0, 0, 0, 0.1)",
  };
  const controlsRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingTop: 24,
  };
  const controlButton: React.CSSProperties = {
    width: 72,
    height: 72,
    borderRadius: 36,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    fontSize: 28,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: "all 0.2s ease",
  };
  const activeButton: React.CSSProperties = {
    background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
    color: "#fff",
    boxShadow: "0 4px 16px rgba(239, 68, 68, 0.4)",
  };
  const endButton: React.CSSProperties = { ...activeButton };
  const label: React.CSSProperties = {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: 500,
    textAlign: "center",
    marginTop: 10,
  };

  return (
    <div style={container}>
      <div style={header}>
        <div style={headerRow}>
          <div style={headerLeft}>
            <button
              onClick={() => navigate(-1)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                background: "#f3f4f6",
                border: "none",
                cursor: "pointer",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              ←
            </button>
            <div style={phoneIcon}>📞</div>
            <div style={{ color: "#111827", fontWeight: 500, fontSize: 14 }}>
              Video/Audio Consultation
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: "#9ca3af",
              }}
            />
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: "#9ca3af",
              }}
            />
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: "#9ca3af",
              }}
            />
          </div>
        </div>
      </div>

      <div style={videoArea}>
        {remoteUid ? (
          isWeb ? (
            <div
              ref={remoteVideoRef}
              style={{
                width: "100%",
                maxWidth: 600,
                height: 420,
                backgroundColor: "#000",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: 420,
                background: "#000",
                borderRadius: 16,
              }}
            />
          )
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <div style={avatar}>MS</div>
            <div style={doctorName}>Maria Santos</div>
            <div style={{ 
              fontSize: 15, 
              color: "#666", 
              marginBottom: 20,
              fontWeight: 500
            }}>
              42 years old • Cardiac Emergency
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 24px",
                background: "rgba(139, 92, 246, 0.1)",
                borderRadius: 24,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  background: "#8B5CF6",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              <div style={{ color: "#8B5CF6", fontSize: 14, fontWeight: 600 }}>
                Waiting to connect...
              </div>
            </div>
          </div>
        )}

        {isJoined && !isVideoOff && isWeb && (
          <div
            ref={localVideoRef}
            style={{
              position: "absolute",
              top: remoteUid ? 24 : "50%",
              right: remoteUid ? 48 : "50%",
              transform: remoteUid ? "none" : "translate(50%, -50%)",
              width: remoteUid ? 140 : 280,
              height: remoteUid ? 180 : 360,
              backgroundColor: "#1f2937",
              borderRadius: 16,
              border: "3px solid #ffffff",
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
            }}
          />
        )}
      </div>

      <div style={controlsWrap}>
        <div style={controlsRow}>
          <div style={{ textAlign: "center" }}>
            <button
              style={{ ...controlButton, ...endButton }}
              onClick={leaveChannel}
            >
              📞
            </button>
            <div style={label}>End Call</div>
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={toggleMute}
              style={{ ...controlButton, ...(isMuted ? activeButton : {}) }}
            >
              {isMuted ? "🔇" : "🎤"}
            </button>
            <div style={label}>Mute</div>
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={toggleVideo}
              style={{ ...controlButton, ...(isVideoOff ? activeButton : {}) }}
            >
              {isVideoOff ? "📵" : "🎥"}
            </button>
            <div style={label}>Video</div>
          </div>

          <div style={{ textAlign: "center" }}>
            <button style={controlButton} onClick={switchCamera}>
              🔁
            </button>
            <div style={label}>Flip</div>
          </div>
        </div>
      </div>
    </div>
  );
}
