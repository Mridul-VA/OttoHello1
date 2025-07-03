/*  src/App.tsx  */
import  { useState } from 'react';

import WelcomeScreen       from './components/WelcomeScreen';
import CheckInForm         from './components/CheckInForm';
import CheckOutForm        from './components/CheckOutForm';
import LateCheckInForm     from './components/LateCheckInForm';
import ConfirmationScreen  from './components/ConfirmationScreen';

import { useVisitorStorage } from './hooks/useVisitorStorage';

/* ─── routes / screens ───────────────────────────────────────── */
type Screen = 'welcome' | 'checkin' | 'checkout' | 'late-checkin' | 'confirmation';

interface ConfirmationData {
  type: 'checkin' | 'checkout' | 'late-checkin';
  visitor: { id: string; fullName: string };
}

/* ────────────────────────────────────────────────────────────── */
export default function App() {
  const [screen, setScreen]         = useState<Screen>('welcome');
  const [confirm, setConfirm]       = useState<ConfirmationData | null>(null);

  /* local-storage helper – lets the Check-Out page list visitors */
  const { visitors, addVisitor, checkOutVisitor } = useVisitorStorage();

  /* ─── called by CheckInForm after Supabase insert succeeds ─── */
  const handleCheckInSuccess = (
    newVisitor: { id: string; fullName: string }
  ) => {
    /* keep a lightweight local record for the Check-Out list */
    addVisitor(newVisitor);

    setConfirm({ type: 'checkin', visitor: newVisitor });
    setScreen('confirmation');
  };

  /* ─── called by LateCheckInForm after Supabase insert succeeds ─── */
  const handleLateCheckInSuccess = (
    newVisitor: { id: string; fullName: string }
  ) => {
    setConfirm({ type: 'late-checkin', visitor: newVisitor });
    setScreen('confirmation');
  };

  /* ─── visitor check-out ────────────────────────────────────── */
  const handleCheckOut = (visitorId: string) => {
    const v = checkOutVisitor(visitorId);
    if (v) {
      setConfirm({ type: 'checkout', visitor: { id: v.id, fullName: v.fullName } });
      setScreen('confirmation');
    }
  };

  const goHome = () => {
    setConfirm(null);
    setScreen('welcome');
  };

  /* ─── simple router ────────────────────────────────────────── */
  switch (screen) {
    case 'checkin':
      return (
        <CheckInForm
          onSubmit={handleCheckInSuccess}
          onBack={() => setScreen('welcome')}
        />
      );

    case 'checkout':
      return (
        <CheckOutForm
          visitors={visitors}
          onCheckOut={handleCheckOut}
          onBack={() => setScreen('welcome')}
        />
      );

    case 'late-checkin':
      return (
        <LateCheckInForm
          onSubmit={handleLateCheckInSuccess}
          onBack={() => setScreen('welcome')}
        />
      );

    case 'confirmation':
      return confirm ? (
        <ConfirmationScreen
          type={confirm.type}
          visitor={confirm.visitor}
          onReturn={goHome}
        />
      ) : null;

    default: /* 'welcome' */
      return (
        <WelcomeScreen
          onCheckIn={() => setScreen('checkin')}
          onCheckOut={() => setScreen('checkout')}
          onLateCheckIn={() => setScreen('late-checkin')}
        />
      );
  }
}