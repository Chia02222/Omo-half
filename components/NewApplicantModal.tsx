import React, { useState, useRef, useCallback } from 'react';
import { CloudArrowUpIcon, PaperClipIcon, SparklesIcon } from './Icons';

interface NewApplicantModalProps {
  onClose: () => void;
  onStartEvaluation: (resumes: File[]) => void;
  isProcessing: boolean;
}

export const NewApplicantModal = ({ onClose, onStartEvaluation, isProcessing }: NewApplicantModalProps): React.ReactNode => {
    const [resumes, setResumes] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFilesChange = (files: FileList | null) => {
        if (files) {
            const newFiles = Array.from(files);
            setResumes(prev => {
                const existingNames = new Set(prev.map(f => f.name));
                const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.name));
                return [...prev, ...uniqueNewFiles];
            });
        }
    };

    const handleRemoveFile = (fileName: string) => {
        setResumes(prev => prev.filter(f => f.name !== fileName));
    };

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFilesChange(e.dataTransfer.files);
    }, [handleFilesChange]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (resumes.length === 0) {
            alert('Please upload at least one resume file.');
            return;
        }
        onStartEvaluation(resumes);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={!isProcessing ? onClose : undefined}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10">
                        <SparklesIcon className="w-12 h-12 text-indigo-500 animate-pulse" />
                        <p className="mt-4 text-lg font-semibold text-slate-700">Evaluating candidates with Omo AI...</p>
                        <p className="text-sm text-slate-500">This may take a moment.</p>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-slate-800">Add New Applicants via Resume</h2>
                        <p className="text-slate-500 mt-1">Upload one or more resumes to create new applicant profiles.</p>
                    </div>

                    <div className="px-6 pb-6 space-y-4 max-h-[40vh] overflow-y-auto">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Resumes</label>
                            <div
                                className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                                    ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-slate-400'}`
                                }
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) => handleFilesChange(e.target.files)}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.txt"
                                    multiple
                                />
                                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-slate-400" />
                                <p className="mt-2 text-sm text-slate-600">
                                    <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-slate-500">PDF, DOCX, TXT (MAX. 5MB each)</p>
                            </div>
                            {resumes.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {resumes.map(resume => (
                                        <div key={resume.name} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <PaperClipIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />
                                                <span className="text-sm font-medium text-slate-700 truncate">{resume.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(resume.name)}
                                                className="text-sm font-semibold text-red-500 hover:text-red-700 flex-shrink-0 ml-2"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={resumes.length === 0}
                            className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            Evaluate {resumes.length > 0 ? `${resumes.length} Resume(s)` : 'Resumes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};