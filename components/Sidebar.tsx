
import React from 'react';
import { DashboardIcon, JobsIcon, CandidatesIcon, CalendarIcon } from './Icons';

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

const NavItem = ({ icon, label, active = false, onClick }: NavItemProps): React.ReactNode => (
  <a
    href="#"
    onClick={(e) => {
        e.preventDefault();
        onClick?.();
    }}
    className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
      active
        ? 'bg-indigo-100 text-indigo-700 font-semibold'
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span>{label}</span>
  </a>
);

interface SidebarProps {
    onDashboardClick: () => void;
    onJobsClick: () => void;
    onCandidatesClick: () => void;
    onCalendarClick: () => void;
    activeItem: string;
}

export const Sidebar = ({ onDashboardClick, onJobsClick, onCandidatesClick, onCalendarClick, activeItem }: SidebarProps): React.ReactNode => {
  return (
    <aside className="w-64 bg-white flex-shrink-0 p-6 flex flex-col justify-between shadow-sm">
      <div>
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">Omo</h1>
        </div>
        <nav className="space-y-2">
          <NavItem icon={<DashboardIcon className="h-5 w-5" />} label="Dashboard" active={activeItem === 'Dashboard'} onClick={onDashboardClick} />
          <NavItem icon={<JobsIcon className="h-5 w-5" />} label="Jobs" active={activeItem === 'Jobs'} onClick={onJobsClick} />
          <NavItem icon={<CandidatesIcon className="h-5 w-5" />} label="Candidates" active={activeItem === 'Candidates'} onClick={onCandidatesClick} />
          <NavItem icon={<CalendarIcon className="h-5 w-5" />} label="Calendar" active={activeItem === 'Calendar'} onClick={onCalendarClick} />
        </nav>
      </div>
      <div className="flex items-center space-x-3">
        <img
          className="h-10 w-10 rounded-full object-cover"
          src="https://picsum.photos/id/433/100/100"
          alt="Lee Wei Song"
        />
        <div>
          <p className="font-semibold text-slate-800">Lee Wei Song</p>
          <p className="text-sm text-slate-500">Lead HR</p>
        </div>
      </div>
    </aside>
  );
};