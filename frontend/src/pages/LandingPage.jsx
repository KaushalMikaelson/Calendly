import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  Users,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Globe2
} from 'lucide-react';
import { eventTypesApi } from '../api';
import Skeleton from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

function LandingPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const goDashboard = () => navigate('/dashboard');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await eventTypesApi.getAll();
        const data = res.data || res;
        setEventTypes(data);
      } catch (e) {
        setError(e.message);
        showToast({ message: e.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-text-primary page-enter font-sans selection:bg-blue-primary/20">
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 h-[72px] bg-white/80 backdrop-blur-xl border-b border-border z-50 transition-all">
        <div className="max-w-[1240px] mx-auto h-full flex items-center justify-between px-6 md:px-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-primary flex items-center justify-center text-white font-bold shadow-button group-hover:shadow-button-hover transition-all">
              C
            </div>
            <span className="text-2xl font-bold tracking-tighter text-text-primary">calendly</span>
          </button>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <button type="button" className="text-text-primary hover:text-blue-primary transition-colors">Individuals</button>
            <button type="button" className="text-text-primary hover:text-blue-primary transition-colors">Teams</button>
            <button type="button" className="text-text-primary hover:text-blue-primary transition-colors">Enterprise</button>
          </nav>
          <nav className="hidden md:flex items-center gap-4 text-sm font-semibold">
            <button
              type="button"
              onClick={goDashboard}
              className="px-4 py-2.5 rounded-button text-text-primary hover:bg-gray-50 transition-colors"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={goDashboard}
              className="px-6 py-2.5 rounded-button bg-blue-primary text-white shadow-button hover:shadow-button-hover hover:-translate-y-0.5 transition-all"
            >
              Get started
            </button>
          </nav>
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-text-primary hover:bg-gray-100"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden absolute top-[72px] left-0 right-0 bg-white border-b border-border px-6 py-6 shadow-xl flex flex-col gap-4 animate-slide-up">
            <button type="button" className="text-left font-semibold text-lg hover:text-blue-primary">Individuals</button>
            <button type="button" className="text-left font-semibold text-lg hover:text-blue-primary">Teams</button>
            <button type="button" className="text-left font-semibold text-lg hover:text-blue-primary">Enterprise</button>
            <hr className="border-border my-2" />
            <button
              type="button"
              onClick={goDashboard}
              className="block w-full text-center px-4 py-3 rounded-button border-2 border-border text-lg font-semibold hover:bg-gray-50"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={goDashboard}
              className="block w-full text-center px-4 py-3 rounded-button bg-blue-primary text-white text-lg font-semibold shadow-button"
            >
              Get started
            </button>
          </div>
        )}
      </header>

      <main className="pt-[72px] overflow-hidden">
        {/* Hero Section */}
        <section className="relative px-6 md:px-8 py-20 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-primary/10 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
          
          <h1 className="text-5xl md:text-7xl lg:text-[84px] font-extrabold tracking-tight text-text-primary leading-[1.1] max-w-5xl mx-auto mb-8">
            Easy scheduling <span className="text-blue-primary inline-block">ahead</span>
          </h1>
          <p className="text-lg md:text-2xl text-text-secondary max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Calendly is your hub for scheduling meetings professionally and efficiently, eliminating the hassle of back-and-forth emails so you can get back to work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full sm:w-[320px] h-14 pl-6 pr-4 rounded-full border-2 border-border bg-white text-base focus:outline-none focus:border-blue-primary focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
              />
            </div>
            <button
              type="button"
              onClick={goDashboard}
              className="w-full sm:w-auto h-14 px-8 rounded-full bg-blue-primary text-white text-lg font-bold shadow-button hover:shadow-button-hover hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Sign Up <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-text-muted mt-6 font-medium">
            Create your free account. No credit card required.
          </p>
        </section>

        {/* Mock App Preview Section */}
        <section className="max-w-[1000px] mx-auto px-6 md:px-8 pb-20 md:pb-32 relative">
          <div className="rounded-2xl md:rounded-[32px] bg-white border border-border/80 shadow-[0_20px_80px_rgba(0,0,0,0.08)] overflow-hidden animate-slide-up relative z-10 p-2 md:p-4">
            <div className="bg-gray-50 rounded-xl md:rounded-3xl border border-border h-[400px] md:h-[600px] flex items-center justify-center overflow-hidden">
               {/* Replace this empty block with a more lively visual showing availability */}
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-x-0 bottom-0 top-[20%] bg-gradient-to-t from-white to-transparent z-10" />
                <div className="w-[340px] md:w-[600px] bg-white shadow-modal rounded-2xl border border-border p-6 flex flex-col md:flex-row gap-8 -translate-y-10">
                   <div className="flex-1">
                      <h3 className="text-xl font-bold mb-6">Select a Date & Time</h3>
                      <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center text-sm font-medium">
                        {['S','M','T','W','T','F','S'].map((d, i) => <div key={`day-${i}`} className="text-text-muted">{d}</div>)}
                        {Array.from({ length: 31 }).map((_, i) => (
                           <div key={`date-${i}`} className={`w-8 h-8 md:w-10 md:h-10 mx-auto flex items-center justify-center rounded-full ${i === 14 ? 'bg-blue-primary text-white shadow-button ring-4 ring-blue-100' : 'text-text-primary hover:bg-blue-50 cursor-pointer transition-colors'}`}>
                             {i + 1}
                           </div>
                        ))}
                      </div>
                   </div>
                   <div className="flex-1 border-l border-border pl-8 hidden md:block">
                     <p className="font-semibold mb-4 text-text-primary">Tuesday, 15th</p>
                     <div className="space-y-3">
                       {['09:00am', '10:00am', '11:00am', '01:00pm', '02:30pm'].map((t, idx) => (
                         <div key={t} className={`p-3 text-center rounded-xl border border-blue-primary font-semibold cursor-pointer transition-all ${idx === 2 ? 'bg-text-primary border-text-primary text-white' : 'text-blue-primary hover:bg-blue-50 outline outline-transparent'}`}>
                           {t}
                         </div>
                       ))}
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities grid */}
        <section className="bg-page py-24 md:py-32">
          <div className="max-w-[1240px] mx-auto px-6 md:px-8 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight">
                Simplified scheduling for more than just meetings
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                Whether you're hosting one-on-ones, interviews, or large team events, Calendly makes the coordination seamless.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Globe2, title: 'Share anywhere', desc: 'Link to your calendar anywhere: emails, texts, chats, or embedded on your website.' },
                { icon: Users, title: 'Team scheduling', desc: 'Round robin, collective, and group events make it easy to assemble the right people.' },
                { icon: ShieldCheck, title: 'Secure & reliable', desc: 'Enterprise-grade security trusted by Fortune 500s blocks double-bookings natively.' }
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={`feature-${i}`} className="bg-white rounded-[24px] p-8 shadow-sm border border-border/50 hover:shadow-card-hover transition-all duration-smooth hover:-translate-y-1">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-primary">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-3 tracking-tight">{f.title}</h3>
                    <p className="text-text-secondary leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Popular event types (Dynamic) */}
        <section className="bg-white py-24 md:py-32">
          <div className="max-w-[1240px] mx-auto px-6 md:px-8 text-center space-y-16">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">Popular Event Types</h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">Explore some examples of how our users block their calendars.</p>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <Skeleton className="h-[200px] w-full rounded-2xl" />
                <Skeleton className="h-[200px] w-full rounded-2xl" />
                <Skeleton className="h-[200px] w-full rounded-2xl" />
              </div>
            ) : eventTypes.length === 0 ? (
              <div className="bg-gray-50 rounded-[24px] p-12 border border-dashed border-border text-text-secondary">
                No event types found. You might need to sign in and create them!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {eventTypes.slice(0, 3).map((et) => (
                  <div
                    key={et.id}
                    onClick={() => window.open(`/book/${et.slug}`, '_blank')}
                    className="group bg-white rounded-[24px] border border-border shadow-card p-8 hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-smooth cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: et.color }} />
                    <div className="flex flex-col h-full">
                      <h3 className="text-2xl font-bold text-text-primary mb-2 group-hover:text-blue-primary transition-colors">{et.name}</h3>
                      <div className="flex items-center gap-3 text-text-secondary font-medium mb-6">
                        <Clock className="w-4 h-4" /> {et.duration} mins
                      </div>
                      <div className="mt-auto flex items-center text-blue-primary font-semibold group-hover:translate-x-1 transition-transform">
                        View Demo <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-text-primary text-white py-24 md:py-32 rounded-t-[40px] md:rounded-t-[80px] mt-10">
          <div className="max-w-4xl mx-auto px-6 md:px-8 text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Ready to claim your link?
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 font-medium">
              Start scheduling meetings faster today.
            </p>
            <div className="pt-6">
               <button
                type="button"
                onClick={goDashboard}
                className="px-10 py-5 rounded-full bg-blue-primary text-white text-xl font-bold hover:bg-blue-hover shadow-button hover:shadow-button-hover hover:-translate-y-1 transition-all"
              >
                Sign up for free
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;

