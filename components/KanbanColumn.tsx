import React, { useState, useMemo } from 'react';
import { Candidate } from '../types';
import { CandidateCard } from './CandidateCard';

interface KanbanColumnProps {
  title: string;
  candidates: Candidate[];
  onSelectCandidate: (candidateId: string) => void;
  onCardClick: (candidate: Candidate) => void;
  onScheduleCandidate: (candidate: Candidate) => void;
}

const getButtonTextForStage = (stage: Candidate['stage']): string => {
    switch (stage) {
        case 'OMOED': return 'Schedule';
        case 'SCREENING': return 'Schedule';
        case 'TECHNICAL_TEST': return 'Schedule';
        case 'FINAL_INTERVIEW': return 'Offer';
        case 'HIRED': return 'Onboard';
        case 'REJECTED': return 'Archived';
        default: return 'Next Step';
    }
}

const InProgressIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
    </svg>
);

const CompleteIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
    </svg>
);

const getEvaluatorsForStage = (stage: string, candidate: Candidate): { name: string; role: string; avatarUrl?: string }[] => {
    switch (stage) {
        case 'OMOED':
        case 'SCREENING':
            return [{ name: 'Lee Wei Song', role: 'HR' }];
        case 'TECHNICAL_TEST':
            return [
                { name: 'Andrew Sebastian', role: 'HR' },
                { name: 'John Doe (CTO)', role: 'Technical Evaluator' },
            ];
        case 'FINAL_INTERVIEW':
            const interviewer = candidate.upcomingSchedule?.participants[0];
            const baseEvaluators: { name: string; role: string; avatarUrl?: string }[] = [{ name: 'Lee Wei Song', role: 'HR' }];
            if (interviewer && interviewer.name !== 'Lee Wei Song') {
                baseEvaluators.push({ name: interviewer.name, role: interviewer.role, avatarUrl: interviewer.avatarUrl });
            }
            return baseEvaluators;
        default:
            return [];
    }
};

const isStageCompletedForCandidate = (candidate: Candidate, stage: string): boolean => {
    const evaluators = getEvaluatorsForStage(stage, candidate);
    if (evaluators.length === 0) {
        return false;
    }
    const marksForStage = candidate.stageMarks?.[stage];
    if (!marksForStage) {
        return false;
    }
    return evaluators.every(evaluator => marksForStage[evaluator.name]?.mark !== undefined);
};


export const KanbanColumn = ({ title, candidates, onSelectCandidate, onCardClick, onScheduleCandidate }: KanbanColumnProps): React.ReactNode => {
  const [activeFilter, setActiveFilter] = useState<'inProgress' | 'completed'>('inProgress');
  
  const showFilters = title !== 'OMOED';

  const filteredCandidates = useMemo(() => {
    if (!showFilters) {
      return candidates;
    }
    if (activeFilter === 'inProgress') {
      return candidates.filter(c => !isStageCompletedForCandidate(c, title));
    }
    // 'completed'
    return candidates.filter(c => isStageCompletedForCandidate(c, title));
  }, [candidates, activeFilter, title, showFilters]);

  return (
    <div className="flex flex-col bg-slate-100 rounded-xl p-1">
      <div className="p-3 flex justify-between items-center">
        <h3 className="font-bold text-slate-600">{title} <span className="text-xs">({candidates.length})</span></h3>
        
        {showFilters && (
            <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-slate-200">
                <button
                    onClick={() => setActiveFilter('inProgress')}
                    aria-label="Filter by In Progress"
                    className={`p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${
                        activeFilter === 'inProgress' 
                        ? 'bg-slate-800 text-white' 
                        : 'text-slate-800 hover:bg-slate-100'
                    }`}
                >
                    <InProgressIcon className={`w-5 h-5 ${activeFilter === 'inProgress' ? 'animate-spin' : ''}`} />
                </button>
                <button
                    onClick={() => setActiveFilter('completed')}
                    aria-label="Filter by Completed"
                    className={`p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${
                        activeFilter === 'completed'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-800 hover:bg-slate-100'
                    }`}
                >
                    <CompleteIcon className="w-5 h-5" />
                </button>
            </div>
        )}
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto px-2 pb-2">
        {filteredCandidates.map((candidate) => (
          <CandidateCard 
            key={candidate.id} 
            candidate={candidate} 
            buttonText={getButtonTextForStage(candidate.stage)}
            onViewDetails={() => onSelectCandidate(candidate.id as string)}
            onCardClick={onCardClick}
            onScheduleClick={() => onScheduleCandidate(candidate)}
            showScore={isStageCompletedForCandidate(candidate, title)}
          />
        ))}
      </div>
    </div>
  );
};
