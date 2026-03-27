import { motion } from 'framer-motion';
import { Leaf, MapPin, Brain, Zap, TrendingUp, Sprout, Bug, Cloud, BarChart3 } from 'lucide-react';

// Season detection based on month
const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 3 && month <= 5) return 'Zaid (Summer)';
    if (month >= 6 && month <= 10) return 'Kharif (Monsoon)';
    if (month === 3) return 'Rabi / Zaid Transition';
    return 'Rabi (Winter)';
};

// March is the transition month
const getSeasonLabel = () => {
    const month = new Date().getMonth() + 1;
    if (month === 3) return 'Rabi / Zaid Transition';
    if (month >= 4 && month <= 5) return 'Zaid (Summer)';
    if (month >= 6 && month <= 10) return 'Kharif (Monsoon)';
    return 'Rabi (Winter)';
};

const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
};

const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const quickActions = [
    { emoji: '🌱', label: 'Crop AI', id: 'crop-ai' },
    { emoji: '🔬', label: 'Disease Check', id: 'disease' },
    { emoji: '🌤', label: 'Weather', id: 'weather' },
    { emoji: '👷', label: 'Hire Help', id: 'services' },
];

export default function OverviewSection() {
    const season = getSeasonLabel();
    const formattedDate = getFormattedDate();

    return (
        <section id="overview" className="space-y-0">
            {/* Clean white hero header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="dashboard-header"
            >
                <div className="header-greeting">
                    <h1>నమస్కారం, Farmer 🌾</h1>
                    <p className="header-date">
                        {season} Season &bull; {formattedDate} &bull; Andhra Pradesh
                    </p>
                </div>

                <div className="header-quick-actions">
                    {quickActions.map((a) => (
                        <button
                            key={a.id}
                            className="quick-action-btn"
                            onClick={() => scrollToSection(a.id)}
                        >
                            {a.emoji} {a.label}
                        </button>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
