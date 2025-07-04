
import React, { useState } from 'react';
import { XCircleIcon } from './Icons';

interface ChatInputProps {
  query: string;
  setQuery: (query: string) => void;
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

interface TaggedCandidate {
    name: string;
    avatarUrl: string;
}

export const ChatInput = ({ query, setQuery, onSubmit, isLoading }: ChatInputProps): React.ReactNode => {
    const [taggedCandidates, setTaggedCandidates] = useState<TaggedCandidate[]>([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const handleRemoveCandidate = (name: string) => {
        setTaggedCandidates(prev => prev.filter(c => c.name !== name));
    };

    const handleInternalSubmit = () => {
        const candidateNames = taggedCandidates.map(c => c.name);
        let finalQuery = query;

        if (candidateNames.length > 0) {
            const namesString = candidateNames.join(' and ');
            if (query) {
                finalQuery = `Comparing ${namesString}: ${query}`;
            } else {
                if (candidateNames.length > 1) {
                    finalQuery = `Compare ${namesString}.`;
                } else {
                    finalQuery = `Summarize the profile for ${namesString}.`;
                }
            }
        }

        if (finalQuery.trim() && !isLoading) {
            onSubmit(finalQuery);
            setTaggedCandidates([]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter' && !isLoading) {
            e.preventDefault();
            handleInternalSubmit();
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(false);
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data.candidateName && data.candidateAvatarUrl) {
                const newCandidate = { name: data.candidateName, avatarUrl: data.candidateAvatarUrl };
                setTaggedCandidates(prev => {
                    if (!prev.find(c => c.name === newCandidate.name)) {
                        return [...prev, newCandidate];
                    }
                    return prev;
                });
            }
        } catch (error) {
            // This might not be a candidate, so we can ignore the error
        }
    };

    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative transition-all duration-200 rounded-xl ${isDraggingOver ? 'ring-2 ring-indigo-500 ring-offset-2 bg-indigo-50' : ''}`}
        >
            <div className="w-full pl-3 pr-32 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:outline-none transition flex flex-wrap items-center gap-2 min-h-[58px]">
                {taggedCandidates.map(candidate => (
                    <div key={candidate.name} className="flex items-center gap-1.5 bg-slate-100 rounded-full py-1 pl-1 pr-2">
                        <img src={candidate.avatarUrl} alt={candidate.name} className="w-6 h-6 rounded-full" />
                        <span className="text-sm font-medium text-slate-700">{candidate.name}</span>
                        <button onClick={() => handleRemoveCandidate(candidate.name)} className="text-slate-400 hover:text-slate-600">
                           <XCircleIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={taggedCandidates.length > 0 ? "Ask a question about the selected candidate(s)..." : "Drag a candidate here or ask a general question..."}
                    disabled={isLoading}
                    className="flex-1 min-w-[200px] bg-transparent focus:outline-none disabled:opacity-70 h-9"
                />
            </div>
             <button
                onClick={handleInternalSubmit}
                disabled={isLoading || (!query.trim() && taggedCandidates.length === 0)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-800 text-white font-bold px-6 py-2 rounded-lg hover:bg-slate-900 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    'Omo!'
                )}
            </button>
        </div>
    );
};
