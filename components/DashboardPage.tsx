import React, { useMemo } from 'react';
import { Job, Candidate } from '../types';
import { BadgeCheckIcon, JobsIcon, BuildingOfficeIcon, LocationIcon } from './Icons';

interface DashboardPageProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
}

const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: number | string }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80 flex items-center gap-5">
        <div className="bg-slate-100 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-slate-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const PIE_CHART_COLORS = ['#4338ca', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];

const HiringPipelineDonutChart = ({ data, totalCandidates }: { data: { [key: string]: number }, totalCandidates: number }) => {
    const pipelineEntries = Object.entries(data);

    if (totalCandidates === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[180px]">
                <p className="text-slate-500">No candidates in the pipeline yet.</p>
            </div>
        );
    }
    
    let cumulativePercentage = 0;
    const gradientParts = pipelineEntries.map(([_, count], index) => {
        const percentage = totalCandidates > 0 ? (count / totalCandidates) * 100 : 0;
        const part = `${PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} ${cumulativePercentage}% ${cumulativePercentage + percentage}%`;
        cumulativePercentage += percentage;
        return part;
    });
    const conicGradient = `conic-gradient(${gradientParts.join(', ')})`;

    return (
        <div className="flex flex-col md:flex-row items-center gap-8 h-full">
            <div className="relative flex-shrink-0">
                <div 
                    className="w-44 h-44 rounded-full"
                    style={{ background: conicGradient }}
                    role="img"
                    aria-label="Hiring pipeline donut chart"
                ></div>
                <div className="absolute inset-5 bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800">{totalCandidates}</span>
                    <span className="text-sm text-slate-500">Candidates</span>
                </div>
            </div>
            <div className="space-y-3 w-full">
                {pipelineEntries.map(([stage, count], index) => (
                    <div key={stage} className="flex items-center gap-3 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] }}></div>
                        <span className="font-medium text-slate-600">{stage}</span>
                        <span className="font-bold text-slate-800 ml-auto">{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MonthlyActivityBarChart = ({ data, maxCount }: { data: { [key: string]: { applicants: number, hired: number, monthName: string }}, maxCount: number }) => {
    return (
        <div className="h-64 flex items-end justify-around gap-2">
            {Object.entries(data).map(([monthKey, monthData]) => {
                const applicantHeight = maxCount > 0 ? (monthData.applicants / maxCount) * 100 : 0;
                const hiredHeight = maxCount > 0 ? (monthData.hired / maxCount) * 100 : 0;

                return (
                    <div key={monthKey} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div className="flex items-end h-full w-full justify-center gap-1.5" style={{ height: 'calc(100% - 2rem)' }}>
                            <div className="relative group w-1/3 h-full flex items-end">
                                <div className="bg-blue-200 hover:bg-blue-400 w-full rounded-t-md transition-colors" style={{ height: `${applicantHeight}%` }}></div>
                                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{monthData.applicants} Applicants</div>
                            </div>
                             <div className="relative group w-1/3 h-full flex items-end">
                                <div className="bg-indigo-300 hover:bg-indigo-500 w-full rounded-t-md transition-colors" style={{ height: `${hiredHeight}%` }}></div>
                                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{monthData.hired} Hired</div>
                            </div>
                        </div>
                        <p className="text-xs font-medium text-slate-500">{monthData.monthName}</p>
                    </div>
                );
            })}
        </div>
    );
}

const UpcomingInterviewsList = ({ interviews }: { interviews: { candidate: Candidate, job?: Job }[] }) => {
    if (interviews.length === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[180px]">
                <p className="text-slate-500">No upcoming interviews scheduled.</p>
            </div>
        );
    }
    return (
        <div className="space-y-4">
            {interviews.map(({ candidate, job }) => (
                <div key={candidate.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <img src={candidate.avatarUrl} alt={candidate.name} className="w-11 h-11 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{candidate.name}</p>
                        <p className="text-xs text-slate-500 truncate">{candidate.upcomingSchedule!.title} for {job?.title || 'N/A'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                         <p className="text-sm font-medium text-slate-700">{new Date(candidate.upcomingSchedule!.dateTime.replace(' -', ',')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        <p className="text-xs text-slate-500">{new Date(candidate.upcomingSchedule!.dateTime.replace(' -', ',')).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const DashboardPage = ({ jobs, onSelectJob }: DashboardPageProps) => {

    const {
        totalJobs,
        activeJobs,
        totalCandidates,
        hiredCandidates,
        pipelineData,
        monthlyActivityData,
        recentJobs,
        upcomingInterviews,
    } = useMemo(() => {
        const allCandidates = jobs.flatMap(j => j.candidates || []);
        
        const pipelineCounts: { [key: string]: number } = {
            'OMOED': 0, 'SCREENING': 0, 'TECHNICAL_TEST': 0, 'FINAL_INTERVIEW': 0,
        };
        allCandidates.forEach(c => {
            if (c.stage in pipelineCounts) pipelineCounts[c.stage]++;
        });
        
        const monthlyStats: { [key: string]: { applicants: number, hired: number, monthName: string }} = {};
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyStats[monthKey] = { applicants: 0, hired: 0, monthName: d.toLocaleString('default', { month: 'short' }) };
        }

        allCandidates.forEach(c => {
            if (c.appliedDate) {
                try {
                    const appliedDate = new Date(c.appliedDate.replace(/-/g, '/'));
                    if (!isNaN(appliedDate.getTime())) {
                        const monthKey = `${appliedDate.getFullYear()}-${String(appliedDate.getMonth() + 1).padStart(2, '0')}`;
                        if (monthlyStats[monthKey]) {
                            monthlyStats[monthKey].applicants++;
                            if (c.stage === 'HIRED') monthlyStats[monthKey].hired++;
                        }
                    }
                } catch (e) { /* Ignore invalid date formats */ }
            }
        });

        const maxMonthlyCount = Math.max(...Object.values(monthlyStats).flatMap(m => [m.applicants, m.hired]), 1);
        const sortedJobs = [...jobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        const interviews = allCandidates
            .filter(c => c.upcomingSchedule)
            .map(c => ({
                candidate: c,
                job: jobs.find(j => j.candidates.some(cand => cand.id === c.id))
            }))
            .sort((a, b) => {
                try {
                    const dateA = new Date(a.candidate.upcomingSchedule!.dateTime.replace(' -', ',')).getTime();
                    const dateB = new Date(b.candidate.upcomingSchedule!.dateTime.replace(' -', ',')).getTime();
                    if (isNaN(dateA) || isNaN(dateB)) return 0;
                    return dateA - dateB;
                } catch { return 0; }
            });

        return {
            totalJobs: jobs.length,
            activeJobs: jobs.filter(j => j.status === 'ACTIVE').length,
            totalCandidates: allCandidates.length,
            hiredCandidates: allCandidates.filter(c => c.stage === 'HIRED').length,
            pipelineData: pipelineCounts,
            monthlyActivityData: { stats: monthlyStats, maxCount: maxMonthlyCount },
            recentJobs: sortedJobs.slice(0, 5),
            upcomingInterviews: interviews.slice(0, 4),
        };
    }, [jobs]);

    const totalPipelineCandidates = Object.values(pipelineData).reduce((sum, count) => sum + count, 0);

    return (
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-slate-500">
                            <path d="M12 12h.01"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M22 13a18.15 18.15 0 0 1-20 0"/><rect width="20" height="14" x="2" y="6" rx="2"/>
                        </svg>
                    } 
                    title="Total Jobs" 
                    value={totalJobs} 
                />
                <StatCard icon={<JobsIcon className="w-6 h-6 text-slate-500"/>} title="Active Jobs" value={activeJobs} />
                <StatCard 
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-slate-500">
                            <path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/>
                        </svg>
                    } 
                    title="Total Candidates" 
                    value={totalCandidates} 
                />
                <StatCard icon={<BadgeCheckIcon className="w-6 h-6 text-slate-500"/>} title="Hired Candidates" value={hiredCandidates} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 mb-8">
                <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Hiring Pipeline</h2>
                    <HiringPipelineDonutChart data={pipelineData} totalCandidates={totalPipelineCandidates} />
                </div>
                <div className="xl:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Monthly Activity</h2>
                            <p className="text-sm text-slate-500">Applicants vs. Hired in the last 6 months.</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-blue-200"></div>
                                <span className="text-slate-600">Applicants</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-indigo-300"></div>
                                <span className="text-slate-600">Hired</span>
                            </div>
                        </div>
                    </div>
                    <MonthlyActivityBarChart data={monthlyActivityData.stats} maxCount={monthlyActivityData.maxCount} />
                </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Upcoming Interviews</h2>
                    <UpcomingInterviewsList interviews={upcomingInterviews} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                     <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Jobs</h2>
                     <div className="space-y-4">
                        {recentJobs.length > 0 ? recentJobs.map(job => (
                            <div 
                                key={job.id} 
                                onClick={() => onSelectJob(job)}
                                className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                                <p className="font-semibold text-slate-800">{job.title}</p>
                                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                                    <span className="flex items-center gap-1.5"><BuildingOfficeIcon className="w-3.5 h-3.5"/>{job.department}</span>
                                    <span className="flex items-center gap-1.5"><LocationIcon className="w-3.5 h-3.5"/>{job.location}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="flex items-center justify-center h-full min-h-[180px]">
                                <p className="text-slate-500">No jobs posted recently.</p>
                            </div>
                        )}
                     </div>
                </div>
            </div>

        </main>
    );
};