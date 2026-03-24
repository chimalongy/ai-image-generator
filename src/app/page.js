"use client";
import { useState, useRef } from "react";

const MODEL_SIZE_CONFIG = {
  "@cf/black-forest-labs/flux-1-schnell": {
    supportsSize: false,
    note: "Fixed output size — width/height not supported by this model",
  },
  "@cf/black-forest-labs/flux-2-klein-4b": {
    supportsSize: true, min: 256, max: 1920,
    supportsRefImage: true,
    refImageNote: "Optional: upload up to 4 reference images (≤512×512 each) to guide style/content",
    presets: [
      { label: "Square HD — 1024×1024", width: 1024, height: 1024 },
      { label: "Landscape — 1280×768",  width: 1280, height: 768  },
      { label: "Portrait — 768×1280",   width: 768,  height: 1280 },
      { label: "Widescreen — 1920×1080",width: 1920, height: 1080 },
      { label: "Small — 512×512",       width: 512,  height: 512  },
    ],
  },
  "@cf/black-forest-labs/flux-2-klein-9b": {
    supportsSize: true, min: 256, max: 1920,
    supportsRefImage: true,
    refImageNote: "Optional: upload up to 4 reference images (≤512×512 each) to guide style/content",
    presets: [
      { label: "Square HD — 1024×1024", width: 1024, height: 1024 },
      { label: "Landscape — 1280×768",  width: 1280, height: 768  },
      { label: "Portrait — 768×1280",   width: 768,  height: 1280 },
      { label: "Widescreen — 1920×1080",width: 1920, height: 1080 },
      { label: "Small — 512×512",       width: 512,  height: 512  },
    ],
  },
  "@cf/black-forest-labs/flux-2-dev": {
    supportsSize: true, min: 256, max: 1920,
    supportsRefImage: true,
    refImageNote: "Optional: upload up to 4 reference images (≤512×512 each) to guide style/content",
    presets: [
      { label: "Default — 1024×768",    width: 1024, height: 768  },
      { label: "Square HD — 1024×1024", width: 1024, height: 1024 },
      { label: "Landscape — 1280×768",  width: 1280, height: 768  },
      { label: "Portrait — 768×1280",   width: 768,  height: 1280 },
      { label: "Widescreen — 1920×1080",width: 1920, height: 1080 },
    ],
  },
  "@cf/stabilityai/stable-diffusion-xl-base-1.0": {
    supportsSize: true, min: 256, max: 2048,
    presets: [
      { label: "Native — 1024×1024",    width: 1024, height: 1024 },
      { label: "Landscape — 1280×768",  width: 1280, height: 768  },
      { label: "Portrait — 768×1280",   width: 768,  height: 1280 },
      { label: "Large — 2048×2048",     width: 2048, height: 2048 },
      { label: "Small — 512×512",       width: 512,  height: 512  },
    ],
  },
  "@cf/bytedance/stable-diffusion-xl-lightning": {
    supportsSize: true, min: 256, max: 2048,
    presets: [
      { label: "Native — 1024×1024",    width: 1024, height: 1024 },
      { label: "Landscape — 1280×720",  width: 1280, height: 720  },
      { label: "Portrait — 720×1280",   width: 720,  height: 1280 },
      { label: "Large — 2048×2048",     width: 2048, height: 2048 },
      { label: "Small — 512×512",       width: 512,  height: 512  },
    ],
  },
  "@cf/runwayml/stable-diffusion-v1-5-img2img": {
    supportsSize: true, min: 256, max: 768,
    note: "SD v1.5 performs best at 512×512 or 768×768",
    requiresImage: true,
    imageLabel: "Input Image (required)",
    imageNote: "The model will transform this image guided by your prompt",
    presets: [
      { label: "Standard — 512×512",    width: 512,  height: 512  },
      { label: "Portrait — 512×768",    width: 512,  height: 768  },
      { label: "Landscape — 768×512",   width: 768,  height: 512  },
      { label: "Large — 768×768",       width: 768,  height: 768  },
    ],
  },
  "@cf/runwayml/stable-diffusion-v1-5-inpainting": {
    supportsSize: true, min: 256, max: 768,
    note: "SD v1.5 performs best at 512×512 or 768×768",
    requiresImage: true,
    requiresMask: true,
    imageLabel: "Input Image (required)",
    imageNote: "The source image to inpaint",
    maskLabel: "Mask Image (required)",
    maskNote: "White areas will be repainted, black areas are preserved",
    presets: [
      { label: "Standard — 512×512",    width: 512,  height: 512  },
      { label: "Portrait — 512×768",    width: 512,  height: 768  },
      { label: "Landscape — 768×512",   width: 768,  height: 512  },
      { label: "Large — 768×768",       width: 768,  height: 768  },
    ],
  },
  // Corrected namespace: @cf/leonardo/ not @cf/leonardo-ai/
  "@cf/leonardo/phoenix-1.0": {
    supportsSize: true, min: 256, max: 1920,
    presets: [
      { label: "Square HD — 1024×1024", width: 1024, height: 1024 },
      { label: "Landscape — 1280×768",  width: 1280, height: 768  },
      { label: "Portrait — 768×1280",   width: 768,  height: 1280 },
      { label: "Widescreen — 1920×1080",width: 1920, height: 1080 },
    ],
  },
  "@cf/leonardo/lucid-origin": {
    supportsSize: true, min: 256, max: 1920,
    presets: [
      { label: "Square HD — 1024×1024", width: 1024, height: 1024 },
      { label: "Landscape — 1280×768",  width: 1280, height: 768  },
      { label: "Portrait — 768×1280",   width: 768,  height: 1280 },
      { label: "Widescreen — 1920×1080",width: 1920, height: 1080 },
    ],
  },
};

