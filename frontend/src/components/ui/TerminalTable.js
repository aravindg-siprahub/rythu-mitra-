import React from 'react';

export default function TerminalTable({ headers, data, renderRow }) {
    return (
        <div className="w-full overflow-hidden rounded-lg border border-white/10 bg-black/20">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            {headers.map((header, i) => (
                                <th
                                    key={i}
                                    className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono whitespace-nowrap"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.map((item, i) => renderRow(item, i))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
