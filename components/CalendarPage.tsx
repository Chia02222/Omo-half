
import React, { useState, useMemo } from 'react';
import { Job } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CalendarPageProps {
  jobs: Job[];
}

interface InterviewEvent {
  candidateName: string;
  candidateAvatar: string;
  jobTitle: string;
  time: string;
  id: number;
}

export const CalendarPage = ({ jobs }: CalendarPageProps) => {
  const [currentDate, setCurrentDate] = useState(new Date(2030, 9, 1)); // Default to Oct 2030

  const interviewsByDate = useMemo(() => {
    const events: { [key: string]: InterviewEvent[] } = {};
    jobs.forEach(job => {
      job.candidates.forEach(candidate => {
        if (candidate.upcomingSchedule?.dateTime) {
          try {
            // Standardize date string for better parsing
            const dateStr = candidate.upcomingSchedule.dateTime.replace(' -', ',');
            const eventDate = new Date(dateStr);
            if (!isNaN(eventDate.getTime())) {
              const dateKey = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
              if (!events[dateKey]) {
                events[dateKey] = [];
              }
              events[dateKey].push({
                candidateName: candidate.name,
                candidateAvatar: candidate.avatarUrl,
                jobTitle: job.title,
                time: eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
                id: candidate.id
              });
            }
          } catch (e) {
            console.error(`Could not parse date: ${candidate.upcomingSchedule.dateTime}`);
          }
        }
      });
    });
    return events;
  }, [jobs]);

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg hover:bg-slate-100">
            <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
          >
            Today
          </button>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-lg hover:bg-slate-100">
            <ChevronRightIcon className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>
    );
  };
  
  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 text-center text-sm font-semibold text-slate-600">
        {days.map(day => <div key={day} className="py-2">{day}</div>)}
      </div>
    );
  };

  const renderCells = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="border-r border-b border-slate-200"></div>);
    }
    
    const today = new Date();

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const dateKey = cellDate.toISOString().split('T')[0];
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

      cells.push(
        <div key={day} className="relative border-r border-b border-slate-200 p-2 min-h-[120px] flex flex-col gap-1">
          <p className={`font-semibold text-sm ${isToday ? 'bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'text-slate-700'}`}>
            {day}
          </p>
          <div className="flex flex-col gap-1.5 overflow-y-auto">
            {(interviewsByDate[dateKey] || []).map(event => (
              <div key={event.id} className="bg-indigo-50 p-1.5 rounded-md text-xs group cursor-pointer hover:bg-indigo-100">
                <p className="font-bold text-indigo-800 truncate">{event.candidateName}</p>
                <p className="text-indigo-600 truncate">{event.jobTitle}</p>
                <p className="text-indigo-500 font-semibold">{event.time}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Adjust grid styles
    const lastCellIndex = cells.length - 1;
    
    return (
        <div className="grid grid-cols-7 flex-1 border-t border-l border-slate-200">
          {cells.map((cell, index) => {
              const col = index % 7;
              let className = "";
              if (col === 6) className += " border-r-0"; // last column
              return <div key={index} className={className}>{cell}</div>;
          })}
        </div>
    );
  };

  return (
    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Calendar</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm h-full flex flex-col">
        {renderHeader()}
        <div className="mt-4 flex flex-col flex-1">
          {renderDays()}
          {renderCells()}
        </div>
      </div>
    </main>
  );
};