const IMAGE_MODELS = [
  {
    group: "FLUX (Black Forest Labs)",
    models: [
      { label: "FLUX.1 Schnell — 12B, fast",          value: "@cf/black-forest-labs/flux-1-schnell"  },
      { label: "FLUX.2 Klein 4B — Fastest/lightest",  value: "@cf/black-forest-labs/flux-2-klein-4b" },
      { label: "FLUX.2 Klein 9B — Ultra-fast + editing", value: "@cf/black-forest-labs/flux-2-klein-9b" },
      { label: "FLUX.2 Dev — High realism",           value: "@cf/black-forest-labs/flux-2-dev"      },
    ],
  },
  {
    group: "Stable Diffusion (Stability AI / RunwayML)",
    models: [
      { label: "SDXL Base 1.0 — High quality 1024×1024", value: "@cf/stabilityai/stable-diffusion-xl-base-1.0"        },
      { label: "SDXL Lightning — 2-step generation",     value: "@cf/bytedance/stable-diffusion-xl-lightning"          },
      { label: "SD v1.5 img2img — image-to-image",       value: "@cf/runwayml/stable-diffusion-v1-5-img2img"           },
      { label: "SD v1.5 Inpainting — image + mask",      value: "@cf/runwayml/stable-diffusion-v1-5-inpainting"        },
    ],
  },
  {
    group: "Leonardo AI (Partner)",
    models: [
      { label: "Leonardo Phoenix 1.0",  value: "@cf/leonardo/phoenix-1.0"  },
      { label: "Leonardo Lucid Origin", value: "@cf/leonardo/lucid-origin" },
    ],
  },
];

