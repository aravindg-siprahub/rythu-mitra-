import React, { useState } from 'react';
import { DISTRICTS, SKILLS, SERVICES } from './laborConstants';
import * as workApi from '../../services/workApi';

/** Worker / vehicle owner onboarding — creates supplier_profiles (applicant identity for job_applications). */
export default function SupplierRegistrationForm({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: '',
    whatsapp: '',
    same_as_phone: false,
    district: DISTRICTS[0] || 'Chittoor',
    state: 'Andhra Pradesh',
    service_type: 'worker',
    skills: [],
    daily_rate: '',
    experience: '',
    bio: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await workApi.registerSupplier({
        full_name: formData.full_name,
        phone: formData.phone,
        user_id: user.id,
        service_type: formData.service_type,
        district: formData.district,
        state: formData.state,
        village: '',
        skills: formData.skills,
        daily_rate: formData.daily_rate ? parseInt(formData.daily_rate, 10) : undefined,
        experience_years: parseInt(formData.experience, 10) || 0,
        bio: formData.bio,
        whatsapp_number: formData.same_as_phone ? formData.phone : formData.whatsapp,
      });
      setStep(3);
    } catch (err) {
      alert(err.message || 'Error submitting registration');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="text-8xl mb-6">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration submitted!</h2>
        <p className="text-gray-500 mb-8">
          Your worker profile is ready. You can browse jobs on the Labor Market.
        </p>
        <button
          type="button"
          onClick={() => {
            onComplete?.();
            window.location.href = '/work';
          }}
          className="w-full max-w-xs bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg"
        >
          Go to Labor Market
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 pb-20 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Complete Profile</h2>
        <p className="text-gray-500 mb-8">Tell us about your services</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Full Name (As per Aadhar)"
            required
            className="w-full h-14 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />

          <input
            type="tel"
            placeholder="Phone Number (+91)"
            required
            className="w-full h-14 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 outline-none text-slate-900 font-medium placeholder:text-slate-400"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              id="whatsapp-check"
              checked={formData.same_as_phone}
              onChange={(e) => setFormData({ ...formData, same_as_phone: e.target.checked })}
            />
            <label htmlFor="whatsapp-check" className="text-sm font-medium text-gray-600">
              WhatsApp same as phone
            </label>
          </div>

          {!formData.same_as_phone && (
            <input
              type="tel"
              placeholder="WhatsApp Number"
              className="w-full h-14 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 outline-none text-slate-900 font-medium placeholder:text-slate-400"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <select
              className="h-14 px-4 rounded-xl border border-gray-200 bg-white outline-none text-slate-900 font-medium"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              required
            >
              <option value="">Select District</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              type="text"
              value="Andhra Pradesh"
              disabled
              className="h-14 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 font-bold"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700">Service Type</label>
            <div className="grid grid-cols-2 gap-2">
              {SERVICES.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setFormData({ ...formData, service_type: s.id })}
                  className={`py-3 rounded-xl border font-black transition-all ${
                    formData.service_type === s.id
                      ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-100'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {formData.service_type === 'worker' && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700">Skills</label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => {
                      const exists = formData.skills.includes(s);
                      setFormData({
                        ...formData,
                        skills: exists ? formData.skills.filter((i) => i !== s) : [...formData.skills, s],
                      });
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      formData.skills.includes(s)
                        ? 'bg-green-100 border-green-600 text-green-700'
                        : 'bg-white border-gray-200 text-gray-500'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Daily Rate (₹)"
              required
              className="h-14 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 outline-none text-slate-900 font-medium placeholder:text-slate-400"
              value={formData.daily_rate}
              onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
            />
            <input
              type="number"
              placeholder="Exp. (Years)"
              className="h-14 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 outline-none text-slate-900 font-medium placeholder:text-slate-400"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            />
          </div>

          <textarea
            placeholder="Tell farmers about your experience (Optional)"
            className="w-full h-24 p-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 outline-none text-slate-900 font-medium placeholder:text-slate-400"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-16 bg-green-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-green-100 flex items-center justify-center gap-2"
          >
            {submitting ? 'Submitting...' : 'Save profile ✓'}
          </button>
        </form>
      </div>
    </div>
  );
}
