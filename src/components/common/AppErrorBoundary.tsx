import React from 'react';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Top-level error boundary. Prevents a single render/engine failure from
 * white-screening the whole app (e.g., bad localStorage payload, corrupt
 * engine state after realm switch) and offers a one-click world reset.
 */
export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, message: err instanceof Error ? err.message : String(err) };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('[SwarmWorld] Uncaught render error:', error, info);
  }

  private handleReset = () => {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('swarmworld_'))
        .forEach(k => localStorage.removeItem(k));
    } catch {
      /* storage may be unavailable; ignore */
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-neutral-950 text-neutral-100 font-mono">
          <div className="max-w-md p-6 rounded-md bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="text-sm font-bold uppercase tracking-wider text-neutral-300">
              SwarmWorld hit an unexpected error
            </div>
            <div className="text-xs text-neutral-400 break-words leading-relaxed">
              {this.state.message || 'Unknown error'}
            </div>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-sm bg-neutral-100 text-neutral-950 text-xs font-semibold hover:bg-neutral-200 transition-colors"
            >
              Clear saves &amp; reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
