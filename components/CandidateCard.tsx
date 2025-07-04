
import React from 'react';
import { Candidate, PointStatus } from '../types';
import { ArrowRightIcon, CalendarDaysIcon, SparklesIcon } from './Icons';

interface CandidateCardProps {
  candidate: Candidate;
  buttonText: string;
  onViewDetails: () => void;
  onCardClick: (candidate: Candidate) => void;
  onScheduleClick: () => void;
  showScore?: boolean;
}

const ScoreBadge = ({ score }: { score: number }): React.ReactNode => {
  const getScoreColor = (): string => {
    if (score >= 90) return 'bg-green-400 text-green-900';
    if (score >= 75) return 'bg-green-300 text-green-800';
    if (score >= 70) return 'bg-yellow-300 text-yellow-800';
    if (score >= 50) return 'bg-red-300 text-red-800';
    return 'bg-red-400 text-red-900';
  };
  return (
    <div className={`px-2.5 py-1 rounded-md text-sm font-bold ${getScoreColor()}`}>
      {score}
    </div>
  );
};

const PercentileBadge = ({ score }: { score: string }): React.ReactNode => {
    return (
        <div className="px-2.5 py-1 rounded-md text-sm font-bold bg-indigo-100 text-indigo-700 flex items-center gap-1.5">
            <SparklesIcon className="w-4 h-4" />
            <span>{score}</span>
        </div>
    );
};

const formatScheduleDateTime = (dateTime: string): string => {
    try {
        const date = new Date(dateTime.replace(' -', ','));
        if (isNaN(date.getTime())) return dateTime;

        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        return `${month} ${day}, ${time}`;
    } catch (e) {
        console.error("Failed to format date:", e);
        return dateTime;
    }
};

const PointBullet = ({ status }: { status: PointStatus }) => {
    const colorClass = {
        positive: 'bg-green-400',
        neutral: 'bg-yellow-400',
        negative: 'bg-red-400',
    }[status];
    return <div className={`w-1.5 h-1.5 rounded-full ${colorClass} mt-1.5 flex-shrink-0`}></div>;
}

export const CandidateCard = ({ candidate, buttonText, onViewDetails, onCardClick, onScheduleClick, showScore = true }: CandidateCardProps): React.ReactNode => {
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Keep drag functionality for chat input, but remove stage info
    e.dataTransfer.setData('application/json', JSON.stringify({
        candidateName: candidate.name,
        candidateAvatarUrl: candidate.avatarUrl,
    }));
  };

  const getActionButtonStyles = () => {
    if (buttonText === 'Offer' || buttonText === 'Hired') {
        return 'bg-indigo-200 text-indigo-800 hover:bg-indigo-300';
    }
    return 'bg-slate-800 text-white hover:bg-slate-900';
  };
  
  return (
    <div 
        className="bg-white rounded-lg p-4 shadow-sm border border-slate-200/80 flex flex-col space-y-4 cursor-pointer"
        draggable="true"
        onDragStart={handleDragStart}
        onClick={() => onCardClick(candidate)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <img
            src={candidate.avatarUrl}
            alt={candidate.name}
            className="w-11 h-11 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-slate-800">{candidate.name}</p>
            {candidate.appliedDate && (
              <p className="text-xs text-slate-500">
                Applied: {new Date(candidate.appliedDate.replace(/-/g, '/')).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
        {candidate.stage === 'Omo-ed' && candidate.percentileScore ? (
            <PercentileBadge score={candidate.percentileScore} />
        ) : showScore && candidate.score > 0 ? (
            <ScoreBadge score={candidate.score} />
        ) : (
            <div className="px-2.5 py-1 rounded-md text-sm font-bold bg-slate-200 text-slate-600">
                --
            </div>
        )}
      </div>
      
      <div className="min-h-[64px] flex flex-col justify-center">
        {candidate.stage === 'Omo-ed' && candidate.summaryPoints ? (
          <div className="bg-indigo-50 border border-indigo-200/80 rounded-lg p-3 text-xs space-y-2">
            <ul className="space-y-1.5 pl-1">
                {candidate.summaryPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-600">
                    <PointBullet status={point.status} />
                    <span>{point.text}</span>
                </li>
                ))}
            </ul>
          </div>
        ) : candidate.upcomingSchedule ? (
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs">
              <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <p className="font-semibold text-slate-700">
                      {formatScheduleDateTime(candidate.upcomingSchedule.dateTime)}
                  </p>
              </div>
              <p className="text-slate-600 mt-1 pl-6">
                  Platform: {candidate.upcomingSchedule.platform}
              </p>
          </div>
        ) : null}
      </div>
      
      <div className="flex items-center justify-end gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          className="text-sm font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 group bg-slate-100 text-slate-700 hover:bg-slate-200">
          <span>View Details</span>
        </button>
        <button 
            onClick={(e) => {
                e.stopPropagation();
                if (buttonText === 'Schedule') {
                    onScheduleClick();
                }
            }}
            className={`text-sm font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 group ${getActionButtonStyles()}`}>
            <span>{buttonText}</span>
            <ArrowRightIcon className="w-4 h-4 ml-2 transform transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
