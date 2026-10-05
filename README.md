# 📱 QR Code Generator Studio

A high-resolution, branded QR Code Generator designed for **Midfin360**, **InveztMF**, and custom marketing campaigns. Built with React, Vite, Tailwind CSS, and Canvas rendering.

---

## ✨ Features

- **🚀 Exact Midfin360 QR Stying**: Matches `src/lib/qr-generator.js` with:
  - High error correction level (`H` - 30%)
  - Center rounded badge background (`radius: 25px`, `padding: 20px`)
  - Smooth rounded corner logo clipping (`radius: 20px`)
  - Aspect ratio preservation for square, wide, and tall logos
- **🎯 Campaign Tracking & Referrers**:
  - Direct support for `https://www.midfin360.com/qr/index.html?refer={referrer}`
  - Target URL mode for InveztMF (`http://inveztmf.com/app`) and custom destinations
- **🖼️ Logo Customization**:
  - Preset logos (Midfin360 Dark, Midfin360 Blue, InveztMF)
  - Custom file upload (PNG, JPG, SVG, WebP) with instant preview
  - Option to generate clean plain QR codes without logo
- **🎨 Custom Styling**:
  - Custom QR dark and light colors
  - Adjustable resolution (Standard 512×512, Ultra HD 1024×1024)
  - Customizable badge padding, badge radius, and logo corner radius
- **💾 Export & Sharing**:
  - One-click high-res PNG download with descriptive filenames (`qr-code-facebook.png`, `qr-code-inveztmf.png`, etc.)
  - Copy image directly to clipboard
  - Copy target URL to clipboard

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm or yarn

### Installation

```bash
git clone https://github.com/Sangarananthan-Dev/qr-generator.git
cd qr-generator
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## 📂 Project Structure

```
qr-generator/
├── public/
│   ├── logos/
│   │   ├── midfin360-logo.png
│   │   ├── midfin360-blue.png
│   │   └── inveztmf-logo.png
│   └── logo.png
├── src/
│   ├── lib/
│   │   ├── qr-generator.js    # Canvas QR & rounded badge logic
│   │   └── presets.js         # Campaign presets & logo profiles
│   ├── App.jsx                # Interactive QR Generator Studio UI
│   ├── main.jsx               # Entry point
│   └── index.css              # Tailwind CSS styling
├── package.json
└── vite.config.js
```

---

## 📄 License
MIT
