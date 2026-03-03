import React, { useRef } from 'react';
import Button from '../../components/ui/Button';

export default function ImageUpload({ onUpload, loading }) {
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => e.preventDefault();

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) onUpload(file);
    };

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) onUpload(file);
    };

    return (
        <div
            className="bg-neo-panel backdrop-blur-md border border-neo-border rounded-2xl p-8 text-center border-dashed border-2 border-slate-700 hover:border-blue-500 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input type="file" ref={fileInputRef} onChange={handleChange} className="hidden" accept="image/*" />

            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                📸
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Upload Leaf Sample</h3>
            <p className="text-xs text-slate-400 mb-6">Drag & Drop or Click to Scan</p>

            {loading && (
                <div className="text-xs font-mono text-blue-400 animate-pulse">
                    ANALYZING PIXEL DATA...
                </div>
            )}
        </div>
    );
}
