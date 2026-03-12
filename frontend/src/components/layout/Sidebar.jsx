import React from 'react';
import { NavLink } from 'react-router-dom';
import { Link2, CalendarDays, Clock, Users, Workflow, LayoutGrid, Route, CircleDollarSign, BarChart2, Shield, HelpCircle, ChevronLeft, Plus } from 'lucide-react';

const mainNavItems = [
  { to: '/dashboard', label: 'Scheduling', icon: Link2, iconClass: 'rotate-45' },
  { to: '/meetings', label: 'Meetings', icon: CalendarDays },
  { to: '/availability', label: 'Availability', icon: Clock },
  { to: '/contacts', label: 'Contacts', icon: Users },
  { to: '/workflows', label: 'Workflows', icon: Workflow },
  { to: '/integrations', label: 'Integrations & apps', icon: LayoutGrid },
  { to: '/routing', label: 'Routing', icon: Route },
];

const bottomNavItems = [
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/admin', label: 'Admin center', icon: Shield },
];

function Sidebar() {
  return (
    <aside className="w-[240px] bg-white border-r border-[#E5E7EB] flex flex-col h-full shrink-0 shadow-[1px_0_10px_rgba(0,0,0,0.02)] hidden md:flex">
      {/* Header Logo Area */}
      <div className="px-6 py-6 flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Calendly 'C' Logo SVG representation */}
          <div className="w-8 h-8 rounded-full bg-[#006BFF] flex items-center justify-center text-white scale-90 relative overflow-hidden">
             <div className="w-4 h-4 rounded-full border-[3px] border-white"></div>
             <div className="absolute top-1/2 left-1/2 w-4 h-1 bg-white scale-x-[2.5] -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
             <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          <span className="text-[22px] font-extrabold tracking-tight text-[#006BFF]">Calendly</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Action */}
      <div className="px-5 mb-6">
        <button className="w-full flex items-center justify-center gap-2 py-3 border border-[#006BFF] text-[#006BFF] rounded-full hover:bg-blue-50 font-bold text-[14px] transition-colors shadow-sm">
          <Plus className="w-4 h-4 stroke-[3]" /> Create
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-[#006BFF] font-bold'
                    : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-[18px] h-[18px] ${item.iconClass || ''} ${isActive ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
        
        {/* Upgrade Plan Banner Link */}
        <div className="mt-4 px-2">
           <NavLink to="/upgrade" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-200 bg-[#F0F5FF]/50 text-[#006BFF] font-semibold text-[14px] hover:bg-[#F0F5FF] transition-colors ${isActive ? 'bg-[#F0F5FF]' : ''}`}>
             <CircleDollarSign className="w-[18px] h-[18px] stroke-[1.5]" /> Upgrade plan
           </NavLink>
        </div>
        
        <div className="mt-3 space-y-0.5">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-[#006BFF] font-bold'
                      : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-[18px] h-[18px] ${item.iconClass || ''} ${isActive ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                    {item.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer Nav */}
      <div className="px-3 pt-3 pb-6 mt-auto">
        <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-text-primary hover:bg-gray-50 transition-colors text-[14px] font-bold">
          <HelpCircle className="w-[18px] h-[18px] stroke-[2] text-text-muted" /> Help <ChevronLeft className="w-3.5 h-3.5 ml-auto -rotate-90 text-text-muted stroke-[2.5]" />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
