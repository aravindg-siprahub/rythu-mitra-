import React from 'react';

const TrustBadge = () => {
    return (
        <div id="trust" className="py-24 bg-[#000000] border-t border-white/5">
            <div className="max-w-5xl mx-auto px-6">
                <div className="flex items-center gap-4 mb-16 opacity-50">
                    <div className="h-px w-8 bg-white/20" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">Trust & Governance</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Infrastructure */}
                    <div className="group">
                        <div className="flex items-center gap-3 mb-4 text-slate-500 group-hover:text-slate-300 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                            </svg>
                            <h4 className="text-xs font-bold uppercase tracking-widest">Infrastructure</h4>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed font-light">
                            Built on AWS high-availability zones. Auto-scaling architecture supporting 10M+ concurrent logic streams with 99.99% uptime SLA.
                        </p>
                    </div>

                    {/* Security */}
                    <div className="group">
                        <div className="flex items-center gap-3 mb-4 text-slate-500 group-hover:text-slate-300 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <h4 className="text-xs font-bold uppercase tracking-widest">Data Sovereignty</h4>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed font-light">
                            End-to-end AES-256 encryption. Local data residency compliance for government and enterprise integration.
                        </p>
                    </div>

                    {/* Footer / Meta */}
                    <div className="group">
                        <div className="flex items-center gap-3 mb-4 text-slate-500 group-hover:text-slate-300 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <h4 className="text-xs font-bold uppercase tracking-widest">System</h4>
                        </div>
                        <div className="flex flex-col gap-2 text-xs text-slate-600 font-mono">
                            <span className="hover:text-slate-400 cursor-pointer transition-colors">v24.02.1-stable</span>
                            <span className="hover:text-slate-400 cursor-pointer transition-colors">Documentation</span>
                            <span className="hover:text-slate-400 cursor-pointer transition-colors">API Access</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrustBadge;
