/* ──────────────────────────────────────────────────────────────
   Visitor Check-In Form – full UI + Supabase insert
   src/components/CheckInForm.tsx
   ──────────────────────────────────────────────────────────── */

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  CameraOff,
  Clock,
  Loader2,
  MessageSquare,
  Scan,
  Shield,
  User,
  Users,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

import { supabase } from '../supabaseClient';
import { ReasonForVisit, REASON_OPTIONS } from '../types/visitor';
import { sendSlackNotification, fetchSlackUsers, findSlackUserByName, isSlackConfigured } from '../utils/slackUtils';

interface CheckInFormProps {
  onSubmit: (data: { id: string; fullName: string }) => void;
  onBack: () => void;
}

export default function CheckInForm({ onSubmit, onBack }: CheckInFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    reasonForVisit: '' as ReasonForVisit,
    otherReason: '',
    personToMeet: '',
    phoneNumber: '',
  });

  const [photo, setPhoto] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [slackUsers, setSlackUsers] = useState<Array<{id: string, name: string, real_name: string}>>([]);
  const [filteredUsers, setFilteredUsers] = useState<Array<{id: string, name: string, real_name: string}>>([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [slackNotificationStatus, setSlackNotificationStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // Joy-ride (in-app tour)
  const [runTour, setRunTour] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('ottohello_tour_done')) setRunTour(true);
  }, []);

  const tourSteps: Step[] = [
    {
      target: '.capture-photo-btn',
      content: 'Step 1 → Take the visitor\'s photo here first. This is required for security.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '.full-name-input',
      content: 'Step 2 → Enter the visitor\'s full name.',
      placement: 'top',
    },
    {
      target: '.purpose-select',
      content: 'Step 3 → Select the purpose of their visit.',
      placement: 'top',
    },
    {
      target: '.person-to-meet-input',
      content: 'Step 4 → Type who the visitor is meeting. We\'ll notify them on Slack!',
      placement: 'top',
    },
    {
      target: '.checkin-submit',
      content: 'Step 5 → Complete the check-in process.',
      placement: 'left',
    },
  ];

  const handleJoyride = (data: CallBackProps) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      localStorage.setItem('ottohello_tour_done', 'true');
      setRunTour(false);
    }
  };

  // Slack integration
  useEffect(() => {
    const loadSlackUsers = async () => {
      try {
        const users = await fetchSlackUsers();
        setSlackUsers(users);
      } catch (error) {
        console.error('Failed to load Slack users:', error);
      }
    };
    loadSlackUsers();
  }, []);

  const handlePersonToMeetChange = (value: string) => {
    setFormData(p => ({ ...p, personToMeet: value }));
    
    if (value.length > 1) {
      const filtered = slackUsers.filter(user => 
        user.real_name.toLowerCase().includes(value.toLowerCase()) ||
        user.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowUserSuggestions(filtered.length > 0);
    } else {
      setShowUserSuggestions(false);
    }
  };

  const selectSlackUser = (user: {id: string, name: string, real_name: string}) => {
    setFormData(p => ({ ...p, personToMeet: user.real_name }));
    setShowUserSuggestions(false);
  };

  // Camera helpers
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = () => {
    setCameraError('');
    setShowCamera(true);
  };

  useEffect(() => {
    const setupCamera = async () => {
      if (!showCamera || !videoRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false,
        });
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current?.play();
      } catch (err) {
        setCameraError('Camera access denied or not available');
      }
    };

    setupCamera();
  }, [showCamera]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    setPhoto(canvas.toDataURL('image/jpeg', 0.8));
    stopCamera();
  };

  const handleInputChange = (field: string, value: string) =>
    setFormData((p) => ({ ...p, [field]: value }));

  // Submit to Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSlackNotificationStatus('idle');

    const { fullName, reasonForVisit, otherReason, personToMeet, phoneNumber } = formData;
    
    // Validation
    if (!fullName.trim()) {
      setSubmitError('Please enter the visitor\'s full name');
      return;
    }
    if (!reasonForVisit) {
      setSubmitError('Please select a reason for visit');
      return;
    }
    if (reasonForVisit === 'other' && !otherReason.trim()) {
      setSubmitError('Please specify the reason for visit');
      return;
    }
    if (!personToMeet.trim()) {
      setSubmitError('Please enter who the visitor is meeting');
      return;
    }
    if (!photo) {
      setSubmitError('Please take a photo before submitting');
      return;
    }

    setSubmitting(true);

    try {
      // Insert visitor record
      const { data, error } = await supabase
        .from('visitors')
        .insert([
          {
            full_name: fullName.trim(),
            reason_for_visit: reasonForVisit === 'other' ? otherReason.trim() : reasonForVisit,
            person_to_meet: personToMeet.trim(),
            photo_base64: photo,
            phone_number: phoneNumber.trim() || null,
            checked_in_at: new Date().toISOString(),
          },
        ])
        .select('id')
        .single();

      if (error || !data?.id) {
        throw new Error(error?.message || 'Failed to save visitor data');
      }

      // Send Slack notification
      if (isSlackConfigured()) {
        setSlackNotificationStatus('sending');
        try {
          const slackUser = findSlackUserByName(slackUsers, personToMeet.trim());
          
          if (slackUser) {
            const success = await sendSlackNotification(
              slackUser.id, 
              fullName.trim(), 
              reasonForVisit === 'other' ? otherReason.trim() : reasonForVisit
            );
            setSlackNotificationStatus(success ? 'success' : 'error');
          } else {
            console.log('[SLACK] User not found in Slack directory:', personToMeet);
            setSlackNotificationStatus('error');
          }
        } catch (slackError) {
          console.error('Slack notification failed:', slackError);
          setSlackNotificationStatus('error');
        }
      }

      setSubmitting(false);
      onSubmit({ id: data.id, fullName: fullName.trim() });

    } catch (error) {
      console.error('Check-in error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to complete check-in. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="flex items-center gap-6 mb-12">
            <button
              onClick={onBack}
              className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 rounded-2xl transition-all duration-300 group"
            >
              <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Visitor Registration
              </h2>
              <p className="text-gray-300 text-lg mt-2">
                Please complete your check-in
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Camera section */}
            <div className="space-y-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <Scan className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-xl font-semibold text-white">
                      Photo Capture
                    </h3>
                  </div>

                  {showCamera ? (
                    <div className="space-y-6">
                      <div className="relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full max-w-sm mx-auto rounded-2xl border-4 border-cyan-400/50 shadow-2xl shadow-cyan-500/25"
                        />
                        <div className="absolute inset-0 rounded-2xl border-4 border-cyan-400 animate-pulse pointer-events-none" />
                      </div>
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={capturePhoto}
                          className="capture-photo-btn bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25"
                        >
                          Capture Photo
                        </button>
                        <button
                          onClick={stopCamera}
                          className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : photo ? (
                    <div className="space-y-6">
                      <div className="relative">
                        <img
                          src={photo}
                          alt="Captured"
                          className="w-48 h-36 mx-auto rounded-2xl border-4 border-green-400/50 object-cover shadow-2xl shadow-green-500/25"
                        />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <button
                        onClick={() => setPhoto('')}
                        className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                      >
                        Retake Photo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-48 h-36 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-dashed border-gray-600 flex items-center justify-center">
                        <Camera className="w-12 h-12 text-gray-500" />
                      </div>
                      <button
                        onClick={startCamera}
                        className="capture-photo-btn bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25 inline-flex items-center gap-3"
                      >
                        <Camera className="w-5 h-5" />
                        Take Photo
                      </button>
                      {cameraError && (
                        <p className="text-red-400 text-sm flex items-center justify-center gap-2">
                          <CameraOff className="w-4 h-4" />
                          {cameraError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Slack status indicator */}
              {slackNotificationStatus !== 'idle' && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    {slackNotificationStatus === 'sending' && (
                      <>
                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                        <span className="text-blue-400">Sending Slack notification...</span>
                      </>
                    )}
                    {slackNotificationStatus === 'success' && (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400">Slack notification sent!</span>
                      </>
                    )}
                    {slackNotificationStatus === 'error' && (
                      <>
                        <AlertCircle className="w-5 h-5 text-orange-400" />
                        <span className="text-orange-400">Slack notification failed (check-in still successful)</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Form section */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Full Name */}
                <div>
                  <label className="block text-white font-medium mb-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="full-name-input w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl
                               focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white
                               placeholder-gray-400 text-lg transition-all duration-300"
                    placeholder="Enter visitor's full name"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-white font-medium mb-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl
                               focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white
                               placeholder-gray-400 text-lg transition-all duration-300"
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-white font-medium mb-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    Purpose of Visit *
                  </label>
                  <select
                    value={formData.reasonForVisit}
                    onChange={(e) => handleInputChange('reasonForVisit', e.target.value as ReasonForVisit)}
                    className="purpose-select w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl
                               focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white
                               text-lg transition-all duration-300"
                    required
                  >
                    <option value="" className="bg-gray-800">
                      Select purpose of visit
                    </option>
                    {REASON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-gray-800">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Other reason */}
                {formData.reasonForVisit === 'other' && (
                  <div>
                    <label className="block text-white font-medium mb-3">
                      Please specify *
                    </label>
                    <input
                      type="text"
                      value={formData.otherReason}
                      onChange={(e) => handleInputChange('otherReason', e.target.value)}
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl
                                 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white
                                 placeholder-gray-400 text-lg transition-all duration-300"
                      placeholder="Describe the reason"
                      required
                    />
                  </div>
                )}

                {/* Person to meet */}
                <div className="relative">
                  <label className="block text-white font-medium mb-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    Person to Meet *
                  </label>
                  <input
                    type="text"
                    value={formData.personToMeet}
                    onChange={(e) => handlePersonToMeetChange(e.target.value)}
                    className="person-to-meet-input w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl
                               focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white
                               placeholder-gray-400 text-lg transition-all duration-300"
                    placeholder="Start typing name..."
                    required
                  />
                  
                  {/* Slack user suggestions */}
                  {showUserSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl max-h-48 overflow-y-auto z-50">
                      {filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => selectSlackUser(user)}
                          className="w-full text-left px-4 py-3 hover:bg-white/10 text-white transition-colors border-b border-white/10 last:border-b-0"
                        >
                          <div className="font-medium">{user.real_name}</div>
                          <div className="text-sm text-gray-400">@{user.name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="checkin-submit w-full bg-gradient-to-r from-cyan-500 to-blue-600
                             hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-6 px-8
                             rounded-xl text-xl transition-all duration-300 flex items-center
                             justify-center gap-4 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin w-6 h-6" />
                  ) : (
                    <Clock className="w-6 h-6" />
                  )}
                  {submitting ? 'Processing...' : 'Complete Check-In'}
                </button>

                {submitError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {submitError}
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Joyride tour */}
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showSkipButton
        callback={handleJoyride}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: '#1E40CA',
            arrowColor: '#1E40CA',
          },
          tooltip: { borderRadius: 12, padding: 16 },
        }}
        floaterProps={{ styles: { arrow: { length: 14, spread: 30 } } }}
      />
    </div>
  );
}