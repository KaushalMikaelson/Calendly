import React, { useRef, useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Link2, CalendarDays, Clock, Users, Workflow, LayoutGrid, Route, CircleDollarSign, BarChart2, Shield, HelpCircle, ChevronLeft, Plus, Menu, X } from 'lucide-react';
import CreateDropdown from '../CreateDropdown';

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

function Sidebar({ collapsed, onToggle }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const createBtnRef = useRef(null);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Menu Toggle Button - Visible only on small screens */}
      <button 
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-50 bg-[#006BFF] text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          bg-white border-r border-[#E5E7EB] flex flex-col h-full shrink-0 shadow-[1px_0_10px_rgba(0,0,0,0.02)]
          fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          width: collapsed ? 64 : 240,
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), transform 0.3s ease-in-out',
          overflow: 'hidden',
        }}
      >
        {/* Header Logo Area */}
        <div
          className="px-3 py-6 flex items-center mb-2"
          style={{ justifyContent: collapsed ? 'center' : 'space-between' }}
        >
          <div className="flex items-center gap-2 overflow-hidden" style={{ minWidth: 0 }}>
            <div
              className="w-8 h-8 rounded-full bg-[#006BFF] flex items-center justify-center text-white scale-90 relative overflow-hidden shrink-0"
              style={{ marginLeft: collapsed ? 'auto' : undefined, marginRight: collapsed ? 'auto' : undefined }}
            >
              <div className="w-4 h-4 rounded-full border-[3px] border-white"></div>
              <div className="absolute top-1/2 left-1/2 w-4 h-1 bg-white scale-x-[2.5] -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <span
              className="text-[22px] font-extrabold tracking-tight text-[#006BFF] whitespace-nowrap"
              style={{
                opacity: collapsed ? 0 : 1,
                width: collapsed ? 0 : 'auto',
                overflow: 'hidden',
                transition: 'opacity 0.15s, width 0.22s',
              }}
            >
              Calendly
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!collapsed && (
              <button
                onClick={onToggle}
                className="hidden md:block text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            
            {/* Close Mobile Menu Button */}
            <button
               onClick={() => setMobileOpen(false)}
               className="md:hidden text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="hidden md:flex justify-center mb-2">
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
              title="Expand sidebar"
            >
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>
        )}

        {/* Primary Action — Create button */}
        <div className="px-3 mb-6 relative">
          {collapsed ? (
            <button
              ref={createBtnRef}
              onClick={() => setCreateOpen((v) => !v)}
              className="w-full flex items-center justify-center py-2.5 border border-[#006BFF] text-[#006BFF] rounded-full hover:bg-blue-50 transition-colors shadow-sm"
              title="Create"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          ) : (
            <button
              ref={createBtnRef}
              onClick={() => setCreateOpen((v) => !v)}
              className="w-full flex items-center justify-center gap-2 py-3 border border-[#006BFF] text-[#006BFF] rounded-full hover:bg-blue-50 font-bold text-[14px] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Create
            </button>
          )}

          <CreateDropdown
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            anchorRef={createBtnRef}
            side="left"
          />
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-lg text-[14px] transition-colors ${
                    collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3'
                  } ${
                    isActive
                      ? 'bg-blue-50 text-[#006BFF] font-bold'
                      : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${item.iconClass || ''} ${isActive ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                    {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Upgrade Plan */}
          <div className="mt-4 px-0">
            <NavLink
              to="/upgrade"
              title={collapsed ? 'Upgrade plan' : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-xl border border-blue-200 bg-[#F0F5FF]/50 text-[#006BFF] font-semibold text-[14px] hover:bg-[#F0F5FF] transition-colors ${
                  collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3'
                } ${isActive ? 'bg-[#F0F5FF]' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <CircleDollarSign className="w-[18px] h-[18px] stroke-[1.5] shrink-0" />
                  {!collapsed && <span className="whitespace-nowrap">Upgrade plan</span>}
                </>
              )}
            </NavLink>
          </div>

          <div className="mt-3 space-y-0.5">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center rounded-lg text-[14px] transition-colors ${
                      collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3'
                    } ${
                      isActive
                        ? 'bg-blue-50 text-[#006BFF] font-bold'
                        : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary font-medium'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-[18px] h-[18px] shrink-0 ${item.iconClass || ''} ${isActive ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                      {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-2 pt-3 pb-6 mt-auto">
          <button
            className={`flex items-center w-full text-left rounded-lg text-text-primary hover:bg-gray-50 transition-colors text-[14px] font-bold ${
              collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3'
            }`}
            title={collapsed ? 'Help' : undefined}
          >
            <HelpCircle className="w-[18px] h-[18px] stroke-[2] text-text-muted shrink-0" />
            {!collapsed && (
              <>
                Help
                <ChevronLeft className="w-3.5 h-3.5 ml-auto -rotate-90 text-text-muted stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
