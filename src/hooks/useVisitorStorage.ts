import { useState, useEffect } from 'react';

export interface LocalVisitor {
  id: string;
  fullName: string;
  personToMeet?: string;
  reasonForVisit?: string;
  otherReason?: string;
  phoneNumber?: string;
  photo?: string;
  checkInTime: string;
  checkOutTime: string | null;
}

export function useVisitorStorage() {
  const [visitors, setVisitors] = useState<LocalVisitor[]>(() => {
    try {
      const raw = localStorage.getItem('ottohello_visitors');
      return raw ? (JSON.parse(raw) as LocalVisitor[]) : [];
    } catch (error) {
      console.error('Error loading visitors from localStorage:', error);
      return [];
    }
  });

  // Save to localStorage whenever visitors change
  useEffect(() => {
    try {
      localStorage.setItem('ottohello_visitors', JSON.stringify(visitors));
    } catch (error) {
      console.error('Error saving visitors to localStorage:', error);
    }
  }, [visitors]);

  const addVisitor = ({ id, fullName }: { id: string; fullName: string }) => {
    const newVisitor: LocalVisitor = {
      id,
      fullName,
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
    };
    
    setVisitors(prev => {
      // Avoid duplicates
      const exists = prev.some(v => v.id === id);
      if (exists) return prev;
      
      return [...prev, newVisitor];
    });
  };

  const checkOutVisitor = (id: string) => {
    const checkOutTime = new Date().toISOString();
    
    setVisitors(prev => 
      prev.map(v => 
        v.id === id ? { ...v, checkOutTime } : v
      )
    );
    
    return visitors.find(v => v.id === id) ?? null;
  };

  // Clean up old visitors (older than 24 hours)
  const cleanupOldVisitors = () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    setVisitors(prev => 
      prev.filter(v => v.checkInTime > oneDayAgo)
    );
  };

  // Auto-cleanup on mount
  useEffect(() => {
    cleanupOldVisitors();
  }, []);

  return { 
    visitors, 
    addVisitor, 
    checkOutVisitor, 
    cleanupOldVisitors 
  };
}