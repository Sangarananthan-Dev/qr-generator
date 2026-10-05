import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Download,
  Copy,
  Check,
  Upload,
  RefreshCw,
  Sparkles,
  Link2,
  Image as ImageIcon,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { generateQRCode, downloadQRCode } from "./lib/qr-generator";
import { PRESETS, LOGO_PRESETS } from "./lib/presets";

export default function App() {
  const [selectedPresetId, setSelectedPresetId] = useState("midfin360");
  const [referText, setReferText] = useState("facebook");
  const [customUrl, setCustomUrl] = useState("http://inveztmf.com/app");
  const [selectedLogoMode, setSelectedLogoMode] = useState("preset"); // 'preset' | 'upload' | 'none'
  const [selectedLogoUrl, setSelectedLogoUrl] = useState("/logos/midfin360-logo.png");
  const [uploadedLogoDataUrl, setUploadedLogoDataUrl] = useState(null);
  
  // Customization settings
  const [qrSize, setQrSize] = useState(512);
  const [margin, setMargin] = useState(2);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState("H");
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#FFFFFF");
  const [logoPadding, setLogoPadding] = useState(20);
  const [badgeRadius, setBadgeRadius] = useState(25);
  const [logoRadius, setLogoRadius] = useState(20);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentPreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  // Compute final destination URL
  const getEncodedUrl = () => {
    if (currentPreset.isReferrerMode) {
      const ref = referText.trim() || "default";
      return `${currentPreset.baseUrl}?refer=${encodeURIComponent(ref)}`;
    }
    if (selectedPresetId === "inveztmf") {
      return customUrl.trim() || "http://inveztmf.com/app";
    }
    return customUrl.trim() || "https://www.midfin360.com";
  };

  // Compute active logo
  const getActiveLogo = () => {
    if (selectedLogoMode === "none") return null;
    if (selectedLogoMode === "upload") return uploadedLogoDataUrl;
    return selectedLogoUrl;
  };

  // Switch preset
  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    if (preset.isReferrerMode) {
      setReferText(preset.defaultReferrer || "facebook");
    } else {
      setCustomUrl(preset.defaultUrl || "https://www.midfin360.com");
    }

    if (preset.colorDark) setDarkColor(preset.colorDark);
    if (preset.colorLight) setLightColor(preset.colorLight);

    if (preset.logoUrl) {
      setSelectedLogoMode("preset");
      setSelectedLogoUrl(preset.logoUrl);
    }
  };

  // Handle logo file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, SVG, WebP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedLogoDataUrl(event.target?.result);
      setSelectedLogoMode("upload");
    };
    reader.readAsDataURL(file);
  };

  // Generate QR Code
  const handleGenerate = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const url = getEncodedUrl();
    if (!url) return;

    setIsGenerating(true);
    setStatusMessage("");

    try {
      const dataUrl = await generateQRCode(canvas, url, {
        logoUrl: getActiveLogo(),
        width: qrSize,
        margin: margin,
        errorCorrectionLevel: errorCorrectionLevel,
        darkColor: darkColor,
        lightColor: lightColor,
        logoPadding: logoPadding,
        badgeRadius: badgeRadius,
        logoRadius: logoRadius,
      });

      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error("Failed to generate QR Code:", err);
      setStatusMessage("Failed to generate QR Code. Please check inputs.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate on input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleGenerate();
    }, 150);
    return () => clearTimeout(timer);
  }, [
    selectedPresetId,
    referText,
    customUrl,
    selectedLogoMode,
    selectedLogoUrl,
    uploadedLogoDataUrl,
    qrSize,
    margin,
    errorCorrectionLevel,
    darkColor,
    lightColor,
    logoPadding,
    badgeRadius,
    logoRadius,
  ]);

  // Download QR Code
  const handleDownload = () => {
    if (!qrDataUrl) return;

    let filename = "qr-code.png";
    if (currentPreset.isReferrerMode) {
      const ref = referText.trim() || "default";
      filename = `qr-code-${ref.replace(/[^a-zA-Z0-9_-]/g, "_")}.png`;
    } else if (selectedPresetId === "inveztmf") {
      filename = "qr-code-inveztmf.png";
    } else {
      filename = "qr-code-custom.png";
    }

    downloadQRCode(qrDataUrl, filename);
  };

  // Copy target link to clipboard
  const handleCopyLink = async () => {
    const url = getEncodedUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error("Clipboard write failed", err);
    }
  };

  // Copy image to clipboard
  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      });
    } catch (err) {
      console.error("Failed to copy image to clipboard", err);
      alert("Direct image copy may not be supported by your browser. Please use Download PNG.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Header / Brand */}
      <div className="w-full max-w-5xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-sm">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                QR Code Studio
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold uppercase tracking-wider">
                  Pro
                </span>
              </h1>
              <p className="text-sm text-slate-500">
                High-Resolution QR Code Generator with Custom Logo Badge & Tracking
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/Sangarananthan-Dev/qr-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub Repo
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Main App Container */}
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Preset Tabs Navigation */}
        <div className="border-b border-slate-200 bg-slate-50/50 p-2 sm:px-6 sm:py-3 flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex items-center gap-2">
            {PRESETS.map((preset) => {
              const active = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                  }`}
                >
                  {preset.name}
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showAdvanced
                ? "bg-blue-50 text-blue-600 border border-blue-200"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            {showAdvanced ? "Hide Advanced" : "Advanced"}
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* Input Section */}
            {currentPreset.isReferrerMode ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-800">
                    Referrer Identifier (Campaign / Source)
                  </label>
                  <span className="text-xs text-slate-400">Tracked in analytics</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={referText}
                    onChange={(e) => setReferText(e.target.value)}
                    placeholder="e.g. facebook, instagram, flyer, billboard"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Base Link: <span className="font-mono text-slate-700">{currentPreset.baseUrl}</span>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-800">
                    Destination URL
                  </label>
                  <span className="text-xs text-slate-400">Full web or app link</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://your-website.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {/* Logo Customization */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-800 flex items-center justify-between">
                <span>Center Logo Overlay</span>
                <span className="text-xs font-normal text-slate-500">
                  Exact Midfin360 rounded badge style
                </span>
              </label>

              {/* Logo Mode Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LOGO_PRESETS.map((preset) => {
                  const active =
                    selectedLogoMode === "preset" && selectedLogoUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedLogoMode("preset");
                        setSelectedLogoUrl(preset.url);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 cursor-pointer transition-all ${
                        active
                          ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center p-1 shadow-2xs">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <span className="truncate w-full text-center">{preset.name}</span>
                    </button>
                  );
                })}

                {/* Upload Custom Logo Button */}
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    selectedLogoMode === "upload"
                      ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="truncate w-full text-center">
                    {uploadedLogoDataUrl ? "Uploaded Logo" : "Upload Logo"}
                  </span>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Remove logo toggle */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLogoMode(selectedLogoMode === "none" ? "preset" : "none");
                  }}
                  className={`text-xs font-medium cursor-pointer transition-colors ${
                    selectedLogoMode === "none"
                      ? "text-blue-600 font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {selectedLogoMode === "none"
                    ? "✓ Logo disabled (Click to re-enable)"
                    : "✕ Disable center logo (Plain QR)"}
                </button>
              </div>
            </div>

            {/* Advanced Settings Accordion */}
            {showAdvanced && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in fade-in duration-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Advanced QR Customization
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      QR Code Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={darkColor}
                        onChange={(e) => setDarkColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={darkColor}
                        onChange={(e) => setDarkColor(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={lightColor}
                        onChange={(e) => setLightColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={lightColor}
                        onChange={(e) => setLightColor(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Error Correction Level
                    </label>
                    <select
                      value={errorCorrectionLevel}
                      onChange={(e) => setErrorCorrectionLevel(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    >
                      <option value="H">High (30% - Recommended for Logos)</option>
                      <option value="Q">Quartile (25%)</option>
                      <option value="M">Medium (15%)</option>
                      <option value="L">Low (7%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Resolution / Size
                    </label>
                    <select
                      value={qrSize}
                      onChange={(e) => setQrSize(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    >
                      <option value={512}>Standard (512 × 512 px)</option>
                      <option value={1024}>Ultra HD (1024 × 1024 px)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      Badge Padding: {logoPadding}px
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="35"
                      value={logoPadding}
                      onChange={(e) => setLogoPadding(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      Badge Radius: {badgeRadius}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={badgeRadius}
                      onChange={(e) => setBadgeRadius(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      Logo Radius: {logoRadius}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="35"
                      value={logoRadius}
                      onChange={(e) => setLogoRadius(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Explicit Generate Button */}
            <div>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
                {isGenerating ? "Generating QR Code..." : "Generate QR Code"}
              </button>
            </div>
          </div>

          {/* Right Column: Preview, Details & Download */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 sm:p-8 text-center space-y-5">
            {/* Canvas Preview Box */}
            <div className="relative group">
              <div className="w-[240px] h-[240px] sm:w-[260px] sm:h-[260px] bg-white rounded-2xl p-3 shadow-lg shadow-slate-200/80 border border-slate-100 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain block rounded-lg"
                />
              </div>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-2 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold rounded-md shadow-xs">
                  {qrSize} × {qrSize}
                </span>
              </div>
            </div>

            {/* Target URL Preview Badge */}
            <div className="w-full max-w-xs bg-white border border-slate-200 rounded-xl p-3 text-left shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                <span className="flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-blue-600" />
                  Target URL
                </span>
                <button
                  onClick={handleCopyLink}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-800 font-mono break-all line-clamp-2 select-all">
                {getEncodedUrl()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-xs space-y-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!qrDataUrl}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>

              <button
                type="button"
                onClick={handleCopyImage}
                disabled={!qrDataUrl}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedImage ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Image Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Image</span>
                  </>
                )}
              </button>
            </div>

            {statusMessage && (
              <p className="text-xs text-red-500 font-medium">{statusMessage}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>High Error Correction (H - 30%) with Rounded Center Logo Clipping</span>
          <span className="font-mono">Midfin360 / InveztMF QR Studio</span>
        </div>
      </div>
    </div>
  );
}
