
import React from 'react';
import { CodeIcon, SearchIcon, EditIcon, ArrowLeftIcon, JobIconComponents } from './Icons';
import { Job } from '../types';

interface HeaderProps {
    job: Job;
    activeTab: 'Job Details' | 'Applicants';
    onTabChange: (tab: 'Job Details' | 'Applicants') => void;
    onNewApplicantClick: () => void;
    onBackToJobList: () => void;
    isEditing?: boolean;
    onEditClick?: () => void;
    onSaveClick?: () => void;
    onCancelClick?: () => void;
    searchQuery: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header = ({ 
    job, 
    activeTab, 
    onTabChange, 
    onNewApplicantClick, 
    onBackToJobList, 
    isEditing, 
    onEditClick, 
    onSaveClick, 
    onCancelClick,
    searchQuery,
    onSearchChange
}: HeaderProps): React.ReactNode => {
  const IconComponent = JobIconComponents[job.title] || CodeIcon;

  return (
    <header className="mb-6">
      <button onClick={onBackToJobList} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Job List</span>
      </button>
      
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div className="flex items-center gap-6">
          <div className="bg-slate-800 text-white p-3 rounded-lg flex-shrink-0">
              <IconComponent className="w-8 h-8"/>
          </div>
          <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{job.title}</h1>
              <p className="text-sm text-slate-500">Latest Update on {job.latestUpdate}</p>
          </div>
        </div>
        {activeTab === 'Job Details' && (
            <div className="text-right mt-4 md:mt-0 md:pl-4">
                <p className="text-2xl font-bold text-slate-900">{job.salary}</p>
                <p className="text-sm text-slate-500">{job.location}</p>
            </div>
        )}
      </div>
      
      <div className="flex justify-between items-center border-b border-slate-200">
        <div className="flex items-center">
            <button 
              onClick={() => onTabChange('Job Details')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'Job Details' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Job Details
            </button>
            <button 
              onClick={() => onTabChange('Applicants')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'Applicants' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Applicants
            </button>
        </div>
        <div className="flex items-center gap-4">
            {activeTab === 'Applicants' && (
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"/>
                    <input 
                        type="text" 
                        placeholder="Search Applicants..." 
                        className="pl-10 pr-4 py-2 w-48 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                        value={searchQuery}
                        onChange={onSearchChange}
                    />
                </div>
            )}
            
            {activeTab === 'Applicants' ? (
                <button 
                    onClick={onNewApplicantClick}
                    className="bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors shadow-sm">
                    + New Applicant
                </button>
            ) : isEditing ? (
                 <div className="flex items-center gap-2">
                    <button onClick={onCancelClick} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition">
                        Cancel
                    </button>
                    <button onClick={onSaveClick} className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition">
                        Save Changes
                    </button>
                </div>
            ) : (
                <button onClick={onEditClick} className="bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors shadow-sm flex items-center gap-2">
                    <EditIcon className="h-4 w-4" />
                    <span>Edit Job</span>
                </button>
            )}
        </div>
      </div>
    </header>
  );
};