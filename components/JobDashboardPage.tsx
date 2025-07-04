import React, { useState, useCallback } from 'react';
import { Header } from './Header';
import { KanbanBoard } from './KanbanBoard';
import { ChatInput } from './ChatInput';
import { JobDetailsPage } from './JobDetailsPage';
import { NewApplicantModal } from './NewApplicantModal';
import { CandidateHiringDrawer } from './CandidateHiringDrawer';
import { EvaluationResultsPage } from './EvaluationResultsPage';
import { callGeminiApi } from '../services/geminiService';
import { Candidate, HiringStage, Job, SmarsEvaluation, Point } from '../types';
import { ChatWidget } from './ChatWidget';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';

type ActiveTab = 'Job Details' | 'Applicants';

const STAGE_ORDER: Candidate['stage'][] = ['OMOED', 'SCREENING', 'TECHNICAL_TEST', 'FINAL_INTERVIEW'];

const generateMockEvaluation = (fileName: string, jobTitle: string): SmarsEvaluation => {
  const name = fileName
    .split('.')[0]
    .replace(/[_-]/g, ' ')
    .replace(/resume/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const hr = Math.floor(Math.random() * 30) + 70; // 70-99
  const tech = Math.floor(Math.random() * 40) + 60; // 60-99
  const culture = Math.floor(Math.random() * 35) + 65; // 65-99
  const overallScore = Math.round((hr + tech + culture) / 3);

  const points: Point[] = [
    { text: "Strong alignment with required technical skills.", status: 'positive' },
    { text: "Impressive project history with clear impact.", status: 'positive' },
    { text: "Experience years match the job requirements well.", status: 'positive' },
    { text: "Resume is well-structured and easy to read.", status: 'neutral' },
    { text: "Some mentioned technologies are not on our primary stack.", status: 'neutral' },
    { text: "Lacks explicit mention of collaboration tools.", status: 'negative' },
  ];

  // Select a few random points
  const selectedPoints: Point[] = [];
  const numPoints = Math.floor(Math.random() * 2) + 3; // 3 to 4 points
  const shuffledPoints = [...points].sort(() => 0.5 - Math.random());
  for (let i = 0; i < numPoints; i++) {
      selectedPoints.push(shuffledPoints[i]);
  }

  return {
    name: name || "Sample Candidate",
    role: `Applicant for ${jobTitle}`,
    scores: { hr, tech, culture },
    overallScore,
    points: selectedPoints,
  };
};

interface JobDashboardPageProps {
  job: Job;
  onSelectCandidate: (candidate: Candidate) => void;
  onBackToJobList: () => void;
  onUpdateJob: (job: Job) => void;
}

export default function JobDashboardPage({ job, onSelectCandidate, onBackToJobList, onUpdateJob }: JobDashboardPageProps): React.ReactNode {
  const [activeTab, setActiveTab] = useState<ActiveTab>('Applicants');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hiringProgressCandidate, setHiringProgressCandidate] = useState<Candidate | null>(null);
  const [evaluationResults, setEvaluationResults] = useState<SmarsEvaluation[] | null>(null);
  const [applicantSearchQuery, setApplicantSearchQuery] = useState('');
  
  const [isChatboxOpen, setIsChatboxOpen] = useState(false);
  const [isChatboxMinimized, setIsChatboxMinimized] = useState(false);
  const [chatQuery, setChatQuery] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState<Job>(job);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [schedulingCandidate, setSchedulingCandidate] = useState<Candidate | null>(null);

  const STAGE_TRANSITIONS: Partial<Record<Candidate['stage'], Candidate['stage']>> = {
    'OMOED': 'SCREENING',
    'SCREENING': 'TECHNICAL_TEST',
    'TECHNICAL_TEST': 'FINAL_INTERVIEW',
  };

  // Map/flatten candidate fields for card display
  const mappedCandidates = job.candidates.map(c => ({
    ...c,
    stage: c.stage || (c as any).currentStage || '',
    appliedRole: c.appliedRole || (c as any).appliedJobs?.[0]?.job?.title || '',
    phone: c.phone || c.personalInfo?.phone || '',
    email: c.email || c.personalInfo?.email || '',
    status: c.status || (c as any).status || (c as any).currentStatus || '',
  }));

  const handleScheduleClick = (candidateToSchedule: Candidate) => {
    setSchedulingCandidate(candidateToSchedule);
  };
  
  const handleConfirmSchedule = (details: { date: string; time: string; platform: string }) => {
    if (!schedulingCandidate) return;

    const nextStage = STAGE_TRANSITIONS[schedulingCandidate.stage];
    if (!nextStage) {
        console.warn(`No next stage defined for stage: ${schedulingCandidate.stage}`);
        setSchedulingCandidate(null);
        return;
    }

    const { date, time, platform } = details;
    
    const dateObj = new Date(`${date}T${time}`);
    const month = dateObj.toLocaleString('en-US', { month: 'short' });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    const timeStr = dateObj.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const dateTime = `${month} ${day}, ${year}, ${timeStr}`;

    const updatedCandidate: Candidate = {
        ...schedulingCandidate,
        stage: nextStage,
        upcomingSchedule: {
            title: `${nextStage}`,
            dateTime: dateTime,
            platform: platform,
            participants: [
                { name: 'Lee Wei Song', role: 'Lead HR', avatarUrl: 'https://picsum.photos/id/433/100/100' }
            ]
        }
    };

    const updatedCandidates = job.candidates.map(c => 
        c.id === updatedCandidate.id ? updatedCandidate : c
    );
    const updatedJob = { ...job, candidates: updatedCandidates };
    onUpdateJob(updatedJob);
    
    if (hiringProgressCandidate?.id === updatedCandidate.id) {
        setHiringProgressCandidate(updatedCandidate);
    }
    
    // Close the scheduling modal automatically upon confirmation.
    setSchedulingCandidate(null);
  };
  
  const handleApplicantSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApplicantSearchQuery(e.target.value);
  };

  const handleJobInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'requirements' || name === 'responsibilities') {
        setEditedJob(prev => ({ ...prev, [name]: value.split('\n').filter(line => line.trim() !== '') }));
    } else {
        setEditedJob(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSaveChanges = useCallback(() => {
    onUpdateJob(editedJob);
    setIsEditing(false);
  }, [editedJob, onUpdateJob]);

  const handleCancelEdit = useCallback(() => {
    setEditedJob(job);
    setIsEditing(false);
  }, [job]);

  const handleQuerySubmit = useCallback(async (newQuery: string) => {
    if (!newQuery.trim() || isLoading) return;

    setIsLoading(true);
    setAiResponse('');
    setChatQuery(newQuery);
    setIsChatboxOpen(true);
    setIsChatboxMinimized(false);

    try {
      const response = await callGeminiApi(newQuery, mappedCandidates);
      setAiResponse(response);
    } catch (error) {
      console.error('Error querying Gemini API:', error);
      setAiResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  }, [isLoading, mappedCandidates]);

  const handleSelectCandidateById = (candidateId: string) => {
    onSelectCandidate({ id: candidateId } as Candidate);
  };

  const handleShowHiringProgress = (candidate: Candidate) => {
    setHiringProgressCandidate(candidate);
  };

  const handleCloseHiringProgress = () => {
    setHiringProgressCandidate(null);
  }

  const handleUpdateCandidateInJob = (updatedCandidate: Candidate) => {
    // Calculate new overall score from all available marks
    const allMarks: number[] = [];
    if (updatedCandidate.stageMarks) {
        Object.values(updatedCandidate.stageMarks).forEach(stage => {
            Object.values(stage).forEach(evaluation => {
                if (typeof evaluation.mark === 'number') {
                    allMarks.push(evaluation.mark);
                }
            });
        });
    }

    if (allMarks.length > 0) {
        const sum = allMarks.reduce((a, b) => a + b, 0);
        updatedCandidate.score = Math.round(sum / allMarks.length);
    } else {
        // If there are no marks, we might want to reset the score or handle it.
        // For now, we leave the original score until a mark is given.
    }
    
    const updatedCandidates = job.candidates.map(c => 
        c.id === updatedCandidate.id ? updatedCandidate : c
    );
    const updatedJob = { ...job, candidates: updatedCandidates };
    onUpdateJob(updatedJob);
    
    // Also update the local state for the drawer if it's open
    if (hiringProgressCandidate?.id === updatedCandidate.id) {
        setHiringProgressCandidate(updatedCandidate);
    }
  };
  
  const handleStartEvaluation = async (resumes: File[]) => {
    if (resumes.length === 0) return;
    setIsEvaluating(true);

    // Simulate API call delay for a better UX
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const allEvaluations: SmarsEvaluation[] = resumes.map(file => 
        generateMockEvaluation(file.name, job.title)
      );
      
      setEvaluationResults(allEvaluations);

    } catch (error) {
      console.error("Failed to process mock resumes:", error);
      alert("There was an error evaluating the mock resumes. Please try again.");
    } finally {
      setIsEvaluating(false);
      setIsModalOpen(false);
    }
  };

  const handleConfirmEvaluation = (evaluations: SmarsEvaluation[]) => {
      const sortedEvaluations = [...evaluations].sort((a, b) => b.overallScore - a.overallScore);
      const totalEvaluations = sortedEvaluations.length;

      // Create candidate objects for all evaluations to calculate percentiles correctly
      const allNewCandidates = sortedEvaluations.map((evalData, index): Candidate => {
        const rank = index + 1;
        const percentileOfBatch = (totalEvaluations - rank + 1) / totalEvaluations * 100;
        
        let percentileScore = 'Bottom 50%';
        if (percentileOfBatch >= 95) percentileScore = 'Top 5%';
        else if (percentileOfBatch >= 90) percentileScore = 'Top 10%';
        else if (percentileOfBatch >= 80) percentileScore = 'Top 20%';
        else if (percentileOfBatch >= 50) percentileScore = 'Top 50%';

        return {
          id: Date.now() + index,
          name: evalData.name,
          role: evalData.role,
          avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(evalData.name)}`,
          score: Math.round(evalData.overallScore),
          points: [], // Old points field, not used in Omo-ed card
          stage: 'OMOED',
          appliedRole: job.title,
          appliedDate: new Date().toISOString().split('T')[0],
          summaryPoints: evalData.points,
          percentileScore: percentileScore,
        };
      });

      // Per existing logic, only add top 20% of candidates to the board
      const top20PercentCount = Math.ceil(sortedEvaluations.length * 0.20);
      const candidatesToAdd = allNewCandidates.slice(0, top20PercentCount);
      
      const updatedJob = {
          ...job,
          candidates: [...job.candidates, ...candidatesToAdd]
      };
      onUpdateJob(updatedJob);

      setEvaluationResults(null);
  };

  const handleCancelEvaluation = () => {
      setEvaluationResults(null);
  };

  const handleRejectCandidate = (candidateId: string) => {
    const updatedCandidates = mappedCandidates.map(c => 
        c.id === candidateId ? { ...c, stage: 'REJECTED' as Candidate['stage'] } : c
    );
    const updatedJob = { ...job, candidates: updatedCandidates };
    onUpdateJob(updatedJob);
    setHiringProgressCandidate(null);
  };

  const renderContent = () => {
    if (activeTab === 'Job Details') {
      return <JobDetailsPage job={editedJob} isEditing={isEditing} onJobChange={handleJobInputChange} />;
    }
    
    if (evaluationResults) {
        return <EvaluationResultsPage evaluations={evaluationResults} onConfirm={handleConfirmEvaluation} onCancel={handleCancelEvaluation} />;
    }

    const filteredCandidates = mappedCandidates.filter(candidate => 
      candidate.name.toLowerCase().includes(applicantSearchQuery.toLowerCase())
    );

    const stages: HiringStage[] = STAGE_ORDER.map(title => ({
        title,
        candidates: filteredCandidates.filter(c => c.stage === title)
    }));
    
    return (
      <KanbanBoard 
        stages={stages} 
        onSelectCandidate={handleSelectCandidateById}
        onCardClick={handleShowHiringProgress}
        onScheduleCandidate={handleScheduleClick}
      />
    );
  };

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-8">
      <Header
        job={job}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewApplicantClick={() => setIsModalOpen(true)}
        onBackToJobList={onBackToJobList}
        isEditing={isEditing}
        onEditClick={() => setIsEditing(true)}
        onSaveClick={handleSaveChanges}
        onCancelClick={handleCancelEdit}
        searchQuery={applicantSearchQuery}
        onSearchChange={handleApplicantSearchChange}
      />
      <div className="flex-1 min-h-0 flex flex-col mt-6">
        {renderContent()}
      </div>
      <div className="mt-8">
        <ChatInput
          query={query}
          setQuery={setQuery}
          onSubmit={handleQuerySubmit}
          isLoading={isLoading}
        />
      </div>

      {isModalOpen && (
        <NewApplicantModal
          onClose={() => setIsModalOpen(false)}
          onStartEvaluation={handleStartEvaluation}
          isProcessing={isEvaluating}
        />
      )}
      {hiringProgressCandidate && (
        <CandidateHiringDrawer
          candidate={hiringProgressCandidate}
          job={job}
          onClose={handleCloseHiringProgress}
          onUpdateCandidate={handleUpdateCandidateInJob}
          onRejectCandidate={handleRejectCandidate}
          onSchedule={handleScheduleClick}
        />
      )}
      {schedulingCandidate && (
        <ScheduleInterviewModal
          onClose={() => setSchedulingCandidate(null)}
          onConfirm={handleConfirmSchedule}
          candidateName={schedulingCandidate.name}
        />
      )}
      <ChatWidget
        isOpen={isChatboxOpen}
        isMinimized={isChatboxMinimized}
        query={chatQuery}
        response={aiResponse}
        isLoading={isLoading}
        onClose={() => setIsChatboxOpen(false)}
        onToggleMinimize={() => setIsChatboxMinimized(!isChatboxMinimized)}
      />
    </div>
  );
}
