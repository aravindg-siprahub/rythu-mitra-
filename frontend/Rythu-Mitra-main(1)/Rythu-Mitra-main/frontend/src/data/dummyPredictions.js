export const soilData = {
    nitrogen: { value: 240, status: "Optimal", color: "text-emerald-500" },
    phosphorus: { value: 18, status: "Low", color: "text-amber-500" },
    potassium: { value: 350, status: "High", color: "text-blue-500" },
    ph: { value: 6.5, status: "Neutral", color: "text-emerald-500" },
};

export const cropPredictions = [
    { crop: "Paddy (RNR)", yield: "45 bags/acre", probability: "94%", recommended: true },
    { crop: "Cotton", yield: "12 quintals/acre", probability: "86%", recommended: false },
    { crop: "Chilli", yield: "25 quintals/acre", probability: "72%", recommended: false },
];

export const fertilizationPlan = [
    { day: "Day 1", task: "Basal Dose (DAP)", amount: "50kg" },
    { day: "Day 25", task: "Top Dressing (Urea)", amount: "30kg" },
    { day: "Day 45", task: "Micronutrients", amount: "5kg Mix" },
];
