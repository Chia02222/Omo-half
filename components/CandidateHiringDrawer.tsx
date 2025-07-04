
import React, { useState, useEffect } from 'react';
import { Candidate, Job, PrivateNote, StageEvaluation } from '../types';
import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon, MailIcon, PhoneIcon, DotsVerticalIcon, XCircleIcon, EditIcon, SparklesIcon } from './Icons';

interface CandidateHiringDrawerProps {
    candidate: Candidate;
    job: Job;
    onClose: () => void;
    onUpdateCandidate: (candidate: Candidate) => void;
    onRejectCandidate: (candidateId: number) => void;
    onSchedule: (candidate: Candidate) => void;
}

const Tab = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void; }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-semibold transition-colors duration-200 focus:outline-none ${
            active
            ? 'border-b-2 border-slate-800 text-slate-800'
            : 'text-slate-500 hover:text-slate-700'
        }`}
    >
        {label}
    </button>
);

const MarkBadge = ({ score }: { score: number }) => {
    const getScoreColor = () => {
        if (score >= 90) return 'bg-green-100 text-green-800';
        if (score >= 75) return 'bg-blue-100 text-blue-800';
        if (score >= 60) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };
    return (
        <span className={`px-2.5 py-1 text-sm font-bold rounded-md ${getScoreColor()}`}>
            {score}/100
        </span>
    );
};

const DetailItem = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
    <div className="text-sm flex justify-between items-center mt-2">
        <p className="text-slate-500">{label}</p>
        <div className="font-medium text-slate-800 text-right">{value}</div>
    </div>
);


const StageStep = ({ stage, index, isCompleted, isActive, isLast, expanded, onToggle, details }: {
    stage: string;
    index: number;
    isCompleted: boolean;
    isActive: boolean;
    isLast: boolean;
    expanded: boolean;
    onToggle: () => void;
    details: React.ReactNode;
}) => (
    <div className="flex gap-x-3">
        <div className="relative last:after:hidden after:absolute after:top-8 after:bottom-0 after:start-4 after:w-px after:bg-slate-200">
            <div className="relative z-10 w-8 h-8 flex items-center justify-center">
                {isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        <span className="font-bold text-sm">{index + 1}</span>
                    </div>
                )}
            </div>
        </div>
        
        <div className="grow pt-1 pb-8">
            <div className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${expanded ? 'bg-white shadow-sm hover:bg-slate-50' : 'hover:bg-slate-100'}`} onClick={onToggle}>
                <h3 className="font-semibold text-slate-800">{stage}</h3>
                <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </div>
            {expanded && (
                <div className="mt-2 pl-3">
                    {details}
                </div>
            )}
        </div>
    </div>
);

const allHiringStages = ['Omo-ed', 'Screening', 'Technical Interview', 'Final Interview'];
const stageMap: Record<Candidate['stage'], string> = {
    'Omo-ed': 'Omo-ed',
    'Screening': 'Screening',
    'Technical Interview': 'Technical Interview',
    'Final Interview': 'Final Interview',
    'Hired': 'Final Interview',
    'Rejected': 'Final Interview',
};


