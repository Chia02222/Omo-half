import { useState, useMemo } from 'react';
import { Candidate } from '../types';
import { SearchIcon, ChevronDownIcon } from './Icons';
import { CandidatesTable } from './CandidatesTable';
import { Pagination } from './Pagination';

interface AllCandidatesPageProps {
  allCandidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
}

type SortKey = 'name' | 'appliedDate';

export const AllCandidatesPage = ({ allCandidates, onSelectCandidate }: AllCandidatesPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('appliedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Flatten/mapping step for table display
  const mappedCandidates = useMemo(() => allCandidates.map(c => ({
    ...c,
    stage: c.stage || (c as any).currentStage || '',
    appliedRole: c.appliedRole || (c as any).appliedJobs?.[0]?.job?.title || '',
    phone: c.phone || c.personalInfo?.phone || '',
    email: c.email || c.personalInfo?.email || '',
    status: c.status || (c as any).status || (c as any).currentStatus || '',
  })), [allCandidates]);

  const filteredCandidates = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return mappedCandidates.filter(c =>
      c.name.toLowerCase().includes(lowerCaseQuery) ||
      (c.email && c.email.toLowerCase().includes(lowerCaseQuery)) ||
      c.appliedRole.toLowerCase().includes(lowerCaseQuery)
    );
  }, [mappedCandidates, searchQuery]);

  const sortedCandidates = useMemo(() => {
    return [...filteredCandidates].sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (sortBy === 'appliedDate' && a.appliedDate && b.appliedDate) {
        const dateA = new Date(a.appliedDate).getTime();
        const dateB = new Date(b.appliedDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
  }, [filteredCandidates, sortBy, sortOrder]);

  const handleSortChange = (value: string) => {
      if (value === 'Newest' || value === 'Oldest') {
          setSortBy('appliedDate');
          setSortOrder(value === 'Newest' ? 'desc' : 'asc');
      }
  }

  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedCandidates.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedCandidates, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedCandidates.length / itemsPerPage);
  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, sortedCandidates.length);

  return (
    <main className="flex-1 flex flex-col p-6 lg:p-8 overflow-y-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-slate-800 self-start">All Candidates</h1>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>
            <div className="relative">
                <select 
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none cursor-pointer bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="Newest">Short by: Newest</option>
                    <option value="Oldest">Short by: Oldest</option>
                </select>
                <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
            <CandidatesTable candidates={paginatedCandidates} onSelectCandidate={onSelectCandidate} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 mt-auto">
          <p className="text-sm text-slate-500">
            Showing data {startEntry} to {endEntry} of {sortedCandidates.length} entries
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </main>
  );
};
