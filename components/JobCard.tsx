import React from 'react';
import { Job } from '../types';
import { CodeIcon, UsersIcon, BuildingOfficeIcon, CalendarDaysIcon, JobIconComponents } from './Icons';

interface JobCardProps {
    job: Job;
    onClick: () => void;
}

const InfoTag = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div className="flex items-center gap-1.5 text-sm text-slate-600">
        {icon}
        <span>{text}</span>
    </div>
);

export const JobCard = ({ job, onClick }: JobCardProps): React.ReactNode => {
    const formattedDeadline = new Date(job.deadline.replace(/-/g, '\/')).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    const IconComponent = JobIconComponents[job.title] || CodeIcon;

    return (
        <div 
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col"
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-slate-600" />
                </div>
                <div className="flex flex-col items-end gap-1">
                    {job.status === 'Active' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8"><circle cx={4} cy={4} r={3} /></svg>
                            Active
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            Inactive
                        </span>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarDaysIcon className="w-3.5 h-3.5" />
                        <span>Deadline: {formattedDeadline}</span>
                    </div>
                </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800">{job.title}</h3>
            <p className="text-sm text-slate-500 mb-4">{job.department}</p>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-1 mb-4">
                <InfoTag icon={<BuildingOfficeIcon className="w-4 h-4 text-slate-500"/>} text={job.level} />
                <InfoTag icon={<CalendarDaysIcon className="w-4 h-4 text-slate-500"/>} text={job.experience} />
                <div className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1 rounded-md text-center">{job.employmentType}</div>
                <div className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1 rounded-md text-center">{job.workType}</div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-200">
                 <div className="flex justify-between items-center">
                    <p className="font-semibold text-slate-800">{job.salary}</p>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                        <UsersIcon className="w-4 h-4"/>
                        <span>{job.applicants} Applicants</span>
                    </div>
                </div>
            </div>
        </div>
    );
};