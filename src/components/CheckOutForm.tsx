import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  User,
  Clock,
  MapPin,
  Users,
  Activity,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { LocalVisitor } from '../hooks/useVisitorStorage';
import { supabase } from '../supabaseClient';

interface CheckOutFormProps {
  visitors: LocalVisitor[];
  onCheckOut: (visitorId: string) => void;
  onBack: () => void;
}

export default function CheckOutForm({
  visitors,
  onCheckOut,
  onBack,
}: CheckOutFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [foundVisitor, setFoundVisitor] = useState<LocalVisitor | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const formatPurpose = (v: LocalVisitor) => {
    if (v.reasonForVisit === 'other') return v.otherReason ?? 'Other';
    if (v.reasonForVisit) {
      return v.reasonForVisit
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }
    return '—';
  };

  const activeVisitors = visitors.filter((v) => !v.checkOutTime);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    setCheckoutError('');
    setCheckoutSuccess(false);

    const searchLower = searchTerm.toLowerCase().trim();
    const vis = activeVisitors.find(
      (v) =>
        v.fullName.toLowerCase().includes(searchLower) ||
        (v.phoneNumber && v.phoneNumber.includes(searchTerm.trim())) ||
        (v.personToMeet && v.personToMeet.toLowerCase().includes(searchLower))
    );

    if (vis) {
      setFoundVisitor(vis);
      setNotFound(false);
    } else {
      setFoundVisitor(null);
      setNotFound(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCheckOutClick = async () => {
    if (!foundVisitor || checkingOut) return;
    
    setCheckingOut(true);
    setCheckoutError('');
    setCheckoutSuccess(false);
    
    try {
      const checkoutTime = new Date().toISOString();
      
      // Update Supabase with checkout time
      const { error } = await supabase
        .from('visitors')
        .update({ 
          checked_out_at: checkoutTime 
        })
        .eq('id', foundVisitor.id);

      if (error) {
        console.error('Supabase checkout error:', error);
        setCheckoutError('Failed to update checkout time in database. Please try again.');
        setCheckingOut(false);
        return;
      }

      console.log(`[CHECKOUT] Successfully updated checkout time for visitor ${foundVisitor.id}`);
      
      // Update local storage
      onCheckOut(foundVisitor.id);
      
      setCheckoutSuccess(true);
      
      // Auto-redirect after success
      setTimeout(() => {
        setFoundVisitor(null);
        setSearchTerm('');
        setCheckoutSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError('An unexpected error occurred. Please try again.');
    }
    
    setCheckingOut(false);
  };

  const getVisitDuration = (iso: string) => {
    const ms = Date.now() - new Date(iso).getTime();
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const resetSearch = () => {
    setSearchTerm('');
    setFoundVisitor(null);
    setNotFound(false);
    setCheckoutError('');
    setCheckoutSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-5xl w-full">
          {/* Header */}
          <div className="flex items-center gap-6 mb-12">
            <button
              onClick={onBack}
              className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 rounded-2xl transition-all duration-300 group"
            >
              <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                Check-Out
              </h2>
              <p className="text-gray-300 text-lg mt-2">Complete your visit</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Stats & Search */}
            <div className="space-y-8">
              {/* Dashboard Stats */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Today's Activity</h3>
                    <p className="text-gray-400 text-sm">Current visitor status</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-emerald-400">
                      {activeVisitors.length}
                    </p>
                    <p className="text-gray-400 text-sm">Active Visitors</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-teal-400">
                      {visitors.length}
                    </p>
                    <p className="text-gray-400 text-sm">Total Today</p>
                  </div>
                </div>
              </div>

              {/* Search Panel */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-xl font-semibold text-white">Find Visitor</h3>
                </div>
                <div className="space-y-4">
                  <input
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (!e.target.value.trim()) {
                        resetSearch();
                      }
                    }}
                    onKeyDown={handleKeyPress}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400 text-lg transition-all"
                    placeholder="Enter name, phone, or person they're meeting"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSearch}
                      disabled={!searchTerm.trim()}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3"
                    >
                      <Search className="w-5 h-5" />
                      Search Visitor
                    </button>
                    {(foundVisitor || notFound) && (
                      <button
                        onClick={resetSearch}
                        className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white px-6 py-4 rounded-xl font-semibold transition-all"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-8">
              {/* Success Message */}
              {checkoutSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Check-out Successful!
                  </h3>
                  <p className="text-green-300">
                    Visitor has been successfully checked out.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {checkoutError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-400">{checkoutError}</p>
                  </div>
                </div>
              )}

              {/* Visitor Found Card */}
              {foundVisitor && !checkoutSuccess && (
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-8">
                  <div className="flex justify-between mb-6">
                    <div className="flex-1">
                      <p className="text-emerald-400 text-sm font-medium mb-2">
                        VISITOR FOUND
                      </p>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {foundVisitor.fullName}
                      </h3>

                      <div className="space-y-3 text-gray-300">
                        {foundVisitor.personToMeet && (
                          <p className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-emerald-400" />
                            Meeting: {foundVisitor.personToMeet}
                          </p>
                        )}

                        {foundVisitor.reasonForVisit && (
                          <p className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-emerald-400" />
                            Purpose: {formatPurpose(foundVisitor)}
                          </p>
                        )}

                        <p className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-emerald-400" />
                          Duration: {getVisitDuration(foundVisitor.checkInTime)}
                        </p>

                        {foundVisitor.phoneNumber && (
                          <p className="flex items-center gap-3">
                            <User className="w-4 h-4 text-emerald-400" />
                            Phone: {foundVisitor.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {foundVisitor.photo && (
                      <img
                        src={foundVisitor.photo}
                        alt="Visitor"
                        className="w-20 h-16 rounded-xl object-cover border-2 border-emerald-400/50"
                      />
                    )}
                  </div>

                  <button
                    onClick={handleCheckOutClick}
                    disabled={checkingOut}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 rounded-xl text-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {checkingOut ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Check-out...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Complete Check-Out
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* No Active Visitors */}
              {activeVisitors.length === 0 && !foundVisitor && !notFound && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Active Visitors
                  </h3>
                  <p className="text-orange-300">
                    There are currently no visitors checked in to the building.
                  </p>
                </div>
              )}

              {/* Active Visitor List */}
              {activeVisitors.length > 0 && !foundVisitor && !notFound && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                    <Users className="w-6 h-6 text-emerald-400" />
                    Active Visitors ({activeVisitors.length})
                  </h3>

                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {activeVisitors.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition cursor-pointer"
                        onClick={() => {
                          setSearchTerm(v.fullName);
                          setFoundVisitor(v);
                          setNotFound(false);
                          setCheckoutError('');
                        }}
                      >
                        <div className="flex items-center gap-4">
                          {v.photo ? (
                            <img
                              src={v.photo}
                              alt="Visitor"
                              className="w-12 h-9 rounded-lg object-cover border border-white/20"
                            />
                          ) : (
                            <div className="w-12 h-9 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-300" />
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-white">{v.fullName}</p>
                            {v.personToMeet && (
                              <p className="text-sm text-gray-400">
                                Meeting: {v.personToMeet}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-emerald-400 font-medium">
                            {getVisitDuration(v.checkInTime)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(v.checkInTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Not Found */}
              {notFound && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Visitor Not Found
                  </h3>
                  <p className="text-red-300 mb-4">
                    No active visitor matches "{searchTerm}". Please check the spelling or try a different search term.
                  </p>
                  <button
                    onClick={resetSearch}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}