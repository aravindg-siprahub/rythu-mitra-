import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-3xl border border-red-100 text-center my-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 max-w-md mb-8">
                        The application encountered an unexpected error while rendering this section.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                    >
                        <RefreshCw className="w-5 h-5" /> Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
