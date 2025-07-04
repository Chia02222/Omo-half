import React from 'react';
import { SparklesIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

interface ChatWidgetProps {
    isOpen: boolean;
    isMinimized: boolean;
    query: string;
    response: string;
    isLoading: boolean;
    onClose: () => void;
    onToggleMinimize: () => void;
}

export const ChatWidget = ({
    isOpen,
    isMinimized,
    query,
    response,
    isLoading,
    onClose,
    onToggleMinimize
}: ChatWidgetProps): React.ReactNode => {

    if (!isOpen) {
        return null;
    }

    if (isMinimized) {
        return (
            <div 
                className="fixed bottom-6 right-8 bg-slate-800 text-white rounded-lg shadow-2xl flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-slate-900 transition-all z-40"
                onClick={onToggleMinimize}
            >
                <SparklesIcon className="w-6 h-6" />
                <h3 className="font-bold">Omo AI</h3>
                <ChevronUpIcon className="w-5 h-5"/>
            </div>
        )
    }

    return (
        <div className="fixed bottom-6 right-8 w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200/80 z-40 flex flex-col transition-all duration-300">
            {/* Header */}
            <header className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50 rounded-t-xl cursor-pointer" onClick={onToggleMinimize}>
                <div className="flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-indigo-500" />
                    <h3 className="font-bold text-slate-800">Omo AI Assistant</h3>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onToggleMinimize(); }} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-md transition-colors">
                        <ChevronDownIcon className="w-5 h-5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-md transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Body */}
            <div className="p-4 h-80 overflow-y-auto space-y-4">
                {/* Query */}
                {query && (
                    <div className="flex flex-col items-end">
                        <div className="bg-slate-800 text-white p-3 rounded-lg rounded-br-none max-w-xs">
                            <p className="text-sm">{query}</p>
                        </div>
                    </div>
                )}

                {/* Response */}
                <div className="flex flex-col items-start">
                     <div className="bg-slate-100 text-slate-800 p-3 rounded-lg rounded-bl-none max-w-xs min-w-[120px]">
                        {isLoading ? (
                             <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600"></div>
                                <span className="text-sm text-slate-600">Omo is thinking...</span>
                            </div>
                        ) : (
                            <p className="text-sm whitespace-pre-wrap">{response || "Hello! How can I help you compare candidates today?"}</p>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};