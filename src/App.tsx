import { useEffect, useRef, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { QRCodeSVG } from "qrcode.react";

const METADATA_KEY = "com.quickeR/roomUrl";
const BROADCAST_CHANNEL = "com.quickeR/showFullscreen";
const ROOM_URL_PREFIX = "https://www.owlbear.rodeo/room/";
const MAX_URL_LENGTH = 2048;

function parseRoomName(url: string): string | null {
  // URL format: .../room/{userId}/{roomName}?...
  const slug = url.replace(ROOM_URL_PREFIX, "");
  const parts = slug.split("/");
  const raw = (parts[1] ?? "").split("?")[0];
  if (!raw) return null;
  return decodeURIComponent(raw).replace(/-/g, " ");
}

const ROOM_URL_PATTERN = new RegExp(
  "^https://www\\.owlbear\\.rodeo/room/[A-Za-z0-9]{12}/[A-Za-z0-9%]{4,}"
);

function validateRoomUrl(url: string): string | null {
  if (url.length > MAX_URL_LENGTH) return "URL is too long";
  if (!ROOM_URL_PATTERN.test(url)) return "Not a valid Owlbear Rodeo room URL";
  return null;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [isGM, setIsGM] = useState(false);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Wait for OBR SDK, then load any previously saved URL from room metadata
  useEffect(() => {
    OBR.onReady(async () => {
      try {
        const [metadata, role] = await Promise.all([
          OBR.room.getMetadata(),
          OBR.player.getRole(),
        ]);
        const saved = metadata[METADATA_KEY] as string | undefined;
        if (saved) setRoomUrl(saved);
        setIsGM(role === "GM");
      } catch {
        // no saved URL yet
      }
      setReady(true);

      const unsubPlayer = OBR.player.onChange((player) => {
        setIsGM(player.role === "GM");
      });

      const unsubMetadata = OBR.room.onMetadataChange((metadata) => {
        const saved = metadata[METADATA_KEY] as string | undefined;
        setRoomUrl(saved ?? null);
      });

      return () => {
        unsubPlayer();
        unsubMetadata();
      };
    });
  }, []);

  // Dynamically resize popover height based on content
  useEffect(() => {
    if (!ready) return;
    const height = roomUrl
      ? isGM ? 460 : 360
      : isGM ? 280 : 160;
    OBR.action.setHeight(height).catch(() => {});
  }, [ready, roomUrl, isGM]);

  // Focus input on first click anywhere in the popover
  useEffect(() => {
    if (!ready || roomUrl) return;
    const handleClick = () => inputRef.current?.focus();
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [ready, roomUrl]);

  const submitUrl = (url: string) => {
    const trimmed = url.trim();
    const err = validateRoomUrl(trimmed);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setRoomUrl(trimmed);
    setInput("");
    OBR.room.setMetadata({ [METADATA_KEY]: trimmed }).catch(() => {});
  };

  const handleClear = async () => {
    setRoomUrl(null);
    setError(null);
    try {
      await OBR.room.setMetadata({ [METADATA_KEY]: undefined });
    } catch {
      // ignore
    }
  };

  const handleFullscreen = () => {
    if (!roomUrl) return;
    OBR.broadcast
      .sendMessage(BROADCAST_CHANNEL, roomUrl, { destination: "ALL" })
      .catch(() => {});
  };

  const roomName = roomUrl ? parseRoomName(roomUrl) : null;

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1a2e] p-4">
        <div className="w-8 h-8 border-2 border-[#e8c97e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1a1a2e]">
      {/* Header bar with title */}
      <div className="flex items-center justify-center py-2 bg-[#252540] border-b border-[#3a3a5c]">
        <div className="flex items-baseline select-none">
          <span className="text-[#e8c97e] font-bold text-2xl" style={{ marginRight: "-0.07em" }}>Q</span>
          <span className="text-[#e8c97e] font-bold text-2xl tracking-tight" style={{ marginRight: "-0.07em" }}>uicke</span>
          <span className="text-[#e8c97e] font-bold text-2xl">R</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center flex-1 p-4">
        <div className="flex flex-col items-center gap-4 w-full max-w-[260px]">

          {roomUrl ? (
            <>
              {/* QR code in a white card so scanners have clean contrast */}
              <div className="p-3 bg-white rounded-xl shadow-lg shadow-black/40">
                <QRCodeSVG
                  value={roomUrl}
                  size={192}
                  bgColor="#ffffff"
                  fgColor="#1a1a2e"
                  level="M"
                  includeMargin={false}
                />
              </div>

              {/* Instructional label with room name */}
              <p className="text-[#8888aa] text-sm text-center leading-relaxed">
                Scan to join{roomName ? <> <span className="text-[#c8c8d8] font-medium">{roomName}</span></> : " this room"} on your device
              </p>

              {/* URL chip + action buttons (GM only) */}
              {isGM && (
                <div className="w-full bg-[#252540] rounded-lg px-3 py-2">
                  <span className="block text-[#8888cc] text-xs font-mono truncate text-right" dir="rtl">
                    {roomUrl}
                  </span>
                </div>
              )}

              {isGM && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleClear}
                    className="text-[#e8c97e] hover:text-white text-sm font-medium transition-colors"
                  >
                    Change URL
                  </button>
                  <span className="text-[#686868]">|</span>
                  <button
                    onClick={handleFullscreen}
                    className="text-[#e8c97e] hover:text-white text-sm font-medium transition-colors"
                  >
                    Full Screen
                  </button>
                </div>
              )}
            </>
          ) : isGM ? (
            <>
              {/* Paste prompt */}
              <p className="text-[#8888aa] text-xl text-center leading-relaxed">
                Paste your Room's<br />invite link from the<br />
                <span className="text-white">Invite Players</span> <svg className="inline-block align-text-bottom text-white" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M 15 12 c 2.21 0 4 -1.79 4 -4 s -1.79 -4 -4 -4 s -4 1.79 -4 4 s 1.79 4 4 4 m -9 -2 V 8 c 0 -0.55 -0.45 -1 -1 -1 s -1 0.45 -1 1 v 2 H 2 c -0.55 0 -1 0.45 -1 1 s 0.45 1 1 1 h 2 v 2 c 0 0.55 0.45 1 1 1 s 1 -0.45 1 -1 v -2 h 2 c 0.55 0 1 -0.45 1 -1 s -0.45 -1 -1 -1 Z m 9 4 c -2.67 0 -8 1.34 -8 4 v 1 c 0 0.55 0.45 1 1 1 h 14 c 0.55 0 1 -0.45 1 -1 v -1 c 0 -2.66 -5.33 -4 -8 -4" /></svg> button<br />in the Player List
              </p>

              <input
                ref={inputRef}
                autoFocus
                type="text"
                maxLength={MAX_URL_LENGTH}
                value={input}
                onChange={(e) => {
                  const val = e.target.value;
                  setInput(val);
                  setError(null);
                  // Auto-submit when a valid OBR room URL is pasted
                  const trimmed = val.trim();
                  if (ROOM_URL_PATTERN.test(trimmed)) {
                    setTimeout(() => submitUrl(trimmed), 0);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitUrl(input);
                }}
                placeholder="Click here, then Ctrl+V to paste"
                className="w-full bg-[#252540] text-[#c8c8d8] text-xs font-mono rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-[#e8c97e] placeholder:text-[#c8c8d8]"
              />

              {error && (
                <p className="text-[#cc6666] text-xs text-center">{error}</p>
              )}
            </>
          ) : (
            <p className="text-[#8888aa] text-sm text-center leading-relaxed">
              Waiting for the GM to set up<br />the room invite link
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
