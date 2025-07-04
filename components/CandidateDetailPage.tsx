import React, { useEffect, useState } from 'react';
import { Candidate } from '../types';
import { 
    ArrowLeftIcon, MailIcon, PhoneIcon, LocationIcon, CakeIcon, 
    GenderIcon, LinkedInIcon, TwitterIcon, CodeIcon, BriefcaseIcon, AcademicCapIcon, SparklesIcon,
    BadgeCheckIcon, PaperClipIcon,
} from './Icons';

interface CandidateDetailPageProps {
  candidate: Candidate;
  onBack: () => void;
}

const DetailHeader = ({ onBack }: { onBack: () => void }) => (
    <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-semibold">Back to Candidates</span>
        </button>
    </header>
);

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined }) => (
    value ? <div className="flex items-start gap-3">
        <div className="text-slate-400 mt-0.5">{icon}</div>
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-sm font-medium text-slate-700">{value}</p>
        </div>
    </div> : null
);

const SectionCard = ({ title, children, icon }: { title: string, children: React.ReactNode, icon?: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        {children}
    </div>
);

const allHiringStages = ['OMOED', 'SCREENING', 'TECHNICAL_TEST', 'FINAL_INTERVIEW', 'HIRED/ REJECTED'];
const stageMap: Record<Candidate['stage'], string> = {
    'OMOED': 'OMOED',
    'SCREENING': 'SCREENING',
    'TECHNICAL_TEST': 'TECHNICAL_TEST',
    'FINAL_INTERVIEW': 'FINAL_INTERVIEW',
    'HIRED': 'HIRED/ REJECTED',
    'REJECTED': 'HIRED/ REJECTED',
};

const StageScoreItem = ({ stage, score }: { stage: string, score: string | number | undefined }) => {
    const displayScore = score ?? '--';
    const isPercentile = typeof score === 'string' && score.includes('%');
    
    return (
        <div className="flex justify-between items-center text-sm py-2.5 border-b border-slate-100 last:border-b-0">
            <span className="font-medium text-slate-600">{stage}</span>
            {isPercentile ? (
                 <span className="font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md">{displayScore}</span>
            ) : (
                <span className="font-semibold text-slate-800">{typeof score === 'number' ? `${displayScore}/100` : displayScore}</span>
            )}
        </div>
    );
};

export const CandidateDetailPage = ({ candidate, onBack }: CandidateDetailPageProps): React.ReactNode => {
    const [fullCandidate, setFullCandidate] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('Fetching candidate with id:', candidate.id);
        async function fetchCandidate() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:3000/api/candidates?id=${candidate.id}`);
                if (!res.ok) throw new Error('Failed to fetch candidate');
                const data = await res.json();
                const result = Array.isArray(data) ? data[0] : data;
                setFullCandidate(result);
                console.log('Fetched candidate data:', result);
            } catch (err: any) {
                setError(err.message || 'Unknown error');
                setFullCandidate(candidate); // fallback to prop
            } finally {
                setLoading(false);
            }
        }
        fetchCandidate();
    }, [candidate.id]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-slate-50"><p className="text-xl font-semibold text-slate-700">Loading candidate details...</p></div>;
    }
    if (error) {
        return <div className="flex h-screen items-center justify-center bg-slate-50"><p className="text-xl font-semibold text-red-600">{error}</p></div>;
    }
    if (!fullCandidate) return null;

    const currentStageName = stageMap[fullCandidate.stage] || allHiringStages[0];
    let currentStageIndex = allHiringStages.indexOf(currentStageName);

    if (fullCandidate.stage === 'HIRED') {
        currentStageIndex = allHiringStages.length;
    }

    const getScoreForStage = (candidate: Candidate, stage: string): number | undefined => {
        const stageData = candidate.stageMarks?.[stage];
        if (!stageData) return undefined;

        const evaluations = Object.values(stageData);
        if (evaluations.length > 0 && evaluations[0].mark !== undefined) {
            // For simplicity, returning the first evaluator's mark.
            // A more complex implementation could average them.
            return evaluations[0].mark;
        }
        return undefined;
    };


    return (
        <div className="min-h-screen bg-slate-50">
            <DetailHeader onBack={onBack} />
            <main className="p-4 md:p-8">
                <div className="grid grid-cols-12 gap-8">
                    {/* Left Column */}
                    <div className="col-span-12 lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 text-center">
                            <img src={fullCandidate.avatarUrl} alt={fullCandidate.name} className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-white shadow-md" />
                            <h2 className="text-2xl font-bold text-slate-800">{fullCandidate.name}</h2>
                            <p className="text-slate-500 mb-4">{fullCandidate.stage}</p>
                            <div className="flex justify-center gap-4 text-sm text-slate-600 mb-4">
                                {fullCandidate.matchPercentage && <span><strong>{fullCandidate.matchPercentage}%</strong> matched</span>}
                                {fullCandidate.yearsExperience && <span><strong>{fullCandidate.yearsExperience}</strong> years</span>}
                            </div>
                            <p className="text-xs text-slate-400">Applied on {fullCandidate.appliedDate} via {fullCandidate.appliedVia}</p>
                            <div className="flex gap-2 mt-6">
                                <button className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-200 transition">Message</button>
                                <button className="flex-1 bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-900 transition">Schedule Interview</button>
                            </div>
                        </div>
                        
                        <SectionCard title="Personal Info">
                            <div className="space-y-4">
                                <InfoItem icon={<GenderIcon className="w-5 h-5"/>} label="Gender" value={fullCandidate.personalInfo?.gender} />
                                <InfoItem icon={<CakeIcon className="w-5 h-5"/>} label="Date of Birth" value={fullCandidate.personalInfo?.dob} />
                                <InfoItem icon={<MailIcon className="w-5 h-5"/>} label="Email Address" value={fullCandidate.personalInfo?.email} />
                                <InfoItem icon={<PhoneIcon className="w-5 h-5"/>} label="Phone Number" value={fullCandidate.personalInfo?.phone} />
                                <InfoItem icon={<LocationIcon className="w-5 h-5"/>} label="Address" value={fullCandidate.personalInfo?.address} />
                            </div>
                        </SectionCard>
                         <SectionCard title="Social Links">
                            <div className="flex gap-3">
                                <a href={fullCandidate.socialLinks?.linkedin} className="text-slate-400 hover:text-blue-600"><LinkedInIcon className="w-6 h-6"/></a>
                                <a href={fullCandidate.socialLinks?.github} className="text-slate-400 hover:text-slate-800"><CodeIcon className="w-6 h-6"/></a>
                                <a href={fullCandidate.socialLinks?.twitter} className="text-slate-400 hover:text-sky-500"><TwitterIcon className="w-6 h-6"/></a>
                            </div>
                        </SectionCard>
                         <SectionCard title="Language">
                            <div className="space-y-2">
                                {fullCandidate.languages?.map(lang => (
                                    <div key={lang.name} className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700">{lang.name}</span>
                                        <span className="text-slate-500">{lang.proficiency}</span>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                        <SectionCard title="Interest">
                           <div className="flex flex-wrap gap-2">
                                {fullCandidate.interests?.map(interest => (
                                    <span key={interest} className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">{interest}</span>
                                ))}
                            </div>
                        </SectionCard>
                    </div>

                    {/* Middle Column */}
                    <div className="col-span-12 lg:col-span-6">
                       <SectionCard title="Hiring Progress">
                           <div className="flex items-center pt-4 pb-8">
                                {allHiringStages.map((stage, index) => {
                                    const isActive = index === currentStageIndex;
                                    const isCompleted = index < currentStageIndex;
                                    const isLast = index === allHiringStages.length - 1;

                                    return (
                                        <div key={stage} className={`flex-1 flex items-center ${isLast ? 'flex-grow-0' : ''}`}>
                                            <div className="relative">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full z-10
                                                    ${isActive ? 'bg-green-500 text-white ring-4 ring-green-200' : ''}
                                                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                                                    ${!isActive && !isCompleted ? 'bg-slate-200 text-slate-500' : ''}`}>
                                                    {isCompleted ? (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                    ) : (
                                                        <span className="font-bold">{index + 1}</span>
                                                    )}
                                                </div>
                                                <p className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 w-26 text-center text-xs font-semibold leading-tight ${isActive ? 'text-green-600' : 'text-slate-500'} ${isActive ? 'text-green-600' : 'text-slate-500'}`}>{stage}</p>
                                            </div>
                                            {!isLast && <div className={`flex-1 h-0.5 -mx-1 ${isCompleted ? 'bg-green-500' : 'bg-slate-200'}`}></div>}
                                        </div>
                                    );
                                })}
                            </div>
                       </SectionCard>
                       <SectionCard title="Overview">
                           <p className="text-slate-600 leading-relaxed">{fullCandidate.overview}</p>
                       </SectionCard>
                       <SectionCard title="Experience" icon={<BriefcaseIcon className="w-6 h-6 text-slate-500"/>}>
                            {fullCandidate.experience?.map((job, index) => (
                                <div key={index} className="flex gap-4 relative">
                                    <div className={`absolute left-5 top-5 h-full border-l-2 ${index === (fullCandidate.experience?.length ?? 0) -1 ? 'border-transparent' : 'border-slate-200'}`}></div>
                                    <div className="flex flex-col items-center z-10">
                                        <div className="w-10 h-10 p-1.5 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                                            <img src={job.logoUrl} alt={`${job.company} logo`} className="w-full h-full object-contain"/>
                                        </div>
                                    </div>
                                    <div className="pb-8 flex-1">
                                        <p className="font-semibold text-slate-800">{job.title}</p>
                                        <p className="text-sm text-slate-500">{job.company} &middot; {job.period}</p>
                                        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-slate-600">
                                            {job.description.map((desc, i) => <li key={i}>{desc}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                       </SectionCard>
                       <SectionCard title="Education" icon={<AcademicCapIcon className="w-6 h-6 text-slate-500"/>}>
                            {fullCandidate.education?.map((edu, index) => (
                               <div key={index} className="flex gap-4 pb-4">
                                   <div className="w-10 h-10 flex-shrink-0 bg-slate-100 rounded-lg flex items-center justify-center">
                                      <AcademicCapIcon className="w-6 h-6 text-slate-400"/>
                                   </div>
                                   <div>
                                     <p className="font-semibold text-slate-800">{edu.institution}</p>
                                     <p className="text-sm text-slate-500">{edu.degree} &middot; {edu.period}</p>
                                   </div>
                               </div>
                            ))}
                       </SectionCard>
                       <SectionCard title="Skills" icon={<SparklesIcon className="w-6 h-6 text-slate-500"/>}>
                           <div className="flex flex-wrap gap-2">
                                {fullCandidate.skills?.map(skill => (
                                    <span key={skill} className="bg-indigo-100 text-indigo-700 text-sm font-medium px-3 py-1.5 rounded-lg">{skill}</span>
                                ))}
                            </div>
                       </SectionCard>
                        <SectionCard title="Certification" icon={<BadgeCheckIcon className="w-6 h-6 text-slate-500"/>}>
                           <div className="space-y-3">
                                {fullCandidate.certifications?.map(cert => (
                                    <div key={cert.name} className="flex items-center gap-3">
                                        <BadgeCheckIcon className="w-6 h-6 text-green-500"/>
                                        <p className="font-medium text-slate-700">{cert.name}</p>
                                    </div>
                                ))}
                            </div>
                       </SectionCard>
                    </div>

                    {/* Right Column */}
                    <div className="col-span-12 lg:col-span-3">
                        <SectionCard title="Score Breakdown">
                            <div className="text-center mb-6">
                                <p className="text-5xl font-bold text-slate-800">{fullCandidate.score}%</p>
                                <p className="text-slate-500">Overall Score</p>
                            </div>
                            <div className="space-y-1">
                                <StageScoreItem stage="OMOED" score={fullCandidate.percentileScore} />
                                <StageScoreItem stage="SCREENING" score={getScoreForStage(fullCandidate, 'SCREENING')} />
                                <StageScoreItem stage="TECHNICAL_TEST" score={getScoreForStage(fullCandidate, 'TECHNICAL_TEST')} />
                                <StageScoreItem stage="FINAL_INTERVIEW" score={getScoreForStage(fullCandidate, 'FINAL_INTERVIEW')} />
                            </div>
                        </SectionCard>
                        <SectionCard title="Upcoming Schedule">
                           {fullCandidate.upcomingSchedule && (
                               <div>
                                   <p className="font-bold text-slate-800 text-lg">{fullCandidate.upcomingSchedule.title}</p>
                                   <p className="text-sm text-slate-500">{fullCandidate.upcomingSchedule.dateTime}</p>
                                   <p className="text-sm text-slate-500 mt-2">Platform: <span className="font-medium text-slate-700">{fullCandidate.upcomingSchedule.platform}</span></p>
                                   <div className="mt-4">
                                       <p className="text-sm text-slate-500 mb-2">Participants</p>
                                       <div className="flex items-center space-x-2">
                                           {fullCandidate.upcomingSchedule.participants.map(p => (
                                               <img key={p.name} src={p.avatarUrl} alt={p.name} title={p.name} className="w-8 h-8 rounded-full" />
                                           ))}
                                       </div>
                                   </div>
                               </div>
                           )}
                        </SectionCard>
                         <SectionCard title="Job Applied">
                           {fullCandidate.jobApplied && (
                               <div className="space-y-3">
                                   <p className="font-bold text-slate-800 text-lg">{fullCandidate.jobApplied.title}</p>
                                    <div className="flex flex-wrap gap-2">
                                       {fullCandidate.jobApplied.type.map(t => <span key={t} className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">{t}</span>)}
                                   </div>
                                   <p className="text-sm text-slate-600">{fullCandidate.jobApplied.level} &middot; {fullCandidate.jobApplied.experience}</p>
                                   <p className="font-semibold text-slate-800">{fullCandidate.jobApplied.salary}</p>
                                   <button className="text-sm text-indigo-600 font-semibold hover:underline">See Details</button>
                               </div>
                           )}
                        </SectionCard>
                         <SectionCard title="Attachments">
                            <div className="space-y-2">
                                {fullCandidate.attachments?.map(att => (
                                   <a href="#" key={att.fileName} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                                       <PaperClipIcon className="w-5 h-5 text-slate-500"/>
                                       <span className="text-sm font-medium text-slate-700">{att.fileName}</span>
                                       <span className="text-xs text-slate-400 ml-auto">{att.type}</span>
                                   </a>
                                ))}
                            </div>
                        </SectionCard>
                    </div>
                </div>
            </main>
        </div>
    );
};
