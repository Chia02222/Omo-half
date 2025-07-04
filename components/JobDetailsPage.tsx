import React from 'react';
import { JOB_DETAILS } from '../constants'; // Using as fallback for some static text
import { Job } from '../types';

interface JobDetailsPageProps {
    job: Job;
    isEditing?: boolean;
    onJobChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const InfoCard = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200/60">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-semibold text-slate-800 mt-1">{value}</p>
    </div>
);

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-slate-800">{title}</h3>
        {children}
    </div>
);

const EditableInputField = ({ label, name, value, onChange, type = 'text' }: { label: string; name: string; value: string; onChange: any; type?: string; }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
        />
    </div>
);

const EditableSelectField = ({ label, name, value, onChange, children }: { label: string; name: string; value: string; onChange: any; children: React.ReactNode; }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
        >
            {children}
        </select>
    </div>
);

const EditableTextareaField = ({ label, name, value, onChange, rows = 5 }: { label: string; name: string; value: string; onChange: any; rows?: number; }) => (
    <div className="lg:col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows={rows}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
        />
    </div>
);

export const JobDetailsPage = ({ job, isEditing, onJobChange }: JobDetailsPageProps): React.ReactNode => {
    if (isEditing && onJobChange) {
        return (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-slate-200/80">
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <EditableInputField label="Job Title" name="title" value={job.title} onChange={onJobChange} />
                        <EditableInputField label="Department" name="department" value={job.department} onChange={onJobChange} />
                        <EditableSelectField label="Level" name="level" value={job.level} onChange={onJobChange}>
                            <option>Junior</option>
                            <option>Mid-Level</option>
                            <option>Senior</option>
                            <option>Lead</option>
                        </EditableSelectField>
                        <EditableSelectField label="Work Experience" name="experience" value={job.experience} onChange={onJobChange}>
                            <option>0-1 Years</option>
                            <option>1-2 Years</option>
                            <option>2-4 Years</option>
                            <option>3+ Years</option>
                            <option>5+ Years</option>
                            <option>7+ Years</option>
                        </EditableSelectField>
                        <EditableSelectField label="Employment Type" name="employmentType" value={job.employmentType} onChange={onJobChange}>
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Contract</option>
                            <option>Internship</option>
                        </EditableSelectField>
                        <EditableSelectField label="Work Type" name="workType" value={job.workType} onChange={onJobChange}>
                            <option>On-site</option>
                            <option>Remote</option>
                            <option>Hybrid</option>
                        </EditableSelectField>
                        <EditableInputField label="Salary Range" name="salary" value={job.salary} onChange={onJobChange} />
                        <EditableInputField label="Location" name="location" value={job.location} onChange={onJobChange} />
                        <EditableInputField label="Application Deadline" name="deadline" value={job.deadline} onChange={onJobChange} type="date" />
                        <EditableSelectField label="Status" name="status" value={job.status} onChange={onJobChange}>
                            <option>Active</option>
                            <option>Inactive</option>
                        </EditableSelectField>
                        <EditableTextareaField label="Job Description" name="description" value={job.description} onChange={onJobChange} rows={6} />
                        <EditableTextareaField label="Qualifications (one per line)" name="requirements" value={job.requirements.join('\n')} onChange={onJobChange} rows={8} />
                        <EditableTextareaField label="Responsibilities (one per line)" name="responsibilities" value={job.responsibilities.join('\n')} onChange={onJobChange} rows={8} />
                    </form>
                </div>
            </div>
        )
    }

    const details = { ...JOB_DETAILS, ...job, workExperience: job.experience };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <InfoCard label="Level" value={details.level} />
                    <InfoCard label="Work Experience" value={details.workExperience} />
                    <InfoCard label="Employment Type" value={details.employmentType} />
                    <InfoCard label="Work Type" value={details.workType} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200/80">
                    <Section title="Job Description">
                        <p className="text-slate-600 leading-relaxed">{job.description}</p>
                    </Section>
                    
                    <Section title="Qualifications">
                        <ul className="list-disc pl-5 space-y-2 text-slate-600">
                            {job.requirements.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                    </Section>

                    <Section title="Responsibilities">
                        <ul className="list-disc pl-5 space-y-2 text-slate-600">
                            {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                    </Section>
                </div>
            </div>
            
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200/80">
                    <h3 className="text-xl font-bold mb-6 text-slate-800">Job Postings</h3>
                    <div className="space-y-5">
                        <div key="status">
                            <p className="text-sm text-slate-500">Status</p>
                            {job.status === 'Active' ? (
                                <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                                        <circle cx={4} cy={4} r={3} />
                                    </svg>
                                    Active
                                </span>
                            ) : (
                                <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                    <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-slate-400" fill="currentColor" viewBox="0 0 8 8">
                                        <circle cx={4} cy={4} r={3} />
                                    </svg>
                                    Inactive
                                </span>
                            )}
                        </div>
                         <div key="deadline">
                            <p className="text-sm text-slate-500">Application Deadline</p>
                            <p className="font-semibold text-slate-800 text-base mt-1">{job.deadline}</p>
                        </div>
                        <div key="totalApplicants">
                            <p className="text-sm text-slate-500">Total Applicants</p>
                            <p className="font-semibold text-slate-800 text-base mt-1">{job.applicants}</p>
                        </div>
                        <div key="lastUpdate">
                             <p className="text-sm text-slate-500">Last Update</p>
                             <p className="font-semibold text-slate-800 text-base mt-1">{job.latestUpdate}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};