import os

profile_path = os.path.join('frontend', 'src', 'pages', 'Profile.jsx')

with open(profile_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. PAGE WIDTH AND REMOVE PB-40
content = content.replace(
    'max-w-none md:max-w-2xl bg-white min-h-screen pb-40 relative',
    'max-w-none md:max-w-lg bg-white min-h-screen pb-6 relative'
)

# 2. GREEN HERO
hero_old = """            <div className="bg-[#15803d] pt-12 pb-16 px-4 relative flex flex-col items-center">
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
            </div>"""

hero_new = """            <div className="bg-[#15803d] min-h-[200px] pt-12 pb-8 px-4 relative flex flex-col items-center overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}/>
                <div className="absolute top-4 right-4 z-20">
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="text-white text-sm font-semibold bg-white/20 px-3 py-1.5 rounded-full">
                            Edit
                        </button>
                    )}
                </div>
                
                <div className="w-24 h-24 rounded-full ring-4 ring-white bg-white flex items-center justify-center text-3xl font-black text-green-700 shadow-lg z-10 mt-2">
                    {initials}
                </div>
                
                <h1 className="text-2xl font-bold text-white mt-4 text-center z-10">
                    {formData.full_name || 'Farmer Friend'}
                </h1>
                
                <div className="inline-flex bg-green-600 text-white text-sm px-4 py-1.5 rounded-full mt-2 font-medium z-10">
                    {role || 'Farmer'}
                </div>
                
                <p className="text-green-100 text-sm mt-2 flex items-center gap-1 z-10">
                    📍 {formData.location || 'Location not set'} · Member since {memberSince || new Date().getFullYear()}
                </p>
            </div>"""

content = content.replace(hero_old, hero_new)

# 3. STATS CARDS
stats_old = """                <div className="grid grid-cols-3 gap-3 px-4 mt-6">
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
                </div>"""

stats_new = """                <div className="grid grid-cols-3 gap-3 px-4 mt-6">
                    <div className="bg-green-50 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                        <span className="w-8 h-8 flex items-center justify-center text-2xl mb-1 mt-1">🌾</span>
                        <span className="text-3xl font-bold text-green-700">{cropReportCount}</span>
                        <span className="text-[11px] uppercase tracking-widest text-gray-400 mt-1 text-center">Crop Scans</span>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                        <span className="w-8 h-8 flex items-center justify-center text-2xl mb-1 mt-1">🦠</span>
                        <span className="text-3xl font-bold text-green-700">{diseaseReportCount}</span>
                        <span className="text-[11px] uppercase tracking-widest text-gray-400 mt-1 text-center">Disease Scans</span>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                        <span className="w-8 h-8 flex items-center justify-center text-2xl mb-1 mt-1">⭐</span>
                        <span className="text-3xl font-bold text-green-700">4.8</span>
                        <span className="text-[11px] uppercase tracking-widest text-gray-400 mt-1 text-center">Rating</span>
                    </div>
                </div>"""

content = content.replace(stats_old, stats_new)

# 4. PROFILE COMPLETION
completion_old = """                        <div className="mx-4 mt-4 bg-gradient-to-r from-green-600 to-[#15803d] rounded-2xl p-4 text-white shadow-sm">
                            <div className="flex justify-between mb-2 items-end">
                                <span className="font-semibold text-sm">Profile Completion</span>
                                <span className="text-xl font-bold">{percent}%</span>
                            </div>
                            <div className="bg-green-800/40 rounded-full h-2 overflow-hidden">
                                <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                            </div>"""

completion_new = """                        <div className="mx-0 mt-4 bg-gradient-to-r from-green-600 to-[#15803d] rounded-2xl p-4 text-white shadow-sm">
                            <div className="flex justify-between mb-3 items-center">
                                <span className="font-semibold text-sm">Profile Completion</span>
                                <span className="text-2xl font-bold float-right">{percent}%</span>
                            </div>
                            <div className="bg-green-500/30 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-white h-2.5 rounded-full animate-none" style={{ width: `${percent}%` }}></div>
                            </div>"""

content = content.replace(completion_old, completion_new)

# 5. TABS
tabs_old = """                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-[1_0_auto] text-center min-w-[33%] py-2.5 px-4 min-h-[48px] text-sm rounded-lg transition-all ${
                                activeTab === tab ? 'bg-white shadow text-[#15803d] font-semibold' : 'text-gray-500 font-medium'
                            }`}
                        >"""

tabs_new = """                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-[1_0_auto] text-center min-w-[33%] py-2.5 px-4 min-h-[48px] text-sm transition-all duration-200 ${
                                activeTab === tab ? 'bg-white shadow-sm text-green-700 font-semibold rounded-lg' : 'text-gray-500 font-medium rounded-lg'
                            }`}
                        >"""

content = content.replace(tabs_old, tabs_new)

# 6. SIGN OUT AND BOTTOM GAPS
sign_old = """                <button 
                    onClick={logout}
                    className="mx-4 mt-6 mb-24 w-[calc(100%-2rem)] border-2 border-red-200 text-red-600 py-3.5 min-h-[52px] rounded-xl text-base font-semibold flex items-center justify-center gap-2"
                >
                    <span aria-hidden="true" className="text-xl">🚪</span> Sign Out
                </button>
            </div>

            {/* 9. SAVE / CANCEL BUTTONS (Sticky Bottom) */}
            {isEditing && (
                <div className="fixed bottom-[64px] md:bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40 md:max-w-2xl md:mx-auto pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-x">"""

sign_new = """                <button 
                    onClick={logout}
                    className="mx-0 mt-4 border-2 border-red-200 text-red-500 rounded-2xl py-4 flex items-center justify-center gap-2 w-full text-base font-semibold mb-6"
                >
                    <span aria-hidden="true" className="text-xl">🚪</span> Sign Out
                </button>
            </div>

            {/* 9. SAVE / CANCEL BUTTONS (Sticky Bottom) */}
            {isEditing && (
                <div className="sticky bottom-[64px] md:bottom-0 w-full bg-white border-t border-gray-100 py-4 px-4 z-40 pb-safe">"""

content = content.replace(sign_old, sign_new)

with open(profile_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Profile.jsx updated successfully")
