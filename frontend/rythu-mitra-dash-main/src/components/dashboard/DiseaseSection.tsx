import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Leaf } from 'lucide-react';

export default function DiseaseSection() {
  return (
    <section id="disease" className="space-y-6">
      <div className="farm-section-header">
        <div className="section-icon">
          <Leaf className="w-[18px] h-[18px] text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">AI Plant Disease Detection</h2>
          <p className="text-sm text-muted-foreground">Upload a crop photo for instant AI diagnosis</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Upload Zone */}
        <div className="farm-card">
          <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/40 transition-colors">
            <div className="animate-float">
              <Upload className="w-12 h-12 text-primary/40 mx-auto mb-3" />
            </div>
            <p className="font-medium text-foreground text-sm">Drop your crop photo here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse • JPG PNG WEBP • Max 10MB</p>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">Backend connection required for AI diagnosis</p>
        </div>

        {/* Results — empty state */}
        <div className="farm-card flex items-center justify-center min-h-[250px]">
          <div className="text-center">
            <Leaf className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Upload a photo to see AI diagnosis results</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Supports detection of common crop diseases</p>
          </div>
        </div>
      </div>
    </section>
  );
}
