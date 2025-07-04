import React from 'react';
import { HiringStage, Candidate } from '../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  stages: HiringStage[];
  onSelectCandidate: (candidateId: string) => void;
  onCardClick: (candidate: Candidate) => void;
  onScheduleCandidate: (candidate: Candidate) => void;
}

export const KanbanBoard = ({ stages, onSelectCandidate, onCardClick, onScheduleCandidate }: KanbanBoardProps): React.ReactNode => {
  return (
    <div className="flex-1 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
            {stages.map((stage) => (
                <KanbanColumn 
                    key={stage.title} 
                    title={stage.title} 
                    candidates={stage.candidates} 
                    onSelectCandidate={onSelectCandidate}
                    onCardClick={onCardClick}
                    onScheduleCandidate={onScheduleCandidate}
                />
            ))}
        </div>
    </div>
  );
};
