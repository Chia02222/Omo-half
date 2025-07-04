import React from 'react';
import { XMarkIcon } from './Icons';

interface Filters {
    location: string;
    level: string;
    experience: string;
    employmentType: string;
    workType: string;
}

interface FilterPanelProps {
    filters: Filters;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onClear: () => void;
    onClose: () => void;
}

const FilterInput = ({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
        />
    </div>
);

const FilterSelect = ({ label, name, value, onChange, children }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
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

export const FilterPanel = ({ filters, onChange, onClear, onClose }: FilterPanelProps): React.ReactNode => {
    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-20">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">Filters</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                    <XMarkIcon className="w-5 h-5 text-slate-500" />
                </button>
            </div>
            <div className="p-4 space-y-4">
                <FilterInput label="Location" name="location" value={filters.location} onChange={onChange} />
                <FilterSelect label="Level" name="level" value={filters.level} onChange={onChange}>
                    <option>All</option>
                    <option>Junior</option>
                    <option>Mid-Level</option>
                    <option>Senior</option>
                    <option>Lead</option>
                </FilterSelect>
                <FilterSelect label="Experience" name="experience" value={filters.experience} onChange={onChange}>
                    <option>All</option>
                    <option>0-1 Years</option>
                    <option>1-2 Years</option>
                    <option>2-4 Years</option>
                    <option>3+ Years</option>
                    <option>5+ Years</option>
                    <option>7+ Years</option>
                </FilterSelect>
                <FilterSelect label="Employment Type" name="employmentType" value={filters.employmentType} onChange={onChange}>
                    <option>All</option>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                </FilterSelect>
                <FilterSelect label="Work Type" name="workType" value={filters.workType} onChange={onChange}>
                    <option>All</option>
                    <option>On-site</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                </FilterSelect>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200">
                <button
                    onClick={onClear}
                    className="w-full px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                >
                    Clear All Filters
                </button>
            </div>
        </div>
    );
};
