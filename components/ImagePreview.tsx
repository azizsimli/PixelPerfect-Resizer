import React, { useState } from 'react';
import { formatFileSize } from '../utils/imageProcessing';
import { Download, ZoomIn, Loader2 } from 'lucide-react';

interface ImagePreviewProps {
  originalUrl: string;
  processedUrl: string | null;
  isProcessing: boolean;
  originalSize: number;
  processedSize: number;
  originalDimensions: { width: number; height: number };
  processedDimensions: { width: number; height: number };
  onDownload: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  originalUrl,
  processedUrl,
  isProcessing,
  originalSize,
  processedSize,
  originalDimensions,
  processedDimensions,
  onDownload,
}) => {
  const [zoom, setZoom] = useState(false);
  
  // Calculate savings
  const savings = originalSize - processedSize;
  const savingsPercent = Math.round((savings / originalSize) * 100);
  const isSmaller = savings > 0;

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-700/50 backdrop-blur-sm">
      
      {/* Header Info Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-800/80 border-b border-slate-700/50">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Original</div>
            <div className="text-sm font-semibold text-slate-200">
              {originalDimensions.width} x {originalDimensions.height}
              <span className="mx-2 text-slate-600">|</span>
              {formatFileSize(originalSize)}
            </div>
          </div>
        </div>

        {processedUrl && (
             <div className="text-right">
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Output</div>
                <div className="flex items-center gap-2 justify-end">
                    <span className="text-sm font-semibold text-slate-200">
                         {processedDimensions.width} x {processedDimensions.height}
                    </span>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${isSmaller ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {formatFileSize(processedSize)}
                    </span>
                </div>
            </div>
        )}
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-950">
          {/* Checkerboard background for transparency */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{
                   backgroundImage: `linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)`,
                   backgroundSize: `20px 20px`,
                   backgroundPosition: `0 0, 0 10px, 10px -10px, -10px 0px`
               }} 
          />
          
          <div className={`relative transition-all duration-300 ${zoom ? 'scale-100' : 'scale-[0.85]'} max-w-full max-h-full shadow-2xl shadow-black/50`}>
              {isProcessing && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] rounded-lg">
                      <Loader2 className="animate-spin text-blue-500" size={48} />
                  </div>
              )}
              
              <img 
                src={processedUrl || originalUrl} 
                alt="Preview" 
                className="max-w-full max-h-[60vh] object-contain rounded-lg border border-slate-700/50"
              />
          </div>

          {/* Floating Actions */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-full border border-slate-700/50 shadow-xl backdrop-blur-md">
              <button 
                onClick={() => setZoom(!zoom)}
                className={`p-2 rounded-full transition-colors ${zoom ? 'bg-blue-500 text-white' : 'hover:bg-slate-700 text-slate-300'}`}
                title="Toggle actual size"
              >
                  <ZoomIn size={20} />
              </button>
              <div className="w-px h-4 bg-slate-600 mx-1"></div>
              <button
                onClick={onDownload}
                disabled={!processedUrl || isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                <span>Export Image</span>
              </button>
          </div>
      </div>
      
      {/* Footer Stats */}
      {processedUrl && isSmaller && (
          <div className="bg-green-500/10 border-t border-green-500/20 py-2 text-center text-xs font-medium text-green-400">
             Reduced by {savingsPercent}% ({formatFileSize(savings)} saved)
          </div>
      )}
    </div>
  );
};

export default ImagePreview;
