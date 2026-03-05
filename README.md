# QuickeR

An [Owlbear Rodeo](https://owlbear.rodeo) extension that generates a scannable QR code for your room's invite URL — perfect for in-person play where players want to join on their own devices.

## How It Works

Click the **QuickeR** action button in your OBR room. A popover appears with a QR code encoding the full room URL. Players at the table scan it with their phone camera and are taken straight to the room in their browser.

The room URL is derived from the `roomId` query parameter that OBR automatically passes to all extension iframes — no extra permissions or API calls required.

## Development

```bash
npm install
npm run dev
```

Then in OBR, add the extension with:
```
http://localhost:5173/manifest.json
```

## Building & Deployment

```bash
npm run build
```

Deploy the `dist/` folder to any static host (Render, Vercel, Cloudflare Pages, etc.).

Set your manifest URL in OBR to:
```
https://your-deployment-url.com/manifest.json
```

## CORS

Add a `_headers` file in `public/` if your host requires explicit CORS headers:

```
/*
  Access-Control-Allow-Origin: https://www.owlbear.rodeo
  Access-Control-Allow-Methods: GET, OPTIONS
```

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- [qrcode.react](https://github.com/zpao/qrcode.react)
- [@owlbear-rodeo/sdk](https://extensions.owlbear.rodeo/docs)
