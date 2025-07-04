
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Job } from '../types';
import { JobCard } from './JobCard';
import { Pagination } from './Pagination';
import { NewJobModal } from './NewJobModal';
import { SearchIcon, FilterIcon, GridViewIcon, ListViewIcon } from './Icons';
import { JobListItem } from './JobListItem';
import { FilterPanel } from './FilterPanel';

interface JobsListPageProps {
    jobs: Job[];
    onSelectJob: (job: Job) => void;
    onAddJob: (job: Job) => void;
}

type SortByType = 'dateCreated' | 'title';
type ViewType = 'grid' | 'list';

interface Filters {
    level: string;
    experience: string;
    employmentType: string;
    workType: string;
    location: string
}

export const JobsListPage = ({ jobs, onSelectJob, onAddJob }: JobsListPageProps): React.ReactNode => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState<SortByType>('dateCreated');
    const [view, setView] = useState<ViewType>('grid');
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Filters>({
        level: 'All',
        experience: 'All',
        employmentType: 'All',
        workType: 'All',
        location: ''
    });
    const filterButtonRef = useRef<HTMLButtonElement>(null);
    const filterPanelRef = useRef<HTMLDivElement>(null);
    
    const jobsPerPage = view === 'grid' ? 8 : 10;

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value }));
        setCurrentPage(1);
    };
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({
            level: 'All',
            experience: 'All',
            employmentType: 'All',
            workType: 'All',
            location: ''
        });
        setCurrentPage(1);
    }
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                filterPanelRef.current &&
                !filterPanelRef.current.contains(event.target as Node) &&
                filterButtonRef.current &&
                !filterButtonRef.current.contains(event.target as Node)
            ) {
                setIsFilterPanelOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredAndSortedJobs = useMemo(() => {
        const lowerCaseSearchQuery = searchQuery.toLowerCase();
        
        let filteredJobs = [...jobs].filter(job => {
            const searchMatch = !searchQuery || (
                job.title.toLowerCase().includes(lowerCaseSearchQuery) ||
                job.department.toLowerCase().includes(lowerCaseSearchQuery) ||
                job.location.toLowerCase().includes(lowerCaseSearchQuery)
            );

            const filterMatch = (
                (filters.level !== 'All' ? job.level === filters.level : true) &&
                (filters.experience !== 'All' ? job.experience === filters.experience : true) &&
                (filters.employmentType !== 'All' ? job.employmentType === filters.employmentType : true) &&
                (filters.workType !== 'All' ? job.workType === filters.workType : true) &&
                (filters.location ? job.location.toLowerCase().includes(filters.location.toLowerCase()) : true)
            );

            return searchMatch && filterMatch;
        });

        switch (sortBy) {
            case 'title':
                return filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
            case 'dateCreated':
            default:
                return filteredJobs.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
        }
    }, [jobs, sortBy, filters, searchQuery]);

    const activeFilterCount = Object.values(filters).filter(value => value && value !== 'All').length;

    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredAndSortedJobs.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(filteredAndSortedJobs.length / jobsPerPage);
    
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }

    return (
        <>
            <main className="flex-1 flex flex-col p-6 lg:p-8 overflow-y-auto bg-white">
                <h1 className="text-3xl font-bold text-slate-900 mb-6">Job List</h1>
                
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full md:w-auto md:flex-1 max-w-md">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"/>
                        <input 
                            type="text" 
                            placeholder="Search position, department, etc" 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button
                                ref={filterButtonRef}
                                onClick={() => setIsFilterPanelOpen(prev => !prev)}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                            >
                                <FilterIcon className="h-4 w-4" />
                                <span>Filter</span>
                                {activeFilterCount > 0 && (
                                    <span className="bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{activeFilterCount}</span>
                                )}
                            </button>
                             {isFilterPanelOpen && (
                                <div ref={filterPanelRef}>
                                    <FilterPanel 
                                        filters={filters}
                                        onChange={handleFilterChange}
                                        onClear={clearFilters}
                                        onClose={() => setIsFilterPanelOpen(false)}
                                    />
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={() => setIsNewJobModalOpen(true)}
                            className="px-4 py-2.5 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition">
                            Post a Job
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <p className="font-semibold text-slate-700">Showing {filteredAndSortedJobs.length} Jobs</p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-500">Sort by:</span>
                            <select 
                                className="font-semibold text-slate-700 bg-transparent border-0 focus:ring-0 p-0"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortByType)}
                            >
                                <option value="dateCreated">Date Created</option>
                                <option value="title">Title</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                            <button 
                                onClick={() => setView('grid')}
                                className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <GridViewIcon className="w-5 h-5"/>
                            </button>
                            <button 
                                onClick={() => setView('list')}
                                className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <ListViewIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    {view === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {currentJobs.map(job => (
                                <JobCard key={job.id} job={job} onClick={() => onSelectJob(job)} />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {currentJobs.map(job => (
                                <JobListItem key={job.id} job={job} onClick={() => onSelectJob(job)} />
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-8">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </main>
            {isNewJobModalOpen && (
                <NewJobModal 
                    onClose={() => setIsNewJobModalOpen(false)}
                    onAddJob={(newJob) => {
                        onAddJob(newJob);
                        setIsNewJobModalOpen(false);
                    }}
                />
            )}
        </>
    );
};
