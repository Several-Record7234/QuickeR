import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import OBR from "@owlbear-rodeo/sdk";
import { QRCodeSVG } from "qrcode.react";
import "./index.css";

const MODAL_ID = "com.quickeR/fullscreen";
const AUTO_CLOSE_MS = 15_000;
const ROOM_URL_PREFIX = "https://www.owlbear.rodeo/room/";

function parseRoomName(url: string): string | null {
  const slug = url.replace(ROOM_URL_PREFIX, "");
  const parts = slug.split("/");
  const raw = (parts[1] ?? "").split("?")[0];
  if (!raw) return null;
  return decodeURIComponent(raw).replace(/-/g, " ");
}

function Modal() {
  const params = new URLSearchParams(window.location.search);
  const roomUrl = params.get("roomUrl") ?? "";
  const roomName = parseRoomName(roomUrl);

  const [remaining, setRemaining] = useState(AUTO_CLOSE_MS / 1000);

  const handleClose = () => {
    OBR.modal.close(MODAL_ID);
  };

  useEffect(() => {
    const timer = setTimeout(handleClose, AUTO_CLOSE_MS);
    const tick = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(tick);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70"
      onClick={handleClose}
    >
      <div
        className="flex flex-col items-center gap-4 sm:gap-6 bg-[#1a1a2e] rounded-2xl p-4 sm:p-8 shadow-2xl max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div className="flex items-baseline gap-1 select-none">
          <span className="text-[#e8c97e] font-bold text-3xl sm:text-5xl" style={{ marginRight: "-0.07em" }}>Q</span>
          <span className="text-[#e8c97e] font-bold text-3xl sm:text-5xl tracking-tight" style={{ marginRight: "-0.07em" }}>uicke</span>
          <span className="text-[#e8c97e] font-bold text-3xl sm:text-5xl">R</span>
        </div>

        {/* QR Code — scales down on small screens */}
        {roomUrl && (
          <div className="p-4 bg-white rounded-2xl shadow-lg shadow-black/40 w-full max-w-[416px]">
            <QRCodeSVG
              value={roomUrl}
              size={384}
              bgColor="#ffffff"
              fgColor="#1a1a2e"
              level="M"
              includeMargin={false}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Instruction */}
        <p className="text-[#8888aa] text-base sm:text-xl text-center leading-relaxed">
          Scan to join{roomName ? <> <span className="text-[#c8c8d8] font-medium">{roomName}</span></> : " this room"} on your device
        </p>

        {/* Dismiss button */}
        <button
          onClick={handleClose}
          className="text-[#e8c97e] hover:text-white text-sm font-medium transition-colors px-6 py-2 rounded-lg bg-[#252540] hover:bg-[#2e2e55]"
        >
          Close ({remaining}s)
        </button>
      </div>
    </div>
  );
}

OBR.onReady(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <Modal />
    </React.StrictMode>
  );
});
