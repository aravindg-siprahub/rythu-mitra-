import os
import re

profile_path = os.path.join('frontend', 'src', 'pages', 'Profile.jsx')

# 1. Update Profile.jsx
with open(profile_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('    return (\n        <div className="min-h-screen')

if start_idx == -1:
    print("Could not find start index in Profile.jsx")
else:
    end_idx = content.rfind('    );\n}')

    new_jsx = r"""    return (
        <div className="min-h-screen bg-white pb-40 font-sans w-full max-w-none md:max-w-2xl md:mx-auto">
            {/* 2. GREEN HEADER */}
            <div className="bg-[#15803d] pt-12 pb-16 px-4 relative flex flex-col items-center">
                <div className="absolute top-4 right-4">
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="text-white text-sm font-semibold bg-white/20 px-3 py-1.5 rounded-full">
                            Edit
                        </button>
                    )}
                </div>
                
                <div className="w-20 h-20 rounded-full border-4 border-white bg-white flex items-center justify-center text-3xl font-black text-green-700 shadow-md z-10 -mb-10 mt-2">
                    {initials}
                </div>
                
                <h1 className="text-2xl font-bold text-white mt-12 text-center">
                    {formData.full_name || 'Farmer Friend'}
                </h1>
                
                <div className="inline-flex bg-green-600 text-white text-sm px-3 py-1 rounded-full mt-2 font-medium">
                    {role || 'Farmer'}
                </div>
                
                <p className="text-green-100 text-sm mt-1">
                    📍 {formData.location || 'Location not set'} · Member since {memberSince || new Date().getFullYear()}
                </p>
            </div>

            <div className="pt-12">
                {/* 12. PHONE NUMBER ALERT BANNER */}
                {(() => {
                    const { percent, missing } = getProfileCompletion();
                    if (percent === 100) return null;
                    if (missing.some(m => m.key === 'phone')) {
                        return (
                            <div className="mx-4 mt-2 rounded-xl p-3 bg-amber-50 border border-amber-200 flex items-center gap-3">
                                <span className="text-amber-500 text-xl">⚠️</span>
                                <span className="text-sm font-medium text-amber-800 flex-1">
                                    Add phone number to contact workers
                                </span>
                                <button onClick={() => setIsEditing(true)} className="bg-amber-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold border-0">
                                    Add Now
                                </button>
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* 7. PROFILE COMPLETION BAR */}
                {(() => {
                    const { percent } = getProfileCompletion();
                    if (percent === 100) return null;
                    return (
                        <div className="mx-4 mt-4 bg-gradient-to-r from-green-600 to-[#15803d] rounded-2xl p-4 text-white shadow-sm">
                            <div className="flex justify-between mb-2 items-end">
                                <span className="font-semibold text-sm">Profile Completion</span>
                                <span className="text-xl font-bold">{percent}%</span>
                            </div>
                            <div className="bg-green-800/40 rounded-full h-2 overflow-hidden">
                                <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                            </div>
                            <p className="text-green-100 text-xs mt-2 opacity-90">
                                Add phone number to reach 100%
                            </p>
                        </div>
                    );
                })()}

                {/* 3. STATS SECTION */}
                <div className="grid grid-cols-3 gap-3 px-4 mt-6">
                    <div className="bg-[#f0fdf4] rounded-2xl p-4 flex flex-col items-center justify-center border border-green-100 shadow-sm">
                        <span className="w-8 h-8 text-[#15803d] flex items-center justify-center text-2xl mb-1 mt-1">🌾</span>
                        <span className="text-3xl font-bold text-[#15803d]">{cropReportCount}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wide mt-1 text-center font-semibold">Crop Scans</span>
                    </div>
                    <div className="bg-[#f0fdf4] rounded-2xl p-4 flex flex-col items-center justify-center border border-green-100 shadow-sm">
                        <span className="w-8 h-8 text-[#15803d] flex items-center justify-center text-2xl mb-1 mt-1">🦠</span>
                        <span className="text-3xl font-bold text-[#15803d]">{diseaseReportCount}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wide mt-1 text-center font-semibold">Disease Scans</span>
                    </div>
                    <div className="bg-[#f0fdf4] rounded-2xl p-4 flex flex-col items-center justify-center border border-green-100 shadow-sm">
                        <span className="w-8 h-8 text-[#15803d] flex items-center justify-center text-2xl mb-1 mt-1">⭐</span>
                        <span className="text-3xl font-bold text-[#15803d]">4.8</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wide mt-1 text-center font-semibold">Rating</span>
                    </div>
                </div>

                {/* 4. TABS */}
                <div className="flex bg-gray-100 rounded-xl p-1 mx-4 mt-6 overflow-x-auto whitespace-nowrap hide-scrollbar">
                    {['info', 'farm', 'activity'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-[1_0_auto] text-center min-w-[33%] py-2.5 px-4 text-sm rounded-lg transition-all ${
                                activeTab === tab ? 'bg-white shadow text-[#15803d] font-semibold' : 'text-gray-500 font-medium'
                            }`}
                        >
                            {tab === 'info' ? 'My Details' : tab === 'farm' ? 'Farm Intelligence' : 'Recent Activity'}
                        </button>
                    ))}
                </div>

                <div className="mt-6 mb-8">
                    {/* DETAILS TAB */}
                    {activeTab === 'info' && (
                        <div className="space-y-5 px-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide block mb-2">Full Name</label>
                                <input 
                                    disabled={!isEditing}
                                    type="text"
                                    value={formData.full_name}
                                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                                    className="w-full min-h-[52px] text-base px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#15803d] focus:ring-2 focus:ring-green-100 disabled:bg-gray-50 disabled:text-gray-600 transition-all text-gray-900"
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide block mb-2">Phone Number</label>
                                <input 
                                    disabled={!isEditing}
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    className="w-full min-h-[52px] text-base px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#15803d] focus:ring-2 focus:ring-green-100 disabled:bg-gray-50 disabled:text-gray-600 transition-all text-gray-900"
                                    placeholder="+91 00000 00000"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide block mb-2">Village/City</label>
                                <input 
                                    disabled={!isEditing}
                                    type="text"
                                    value={formData.location}
                                    onChange={e => setFormData({...formData, location: e.target.value})}
                                    className="w-full min-h-[52px] text-base px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#15803d] focus:ring-2 focus:ring-green-100 disabled:bg-gray-50 disabled:text-gray-600 transition-all text-gray-900"
                                    placeholder="e.g. Madanapalle"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide block mb-2">District</label>
                                <input 
                                    disabled={!isEditing}
                                    type="text"
                                    value={formData.district}
                                    onChange={e => setFormData({...formData, district: e.target.value})}
                                    className="w-full min-h-[52px] text-base px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#15803d] focus:ring-2 focus:ring-green-100 disabled:bg-gray-50 disabled:text-gray-600 transition-all text-gray-900"
                                    placeholder="e.g. Chittoor"
                                />
                            </div>
                        </div>
                    )}

                    {/* FARM TAB */}
                    {activeTab === 'farm' && (
                        <div className="space-y-5 px-4 w-full">
                            <div>
                                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide block mb-2">Total Farm Size (Acres)</label>
                                <input 
                                    disabled={!isEditing}
                                    type="number"
                                    value={farmSize}
                                    onChange={e => {
                                        setFarmSize(e.target.value);
                                        setFormData({ ...formData, farm_size: e.target.value });
                                    }}
                                    className="w-full min-h-[52px] text-base px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#15803d] focus:ring-2 focus:ring-green-100 disabled:bg-gray-50 disabled:text-gray-600 transition-all text-gray-900"
                                    placeholder="e.g. 5"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide block mb-2">Primary Crops Grown</label>
                                <textarea 
                                    disabled={!isEditing}
                                    value={primaryCrops.join(', ')}
                                    onChange={e => {
                                        const next = e.target.value.split(',').map((c) => c.trim()).filter(Boolean);
                                        setPrimaryCrops(next);
                                        setFormData({ ...formData, primary_crops: e.target.value });
                                    }}
                                    className="w-full min-h-[80px] text-base px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#15803d] focus:ring-2 focus:ring-green-100 disabled:bg-gray-50 disabled:text-gray-600 transition-all text-gray-900 resize-none"
                                    placeholder="e.g. Rice, Tomatoes, Sugarcane"
                                />
                                {primaryCrops.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {primaryCrops.map((crop) => (
                                            <span key={crop} className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 border border-green-100">
                                                {crop}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 6. ROLE SELECTOR */}
                            <div className="pt-2 w-full">
                                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide block mb-2">I am a</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { key: 'farmer', label: 'Farmer', desc: 'Manage farm', icon: '🌾' },
                                        { key: 'worker', label: 'Worker', desc: 'Look for work', icon: '👷' },
                                        { key: 'both', label: 'Both', desc: 'Farmer & worker', icon: '🤝' },
                                    ].map((r) => (
                                        <button
                                            key={r.key}
                                            type="button"
                                            disabled={!isEditing}
                                            onClick={() => {
                                                setUserRole(r.key);
                                                setRole(r.label);
                                            }}
                                            className={`min-h-[80px] p-4 rounded-2xl border-2 text-left transition relative flex flex-col justify-start items-start w-full ${
                                                userRole === r.key 
                                                    ? 'border-[#15803d] bg-green-50' 
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                            } ${!isEditing ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <span className="text-2xl mb-1">{r.icon}</span>
                                            <div className={`text-base font-bold mt-1 leading-tight ${userRole === r.key ? 'text-[#15803d]' : 'text-gray-900'}`}>
                                                {r.label}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1 w-full">
                                                {r.desc}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ACTIVITY TAB */}
                    {activeTab === 'activity' && (
                        <div className="w-full">
                            {savedCropReports.length === 0 && savedDiseaseReports.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center mx-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                                    <span className="text-4xl mb-3">🌱</span>
                                    <p className="font-bold text-gray-800 text-base">No activity yet</p>
                                    <p className="text-sm text-gray-500 mt-1 max-w-[200px]">Save crop or disease scans to view them here.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {savedCropReports.map((report, i) => (
                                        <div key={`crop-${i}`} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mx-4 flex items-center justify-between min-h-[64px]">
                                            <div className="flex-1">
                                                <div className="text-base font-semibold text-gray-900">
                                                    🌾 {report?.crop_name || 'Crop Scanned'}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-0.5">
                                                    {report?.farm_acres || '—'} acre · {report?.saved_at ? new Date(report.saved_at).toLocaleDateString('en-IN') : 'Recently'}
                                                </div>
                                            </div>
                                            <div className="bg-green-100 text-[#15803d] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ml-2">
                                                {report?.confidence ? `${report.confidence}% Match` : 'AI Match'}
                                            </div>
                                        </div>
                                    ))}

                                    {savedDiseaseReports.map((report, i) => (
                                        <div key={`disease-${i}`} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mx-4 flex items-center justify-between min-h-[64px]">
                                            <div className="flex-1 pr-2">
                                                <div className="text-base font-semibold text-gray-900 truncate">
                                                    🦠 {report?.disease_name || 'Disease Scanned'}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-0.5">
                                                    {report?.crop || 'Crop'} · {report?.saved_at ? new Date(report.saved_at).toLocaleDateString('en-IN') : 'Recently'}
                                                </div>
                                            </div>
                                            <div className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ml-2 ${report?.spread_risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-500'}`}>
                                                {report?.spread_risk || 'Medium'} Risk
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="px-4 pt-2">
                                        <button onClick={() => navigate('/crop')} className="w-full min-h-[52px] rounded-xl bg-gray-50 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-colors">
                                            View all reports →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 10. SIGN OUT BUTTON */}
                <button 
                    onClick={logout}
                    className="mx-4 mt-6 mb-24 w-[calc(100%-2rem)] border-2 border-red-200 text-red-600 py-3.5 min-h-[52px] rounded-xl text-base font-semibold flex items-center justify-center gap-2"
                >
                    <span aria-hidden="true" className="text-xl">🚪</span> Sign Out
                </button>
            </div>

            {/* 9. SAVE / CANCEL BUTTONS (Sticky Bottom) */}
            {isEditing && (
                <div className="fixed bottom-[64px] left-0 right-0 bg-white border-t border-gray-100 p-4 z-40 lg:max-w-2xl lg:mx-auto pb-safe">
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-[#15803d] text-white py-3.5 rounded-xl text-base font-semibold transition-colors disabled:opacity-70 disabled:active:bg-[#15803d]"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                        onClick={() => { setIsEditing(false); setLoading(false); }}
                        disabled={loading}
                        className="w-full border-2 border-gray-200 text-gray-600 bg-white py-3.5 rounded-xl mt-2 text-base font-semibold transition-colors disabled:opacity-70"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>"""

    with open(profile_path, 'w', encoding='utf-8') as f:
        f.write(content[:start_idx] + new_jsx + "\n}")

    print("Profile.jsx updated successfully!")
