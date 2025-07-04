

import React, { useState } from 'react';
import { Job } from '../types';
import { XMarkIcon, SparklesIcon } from './Icons';
import { generateJobDetails } from '../services/geminiService';

interface NewJobModalProps {
  onClose: () => void;
  onAddJob: (job: Job) => void;
}

const InputField = ({ label, name, value, onChange, placeholder, required = true, type = 'text' }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; required?: boolean, type?: string }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, children }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
        >
            {children}
        </select>
    </div>
);

const TextareaField = ({ label, name, value, onChange, placeholder, rows = 4 }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; rows?: number }) => (
    <div className="md:col-span-2">
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
        />
    </div>
);

export const NewJobModal = ({ onClose, onAddJob }: NewJobModalProps): React.ReactNode => {
  const [jobDetails, setJobDetails] = useState({
    title: '',
    department: '',
    level: 'Mid-Level',
    experience: '3+ Years',
    employmentType: 'Full-time',
    workType: 'Remote',
    salary: '',
    location: '',
    deadline: '',
    description: '',
    requirements: '',
    responsibilities: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateDetails = async () => {
      if (!jobDetails.title) {
          alert("Please enter a job title first.");
          return;
      }
      setIsGenerating(true);
      try {
        const result = await generateJobDetails(jobDetails.title, jobDetails.department);
        setJobDetails(prev => ({
            ...prev,
            description: result.description || '',
            requirements: (result.requirements || []).join('\n'),
            responsibilities: (result.responsibilities || []).join('\n'),
        }));
      } catch (error) {
          console.error("Failed to generate job details", error);
          alert("Couldn't generate details. Please try again.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDetails.title || !jobDetails.department || !jobDetails.salary || !jobDetails.location) {
        alert("Please fill out all required fields.");
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newJob: Job = {
      id: Date.now(),
      status: 'Active',
      applicants: 0,
      latestUpdate: today,
      creationDate: today,
      title: jobDetails.title,
      department: jobDetails.department,
      level: jobDetails.level,
      experience: jobDetails.experience,
      employmentType: jobDetails.employmentType,
      workType: jobDetails.workType,
      salary: jobDetails.salary,
      location: jobDetails.location,
      deadline: jobDetails.deadline,
      description: jobDetails.description,
      requirements: jobDetails.requirements.split('\n').filter(r => r.trim() !== ''),
      responsibilities: jobDetails.responsibilities.split('\n').filter(r => r.trim() !== ''),
      candidates: [],
    };
    onAddJob(newJob);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl m-4" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800">Post a New Job</h2>
                <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                    <XMarkIcon className="w-6 h-6"/>
                </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Job Title" name="title" value={jobDetails.title} onChange={handleChange} placeholder="e.g. Senior Frontend Developer"/>
                    <InputField label="Department" name="department" value={jobDetails.department} onChange={handleChange} placeholder="e.g. Engineering"/>
                    
                    <SelectField label="Level" name="level" value={jobDetails.level} onChange={handleChange}>
                        <option>Junior</option>
                        <option>Mid-Level</option>
                        <option>Senior</option>
                        <option>Lead</option>
                    </SelectField>

                    <SelectField label="Experience" name="experience" value={jobDetails.experience} onChange={handleChange}>
                        <option>0-1 Years</option>
                        <option>1-2 Years</option>
                        <option>2-4 Years</option>
                        <option>3+ Years</option>
                        <option>5+ Years</option>
                        <option>7+ Years</option>
                    </SelectField>
                    
                    <SelectField label="Employment Type" name="employmentType" value={jobDetails.employmentType} onChange={handleChange}>
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                        <option>Internship</option>
                    </SelectField>

                    <SelectField label="Work Type" name="workType" value={jobDetails.workType} onChange={handleChange}>
                        <option>On-site</option>
                        <option>Remote</option>
                        <option>Hybrid</option>
                    </SelectField>

                    <InputField label="Salary Range" name="salary" value={jobDetails.salary} onChange={handleChange} placeholder="e.g. $120k - $150k" />
                    <InputField label="Location" name="location" value={jobDetails.location} onChange={handleChange} placeholder="e.g. Remote, USA" />

                    <InputField label="Application Deadline" name="deadline" value={jobDetails.deadline} onChange={handleChange} type="date" />
                    
                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="button"
                            onClick={handleGenerateDetails}
                            disabled={isGenerating || !jobDetails.title}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-300"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-4 h-4" />
                                    <span>Generate with AI</span>
                                </>
                            )}
                        </button>
                    </div>

                    <TextareaField label="Description" name="description" value={jobDetails.description} onChange={handleChange} placeholder="A brief summary of the role." />
                    <TextareaField label="Requirements" name="requirements" value={jobDetails.requirements} onChange={handleChange} placeholder="List each requirement on a new line." rows={6} />
                    <TextareaField label="Responsibilities" name="responsibilities" value={jobDetails.responsibilities} onChange={handleChange} placeholder="List each responsibility on a new line." rows={6} />
                </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t border-slate-200">
                <button 
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition"
                >
                    Post Job
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};