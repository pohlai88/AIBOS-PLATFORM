# AI-BOS Implementation Guides

> **Purpose**: Step-by-step implementation for each major feature from the PRD

---

## 🎯 PRD Alignment

This guide implements the three core views from the Product Requirements Document:

1. **Hero Landing** (Public Gate) - The Living String
2. **Command Stream** (Dashboard) - Intent Bar + Prediction Cards
3. **Audit Room** (Truth View) - Lineage Graph + Evidence Drawer

---

## 1. Hero Landing: The Living String Engine

### Component Specification

```tsx
// components/HeroLanding.tsx
'use client';

import { useEffect, useRef } from 'react';

export function HeroLanding() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Living String physics
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let targetX = mouseX;
    let targetY = mouseY;
    
    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Smooth follow (tether effect)
      mouseX += (targetX - mouseX) * 0.1;
      mouseY += (targetY - mouseY) * 0.1;
      
      // Draw sine wave
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(242, 240, 233, 0.6)'; // #F2F0E9
      ctx.lineWidth = 2;
      
      const amplitude = 50;
      const frequency = 0.01;
      const offset = Date.now() * 0.001; // Slow drift
      
      for (let x = 0; x < canvas.width; x++) {
        const distance = Math.abs(x - mouseX);
        const influence = Math.max(0, 1 - distance / 300);
        const y = canvas.height / 2 + 
                  Math.sin(x * frequency + offset) * amplitude * (1 + influence);
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <div className="relative min-h-screen bg-[#0A0A0B] bg-noise overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 glow-ambient pointer-events-none" />
      
      {/* Living String Canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.6 }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-metallic text-6xl md:text-8xl font-extralight text-center mb-6 tracking-tight">
          The Life Workspace
        </h1>
        
        <p className="text-stone-400 text-lg md:text-xl font-light text-center max-w-2xl mb-12 leading-relaxed">
          Intelligence that breathes. Decisions that trace. 
          <span className="text-white"> Governance by rhythm.</span>
        </p>
        
        <button className="bg-[#D4A373] text-[#0A0A0B] px-8 py-4 rounded-lg font-mono font-bold text-sm uppercase tracking-wider hover:bg-[#E0B589] transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(212,163,115,0.3)]">
          [ ENTER WORKSPACE ]
        </button>
        
        <div className="mt-16 flex items-center gap-3">
          <div className="w-2 h-2 bg-[#D4A373] rounded-full breathe" />
          <span className="font-mono text-xs text-stone-500 uppercase tracking-widest">
            MCP: ACTIVE (v.4.2)
          </span>
        </div>
      </div>
    </div>
  );
}
```

---

## 2. Command Stream: Intent Bar + Prediction Cards

### Intent Bar Component

```tsx
// components/IntentBar.tsx
'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export function IntentBar() {
  const [query, setQuery] = useState('');
  
  return (
    <div className="fixed bottom-8 left-0 w-full flex justify-center px-4 z-50">
      <div className="w-full max-w-2xl border-photonic-amber rounded-full flex items-center px-6 py-4 backdrop-blur-xl bg-black/40 shadow-2xl ring-1 ring-[#D4A373]/20">
        <Sparkles className="w-4 h-4 text-[#D4A373] glow-pulse mr-3" />
        
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask AI-BOS to analyze, predict, or audit..." 
          className="bg-transparent border-none outline-none text-sm text-white placeholder-stone-500 w-full font-light focus-ring"
        />
        
        <div className="text-[10px] font-mono text-stone-600 border border-white/10 rounded px-2 py-1">
          CMD+K
        </div>
      </div>
    </div>
  );
}
```

### Prediction Card Component

