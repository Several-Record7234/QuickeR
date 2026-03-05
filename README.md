# QuickeR

An [Owlbear Rodeo](https://owlbear.rodeo) extension that generates a scannable QR code for your room's invite URL — perfect for in-person play where players want to join on their own devices.

## How It Works

Open the Player List and click on the Invite Players button to copy the Room's URL. Next, click the **QuickeR** Action icon in your OBR room; a popover appears with a URL entry field that you can select and paste into to create a QR code immediately, and then you can also send that full screen to all connected players - like the TV or projector that your players are currently loojking at. Players at the table scan the QR code with their smartphone or tablet camera and are taken straight to the OBR Room in their browser. Compared to sharing the txt URL via messaging service, this is much... quicker 😁



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
