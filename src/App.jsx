import React, { useState, useEffect, useRef } from "react";
import { QrCode, Download, Upload, X, Sparkles, RefreshCw } from "lucide-react";
import { generateQRCode, downloadQRCode } from "./lib/qr-generator";

export default function App() {
  const [url, setUrl] = useState("https://www.midfin360.com");
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const [logoFileName, setLogoFileName] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle Logo File Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, SVG, WebP)");
      return;
    }

    setLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoDataUrl(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove uploaded logo
  const handleRemoveLogo = () => {
    setLogoDataUrl(null);
    setLogoFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Generate QR Code
  const handleGenerate = async () => {
    if (!url.trim()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    try {
      const dataUrl = await generateQRCode(canvas, url.trim(), {
        logoUrl: logoDataUrl,
        width: 512,
        margin: 2,
        errorCorrectionLevel: "H",
        darkColor: "#000000",
        lightColor: "#FFFFFF",
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error("Failed to generate QR Code:", err);
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
  }, [url, logoDataUrl]);

  // Download Generated QR Code
  const handleDownload = () => {
    if (!qrDataUrl) return;
    downloadQRCode(qrDataUrl, "qr-code.png");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 bg-slate-900 text-white rounded-xl mb-2 shadow-sm">
            <QrCode className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">QR Code Generator</h1>
          <p className="text-xs text-slate-500">
            Enter your destination URL and optionally upload a center logo
          </p>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          {/* URL Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Destination URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Center Logo (Optional)
            </label>

            {!logoDataUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100/80 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
              >
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-600">
                  Click to upload logo
                </span>
                <span className="text-[11px] text-slate-400">
                  PNG, JPG, SVG, or WebP
                </span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <img
                    src={logoDataUrl}
                    alt="Logo Preview"
                    className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 p-0.5"
                  />
                  <span className="text-xs font-medium text-slate-700 truncate max-w-[180px]">
                    {logoFileName || "Custom Logo"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove logo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !url.trim()}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            Generate QR Code
          </button>
        </div>

        {/* QR Code Preview & Download */}
        <div className="pt-2 flex flex-col items-center space-y-4">
          <div className="w-[220px] h-[220px] bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex items-center justify-center overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain block rounded-lg"
            />
          </div>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download QR Code (PNG)
          </button>
        </div>
      </div>
    </div>
  );
}
