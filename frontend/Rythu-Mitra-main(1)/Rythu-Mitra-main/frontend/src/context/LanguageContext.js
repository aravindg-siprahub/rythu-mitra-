import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState("EN"); // EN | TE | HI

    const toggleLang = () => {
        setLang(prev => prev === "EN" ? "TE" : prev === "TE" ? "HI" : "EN");
    };

    const t = (key) => {
        const translations = {
            // NAV
            "nav.home": { EN: "Home", TE: "హోమ్", HI: "होम" },
            "nav.crops": { EN: "AI Crops", TE: "AI పంటలు", HI: "AI फसलें" },
            "nav.market": { EN: "Market", TE: "మార్కెట్", HI: "बाज़ार" },

            // HERO
            "hero.title1": { EN: "Agriculture.", TE: "వ్యవసాయం.", HI: "कृषि।" },
            "hero.title2": { EN: "Reinvented.", TE: "పునరుద్ధరించబడింది.", HI: "पुनर्निर्मित।" },
            "hero.subtitle": {
                EN: "Rythu Mitra intelligence brings AGI predictions, satellite data, and autonomous market engines into one spatial ecosystem.",
                TE: "రైతు మిత్ర ఇంటెలిజెన్స్ AGI అంచనాలు, ఉపగ్రహ డేటా మరియు స్వయంప్రతిపత్త మార్కెట్ ఇంజిన్‌లను ఒకే స్పేషియల్ ఎకోసిస్టమ్‌లోకి తెస్తుంది.",
                HI: "रायथु मित्र इंटेलिजेंस एजीआई भविष्यवाणियों, उपग्रह डेटा और स्वायत्त बाजार इंजनों को एक स्थानिक पारिस्थितिकी तंत्र में लाता है।"
            },
            "hero.cta": { EN: "Launch Dashboard", TE: "డాష్‌బోర్డ్‌ని ప్రారంభించండి", HI: "डैशबोर्ड लॉन्च करें" },
        };

        return translations[key]?.[lang] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
