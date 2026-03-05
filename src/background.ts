import OBR from "@owlbear-rodeo/sdk";

const FULLSCREEN_KEY = "com.quickeR/showFullscreen";
const MODAL_ID = "com.quickeR/fullscreen";

let lastSeenTimestamp = 0;

OBR.onReady(() => {
  OBR.room.onMetadataChange((metadata) => {
    const flag = metadata[FULLSCREEN_KEY] as
      | { url: string; at: number }
      | undefined;

    if (flag && flag.at > lastSeenTimestamp) {
      lastSeenTimestamp = flag.at;
      OBR.modal.open({
        id: MODAL_ID,
        url: `/modal.html?roomUrl=${encodeURIComponent(flag.url)}`,
        height: 700,
        width: 550,
      });
    }
  });
});
