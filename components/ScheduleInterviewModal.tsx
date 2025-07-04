import React, { useState } from 'react';
import { XMarkIcon } from './Icons';

interface ScheduleInterviewModalProps {
  onClose: () => void;
  onConfirm: (details: { date: string; time: string; platform: string }) => void;
  candidateName: string;
}

export const ScheduleInterviewModal = ({ onClose, onConfirm, candidateName }: ScheduleInterviewModalProps): React.ReactNode => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [platform, setPlatform] = useState('Google Meet');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      alert('Please select both a date and a time.');
      return;
    }
    onConfirm({ date, time, platform });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Schedule Interview</h2>
            <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
              <XMarkIcon className="w-6 h-6"/>
            </button>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-slate-600">Set the interview time for <span className="font-semibold text-slate-800">{candidateName}</span>.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="interview-date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  id="interview-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="interview-time" className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                <input
                  type="time"
                  id="interview-time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>
            <div>
              <label htmlFor="interview-platform" className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
              <input
                type="text"
                id="interview-platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                required
                placeholder="e.g., Google Meet, Zoom"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t border-slate-200">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition"
            >
              Confirm Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
