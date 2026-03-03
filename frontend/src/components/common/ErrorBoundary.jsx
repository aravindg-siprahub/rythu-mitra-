import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Dashboard Component Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-full w-full min-h-[200px] flex items-center justify-center bg-neo-panel border border-status-critical/30 rounded-xl p-6">
                    <div className="text-center">
                        <div className="text-status-critical mb-2">⚠️ Component Error</div>
                        <p className="text-xs text-neo-muted">This panel is temporarily unavailable.</p>
                        <button
                            onClick={() => this.setState({ hasError: false })}
                            className="mt-4 px-3 py-1 bg-neo-bg border border-neo-border text-xs rounded hover:border-brand-primary"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