```tsx
// components/PredictionCard.tsx
import { Zap, GitBranch } from 'lucide-react';

interface PredictionCardProps {
  title: string;
  description: string;
  probability: number;
  category: 'opportunity' | 'risk' | 'compliance';
  metadata?: {
    hash?: string;
    source?: string;
  };
  onExecute?: () => void;
  onViewLineage?: () => void;
}

export function PredictionCard({
  title,
  description,
  probability,
  category,
  metadata,
  onExecute,
  onViewLineage
}: PredictionCardProps) {
  const isOpportunity = category === 'opportunity';
  
  return (
    <div className={`
      relative group rounded-xl overflow-hidden hover-lift
      ${isOpportunity ? 'border-photonic-amber' : 'border-photonic'}
    `}>
      {/* Hover light sweep */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Shimmer for active processing */}
      {isOpportunity && (
        <div className="absolute inset-0 animate-shimmer opacity-30" />
      )}
      
      <div className="relative z-10 p-6 bg-black/40 backdrop-blur-xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3 items-center">
            <Zap className="w-4 h-4 text-[#D4A373]" />
            <span className="text-sm font-medium text-[#D4A373]">
              {category === 'opportunity' ? 'Opportunity Detected' : 
               category === 'risk' ? 'Risk Alert' : 'Compliance Check'}
            </span>
          </div>
          <span className="font-mono text-xs text-[#64748B] uppercase tracking-wider">
            PROB: {probability}%
          </span>
        </div>
        
        {/* Title */}
        <h3 className="text-white text-lg font-medium mb-3 leading-tight">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-stone-300 text-sm leading-relaxed mb-4">
          {description}
        </p>
        
        {/* Metadata */}
        {metadata && (
          <div className="mb-4 space-y-1">
            {metadata.hash && (
              <div className="font-mono text-[10px] text-stone-600 uppercase tracking-wider">
                HASH: {metadata.hash}
              </div>
            )}
            {metadata.source && (
              <div className="font-mono text-[10px] text-stone-600">
                SOURCE: {metadata.source}
              </div>
            )}
          </div>
        )}
        
        {/* Divider */}
        <div className="gradient-divider mb-4" />
        
        {/* Actions */}
        <div className="flex gap-4">
          {onExecute && (
            <button 
              onClick={onExecute}
              className="px-4 py-2 bg-[#D4A373] text-[#0A0A0B] rounded-lg text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#E0B589] transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(212,163,115,0.2)]"
            >
              [ EXECUTE ]
            </button>
          )}
          
          {onViewLineage && (
            <button 
              onClick={onViewLineage}
              className="text-xs font-mono text-stone-400 hover:text-white transition-colors duration-300 flex items-center gap-2"
            >
              VIEW LINEAGE <GitBranch className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Command Stream Layout

```tsx
// app/dashboard/page.tsx
import { IntentBar } from '@/components/IntentBar';
import { PredictionCard } from '@/components/PredictionCard';

export default function DashboardPage() {
  const predictions = [
    {
      title: 'Supply Chain Optimization Detected',
      description: 'Vietnam node latency decreased by 14%. Recommended action: Increase allocation by 200 units.',
      probability: 87,
      category: 'opportunity' as const,
      metadata: {
        hash: '#8X92...99',
        source: 'ERP_Oracle_v2'
      }
    },
    // More predictions...
  ];
  
  return (
    <div className="min-h-screen bg-[#0A0A0B] bg-noise">
      {/* Ambient glow */}
      <div className="glow-ambient min-h-screen">
        {/* Header */}
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 backdrop-blur-xl bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#D4A373] rounded-full breathe" />
            <span className="font-mono text-xs tracking-widest text-stone-400 uppercase">
              AI-BOS / WORKSPACE
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-stone-500 font-mono">
              MCP: ACTIVE (v.4.2)
            </span>
          </div>
        </header>
        
        {/* Content */}
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="mb-12">
            <h1 className="text-3xl font-light mb-2 text-white">
              Good morning, Justin.
            </h1>
            <p className="text-stone-400">
              The rhythm is stable. 
              <span className="font-mono text-[#64748B]"> 3 </span> 
              items require governance.
            </p>
          </div>
          
          {/* Prediction Stream */}
          <div className="flex flex-col gap-4 pb-32">
            {predictions.map((pred, i) => (
              <PredictionCard key={i} {...pred} />
            ))}
          </div>
        </main>
        
        {/* Intent Bar */}
        <IntentBar />
      </div>
    </div>
  );
}
```

---

## 3. Audit Room: Lineage Graph + Evidence Drawer

### Lineage Graph Component

```tsx
// components/LineageGraph.tsx
'use client';

import { useEffect, useRef } from 'react';

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  status: 'active' | 'completed' | 'pending';
}

interface LineageGraphProps {
  nodes: Node[];
}

export function LineageGraph({ nodes }: LineageGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  return (
    <div className="relative w-full h-full">
      {/* SVG Background with Living String */}
      <svg 
        ref={svgRef}
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
      >
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#64748B" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#D4A373" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#64748B" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        
        {/* Animated path connections */}
        <path 
          d="M 350 300 C 500 300, 500 300, 650 300" 
          stroke="url(#line-gradient)" 
          strokeWidth="2" 
          fill="none" 
          className="living-string" 
        />
      </svg>
      
      {/* Nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          className="absolute z-10"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <DecisionNode {...node} />
        </div>
      ))}
    </div>
  );
}

function DecisionNode({ label, status }: Omit<Node, 'id' | 'x' | 'y'>) {
  const isActive = status === 'active';
  
  return (
    <div className={`
      relative border-photonic rounded-xl p-5 bg-black/60 backdrop-blur-xl
      hover:scale-105 transition-all duration-500
      ${isActive ? 'border-photonic-amber' : ''}
    `}>
      {isActive && (
        <div className="absolute inset-0 animate-shimmer opacity-50 rounded-xl" />
      )}
      
      <div className="relative z-10">
        <div className="text-sm font-medium text-white mb-1">
          {label}
        </div>
        <div className="font-mono text-[10px] text-stone-500 uppercase">
          {status}
        </div>
      </div>
      
      {/* Connection points */}
      <div className={`
        absolute top-1/2 -right-2 -translate-y-1/2
        w-4 h-4 rounded-full border-2
        ${isActive 
          ? 'bg-[#D4A373] border-[#D4A373] shadow-[0_0_10px_#D4A373]' 
          : 'bg-[#0A0A0B] border-stone-600'
        }
      `} />
    </div>
  );
}
```

### Evidence Drawer Component

```tsx
// components/EvidenceDrawer.tsx
'use client';

