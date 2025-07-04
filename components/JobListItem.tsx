import React from 'react';
import { Job } from '../types';
import { UsersIcon, LocationIcon, DotsVerticalIcon } from './Icons';

interface JobListItemProps {
    job: Job;
    onClick: () => void;
}

export const JobListItem = ({ job, onClick }: JobListItemProps): React.ReactNode => {
    return (
        <div 
            onClick={onClick}
            className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer flex items-center justify-between gap-4"
        >
            <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">{job.title}</p>
                <p className="text-sm text-slate-500">{job.department} &bull; {job.level}</p>
            </div>

            <div className="hidden xl:flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                    <UsersIcon className="w-4 h-4 text-slate-400"/>
                    <span>{job.applicants} Applicants</span>
                </div>
                <div className="flex items-center gap-2">
                    <LocationIcon className="w-4 h-4 text-slate-400"/>
                    <span>{job.location}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden sm:block text-center">
                    <div className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-md">{job.employmentType}</div>
                    <div className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-md mt-1">{job.workType}</div>
                </div>
                 {job.status === 'Active' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        Inactive
                    </span>
                 )}
                <button onClick={(e) => e.stopPropagation()} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                    <DotsVerticalIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};