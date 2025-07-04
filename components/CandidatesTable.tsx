
import React from 'react';
import { Candidate } from '../types';

interface CandidatesTableProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
}

export const CandidatesTable = ({ candidates, onSelectCandidate }: CandidatesTableProps) => {
  const tableHeaders = ["Customer Name", "Applied Role", "Phone Number", "Email", "Hiring Progress Stage", "Status"];

  return (
    <div className="w-full">
      <table className="w-full text-sm text-left text-slate-500">
        <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
          <tr>
            {tableHeaders.map(header => (
              <th key={header} scope="col" className="px-6 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => {
            const isComplete = candidate.stage === 'Hired' || candidate.stage === 'Rejected';
            const progressStatus = isComplete ? 'Completed' : 'In Progress';
            const statusStyle = isComplete 
                ? 'bg-green-100/60 text-green-700' 
                : 'bg-orange-100/60 text-orange-700';

            return (
              <tr 
                key={candidate.id} 
                className="bg-white border-b hover:bg-slate-50 cursor-pointer"
                onClick={() => onSelectCandidate(candidate)}
              >
                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                  {candidate.name}
                </td>
                <td className="px-6 py-4">{candidate.appliedRole}</td>
                <td className="px-6 py-4">{candidate.phone || '-'}</td>
                <td className="px-6 py-4">{candidate.email || '-'}</td>
                <td className="px-6 py-4">{candidate.stage}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center justify-center font-semibold text-center text-xs px-3 py-1.5 rounded-md ${statusStyle}`}
                  >
                    {progressStatus}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
