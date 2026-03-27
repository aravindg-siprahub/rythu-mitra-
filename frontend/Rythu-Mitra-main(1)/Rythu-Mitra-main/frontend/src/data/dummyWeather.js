export const currentWeather = {
    temp: 28,
    condition: "Overcast",
    humidity: "82%",
    wind: "14 km/h",
    alert: "Heavy Rain Alert (48h)",
};

export const forecast = [
    { day: "Mon", temp: 29, icon: "🌧", rain: "80%" },
    { day: "Tue", temp: 27, icon: "⛈", rain: "95%" },
    { day: "Wed", temp: 28, icon: "🌧", rain: "60%" },
    { day: "Thu", temp: 30, icon: "⛅", rain: "20%" },
    { day: "Fri", temp: 32, icon: "☀", rain: "0%" },
];

export const soilMoistureMap = [
    { sector: "A1", level: "90%", status: "Saturated" },
    { sector: "A2", level: "65%", status: "Optimal" },
    { sector: "B1", level: "40%", status: "Dry" },
];
