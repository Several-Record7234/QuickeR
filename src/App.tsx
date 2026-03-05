import { useEffect, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { QRCodeSVG } from "qrcode.react";

type Status = "loading" | "ready" | "no-room" | "error";

function getRoomUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get("roomId");
  if (!roomId) return null;
  return `https://www.owlbear.rodeo/room/${roomId}`;
}

export default function App() {
  const [status, setStatus] = useState<Status>("loading");
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const url = getRoomUrl();
    if (!url) {
      // Fallback: wait for OBR ready in case roomId wasn't in params
      OBR.onReady(() => {
        // roomId should have been in query string; if not, show error
        setStatus("no-room");
      });
      // Give params one more chance after a tick (some hosts hydrate late)
      setTimeout(() => {
        const retryUrl = getRoomUrl();
        if (retryUrl) {
          setRoomUrl(retryUrl);
          setStatus("ready");
        }
      }, 200);
      return;
    }
    setRoomUrl(url);
    setStatus("ready");
  }, []);

  const handleCopy = async () => {
    if (!roomUrl) return;
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable in some iframe contexts
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1a2e] p-4">
      <div className="flex flex-col items-center gap-4 w-full max-w-[240px]">

        {/* Wordmark */}
        <div className="flex items-baseline gap-0.5 select-none">
          <span className="text-[#e8c97e] font-bold text-xl tracking-tight">Q</span>
          <span className="text-[#c8c8d8] font-light text-xl tracking-tight">uicke</span>
          <span className="text-[#e8c97e] font-bold text-xl tracking-tight">R</span>
        </div>

        {/* QR Panel */}
        {status === "loading" && (
          <div className="w-[200px] h-[200px] rounded-xl bg-[#252540] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#e8c97e] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {status === "ready" && roomUrl && (
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

            {/* Instructional label */}
            <p className="text-[#8888aa] text-xs text-center leading-relaxed">
              Scan to join this room on your device
            </p>

            {/* URL chip + copy button */}
            <button
              onClick={handleCopy}
              title="Copy room URL"
              className="flex items-center gap-2 w-full bg-[#252540] hover:bg-[#2e2e55] active:scale-95 transition-all rounded-lg px-3 py-2 group"
            >
              <span className="flex-1 text-[#6666aa] text-[10px] font-mono truncate text-left">
                {roomUrl}
              </span>
              <span className="shrink-0 text-[10px] font-medium text-[#e8c97e] group-hover:text-white transition-colors">
                {copied ? "✓" : "copy"}
              </span>
            </button>
          </>
        )}

        {(status === "no-room" || status === "error") && (
          <div className="w-[200px] rounded-xl bg-[#252540] flex flex-col items-center justify-center gap-2 py-8 px-4 text-center">
            <span className="text-2xl">⚠️</span>
            <p className="text-[#8888aa] text-xs">
              No room ID found. Make sure QuickeR is running inside an Owlbear Rodeo room.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
