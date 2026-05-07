import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  LayoutDashboard,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import { authService } from '../services/auth.service';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.register({ fullName, email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-glow left-[-12%] top-[8%] h-[24rem] w-[24rem] bg-accent/12" />
      <div className="auth-glow bottom-[-10%] right-[-8%] h-[20rem] w-[20rem] bg-violet-500/12" />

      <aside className="auth-side-panel">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-emerald-400 text-primary shadow-lg shadow-accent/20">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <p className="section-label">TaskControl</p>
              <p className="mt-1 text-sm text-surface-300">Build structure before the sprint gets noisy.</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="mt-16 max-w-xl"
          >
            <span className="stat-chip">Team Onboarding</span>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-white">
              Start with a board that respects ownership from day one.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-surface-300">
              Create your account, enter the workspace, and keep reporting, assignment, and status flow aligned from the first task.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-4">
          {[
            {
              icon: Users,
              title: 'Clear team handoff model',
              body: 'Reporter and assignee stay visible so every task keeps a clear owner and executor.',
            },
            {
              icon: ShieldCheck,
              title: 'Role-based visibility',
              body: 'Permission-aware flows reduce accidental access and keep work scoped to the right people.',
            },
            {
              icon: UserPlus,
              title: 'Fast activation path',
              body: 'Registration stays lightweight so teams can start using the board without setup drag.',
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
          <div className="glass-card relative overflow-hidden border-white/6 p-8 sm:p-10">
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-background/92 px-8 text-center backdrop-blur-xl"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <UserPlus className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-white">Account created</h2>
                  <p className="text-sm leading-6 text-surface-300">
                    Redirecting you to login so you can enter the board.
                  </p>
                </div>
              </motion.div>
            )}

            <div className="mb-10">
              <span className="stat-chip">Create Account</span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-white">Join the workspace</h2>
              <p className="mt-3 text-sm leading-6 text-surface-400">
                Set up your identity once, then start reporting, assigning, and moving tasks with clear ownership.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-300"
                >
                  {Array.isArray(error) ? error[0] : error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label htmlFor="register-full-name" className="section-label">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-500 transition-colors group-focus-within:text-accent" />
                  <input
                    id="register-full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field pl-12"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="register-email" className="section-label">Work Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-500 transition-colors group-focus-within:text-accent" />
                  <input
                    id="register-email"
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
                <label htmlFor="register-password" className="section-label">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-500 transition-colors group-focus-within:text-accent" />
                  <input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-12"
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="btn-primary mt-2 flex w-full items-center justify-center gap-3 py-3 text-sm font-bold uppercase tracking-[0.18em] shadow-lg shadow-accent/20"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Create Workspace Access
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-white/6 pt-6 text-sm text-surface-400">
              Already have access?{' '}
              <Link to="/login" className="font-semibold text-accent transition-opacity hover:opacity-80">
                Sign in here
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default RegisterPage;
