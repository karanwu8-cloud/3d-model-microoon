import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { BatteryCharging, ShieldAlert, Scan, Cpu, Radio, Battery, Activity, Lock, Skull, AlertTriangle } from 'lucide-react';
import NanoTraceModel from './components/NanoTraceModel';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Canvas Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 rounded-xl border border-red-900/50 p-6 text-center">
          <AlertTriangle className="text-red-500 mb-4" size={48} />
          <h2 className="text-red-400 font-mono text-lg mb-2">WebGL Render Error</h2>
          <p className="text-neutral-400 text-sm max-w-md">
            {this.state.error?.message || "An unexpected error occurred while rendering the 3D model."}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-6 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm transition-colors"
          >
            Retry Render
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [isCharging, setIsCharging] = useState(false);
  const [isSOS, setIsSOS] = useState(false);
  const [xRayMode, setXRayMode] = useState(false);
  const [isTampered, setIsTampered] = useState(false);

  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-medium tracking-widest text-white">NANO-TRACE</h1>
            <span className="text-xs font-mono text-neutral-500 border border-neutral-800 px-2 py-0.5 rounded-full ml-2">
              PROTOTYPE v1.0
            </span>
          </div>
          <div className="text-xs font-mono text-neutral-500">
            SECURE HARDWARE VISUALIZATION
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: 3D Viewer & Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* 3D Canvas Container */}
            <div className="h-[500px] lg:h-[600px] w-full relative group">
              <ErrorBoundary>
                <NanoTraceModel 
                  isCharging={isCharging} 
                  isSOS={isSOS} 
                  xRayMode={xRayMode} 
                  isTampered={isTampered}
                />
              </ErrorBoundary>
              
              {/* Floating Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button 
                  onClick={() => setXRayMode(!xRayMode)}
                  className={`p-3 rounded-lg backdrop-blur-md border transition-all duration-300 flex items-center gap-2 ${
                    xRayMode 
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                      : 'bg-neutral-900/80 border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
                  }`}
                  title="Toggle X-Ray View"
                >
                  <Scan size={20} />
                  <span className="text-xs font-mono font-medium hidden sm:block">X-RAY</span>
                </button>
                
                <button 
                  onClick={() => {
                    setIsCharging(!isCharging);
                    if (!isCharging) {
                      setIsSOS(false);
                      setIsTampered(false);
                    }
                  }}
                  className={`p-3 rounded-lg backdrop-blur-md border transition-all duration-300 flex items-center gap-2 ${
                    isCharging 
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                      : 'bg-neutral-900/80 border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
                  }`}
                  title="Toggle Induction Charging"
                >
                  <BatteryCharging size={20} />
                  <span className="text-xs font-mono font-medium hidden sm:block">CHARGE</span>
                </button>

                <button 
                  onClick={() => {
                    setIsSOS(!isSOS);
                    if (!isSOS) {
                      setIsCharging(false);
                      setIsTampered(false);
                    }
                  }}
                  className={`p-3 rounded-lg backdrop-blur-md border transition-all duration-300 flex items-center gap-2 ${
                    isSOS 
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                      : 'bg-neutral-900/80 border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
                  }`}
                  title="Trigger SOS Mode"
                >
                  <ShieldAlert size={20} />
                  <span className="text-xs font-mono font-medium hidden sm:block">SOS</span>
                </button>

                <button 
                  onClick={() => {
                    setIsTampered(!isTampered);
                    if (!isTampered) {
                      setXRayMode(true); // Auto-show X-Ray to see the effect
                      setIsCharging(false);
                      setIsSOS(false);
                    }
                  }}
                  className={`p-3 rounded-lg backdrop-blur-md border transition-all duration-300 flex items-center gap-2 ${
                    isTampered 
                      ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse' 
                      : 'bg-neutral-900/80 border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
                  }`}
                  title="Trigger Dead Man's Switch"
                >
                  <Skull size={20} />
                  <span className="text-xs font-mono font-medium hidden sm:block">TAMPER</span>
                </button>
              </div>
            </div>

            {/* Interaction Instructions */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 flex items-start gap-4">
              <Activity className="text-neutral-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Interactive Visualization</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Drag to rotate the model. Scroll to zoom. Use the toggles on the right to simulate hardware states: X-Ray transparency, Qi-Induction charging pulse, Day 10 SOS authority notification, and the Dead Man's Switch tamper response.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Technical Specs */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-2xl font-light text-white mb-2">Hardware Architecture</h2>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Ultra-miniature, portless tracking device designed for high-value items. Bridges the "Last Meter" gap with hybrid LTE-M/BLE technology.
              </p>
            </div>

            <div className="space-y-4">
              {/* Spec Card 1 */}
              <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-neutral-800 rounded-lg text-neutral-300">
                    <Cpu size={18} />
                  </div>
                  <h3 className="text-sm font-medium text-white">The Brain: Nordic nRF9160 SiP</h3>
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  GPS + LTE-M modem integrated into a single System-in-Package. Works entirely independently in remote wilderness areas without relying on nearby smartphones.
                </p>
              </div>

              {/* Spec Card 2 */}
              <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-neutral-800 rounded-lg text-neutral-300">
                    <Radio size={18} />
                  </div>
                  <h3 className="text-sm font-medium text-white">Hybrid Tracking Logic</h3>
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  <span className="text-amber-400 font-medium">Global Recovery:</span> Independent Cellular Modem (LTE-M/GPS) for remote areas.<br/>
                  <span className="text-blue-400 font-medium mt-1 inline-block">Precision Pinpointing:</span> Local Bluetooth (BLE) for the "10m Circle Fix".
                </p>
              </div>

              {/* Spec Card 3 */}
              <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-neutral-800 rounded-lg text-neutral-300">
                    <Battery size={18} />
                  </div>
                  <h3 className="text-sm font-medium text-white">Power & Sustainability</h3>
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Ultra-thin solid-state battery occupying 40% of the chassis. Fully rechargeable via wireless pads (Qi-Induction) using the rear copper spiral. Zero physical ports. Anti-disposable design.
                </p>
              </div>

              {/* Spec Card 4 */}
              <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors relative overflow-hidden group">
                <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 mb-3 relative z-10">
                  <div className="p-2 bg-neutral-800 rounded-lg text-neutral-300">
                    <Lock size={18} />
                  </div>
                  <h3 className="text-sm font-medium text-white">Security & Anti-Tamper</h3>
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed relative z-10">
                  <span className="text-red-400 font-medium">Dead Man's Switch:</span> Capacitive Integrity Mesh & "Integrity Mic". If forced open or violently removed, the internal circuit flashes and wipes sensitive encrypted keys, rendering it useless to thieves.
                </p>
              </div>
            </div>

            {/* Dimensions */}
            <div className="pt-4 border-t border-neutral-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Form Factor</span>
                <span className="font-mono text-white">25mm × 8mm × 2.5mm</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-neutral-500">Mounting</span>
                <span className="font-mono text-white">4mm Titanium Clip</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-neutral-500">Housing</span>
                <span className="font-mono text-white">Smoked Polycarbonate</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
