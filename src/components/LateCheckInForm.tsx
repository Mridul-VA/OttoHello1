import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  User,
  MessageSquare,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

import { supabase } from '../supabaseClient';

interface LateCheckInFormProps {
  onSubmit: (data: { id: string; fullName: string }) => void;
  onBack: () => void;
}

export default function LateCheckInForm({ onSubmit, onBack }: LateCheckInFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    reasonForLate: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (field: string, value: string) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const { fullName, reasonForLate } = formData;
    if (!fullName || !reasonForLate) return;

    setSubmitting(true);

    const { data, error } = await supabase
      .from('late_checkins')
      .insert([
        {
          full_name: fullName,
          reason_for_late: reasonForLate,
          timestamp: new Date().toISOString(),
        },
      ])
      .select('id')
      .single();

    setSubmitting(false);

    if (error || !data || !data.id) {
      console.error(error);
      setSubmitError(
        error?.message ?? 'Could not save to Supabase. Please try again.'
      );
      return;
    }

    onSubmit({ id: data.id, fullName });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center gap-6 mb-12">
            <button
              onClick={onBack}
              className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 rounded-2xl transition-all duration-300 group"
            >
              <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Late Check-In
              </h2>
              <p className="text-gray-300 text-lg mt-2">
                For arrivals after 10:30 AM
              </p>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-orange-400 font-semibold text-lg">Late Arrival Notice</h3>
                <p className="text-orange-200 text-sm">
                  Please provide your details and reason for arriving after 10:30 AM
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Full Name */}
              <div>
                <label className="block text-white font-medium mb-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-600 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl
                             focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white
                             placeholder-gray-400 text-lg transition-all duration-300"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Reason for Late */}
              <div>
                <label className="block text-white font-medium mb-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-orange-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  Reason for Late Arrival *
                </label>
                <textarea
                  value={formData.reasonForLate}
                  onChange={(e) => handleInputChange('reasonForLate', e.target.value)}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl
                             focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white
                             placeholder-gray-400 text-lg transition-all duration-300 min-h-[120px] resize-none"
                  placeholder="Please explain why you're arriving after 10:30 AM..."
                  required
                />
              </div>

              {/* Current Time Display */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-center gap-3 text-gray-300">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <span className="text-sm">Current Time: </span>
                  <span className="font-semibold text-white">
                    {new Date().toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600
                           hover:from-orange-400 hover:to-red-500 text-white font-bold py-6 px-8
                           rounded-xl text-xl transition-all duration-300 flex items-center
                           justify-center gap-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="animate-spin w-6 h-6" />
                ) : (
                  <Clock className="w-6 h-6" />
                )}
                {submitting ? 'Recording...' : 'Record Late Check-In'}
              </button>

              {submitError && (
                <p className="text-center text-red-400 text-sm mt-2">
                  {submitError}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}