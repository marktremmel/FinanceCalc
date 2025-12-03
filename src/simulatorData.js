export const WEATHER_TYPES = [
    { id: 'sunny', icon: '☀️', moodMod: 5 },
    { id: 'cloudy', icon: '☁️', moodMod: 0 },
    { id: 'rainy', icon: '🌧️', moodMod: -5 },
    { id: 'stormy', icon: '⛈️', moodMod: -10 },
    { id: 'snowy', icon: '❄️', moodMod: 2 },
];

export const DAILY_EVENTS = {
    criticalFail: [
        { id: 'broken_appliance', icon: '💥', cost: 15000, mood: -20 },
        { id: 'fine', icon: '🚓', cost: 10000, mood: -15 },
        { id: 'medical', icon: '🏥', cost: 8000, mood: -10 },
        { id: 'theft', icon: '🦹', cost: 12000, mood: -25 },
    ],
    bad: [
        { id: 'bad_food', icon: '🤢', cost: 2000, mood: -5 },
        { id: 'lost_ticket', icon: '🎫', cost: 1500, mood: -5 },
        { id: 'umbrella', icon: '☂️', cost: 3000, mood: -2 },
        { id: 'coffee_spill', icon: '☕', cost: 0, mood: -5 },
    ],
    neutral: [
        { id: 'work', icon: '💼', cost: 0, mood: -1 },
        { id: 'groceries', icon: '🛒', cost: 3000, mood: 0 },
        { id: 'read_book', icon: '📖', cost: 0, mood: 2 },
        { id: 'walk', icon: '🚶', cost: 0, mood: 3 },
        { id: 'netflix', icon: '📺', cost: 0, mood: 1 },
    ],
    good: [
        { id: 'found_money', icon: '💰', cost: -1000, mood: 5 }, // Negative cost = gain
        { id: 'discount', icon: '🏷️', cost: -500, mood: 3 },
        { id: 'compliment', icon: '😊', cost: 0, mood: 5 },
        { id: 'good_meal', icon: '🍕', cost: 4000, mood: 5 }, // Cost but good mood
    ],
    criticalSuccess: [
        { id: 'bonus', icon: '💎', cost: -20000, mood: 30 },
        { id: 'gift', icon: '🎁', cost: -5000, mood: 20 },
        { id: 'lottery', icon: '🎰', cost: -15000, mood: 25 },
        { id: 'promotion', icon: '📈', cost: -30000, mood: 40 }, // One-time bonus representation
    ]
};

export const getRandomEvent = (roll) => {
    let category = 'neutral';
    if (roll === 1) category = 'criticalFail';
    else if (roll <= 5) category = 'bad';
    else if (roll >= 16 && roll < 20) category = 'good';
    else if (roll === 20) category = 'criticalSuccess';

    const events = DAILY_EVENTS[category];
    const event = events[Math.floor(Math.random() * events.length)];
    return { ...event, category, roll };
};

export const getRandomWeather = () => {
    return WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
};
