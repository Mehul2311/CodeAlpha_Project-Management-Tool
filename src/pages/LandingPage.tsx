import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Kanban,
  Zap,
  Users,
  CheckCircle2,
  IndianRupee,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Laptop,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-amber-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200 dark:border-slate-800">
        {/* Subtle background ambient warm glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 dark:bg-amber-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-3 py-1.5 rounded-full border border-amber-200/60 dark:border-amber-800/60">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Designed for small teams, student groups & Indian startups</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white text-balance leading-[1.15]">
                Collaborative project management that feels fast, simple & native to India.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Plan sprints, organize Kanban boards, track ₹ budgets, and assign tasks in real-time. Built without the bloat of Western enterprise suites.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Chalo, Start for Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Instant 1-Click Demo</span>
                </Link>
              </div>

              {/* Quiet unboxed trust cues */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>Free forever for students</span>
                <span aria-hidden="true">·</span>
                <span>Real-time WebSockets</span>
                <span aria-hidden="true">·</span>
                <span>No credit card required</span>
              </div>
            </div>

            {/* Right Column: High-Fidelity Hero Visual */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-900 group">
                <img
                  src="/src/assets/images/kaamboard_collab_hero_1791834144681.jpg"
                  alt="KaamBoard collaborative Kanban board interface with agile cards"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live Sprint: Bangalore Cohort 2026
                  </span>
                  <span className="font-mono tabular-nums text-slate-200">
                    ₹12,00,000 Tracked
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Everything your team needs to get kaam done
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Zero fluff. Tailored for agile sprints, student hackathons, and product roadmaps in India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Fluid Drag & Drop Kanban
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Add, rename and arrange custom columns. Drag cards with responsive feedback and automatic DB order persistence.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Real-Time WebSockets
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                When a teammate moves a card, posts a comment, or updates a checklist, it updates instantly across everyone's screens.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <IndianRupee className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                ₹ INR & Indian Date Formats
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Budget tracking in Lakhs and Crores (1,00,000), DD/MM/YYYY deadlines, and IST relative timestamps for local clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Sprint Flow
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                From college hackathon to startup MVP, stay in sync.
              </h2>
              <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Checklists with Progress:</strong> Break down large tasks into bite-sized actionable items. Watch progress bars complete in real-time.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Threaded Comments & Notifications:</strong> Discuss technical hurdles without switching tabs. Notification bells shake when you're tagged.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Dedicated "My Tasks" Queue:</strong> Never lose track of what you owe the team with personal status and priority filters.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Interactive Mini Board (Try it!)
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  ₹75,000 Budget
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'm1', title: 'UPI Auto-debit Webhook verification', status: 'In Progress', priority: 'High', color: 'text-rose-600' },
                  { id: 'm2', title: 'GST GSTR-1 Excel Export Module', status: 'To Do', priority: 'Medium', color: 'text-amber-600' },
                  { id: 'm3', title: 'Bangalore Launch Party Invites', status: 'Done', priority: 'Low', color: 'text-emerald-600' },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-750 flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-amber-500/50 transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {item.title}
                      </span>
                      <span className={`text-[11px] font-semibold ${item.color}`}>
                        {item.priority} Priority
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center justify-center gap-1"
                >
                  <span>Launch full collaborative board with 1-click login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Straightforward pricing in Indian Rupees
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              No dollar conversions. No hidden platform charges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Students & Side Projects
                </span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    ₹0
                  </span>
                  <span className="text-xs text-slate-500">/ forever</span>
                </div>
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                  Ideal for college teams, hackathon entries, and individual developers.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Unlimited personal projects & task cards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Up to 10 collaborators per board</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Real-time Socket.IO board updates</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/signup"
                className="mt-8 w-full py-2.5 text-xs font-semibold text-center text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Start for Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500 shadow-md flex flex-col justify-between relative">
              <div className="absolute top-4 right-4 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full">
                Most Popular
              </div>

              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Startups & Small Teams
                </span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    ₹499
                  </span>
                  <span className="text-xs text-slate-500">/ month billed annually</span>
                </div>
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                  For growing Indian startups needing role-based permissions and budget analytics.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Unlimited boards, tasks & team members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Project budget tracking in ₹ INR</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Priority WhatsApp & Email support</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/signup"
                className="mt-8 w-full py-2.5 text-xs font-semibold text-center text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-colors shadow-sm"
              >
                Start 14-Day Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Loved by engineers across India
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-4">
                "We migrated our 8-person dev team from heavy enterprise Jira to KaamBoard. The speed difference and zero-friction real-time board sync is phenomenal."
              </p>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Aarav Mehta
                </p>
                <p className="text-[11px] text-slate-400">
                  Founder, Mumbai Tech Lab
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-4">
                "Organizing our annual college tech fest hackathon with 60 volunteers became effortless. Seeing who is active on which column helped us avoid all duplicate work."
              </p>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Rohan Verma
                </p>
                <p className="text-[11px] text-slate-400">
                  Lead Organizer, Delhi Technical College
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-4">
                "The ₹ INR budget integration and Indian date formats make sprint updates so natural for our Bangalore founders cohort."
              </p>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Sneha Reddy
                </p>
                <p className="text-[11px] text-slate-400">
                  Product Manager, Hyderabad Ventures
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-50 dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-amber-500 text-white font-black text-xs flex items-center justify-center">
              क
            </span>
            <span className="font-bold text-slate-900 dark:text-white">KaamBoard</span>
            <span>— Made with care for India's innovators</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/signup" className="hover:underline">Sign Up</Link>
            <span>© 2026 KaamBoard</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