export const CandidateHiringDrawer = ({ candidate, job, onClose, onUpdateCandidate, onRejectCandidate, onSchedule }: CandidateHiringDrawerProps) => {
    const [activeTab, setActiveTab] = useState<'Hiring Stage' | 'Notes'>('Hiring Stage');
    const [newNote, setNewNote] = useState('');
    const [editingEvaluation, setEditingEvaluation] = useState<{ [stage: string]: { [evaluator: string]: Partial<StageEvaluation> } }>({});
    
    const currentStageName = stageMap[candidate.stage] || allHiringStages[0];
    const [expandedStage, setExpandedStage] = useState<string | null>(currentStageName);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);
    
    let currentStageIndex = allHiringStages.indexOf(currentStageName);
    if (candidate.stage === 'Hired' || candidate.stage === 'Rejected') {
        currentStageIndex = allHiringStages.length;
    }

    const handleEvaluationChange = (stage: string, evaluator: string, field: 'mark' | 'feedback', value: string) => {
        let processedValue: string | number = value;
        if (field === 'mark') {
            const numericValue = value.replace(/[^0-9]/g, '');
            if (numericValue !== '' && (parseInt(numericValue, 10) < 0 || parseInt(numericValue, 10) > 100)) {
                return; // Don't update state if out of range
            }
            processedValue = numericValue;
        }

        setEditingEvaluation(prev => ({
            ...prev,
            [stage]: {
                ...(prev[stage] || {}),
                [evaluator]: {
                    ...(prev[stage]?.[evaluator] || {}),
                    [field]: processedValue,
                }
            }
        }));
    };
    
    const handleCancelEdit = (stage: string, evaluator: string) => {
        setEditingEvaluation(prev => {
            const newStageEvals = { ...(prev[stage] || {}) };
            delete newStageEvals[evaluator];
            if (Object.keys(newStageEvals).length === 0) {
                const newEditingEvals = { ...prev };
                delete newEditingEvals[stage];
                return newEditingEvals;
            }
            return {
                ...prev,
                [stage]: newStageEvals,
            };
        });
    };

    const handleSaveEvaluation = (stage: string, evaluator: string) => {
        const editedEval = editingEvaluation[stage]?.[evaluator];
        if (!editedEval) return;

        const markString = editedEval.mark;
        let markValue: number | undefined = undefined;

        if (markString !== undefined && String(markString).trim() !== '') {
            markValue = parseInt(String(markString), 10);
            if (isNaN(markValue) || markValue < 0 || markValue > 100) {
                alert("Please enter a number between 0 and 100 for the mark.");
                return;
            }
        }
        
        const updatedEvaluation: StageEvaluation = {
            mark: markValue,
            feedback: editedEval.feedback,
        };
        
        const updatedCandidate: Candidate = {
            ...candidate,
            stageMarks: {
                ...candidate.stageMarks,
                [stage]: {
                    ...candidate.stageMarks?.[stage],
                    [evaluator]: updatedEvaluation,
                }
            },
        };

        onUpdateCandidate(updatedCandidate);
        handleCancelEdit(stage, evaluator);
    };

    const handleStartEdit = (stage: string, evaluator: string, currentEvaluation?: StageEvaluation) => {
        setEditingEvaluation(prev => ({
            ...prev,
            [stage]: {
                ...(prev[stage] || {}),
                [evaluator]: {
                    mark: currentEvaluation?.mark,
                    feedback: currentEvaluation?.feedback || '',
                }
            }
        }));
    };

    const getEvaluatorsForStage = (stage: string): { name: string; role: string; avatarUrl?: string }[] => {
        switch (stage) {
            case 'Omo-ed':
            case 'Screening':
                return [{ name: 'Lee Wei Song', role: 'HR' }];
            case 'Technical Interview':
                return [
                    { name: 'Andrew Sebastian', role: 'HR' },
                    { name: 'John Doe (CTO)', role: 'Technical Evaluator' },
                ];
            case 'Final Interview':
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

    const renderStageDetails = (stage: string, isCompleted: boolean, isActive: boolean) => {
        if (!isCompleted && !isActive) {
            return <p className="text-sm text-slate-500 p-4 bg-slate-100 rounded-lg">This stage is not yet active.</p>;
        }
    
        const evaluators = getEvaluatorsForStage(stage);

        const renderEvaluatorEvaluation = (evaluator: { name: string; role: string; }) => {
            const savedEvaluation = candidate.stageMarks?.[stage]?.[evaluator.name];
            const isEditingThis = editingEvaluation[stage]?.[evaluator.name] !== undefined;
        
            if (isActive && isEditingThis) {
                const editedEval = editingEvaluation[stage]?.[evaluator.name];
                return (
                    <div key={evaluator.name} className="bg-white p-4 rounded-lg border border-slate-200">
                         <p className="text-sm font-semibold text-slate-600 mb-2">{`Evaluation from ${evaluator.name}`}</p>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Mark</label>
                                <input 
                                    type="text"
                                    pattern="\d*"
                                    maxLength={3}
                                    value={editedEval?.mark ?? ''}
                                    onChange={(e) => handleEvaluationChange(stage, evaluator.name, 'mark', e.target.value)}
                                    placeholder="0-100"
                                    autoFocus
                                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Feedback</label>
                                <textarea
                                    value={editedEval?.feedback ?? ''}
                                    onChange={(e) => handleEvaluationChange(stage, evaluator.name, 'feedback', e.target.value)}
                                    placeholder="Add feedback notes..."
                                    rows={3}
                                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                                />
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                                <button 
                                    onClick={() => handleCancelEdit(stage, evaluator.name)}
                                    className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition">
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => handleSaveEvaluation(stage, evaluator.name)}
                                    className="px-3 py-1.5 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }
        
            const hasEvaluation = savedEvaluation && (savedEvaluation.mark !== undefined || (savedEvaluation.feedback && savedEvaluation.feedback.trim() !== ''));

            let content;
            if (hasEvaluation) {
                content = (
                    <div className="space-y-3">
                        {savedEvaluation.mark !== undefined && (
                            <DetailItem label="Mark" value={<MarkBadge score={savedEvaluation.mark} />} />
                        )}
                        {savedEvaluation.feedback && (
                            <div>
                                <p className="text-sm text-slate-500">Feedback</p>
                                <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap mt-1">{savedEvaluation.feedback}</p>
                            </div>
                        )}
                         {isActive && (
                            <div className="flex justify-end pt-1">
                                <button 
                                    onClick={() => handleStartEdit(stage, evaluator.name, savedEvaluation)}
                                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 transition"
                                    aria-label="Edit evaluation"
                                >
                                    <EditIcon className="w-3 h-3" />
                                    <span>Edit</span>
                                </button>
                            </div>
                         )}
                    </div>
                );
            } else {
                if (isActive) {
                    content = (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 italic">No evaluation yet.</span>
                            <button 
                                onClick={() => handleStartEdit(stage, evaluator.name)}
                                className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 transition"
                            >
                                Add Evaluation
                            </button>
                        </div>
                    );
                } else {
                    content = <span className="text-sm text-slate-500 italic">No evaluation recorded.</span>;
                }
            }

            return (
                 <div key={evaluator.name} className="bg-slate-100 rounded-lg p-4">
                     <p className="text-sm font-semibold text-slate-600 mb-2">{`Evaluation from ${evaluator.name} (${evaluator.role})`}</p>
                     {content}
                 </div>
            );
        };
    
        const detailsContainer = (children: React.ReactNode) => (
            <div className="space-y-4">{children}</div>
        );

        switch(stage) {
            case 'Omo-ed':
                return detailsContainer(
                    <div className="bg-slate-100 rounded-lg p-4 space-y-3">
                        <p className="text-sm font-semibold text-slate-600">AI Evaluation Summary</p>
                        <DetailItem 
                            label="Percentile Score" 
                            value={
                                <div className="flex items-center gap-2 font-bold text-indigo-700">
                                    <SparklesIcon className="w-5 h-5" />
                                    <span>{candidate.percentileScore || 'N/A'}</span>
                                </div>
                            } 
                        />
                        {candidate.summaryPoints && candidate.summaryPoints.length > 0 && (
                             <div>
                                <p className="text-sm text-slate-500">Key Points</p>
                                <ul className="mt-1 space-y-1.5 text-sm text-slate-600 list-disc list-inside">
                                   {candidate.summaryPoints.map((point, index) => (
                                       <li key={index}>{point.text}</li>
                                   ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            case 'Screening':
            case 'Technical Interview':
            case 'Final Interview': {
                const schedule = (isActive && stage === candidate.upcomingSchedule?.title) ? candidate.upcomingSchedule : null;
                return detailsContainer(
                    <>
                        {schedule && (
                            <div className="bg-slate-100 rounded-lg p-4 space-y-2">
                                <div className="text-sm">
                                    <p className="text-slate-500">Date & Time</p>
                                    <p className="font-medium text-slate-800">{schedule.dateTime}</p>
                                </div>
                                <div className="text-sm">
                                    <p className="text-slate-500">Platform</p>
                                    <p className="font-medium text-slate-800">{schedule.platform}</p>
                                </div>
                            </div>
                        )}
                        {evaluators.map(renderEvaluatorEvaluation)}
                    </>
                );
            }
            default:
                 return <p className="text-sm text-slate-500 p-4 bg-slate-100 rounded-lg">Details for this stage will appear here.</p>;
        }
    };
    
    const handleSaveNote = () => {
        if (newNote.trim() === '') return;

        const noteToAdd: PrivateNote = {
            author: 'Lee Wei Song', // Hardcoded for this demo
            date: new Date().toISOString(),
            content: newNote.trim(),
        };

        const updatedNotes = [noteToAdd, ...(candidate.privateNotes || [])];

        const updatedCandidate: Candidate = {
            ...candidate,
            privateNotes: updatedNotes,
        };

        onUpdateCandidate(updatedCandidate);
        setNewNote('');
    };

    const canSchedule = ['Omo-ed', 'Screening', 'Technical Interview'].includes(candidate.stage);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={onClose}>
            <div className="h-full bg-slate-50 w-full max-w-2xl shadow-xl transform transition-transform duration-300" 
                onClick={e => e.stopPropagation()}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <header className="px-6 py-4 bg-white border-b border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={onClose} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
                                <ArrowLeftIcon className="w-4 h-4" />
                                <span>Back</span>
                            </button>
                            <button className="text-slate-500 hover:text-slate-800">
                                <DotsVerticalIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={candidate.avatarUrl} alt={candidate.name} className="w-16 h-16 rounded-full" />
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                        {candidate.name}
                                        {candidate.stage === 'Technical Interview' && <span className="text-xs font-semibold px-2 py-1 bg-teal-100 text-teal-700 rounded-full">Interview</span>}
                                    </h2>
                                    <p className="text-slate-500">{candidate.appliedDate} &bull; {job.workType}, {job.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100"><MailIcon className="w-5 h-5" /></button>
                                <button className="p-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100"><PhoneIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </header>
                    
                    {/* Main content */}
                    <main className="flex-1 overflow-y-auto">
                        <div className="border-b border-slate-200 bg-white px-6">
                           <div className="flex">
                                <Tab label="Hiring Stage" active={activeTab === 'Hiring Stage'} onClick={() => setActiveTab('Hiring Stage')} />
                                <Tab label="Notes" active={activeTab === 'Notes'} onClick={() => setActiveTab('Notes')} />
                           </div>
                        </div>

                        <div className="p-6">
                            {activeTab === 'Hiring Stage' && (
                                <>
                                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 mb-6">
                                        <h3 className="font-bold text-slate-800 mb-4">Applied Jobs</h3>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-slate-500">Position</p>
                                                <p className="font-semibold text-slate-700">{job.title}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Location</p>
                                                <p className="font-semibold text-slate-700">{job.location}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Applied date</p>
                                                <p className="font-semibold text-slate-700">{candidate.appliedDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        {allHiringStages.map((stage, index) => {
                                            const evaluators = getEvaluatorsForStage(stage);
                                            const areAllMarksSaved = evaluators.length > 0 && evaluators.every(
                                                e => candidate.stageMarks?.[stage]?.[e.name]?.mark !== undefined
                                            );
                                            const isCompleted = index < currentStageIndex || areAllMarksSaved;

                                            return (
                                                <StageStep
                                                    key={stage}
                                                    stage={stage}
                                                    index={index}
                                                    isCompleted={isCompleted}
                                                    isActive={index === currentStageIndex}
                                                    isLast={index === allHiringStages.length - 1}
                                                    expanded={expandedStage === stage}
                                                    onToggle={() => setExpandedStage(expandedStage === stage ? null : stage)}
                                                    details={renderStageDetails(stage, isCompleted, index === currentStageIndex)}
                                                />
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                             {activeTab === 'Notes' && (
                                <div>
                                    <div className="mb-6">
                                        <h3 className="font-bold text-slate-800 mb-2">Add a Private Note</h3>
                                        <textarea
                                            className="w-full h-32 p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                                            placeholder={`Add a note for ${candidate.name}... These are only visible to your team.`}
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                        />
                                        <div className="flex justify-end mt-3">
                                            <button 
                                                onClick={handleSaveNote}
                                                disabled={!newNote.trim()}
                                                className="bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                                            >
                                                Save Note
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-slate-700">Notes History</h4>
                                        {(candidate.privateNotes && candidate.privateNotes.length > 0) ? (
                                            <div className="space-y-4">
                                                {candidate.privateNotes
                                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                    .map((note, index) => (
                                                        <div key={index} className="bg-white p-4 rounded-lg border border-slate-200/80">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <p className="font-semibold text-slate-800">{note.author}</p>
                                                                <p className="text-xs text-slate-500">
                                                                    {new Date(note.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                                </p>
                                                            </div>
                                                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{note.content}</p>
                                                        </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 bg-slate-100 rounded-lg">
                                                <p className="text-sm text-slate-500">No private notes for this candidate yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => onRejectCandidate(candidate.id)}
                            disabled={candidate.stage === 'Rejected'}
                            className="flex items-center gap-2 font-semibold text-red-600 hover:text-red-800 disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:text-slate-400"
                        >
                            <XCircleIcon className="w-5 h-5" />
                            <span>{candidate.stage === 'Rejected' ? 'Rejected' : 'Reject'}</span>
                        </button>
                        {canSchedule && (
                            <button onClick={() => onSchedule(candidate)} className="bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-2 group">
                                <span>Schedule Interview</span>
                                <ArrowRightIcon className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
                            </button>
                        )}
                    </footer>
                </div>
            </div>
        </div>
    );
};
