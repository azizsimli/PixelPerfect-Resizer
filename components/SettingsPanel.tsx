import React, { useEffect, useState } from 'react';
import { ResizeSettings } from '../types';
import { SUPPORTED_FORMATS } from '../constants';
import { Lock, Unlock, Download, RefreshCw, AlertCircle } from 'lucide-react';

interface SettingsPanelProps {
  settings: ResizeSettings;
  originalWidth: number;
  originalHeight: number;
  onSettingsChange: (newSettings: ResizeSettings) => void;
  isProcessing: boolean;
  fileSizeEstimate?: number;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  originalWidth,
  originalHeight,
  onSettingsChange,
  isProcessing,
}) => {
  const [widthInput, setWidthInput] = useState(settings.width.toString());
  const [heightInput, setHeightInput] = useState(settings.height.toString());

  // Sync internal state when external settings change (e.g. initial load)
  useEffect(() => {
    setWidthInput(settings.width.toString());
    setHeightInput(settings.height.toString());
  }, [settings.width, settings.height]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setWidthInput(val);
    const numVal = parseInt(val, 10);
    if (!isNaN(numVal)) {
      const updates: Partial<ResizeSettings> = { width: numVal };
      if (settings.maintainAspectRatio && originalWidth > 0) {
        updates.height = Math.round(numVal * (originalHeight / originalWidth));
        setHeightInput(updates.height.toString());
      }
      onSettingsChange({ ...settings, ...updates });
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHeightInput(val);
    const numVal = parseInt(val, 10);
    if (!isNaN(numVal)) {
      const updates: Partial<ResizeSettings> = { height: numVal };
      if (settings.maintainAspectRatio && originalHeight > 0) {
        updates.width = Math.round(numVal * (originalWidth / originalHeight));
        setWidthInput(updates.width.toString());
      }
      onSettingsChange({ ...settings, ...updates });
    }
  };

  const toggleAspectRatio = () => {
    onSettingsChange({ ...settings, maintainAspectRatio: !settings.maintainAspectRatio });
  };

  return (
    <div className="space-y-6">
      
      {/* Resize Settings */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
          Resize Settings
        </h3>
        
        <div className="grid grid-cols-2 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Width (px)</label>
            <input
              type="number"
              value={widthInput}
              onChange={handleWidthChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          
          <div className="space-y-1.5 relative">
            <label className="text-xs font-medium text-slate-400">Height (px)</label>
            <input
              type="number"
              value={heightInput}
              onChange={handleHeightChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            
            {/* Aspect Ratio Lock Button */}
            <button
              onClick={toggleAspectRatio}
              title={settings.maintainAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
              className={`absolute top-1/2 -left-[1.25rem] transform -translate-y-1/2 p-1.5 rounded-full transition-colors ${
                settings.maintainAspectRatio 
                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
              style={{ marginTop: '14px' }}
            >
              {settings.maintainAspectRatio ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
             {/* Quick Percentages */}
             {[0.25, 0.5, 0.75].map((scale) => (
                 <button
                    key={scale}
                    onClick={() => {
                        const w = Math.round(originalWidth * scale);
                        const h = Math.round(originalHeight * scale);
                        onSettingsChange({ ...settings, width: w, height: h });
                    }}
                    className="flex-1 py-1.5 text-xs font-medium bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                 >
                     {scale * 100}%
                 </button>
             ))}
             <button
                onClick={() => {
                    onSettingsChange({ ...settings, width: originalWidth, height: originalHeight });
                }}
                className="flex-1 py-1.5 text-xs font-medium bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
             >
                 Reset
             </button>
        </div>
      </div>

      {/* Export Settings */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <h3 className="text-slate-200 font-semibold mb-4">Export Settings</h3>
        
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Format</label>
                <div className="grid grid-cols-3 gap-2">
                    {SUPPORTED_FORMATS.map((fmt) => (
                        <button
                            key={fmt.value}
                            onClick={() => onSettingsChange({ ...settings, format: fmt.value as any })}
                            className={`py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                                settings.format === fmt.value
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-slate-900 text-slate-400 border border-slate-700 hover:border-slate-600'
                            }`}
                        >
                            {fmt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs font-medium text-slate-400">
                    <span>Quality</span>
                    <span>{Math.round(settings.quality * 100)}%</span>
                </div>
                <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.01"
                    value={settings.quality}
                    onChange={(e) => onSettingsChange({ ...settings, quality: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    disabled={settings.targetFileSizeKB !== null && settings.targetFileSizeKB > 0 && settings.format === 'image/jpeg'}
                />
            </div>

            {/* Target File Size (JPG Only logic applied visually) */}
            <div className={`space-y-1.5 pt-2 border-t border-slate-700/50 ${settings.format !== 'image/jpeg' ? 'opacity-50' : ''}`}>
                 <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                        Max File Size (KB)
                        {settings.format === 'image/jpeg' && (
                             <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">JPG Only</span>
                        )}
                    </label>
                    {settings.targetFileSizeKB && (
                        <button 
                            onClick={() => onSettingsChange({ ...settings, targetFileSizeKB: null })}
                            className="text-[10px] text-red-400 hover:text-red-300"
                        >
                            Clear
                        </button>
                    )}
                 </div>
                 <div className="relative">
                    <input
                        type="number"
                        placeholder="e.g. 500"
                        value={settings.targetFileSizeKB || ''}
                        onChange={(e) => {
                            const val = e.target.value ? parseInt(e.target.value, 10) : null;
                            onSettingsChange({ ...settings, targetFileSizeKB: val });
                        }}
                        disabled={settings.format !== 'image/jpeg'}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder-slate-600"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">KB</span>
                 </div>
                 {settings.format !== 'image/jpeg' && (
                     <p className="text-[10px] text-amber-500/80 flex items-center gap-1 mt-1">
                         <AlertCircle size={10} />
                         Target size only available for JPG
                     </p>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
