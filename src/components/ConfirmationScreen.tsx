import React, { useState, useEffect } from 'react';
import { CheckCircle, Home, Sparkles, Clock, Shield, Zap } from 'lucide-react';

/* ─── props ───────────────────────────────────────────────────── */
interface ConfirmationScreenProps {
  type: 'checkin' | 'checkout' | 'late-checkin';
  visitor: { id: string; fullName: string };
  onReturn: () => void;
}

/* ─── component ───────────────────────────────────────────────── */
export default function ConfirmationScreen({
  type,
  visitor,
  onReturn,
}: ConfirmationScreenProps) {
  const { fullName } = visitor;
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onReturn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onReturn]);

  const isCheckIn = type === 'checkin';
  const isLateCheckIn = type === 'late-checkin';
  const isCheckOut = type === 'checkout';

  const getGradientColors = () => {
    if (isCheckIn) return 'from-slate-900 via-blue-900 to-slate-900';
    if (isLateCheckIn) return 'from-slate-900 via-orange-900 to-slate-900';
    return 'from-slate-900 via-emerald-900 to-slate-900';
  };

  const getBlobColors = () => {
    if (isCheckIn) return { primary: 'bg-blue-500/20', secondary: 'bg-cyan-500/20' };
    if (isLateCheckIn) return { primary: 'bg-orange-500/20', secondary: 'bg-red-500/20' };
    return { primary: 'bg-emerald-500/20', secondary: 'bg-teal-500/20' };
  };

  const getButtonColors = () => {
    if (isCheckIn) return 'from-cyan-400 to-blue-600';
    if (isLateCheckIn) return 'from-orange-400 to-red-600';
    return 'from-emerald-400 to-teal-600';
  };

  const getTextColors = () => {
    if (isCheckIn) return { primary: 'from-cyan-400 to-blue-500', secondary: 'from-emerald-400 to-teal-500' };
    if (isLateCheckIn) return { primary: 'from-orange-400 to-red-500', secondary: 'from-cyan-400 to-blue-500' };
    return { primary: 'from-emerald-400 to-teal-500', secondary: 'from-cyan-400 to-blue-500' };
  };

  const getShadowColor = () => {
    if (isCheckIn) return 'shadow-cyan-500/25';
    if (isLateCheckIn) return 'shadow-orange-500/25';
    return 'shadow-emerald-500/25';
  };

  const getCountdownColor = () => {
    if (isCheckIn) return 'border-cyan-400 text-cyan-400';
    if (isLateCheckIn) return 'border-orange-400 text-orange-400';
    return 'border-emerald-400 text-emerald-400';
  };

  const blobColors = getBlobColors();
  const textColors = getTextColors();

  return (
    <div className={`min-h-screen relative overflow-hidden bg-gradient-to-br ${getGradientColors()}`}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className={`absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl animate-pulse ${blobColors.primary}`}></div>
        <div className={`absolute bottom-20 right-20 w-72 h-72 rounded-full blur-3xl animate-pulse delay-1000 ${blobColors.secondary}`}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full animate-pulse ${
              isCheckIn ? 'bg-cyan-400/30' : isLateCheckIn ? 'bg-orange-400/30' : 'bg-emerald-400/30'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-4xl w-full text-center">
          {/* Success Animation */}
          <div className="mb-12">
            <div className={`relative w-32 h-32 mx-auto mb-8 bg-gradient-to-br ${getButtonColors()} rounded-full flex items-center justify-center shadow-2xl ${getShadowColor()} animate-pulse`}>
              <CheckCircle className="w-16 h-16 text-white" />
              <div className={`absolute -inset-4 rounded-full blur opacity-30 animate-ping bg-gradient-to-br ${getButtonColors()}`}></div>
            </div>

            {/* Status Indicators */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">Secure</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-medium">Verified</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">Complete</span>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="mb-12">
            {isCheckIn ? (
              <>
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                  Welcome,{' '}
                  <span className={`bg-gradient-to-r ${textColors.primary} bg-clip-text text-transparent`}>
                    {visitor.fullName}
                  </span>
                </h2>
                <div className="space-y-4">
                  <p className="text-2xl text-gray-300">
                    🚀 Successfully registered at{' '}
                    <span className={`bg-gradient-to-r ${textColors.secondary} bg-clip-text text-transparent font-bold`}>
                      GrowthJockey
                    </span>
                  </p>
                  <p className="text-xl text-gray-400">
                    Your biometric data has been securely processed
                  </p>
                  <div className="inline-flex items-center gap-3 bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 rounded-full px-8 py-4 mt-6">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-300 font-medium">Please proceed to reception</span>
                  </div>
                </div>
              </>
            ) : isLateCheckIn ? (
              <>
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                  Late Check-In,{' '}
                  <span className={`bg-gradient-to-r ${textColors.primary} bg-clip-text text-transparent`}>
                    {visitor.fullName}
                  </span>
                </h2>
                <div className="space-y-4">
                  <p className="text-2xl text-gray-300">
                    ⏰ Late arrival recorded at{' '}
                    <span className={`bg-gradient-to-r ${textColors.secondary} bg-clip-text text-transparent font-bold`}>
                      GrowthJockey
                    </span>
                  </p>
                  <p className="text-xl text-gray-400">
                    Your late check-in has been logged for HR records
                  </p>
                  <div className="inline-flex items-center gap-3 bg-orange-500/20 backdrop-blur-xl border border-orange-500/30 rounded-full px-8 py-4 mt-6">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-300 font-medium">Please report to your supervisor</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                  Thank you,{' '}
                  <span className={`bg-gradient-to-r ${textColors.primary} bg-clip-text text-transparent`}>
                    {visitor.fullName}
                  </span>
                </h2>
                <div className="space-y-4">
                  <p className="text-2xl text-gray-300">
                    ✨ Visit completed at{' '}
                    <span className={`bg-gradient-to-r ${textColors.secondary} bg-clip-text text-transparent font-bold`}>
                      GrowthJockey
                    </span>
                  </p>
                  <p className="text-xl text-gray-400">
                    Your departure has been securely logged
                  </p>
                  <div className="inline-flex items-center gap-3 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-full px-8 py-4 mt-6">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-300 font-medium">Have an amazing day ahead!</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Timestamp Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Clock className={`w-6 h-6 ${isCheckIn ? 'text-cyan-400' : isLateCheckIn ? 'text-orange-400' : 'text-emerald-400'}`} />
              <h3 className="text-xl font-semibold text-white">
                {isCheckIn ? 'Check-in' : isLateCheckIn ? 'Late Check-in' : 'Check-out'} Timestamp
              </h3>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
            <div className="text-gray-400">
              {new Date().toLocaleDateString([], { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={onReturn}
              className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <Home className="w-5 h-5" />
              Return to Home
            </button>

            {/* Countdown */}
            <div className="flex items-center gap-3 text-gray-400">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${getCountdownColor()}`}>
                {countdown}
              </div>
              <span className="text-sm">Auto-return in {countdown} seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}