import React from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  // Mock live data for the 'streaming' effect
  const data = [
    { name: 'Mon', profit: 4000 },
    { name: 'Tue', profit: 3000 },
    { name: 'Wed', profit: 2000 },
    { name: 'Thu', profit: 2780 },
    { name: 'Fri', profit: 1890 },
    { name: 'Sat', profit: 2390 },
    { name: 'Sun', profit: 3490 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Farmer Command Center</h1>
          <p className="text-sm text-gray-500 mt-1">AI-Powered Agriculture Operating System</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-gray-600">System Online</span>
        </div>
      </header>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/crop" className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 transform hover:-translate-y-1">
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
            <span className="text-2xl group-hover:text-white">🌱</span>
          </div>
          <h3 className="font-bold text-gray-800">Crop Advisor</h3>
          <p className="text-sm text-gray-500 mt-2">Get AI-backed planting recommendations.</p>
        </Link>

        <Link to="/disease" className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 transform hover:-translate-y-1">
          <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600 transition-colors">
            <span className="text-2xl group-hover:text-white">🔬</span>
          </div>
          <h3 className="font-bold text-gray-800">Disease Lab</h3>
          <p className="text-sm text-gray-500 mt-2">Instant diagnosis via EfficientNet AI.</p>
        </Link>

        <Link to="/weather" className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 transform hover:-translate-y-1">
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
            <span className="text-2xl group-hover:text-white">☁️</span>
          </div>
          <h3 className="font-bold text-gray-800">Weather AI</h3>
          <p className="text-sm text-gray-500 mt-2">Hyperlocal forecasts & risk alerts.</p>
        </Link>

        <Link to="/market" className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 transform hover:-translate-y-1">
          <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
            <span className="text-2xl group-hover:text-white">📈</span>
          </div>
          <h3 className="font-bold text-gray-800">Market Intel</h3>
          <p className="text-sm text-gray-500 mt-2">Price forecasting & profit optimization.</p>
        </Link>
      </div>

      {/* Live Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Projected Farm Profitability</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Alerts & Notifications</h3>
          <ul className="space-y-4">
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 h-2 w-2 mt-2 rounded-full bg-red-500"></span>
              <p className="text-sm text-gray-600">Possible rain in 2 days. Delay spraying pesticides.</p>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 h-2 w-2 mt-2 rounded-full bg-green-500"></span>
              <p className="text-sm text-gray-600">Tomato prices up 15%. Good time to sell.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
