import React, { useState, useEffect, useCallback } from 'react';
import Dropzone from './components/Dropzone';
import SettingsPanel from './components/SettingsPanel';
import ImagePreview from './components/ImagePreview';
import { ImageState, ResizeSettings, ProcessingResult } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { readFileAsDataURL, processImage, loadImage } from './utils/imageProcessing';
import { Layout, Image as ImageIcon, Zap, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [imageState, setImageState] = useState<ImageState | null>(null);
  const [settings, setSettings] = useState<ResizeSettings>(DEFAULT_SETTINGS);
  const [processedResult, setProcessedResult] = useState<ProcessingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial processing when an image is loaded
  const handleFileSelect = async (file: File) => {
    try {
      setError(null);
      setIsProcessing(true);
      const dataUrl = await readFileAsDataURL(file);
      const img = await loadImage(dataUrl);

      setImageState({
        file,
        originalPreview: dataUrl,
        originalWidth: img.width,
        originalHeight: img.height,
        originalSize: file.size,
        name: file.name
      });

      const newSettings = {
        ...DEFAULT_SETTINGS,
        width: img.width,
        height: img.height,
      };
      setSettings(newSettings);
      
      // Process immediately with default settings
      const result = await processImage(dataUrl, newSettings);
      setProcessedResult(result);

    } catch (err) {
      console.error(err);
      setError("Failed to load image. Please try another file.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Debounced processing for settings changes
  useEffect(() => {
    if (!imageState) return;

    const timer = setTimeout(async () => {
      setIsProcessing(true);
      try {
        const result = await processImage(imageState.originalPreview, settings);
        setProcessedResult(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [settings, imageState]);

  const handleDownload = () => {
    if (!processedResult || !imageState) return;
    
    const link = document.createElement('a');
    link.href = processedResult.url;
    
    // Generate filename
    const originalName = imageState.name.substring(0, imageState.name.lastIndexOf('.')) || imageState.name;
    let ext = 'jpg';
    if (settings.format === 'image/png') ext = 'png';
    if (settings.format === 'image/webp') ext = 'webp';
    
    link.download = `${originalName}_resized.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 p-2 rounded-lg">
              <Layout className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              PixelPerfect
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
             <span className="hidden md:flex items-center gap-1 hover:text-blue-400 transition-colors cursor-help" title="Processed locally in your browser">
                <ShieldCheck size={16} /> Client-Side Secure
             </span>
             <span className="hidden md:flex items-center gap-1 hover:text-amber-400 transition-colors cursor-help" title="High performance processing">
                <Zap size={16} /> Fast Processing
             </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {!imageState ? (
          /* Empty State / Landing */
          <div className="max-w-3xl mx-auto mt-12 space-y-8 animate-fade-in-up">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Professional Image Resizing <br />
                <span className="text-blue-500">Without the Quality Loss</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Resize, compress, and convert images instantly in your browser. 
                No server uploads, no privacy concerns.
              </p>
            </div>
            
            <div className="bg-slate-900/50 p-1 rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-sm">
                <Dropzone onFileSelect={handleFileSelect} />
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-8">
               {[
                 { title: 'Smart Compression', desc: 'Target specific file sizes for optimized web delivery.' },
                 { title: 'Format Conversion', desc: 'Convert between JPG, PNG, and WebP instantly.' },
                 { title: 'Privacy First', desc: 'Images never leave your device. 100% secure processing.' }
               ].map((feature, i) => (
                 <div key={i} className="bg-slate-900/30 p-6 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                    <h3 className="font-semibold text-slate-200 mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-400">{feature.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        ) : (
          /* Editor State */
          <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
            
            {/* Left Column: Preview */}
            <div className="lg:col-span-8 h-full flex flex-col">
               <div className="flex items-center justify-between mb-4">
                  <button 
                    onClick={() => { setImageState(null); setProcessedResult(null); }}
                    className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    ← Upload different image
                  </button>
                  {error && <span className="text-sm text-red-400 bg-red-400/10 px-3 py-1 rounded-full">{error}</span>}
               </div>
               
               <div className="flex-1 min-h-0">
                  <ImagePreview
                    originalUrl={imageState.originalPreview}
                    processedUrl={processedResult?.url || null}
                    isProcessing={isProcessing}
                    originalSize={imageState.originalSize}
                    processedSize={processedResult?.size || 0}
                    originalDimensions={{ width: imageState.originalWidth, height: imageState.originalHeight }}
                    processedDimensions={{ width: settings.width, height: settings.height }}
                    onDownload={handleDownload}
                  />
               </div>
            </div>

            {/* Right Column: Settings */}
            <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
               <SettingsPanel
                 settings={settings}
                 originalWidth={imageState.originalWidth}
                 originalHeight={imageState.originalHeight}
                 onSettingsChange={setSettings}
                 isProcessing={isProcessing}
               />
               
               <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <h4 className="text-blue-400 font-semibold text-sm mb-1 flex items-center gap-2">
                    <Zap size={14} /> Pro Tip
                  </h4>
                  <p className="text-xs text-blue-300/80 leading-relaxed">
                    Use WebP format for the best balance between quality and file size. It supports transparency like PNG but with better compression.
                  </p>
               </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;
