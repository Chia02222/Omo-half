
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps): React.ReactNode => {
    const pageNumbers = [];
    
    const maxPageButtons = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <nav className="flex items-center justify-center" aria-label="Pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div className="mx-2 flex items-center gap-1">
                {startPage > 1 && (
                    <>
                        <button onClick={() => onPageChange(1)} className="bg-white border-slate-300 text-slate-500 hover:bg-slate-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md">1</button>
                        {startPage > 2 && <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700">...</span>}
                    </>
                )}

                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => onPageChange(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md
                            ${currentPage === number ? 'z-10 bg-black text-white border-black' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`
                        }
                    >
                        {number}
                    </button>
                ))}

                {endPage < totalPages && (
                     <>
                        {endPage < totalPages - 1 && <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700">...</span>}
                        <button onClick={() => onPageChange(totalPages)} className="bg-white border-slate-300 text-slate-500 hover:bg-slate-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md">{totalPages}</button>
                    </>
                )}
            </div>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRightIcon className="h-5 w-5" />
            </button>
        </nav>
    );
};
    