import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface Evidence {
  hash: string;
  source: string;
  payload: Record<string, any>;
  rules: Array<{ label: string; passed: boolean }>;
}

interface EvidenceDrawerProps {
  evidence: Evidence;
  isOpen: boolean;
  onClose: () => void;
}

export function EvidenceDrawer({ evidence, isOpen, onClose }: EvidenceDrawerProps) {
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-strong z-40 fade-in"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <aside className={`
        fixed top-0 right-0 h-full w-full md:w-96
        border-l border-white/5 bg-black/60 backdrop-blur-xl
        z-50 slide-in-right
      `}>
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xs font-mono text-stone-500 uppercase tracking-widest mb-2">
                Metadata Inspector
              </h3>
              <div className="font-mono text-xs text-stone-300 break-all">
                {evidence.hash}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-stone-400" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto space-y-6">
            {/* Source */}
            <div>
              <label className="text-[10px] text-stone-600 uppercase tracking-wider">
                Input Source
              </label>
              <div className="font-mono text-xs text-stone-300 mt-1">
                {evidence.source}
              </div>
            </div>
            
            {/* Governance Rules */}
            <div>
              <label className="text-[10px] text-stone-600 uppercase tracking-wider">
                Governance Rules
              </label>
              <div className="mt-2 space-y-2">
                {evidence.rules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-stone-400">
                    <CheckCircle className={`w-3 h-3 ${
                      rule.passed ? 'text-emerald-500' : 'text-rose-500'
                    }`} />
                    <span>{rule.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* JSON Payload */}
            <div>
              <label className="text-[10px] text-stone-600 uppercase tracking-wider">
                JSON Payload
              </label>
              <div className="mt-2 p-3 rounded bg-black/50 border border-white/5 font-mono text-[10px] text-stone-500 overflow-x-auto">
                <pre>{JSON.stringify(evidence.payload, null, 2)}</pre>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="pt-6 border-t border-white/5">
            <button className="w-full py-3 bg-[#D4A373] hover:bg-[#E0B589] text-[#0A0A0B] text-xs font-bold font-mono rounded transition-colors shadow-lg shadow-[#D4A373]/20">
              APPROVE ACTION
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
```

---

## 4. Success Metrics Implementation

### The Squint Test Validator

```tsx
// utils/squintTest.ts
export function validateSquintTest() {
  const warnings: string[] = [];
  
  // Check for "Grid Lines" (bad)
  const borders = document.querySelectorAll('[class*="border-gray"]');
  if (borders.length > 0) {
    warnings.push(`Found ${borders.length} grey borders. Use .border-photonic instead.`);
  }
  
  // Check for "Blobs of Light" (good)
  const glows = document.querySelectorAll('[class*="glow"]');
  if (glows.length === 0) {
    warnings.push('No glow effects detected. Add .glow-ambient or .glow-pulse.');
  }
  
  return warnings;
}
```

### The Pulse Check Validator

```tsx
// utils/pulseCheck.ts
export function validatePulseCheck() {
  const warnings: string[] = [];
  
  // Check for ambient animations
  const breathingElements = document.querySelectorAll('.breathe, .glow-pulse');
  if (breathingElements.length === 0) {
    warnings.push('No breathing elements found. Interface feels static.');
  }
  
  // Check for Living String
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    warnings.push('No canvas element (Living String) detected.');
  }
  
  return warnings;
}
```

---

## 5. Code Review Checklist

### Before Submitting PR

```bash
# Run these checks
npm run lint
npm run type-check
npm run test:design-compliance
```

### Manual Checks

- [ ] All backgrounds have `.bg-noise`
- [ ] All cards use `.border-photonic`
- [ ] All numbers use `font-mono`
- [ ] All H1/H2 use `.text-metallic`
- [ ] Primary button is Amber (#D4A373)
- [ ] No blue accents
- [ ] Animations follow 60bpm rhythm
- [ ] Hover states smooth (300ms)
- [ ] Living String visible (if Hero page)
- [ ] Intent Bar floating bottom-center (if Dashboard)
- [ ] Lineage paths animated (if Audit Room)

---

**Next**: Implement these components in your Next.js app and test against the Component Implementation Matrix.

