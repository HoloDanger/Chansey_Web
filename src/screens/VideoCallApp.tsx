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
  appId: "1364f588b53c42baac5772751347347a",
  token: null as string | null,
  channelName: "consultation-channel",
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
          console.log("Subscribe success");

          if (mediaType === "video") {
            setRemoteUid(user.uid);

            setTimeout(() => {
              if (remoteVideoRef.current) {
                user.videoTrack?.play(remoteVideoRef.current);
              }
            }, 100);
          }

          if (mediaType === "audio") {
            user.audioTrack?.play();
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
    } catch (error) {
      console.error("Error initializing Agora:", error);
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
    background: "#fff",
    minHeight: "100vh",
  };
  const header: React.CSSProperties = { padding: "48px 24px 24px" };
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
    width: 32,
    height: 32,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#7EFD94,#698DFE,#7F4EF0)",
    color: "#fff",
  };
  const videoArea: React.CSSProperties = {
    position: "relative",
    padding: "0 24px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const avatar: React.CSSProperties = {
    width: 128,
    height: 128,
    borderRadius: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    background: "linear-gradient(135deg,#7EFD94,#698DFE,#7F4EF0)",
    color: "#fff",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  };
  const doctorName: React.CSSProperties = {
    color: "#111827",
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 24,
  };
  const controlsWrap: React.CSSProperties = { padding: "0 24px 40px" };
  const controlsRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  };
  const controlButton: React.CSSProperties = {
    width: 64,
    height: 64,
    borderRadius: 32,
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };
  const activeButton: React.CSSProperties = {
    background: "#ef4444",
    color: "#fff",
  };
  const endButton: React.CSSProperties = { ...activeButton };
  const label: React.CSSProperties = {
    color: "#6b7280",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
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
                height: 420,
                backgroundColor: "#000",
                borderRadius: 16,
                overflow: "hidden",
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                }}
              >
                ⏱️
              </div>
            </div>
            <div style={{ color: "#6b7280", fontSize: 12 }}>
              Waiting to connect...
            </div>
          </div>
        )}

        {isJoined && !isVideoOff && isWeb && (
          <div
            ref={localVideoRef}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 120,
              height: 160,
              backgroundColor: "#1f2937",
              borderRadius: 12,
              border: "2px solid #ffffff",
              overflow: "hidden",
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
