import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertCircle, ArrowLeft, Radar } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-shell relative flex min-h-screen items-center justify-center overflow-hidden p-4 font-sans">
      <div className="auth-glow left-[-10%] top-[8%] h-[20rem] w-[20rem] bg-accent/10" />
      <div className="auth-glow bottom-[-12%] right-[-10%] h-[18rem] w-[18rem] bg-cyan-500/10" />

      <div className="relative z-10 w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-card border-white/6 p-8 text-center sm:p-10">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
              <AlertCircle className="h-11 w-11 text-accent" />
            </div>

            <div className="space-y-4">
              <span className="stat-chip">404 | Route Missing</span>
              <h1 className="text-6xl font-black tracking-[-0.06em] text-white sm:text-7xl">Page not found</h1>
              <p className="mx-auto max-w-md text-sm leading-7 text-surface-400 sm:text-base">
                This route is outside the current workspace map. Head back to the board or return to the previous screen.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="panel-muted p-4 text-left">
                <div className="flex items-start gap-3">
                  <Radar className="mt-0.5 h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-semibold text-text">Navigation reset</p>
                    <p className="mt-1 text-sm leading-6 text-surface-400">
                      Use the board home to recover the main app context.
                    </p>
                  </div>
                </div>
              </div>
              <div className="panel-muted p-4 text-left">
                <div className="flex items-start gap-3">
                  <ArrowLeft className="mt-0.5 h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-semibold text-text">Context-safe back</p>
                    <p className="mt-1 text-sm leading-6 text-surface-400">
                      If you came from a valid screen, going back is the fastest recovery path.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => navigate(-1)}
                className="btn-secondary flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                <ArrowLeft className="h-5 w-5" />
                Go Back
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn-primary flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                <Home className="h-5 w-5" />
                Return Home
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
