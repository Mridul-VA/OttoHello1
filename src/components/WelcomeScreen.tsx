import { UserCheck, UserX, Zap, Clock } from 'lucide-react';

interface WelcomeScreenProps {
  onCheckIn: () => void;
  onCheckOut: () => void;
  onLateCheckIn: () => void;
}

export default function WelcomeScreen({ onCheckIn, onCheckOut, onLateCheckIn }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-5xl w-full">
          {/* Header Section */}
          <div className="text-center mb-16">
            {/* Logo and Branding */}
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/25">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl blur opacity-30 animate-pulse"></div>
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  OttoHello
                </h1>
                <p className="text-gray-400 text-lg">Visitor Management System</p>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="mb-12 text-center">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                Welcome to
              </h2>
              <div className="relative">
                <div className="text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r
                   from-emerald-400 via-cyan-500 to-blue-600
                   bg-clip-text text-transparent mb-12 px-4 leading-[1.1] 
                   min-h-[80px] md:min-h-[120px] lg:min-h-[140px] 
                   flex items-center justify-center">
                  GrowthJockey
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center items-center max-w-4xl mx-auto">
            <button
              onClick={onCheckIn}
              className="group relative w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-8 px-8 rounded-2xl shadow-2xl shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <UserCheck className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">Check-In</div>
                  <div className="text-cyan-100 text-sm">Start your visit</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={onCheckOut}
              className="group relative w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-8 px-8 rounded-2xl shadow-2xl shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <UserX className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">Check-Out</div>
                  <div className="text-emerald-100 text-sm">Complete your visit</div>
                </div>
              </div>
            </button>

            <button
              onClick={onLateCheckIn}
              className="group relative w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold py-8 px-8 rounded-2xl shadow-2xl shadow-orange-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <Clock className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">Late Check-In</div>
                  <div className="text-orange-100 text-sm">After 10:30 AM</div>
                </div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-2 text-gray-400 text-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              System Online • Slack Connected • Database Ready
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}