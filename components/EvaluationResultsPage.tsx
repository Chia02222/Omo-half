import React from 'react';
import { SmarsEvaluation, PointStatus } from '../types';
import { SparklesIcon } from './Icons';

interface EvaluationResultsPageProps {
  evaluations: SmarsEvaluation[];
  onConfirm: (evaluations: SmarsEvaluation[]) => void;
  onCancel: () => void;
}

const PointBullet = ({ status }: { status: PointStatus }) => {
    const colorClass = {
        positive: 'bg-green-400',
        neutral: 'bg-yellow-400',
        negative: 'bg-red-400',
    }[status];
    return <div className={`w-2 h-2 rounded-full ${colorClass} mt-1.5 flex-shrink-0`}></div>;
}

const ScoreCircle = ({ score }: { score: number }) => {
    const getScoreColor = () => {
        if (score >= 90) return 'text-green-500';
        if (score >= 75) return 'text-emerald-500';
        if (score >= 60) return 'text-yellow-500';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };
    
    const circumference = 2 * Math.PI * 18; // 2 * pi * r
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-24 h-24">
            <svg className="w-full h-full" viewBox="0 0 40 40">
                <circle
                    className="text-slate-200"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r="18"
                    cx="20"
                    cy="20"
                />
                <circle
                    className={`${getScoreColor()}`}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="18"
                    cx="20"
                    cy="20"
                    transform="rotate(-90 20 20)"
                />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center font-bold text-2xl ${getScoreColor()}`}>
                {score}
            </div>
        </div>
    );
}

const ScoreBar = ({ label, score }: { label: string, score: number }) => {
    const getScoreColor = () => {
        if (score >= 90) return 'bg-green-500';
        if (score >= 75) return 'bg-emerald-500';
        if (score >= 60) return 'bg-yellow-500';
        if (score >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-600">{label}</span>
                <span className="font-semibold text-slate-800">{score}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
                <div className={`${getScoreColor()} h-2 rounded-full`} style={{ width: `${score}%`}}></div>
            </div>
        </div>
    )
}

const EvaluationCard = ({ evaluation }: { evaluation: SmarsEvaluation }) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col">
            <div className="flex items-start gap-4">
                <ScoreCircle score={evaluation.overallScore} />
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-800">{evaluation.name}</h3>
                    <p className="text-sm text-slate-500">{evaluation.role}</p>
                </div>
            </div>
            <div className="space-y-3 mt-4">
                <ScoreBar label="HR Fit" score={evaluation.scores.hr} />
                <ScoreBar label="Technical" score={evaluation.scores.tech} />
                <ScoreBar label="Culture Fit" score={evaluation.scores.culture} />
            </div>
            <div className="border-t border-slate-200 my-4"></div>
             <ul className="space-y-2 text-sm text-slate-600 flex-1">
                {evaluation.points.map((point, index) => (
                <li key={index} className="flex items-start space-x-2.5">
                    <PointBullet status={point.status} />
                    <span>{point.text}</span>
                </li>
                ))}
            </ul>
        </div>
    );
};

export const EvaluationResultsPage = ({ evaluations, onConfirm, onCancel }: EvaluationResultsPageProps) => {
    const sortedEvaluations = [...evaluations].sort((a, b) => b.overallScore - a.overallScore);
    const top20PercentCount = Math.ceil(sortedEvaluations.length * 0.20);

    return (
        <div className="flex flex-col h-full">
            <div className="pb-20">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-slate-800">AI Evaluation Results</h2>
                    <p className="text-slate-500 mt-1">
                        Analyzed {sortedEvaluations.length} resumes. Click below to add the top {top20PercentCount} candidate(s) to the board.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedEvaluations.map((evaluation) => (
                        <EvaluationCard key={evaluation.name} evaluation={evaluation} />
                    ))}
                </div>
            </div>
            
            <div className="fixed bottom-0 left-64 right-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 p-4 z-10">
                <div className="max-w-7xl mx-auto flex justify-end items-center gap-4 px-8">
                     <button 
                        onClick={onCancel}
                        className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => onConfirm(sortedEvaluations)}
                        disabled={sortedEvaluations.length === 0}
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Add Top {top20PercentCount} to Board
                    </button>
                </div>
            </div>
        </div>
    );
};
