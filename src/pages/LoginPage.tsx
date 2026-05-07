import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { authService } from '../services/auth.service';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-glow left-[-12%] top-[8%] h-[24rem] w-[24rem] bg-accent/12" />
      <div className="auth-glow bottom-[-10%] right-[-8%] h-[20rem] w-[20rem] bg-cyan-500/10" />

      <aside className="auth-side-panel">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-emerald-400 text-primary shadow-lg shadow-accent/20">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <p className="section-label">TaskControl</p>
              <p className="mt-1 text-sm text-surface-300">Operational clarity for product teams.</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="mt-16 max-w-xl"
          >
            <span className="stat-chip">Control Center</span>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-white">
              Move tasks forward without losing ownership or context.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-surface-300">
              Track status, tighten handoffs, and keep every task visible to the people who should actually see it.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-4">
          {[
            {
              icon: ShieldCheck,
              title: 'Permission-aware workflow',
              body: 'See only the tasks tied to your role, assignment, and reporting line.',
            },
            {
              icon: Sparkles,
              title: 'Focused board interactions',
              body: 'Drag, edit, and update status from one compact workspace with minimal friction.',
            },
            {
              icon: CheckCircle2,
              title: 'Operational signal over noise',
              body: 'Reporter, assignee, priority, and movement history stay visible in the same flow.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="panel-muted p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-text">{title}</p>
                  <p className="text-sm leading-6 text-surface-400">{body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="auth-form-panel">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg"
        >
          <div className="glass-card border-white/6 p-8 sm:p-10">
            <div className="mb-10">
              <span className="stat-chip">Sign In</span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-white">Welcome back</h2>
              <p className="mt-3 text-sm leading-6 text-surface-400">
                Enter your workspace credentials to open the board and continue moving work.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-300"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label htmlFor="login-email" className="section-label">Work Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-500 transition-colors group-focus-within:text-accent" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-12"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="login-password" className="section-label">Password</label>
                  <span className="text-xs font-medium text-surface-500">Protected with JWT access control</span>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-500 transition-colors group-focus-within:text-accent" />
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-12"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-2 flex w-full items-center justify-center gap-3 py-3 text-sm font-bold uppercase tracking-[0.18em] shadow-lg shadow-accent/20"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Enter Workspace
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-white/6 pt-6 text-sm text-surface-400">
              New to TaskControl?{' '}
              <Link to="/register" className="font-semibold text-accent transition-opacity hover:opacity-80">
                Create your account
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LoginPage;