// Read a File → base64 string (no data-URI prefix)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// Small image-drop zone component
function ImageUpload({ label, note, required, file, preview, onChange, onClear, accept = "image/*" }) {
  const inputRef = useRef(null);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</label>
        {required && <span className="text-xs text-red-500 font-bold">required</span>}
      </div>
      {note && <p className="text-xs text-gray-600">{note}</p>}
      {preview ? (
        <div className="relative w-fit">
          <img src={preview} alt="preview" className="h-28 rounded-xl border border-gray-700 object-cover" />
          <button onClick={onClear}
            className="absolute -top-2 -right-2 bg-gray-800 border border-gray-600 text-gray-300 hover:text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            ✕
          </button>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 bg-gray-900 border border-dashed border-gray-600 hover:border-indigo-500 text-gray-500 hover:text-gray-300 rounded-xl px-4 py-3 text-sm transition w-fit">
          <span>📁</span> Choose image…
        </button>
      )}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onChange} />
    </div>
  );
}

export default function AIPromptPage() {
  const [mode, setMode] = useState("text");
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("@cf/black-forest-labs/flux-1-schnell");
  const [sizeMode, setSizeMode] = useState("preset");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customWidth, setCustomWidth] = useState(1024);
  const [customHeight, setCustomHeight] = useState(1024);

  // Image inputs for img2img / inpainting
  const [inputImageFile, setInputImageFile] = useState(null);
  const [inputImagePreview, setInputImagePreview] = useState(null);
  const [inputMaskFile, setInputMaskFile] = useState(null);
  const [inputMaskPreview, setInputMaskPreview] = useState(null);

  const [response, setResponse] = useState("");
  const [imageDataUri, setImageDataUri] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const sizeConfig = MODEL_SIZE_CONFIG[selectedModel];

  const getSelectedSize = () => {
    if (!sizeConfig?.supportsSize) return null;
    if (sizeMode === "preset") return sizeConfig.presets[selectedPreset] ?? sizeConfig.presets[0];
    return { width: Number(customWidth), height: Number(customHeight) };
  };

  const handleModelChange = (val) => {
    setSelectedModel(val);
    setSelectedPreset(0);
    setSizeMode("preset");
    // Clear image inputs when switching models
    setInputImageFile(null);
    setInputImagePreview(null);
    setInputMaskFile(null);
    setInputMaskPreview(null);
    setError(null);
  };

  const handleImageFileChange = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (type === "image") {
      setInputImageFile(file);
      setInputImagePreview(preview);
    } else {
      setInputMaskFile(file);
      setInputMaskPreview(preview);
    }
    e.target.value = "";
  };

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;

    // Validate required image inputs
    if (mode === "image") {
      if (sizeConfig?.requiresImage && !inputImageFile) {
        setError("This model requires an input image. Please upload one.");
        return;
      }
      if (sizeConfig?.requiresMask && !inputMaskFile) {
        setError("This model requires both an image and a mask. Please upload both.");
        return;
      }
    }

    setLoading(true);
    setResponse("");
    setImageDataUri(null);
    setError(null);

    try {
      const size = getSelectedSize();

      let body;
      if (mode === "image") {
        body = { prompt, mode: "image", model: selectedModel, ...(size ? { width: size.width, height: size.height } : {}) };

        // Attach base64 image / mask for SD v1.5 models
        if (inputImageFile) body.image = await fileToBase64(inputImageFile);
        if (inputMaskFile)  body.mask  = await fileToBase64(inputMaskFile);
      } else {
        body = { prompt, mode: "text" };
      }

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "An unknown error occurred.");
        return;
      }

      if (mode === "image") {
        if (!data.image) {
          setError("No image data returned from the model.");
          return;
        }
        const isJpeg = selectedModel === "@cf/black-forest-labs/flux-1-schnell";
        const mimeType = isJpeg ? "image/jpeg" : "image/png";
        setImageDataUri(`data:${mimeType};base64,${data.image}`);
      } else {
        setResponse(data.response || "No response from AI.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error — could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const liveSize = getSelectedSize();

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "radial-gradient(ellipse at 20% 50%, #0f1729 0%, #090d1a 60%, #000 100%)", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        .mode-tab { transition: all 0.2s ease; }
        .mode-tab.active { background: #4f46e5; color: white; }
        .mode-tab:not(.active) { background: transparent; color: #6b7280; }
        .mode-tab:not(.active):hover { color: #d1d5db; }
        select option, optgroup { background: #111827; color: #f3f4f6; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.3s ease forwards; }
        .size-pill { transition: all 0.15s ease; cursor: pointer; border-radius: 8px; border-width: 1px; padding: 6px 12px; font-size: 12px; font-weight: 500; }
        .size-pill.active { background: #4f46e5; border-color: #4f46e5; color: white; }
        .size-pill:not(.active) { background: transparent; border-color: #374151; color: #9ca3af; }
        .size-pill:not(.active):hover { border-color: #6366f1; color: #e5e7eb; }
        .seg-tab { transition: all 0.15s; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 6px 14px; border-radius: 8px; }
        .seg-tab.active { background: #1e1b4b; color: #a5b4fc; }
        .seg-tab:not(.active) { color: #6b7280; }
        .seg-tab:not(.active):hover { color: #d1d5db; }
        @keyframes pulse-b { 0%,100% { box-shadow: 0 0 0 0 rgba(79,70,229,0.4); } 50% { box-shadow: 0 0 0 6px rgba(79,70,229,0); } }
        .loading-btn { animation: pulse-b 1.2s ease infinite; }
      `}</style>

      <div className="w-full max-w-2xl flex flex-col gap-7">

        {/* Header */}
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.03em" }} className="text-4xl font-extrabold text-white">
            AI Studio
          </h1>
          <p className="text-gray-500 text-sm mt-1">Powered by Cloudflare Workers AI</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
          {[{ id: "text", icon: "💬", label: "Text Generation" }, { id: "image", icon: "🖼️", label: "Image Generation" }].map((tab) => (
            <button key={tab.id}
              onClick={() => { setMode(tab.id); setResponse(""); setImageDataUri(null); setError(null); }}
              className={`mode-tab flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg ${mode === tab.id ? "active" : ""}`}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Image Mode Controls */}
        {mode === "image" && (
          <div className="flex flex-col gap-5 fade-up">

            {/* Model Select */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Image Model</label>
              <select value={selectedModel} onChange={(e) => handleModelChange(e.target.value)}
                className="bg-gray-900 text-gray-100 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                {IMAGE_MODELS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.models.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </optgroup>
                ))}
              </select>
              <p className="text-xs text-gray-600 font-mono">{selectedModel}</p>
            </div>

            {/* ── Required image upload (img2img) ── */}
            {sizeConfig?.requiresImage && (
              <div className="flex flex-col gap-4 bg-gray-900/60 border border-gray-700 rounded-2xl p-4">
                <ImageUpload
                  label={sizeConfig.imageLabel}
                  note={sizeConfig.imageNote}
                  required
                  file={inputImageFile}
                  preview={inputImagePreview}
                  onChange={(e) => handleImageFileChange(e, "image")}
                  onClear={() => { setInputImageFile(null); setInputImagePreview(null); }}
                />
                {sizeConfig?.requiresMask && (
                  <ImageUpload
                    label={sizeConfig.maskLabel}
                    note={sizeConfig.maskNote}
                    required
                    file={inputMaskFile}
                    preview={inputMaskPreview}
                    onChange={(e) => handleImageFileChange(e, "mask")}
                    onClear={() => { setInputMaskFile(null); setInputMaskPreview(null); }}
                  />
                )}
              </div>
            )}

            {/* ── Optional reference images (FLUX Klein / Dev) ── */}
            {sizeConfig?.supportsRefImage && (
              <div className="flex flex-col gap-2 bg-indigo-950/20 border border-indigo-900/40 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400 text-sm">🖼</span>
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Reference Images (optional)</p>
                </div>
                <p className="text-xs text-gray-500">{sizeConfig.refImageNote}</p>
                <ImageUpload
                  label="Reference Image"
                  required={false}
                  file={inputImageFile}
                  preview={inputImagePreview}
                  onChange={(e) => handleImageFileChange(e, "image")}
                  onClear={() => { setInputImageFile(null); setInputImagePreview(null); }}
                />
              </div>
            )}

            {/* Size Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Output Size</label>
                {sizeConfig?.supportsSize && (
                  <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-0.5">
                    {["preset", "custom"].map((t) => (
                      <button key={t} onClick={() => setSizeMode(t)} className={`seg-tab ${sizeMode === t ? "active" : ""}`}>
                        {t === "preset" ? "Presets" : "Custom"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!sizeConfig?.supportsSize ? (
                <div className="flex items-center gap-3 bg-yellow-950/30 border border-yellow-900/50 rounded-xl px-4 py-3">
                  <span className="text-yellow-500">⚠️</span>
                  <p className="text-yellow-700 text-xs">{sizeConfig?.note}</p>
                </div>
              ) : sizeMode === "preset" ? (
                <div className="flex flex-wrap gap-2">
                  {sizeConfig.presets.map((preset, i) => (
                    <button key={i} onClick={() => setSelectedPreset(i)}
                      className={`size-pill ${selectedPreset === i ? "active" : ""}`}>
                      {preset.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-end gap-3">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs text-gray-500">Width (px)</label>
                    <input type="number" value={customWidth} min={sizeConfig.min} max={sizeConfig.max} step={8}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      className="bg-gray-900 border border-gray-700 text-gray-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full" />
                  </div>
                  <span className="text-gray-600 font-bold pb-2.5">×</span>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs text-gray-500">Height (px)</label>
                    <input type="number" value={customHeight} min={sizeConfig.min} max={sizeConfig.max} step={8}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      className="bg-gray-900 border border-gray-700 text-gray-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full" />
                  </div>
                  <p className="text-xs text-gray-600 pb-2.5 whitespace-nowrap">{sizeConfig.min}–{sizeConfig.max}px</p>
                </div>
              )}

              {sizeConfig?.note && sizeConfig.supportsSize && (
                <p className="text-xs text-yellow-700">⚠️ {sizeConfig.note}</p>
              )}

              {liveSize && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Will generate:</span>
                  <span className="bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-mono px-2.5 py-1 rounded-lg">
                    {liveSize.width} × {liveSize.height} px
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prompt */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            {mode === "image" ? "Image Prompt" : "Your Prompt"}
          </label>
          <textarea
            className="w-full h-40 bg-gray-900 text-gray-100 placeholder-gray-600 border border-gray-700 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder={mode === "image" ? "Describe the image you want to generate..." : "Type your prompt here..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) handleSend(); }}
          />
          <p className="text-xs text-gray-700 text-right">⌘ + Enter to send</p>
        </div>

        {/* Send Button */}
        <button onClick={handleSend} disabled={!prompt.trim() || loading}
          className={`self-end flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl transition-all text-white ${
            loading ? "bg-indigo-700 loading-btn cursor-wait"
            : "bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed"
          }`}>
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              {mode === "image" ? "Generating image..." : "Thinking..."}
            </>
          ) : (
            <>
              {mode === "image" ? "Generate Image" : "Send Request"}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>

        {/* Error Box */}
        {error && (
          <div className="flex items-start gap-3 bg-red-950/40 border border-red-900/60 rounded-xl px-4 py-3 fade-up">
            <span className="text-red-400 mt-0.5">✕</span>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Text Response */}
        {response && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 fade-up">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Response</p>
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{response}</p>
          </div>
        )}

        {/* Image Response */}
        {imageDataUri && (
          <div className="flex flex-col gap-3 fade-up">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Generated Image</p>
            <div className="rounded-2xl overflow-hidden border border-gray-700 shadow-xl shadow-indigo-950/40">
              <img src={imageDataUri} alt="AI Generated" className="w-full object-cover" />
            </div>
            <a href={imageDataUri} download="ai-generated.png"
              className="self-start flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition font-medium">
              ↓ Download image
            </a>
          </div>
        )}

      </div>
    </div>
  );
}