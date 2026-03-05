import OBR from "@owlbear-rodeo/sdk";

const BROADCAST_CHANNEL = "com.quickeR/showFullscreen";
const MODAL_ID = "com.quickeR/fullscreen";

OBR.onReady(() => {
  OBR.broadcast.onMessage(BROADCAST_CHANNEL, (event) => {
    const roomUrl = event.data as string;
    if (!roomUrl) return;
    OBR.modal.open({
      id: MODAL_ID,
      url: `/modal.html?roomUrl=${encodeURIComponent(roomUrl)}`,
      height: 700,
      width: 550,
    });
  });
});
