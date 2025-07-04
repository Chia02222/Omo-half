import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { JobsListPage } from './components/JobsListPage';
import JobDashboardPage from './components/JobDashboardPage';
import { CandidateDetailPage } from './components/CandidateDetailPage';
import { AllCandidatesPage } from './components/AllCandidatesPage';
import { DashboardPage } from './components/DashboardPage';
import { CalendarPage } from './components/CalendarPage';
import { Job, Candidate } from './types';

export default function App(): React.ReactNode {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [activePage, setActivePage] = useState<'Dashboard' | 'Jobs' | 'Candidates' | 'Calendar'>('Dashboard');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch jobs from backend
        const jobsRes = await fetch('http://localhost:3000/api/jobs');
        const jobsData = await jobsRes.json();
        console.log('Fetched jobsData:', jobsData);
        setJobs(Array.isArray(jobsData) ? jobsData : []);
        // Fetch candidates from backend
        const candidatesRes = await fetch('http://localhost:3000/api/candidates');
        const candidatesData = await candidatesRes.json();
        setCandidates(candidatesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setActivePage('Jobs');
  };

  const handleBackToJobList = () => {
    setSelectedJob(null);
    setActivePage('Jobs');
  };

  const handleNavClick = (page: 'Dashboard' | 'Jobs' | 'Candidates' | 'Calendar') => {
    setSelectedJob(null);
    setSelectedCandidate(null);
    setActivePage(page);
  };
  
  const handleSelectCandidate = (candidate: Candidate) => {
    console.log('Selected candidate:', candidate);
    setSelectedCandidate(candidate);
  };

  const handleBackFromCandidate = () => {
    setSelectedCandidate(null);
  };

  const handleAddJob = (newJob: Job) => {
    setJobs(prevJobs => [newJob, ...prevJobs]);
  };

  const handleUpdateJob = (updatedJob: Job) => {
    setJobs(prevJobs => prevJobs.map(job => job.id === updatedJob.id ? updatedJob : job));
    if (selectedJob?.id === updatedJob.id) {
        setSelectedJob(updatedJob);
    }
  };
  
  // Use candidates from backend
  const allCandidates = candidates;

  const renderMainContent = () => {
      if (selectedCandidate) {
        return <CandidateDetailPage key={selectedCandidate.id} candidate={selectedCandidate} onBack={handleBackFromCandidate} />;
      }

      if (activePage === 'Dashboard') {
        return <DashboardPage jobs={jobs} onSelectJob={handleSelectJob} />;
      }
      
      if (activePage === 'Calendar') {
        return <CalendarPage jobs={jobs} />;
      }

      if (activePage === 'Candidates') {
          return <AllCandidatesPage allCandidates={allCandidates} onSelectCandidate={handleSelectCandidate} />;
      }

      if (activePage === 'Jobs') {
        if (!selectedJob) {
          return <JobsListPage 
                    onSelectJob={handleSelectJob} 
                    jobs={jobs}
                    onAddJob={handleAddJob}
                 />;
        } else {
          return <JobDashboardPage 
                    key={selectedJob.id}
                    job={selectedJob} 
                    onSelectCandidate={handleSelectCandidate}
                    onBackToJobList={handleBackToJobList}
                    onUpdateJob={handleUpdateJob}
                 />;
        }
      }
      
      return null;
  };

  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                <p className="text-xl font-semibold text-slate-700">Loading Dashboard...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      <Sidebar 
        onDashboardClick={() => handleNavClick('Dashboard')}
        onJobsClick={() => handleNavClick('Jobs')} 
        onCandidatesClick={() => handleNavClick('Candidates')}
        onCalendarClick={() => handleNavClick('Calendar')}
        activeItem={activePage} 
      />
      {renderMainContent()}
    </div>
  );
}
