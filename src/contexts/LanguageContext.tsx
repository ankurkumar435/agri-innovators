import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'pa' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    smartFarming: "Smart Farming",
    aiPoweredRecommendations: "AI-powered crop recommendations",
    
    // Navigation
    home: "Home",
    market: "Market",
    scan: "Scan",
    aiBot: "AI Bot",
    profile: "Profile",
    
    // Quick Actions
    quickActions: "Quick Actions",
    cropAdvisory: "Crop Advisory",
    cropAdvisoryDesc: "Expert farming tips and recommendations",
    pestDiseases: "Pest & Diseases",
    pestDiseasesDesc: "Identify and treat crop problems",
    soilConditions: "Soil Conditions",
    soilConditionsDesc: "Monitor soil health and nutrients",
    aiRecommendations: "AI Recommendations",
    aiRecommendationsDesc: "Smart farming suggestions",
    
    // Weather
    weatherForecast: "Weather Forecast",
    
    // Activities
    todaysActivities: "Today's Activities",
    morningFieldInspection: "Morning Field Inspection",
    northField: "North Field",
    checkRiceCrop: "Checked rice crop growth and irrigation needs",
    fertilizerApplication: "Fertilizer Application",
    southField: "South Field",
    applyingFertilizer: "Applying organic fertilizer to wheat crops",
    marketVisit: "Market Visit",
    localMarket: "Local Market",
    checkMarketPrices: "Check current market prices for harvest planning",
    
    // Market Trends
    marketTrends: "Market Trends",
    
    // Tips
    todaysTip: "Today's Tip",
    farmingTip: "Monitor your crops closely during this season. The current weather conditions are ideal for rapid growth, but also watch for potential pest activity in warm, humid conditions.",
    
    // Market Hub
    marketHub: "Market Hub",
    todaysBestPrices: "Today's Best Prices",
    premiumRice: "Premium Rice",
    organicWheat: "Organic Wheat",
    freshCorn: "Fresh Corn",
    marketInsights: "Market Insights",
    
    // Crop Scanner
    cropScanner: "Crop Scanner",
    scanYourCrop: "Scan Your Crop",
    scanDesc: "Point your camera at crops for instant AI-powered analysis",
    startScanning: "Start Scanning",
    recentScans: "Recent Scans",
    tomatoPlant: "Tomato Plant",
    riceField: "Rice Field",
    healthy: "Healthy",
    monitor: "Monitor",
    
    // AI Assistant
    aiAssistant: "AI Assistant",
    farmBotAI: "FarmBot AI",
    farmingCompanion: "Your Farming Companion",
    askAnything: "Hello! I'm FarmBot AI, your farming companion. Ask me anything about crops, weather, pest control, market trends, or any farming-related questions!",
    quickQuestions: "Quick Questions",
    bestTimeRice: "What's the best time to plant rice?",
    preventPests: "How to prevent pest attacks?",
    currentWeather: "Current weather patterns for farming?",
    soilHealthTips: "Soil health tips for better yield",
    askAboutFarming: "Ask me anything about farming...",
    
    // Auth
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    backToHome: "Back to Home",
    joinCommunity: "Join our AI-powered farming community",
    email: "Email",
    password: "Password",
    firstName: "First Name",
    lastName: "Last Name",
    farmName: "Farm Name",
    phoneNumber: "Phone Number",
    enterEmail: "Enter your email",
    enterPassword: "Enter your password",
    createPassword: "Create a strong password",
    createAccount: "Create Account",
    creatingAccount: "Creating account...",
    signingIn: "Signing in...",
    welcomeBack: "Welcome back!",
    
    // Contact
    contactUs: "Contact Us",
    getInTouch: "Get in touch with our farming experts",
    phone: "Phone",
    address: "Address",
    sendMessage: "Send us a message",
    yourName: "Your Name",
    yourEmail: "Your Email",
    subject: "Subject",
    yourMessage: "Your Message",
    sendMessageBtn: "Send Message",
    supportHours: "Support Hours",
    mondayFriday: "Monday - Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    closed: "Closed",
    
    // About
    aboutSmartFarm: "About SmartFarm",
    revolutionizing: "Revolutionizing agriculture with AI technology",
    ourMission: "Our Mission",
    missionText: "To empower farmers worldwide with cutting-edge AI technology and data-driven insights, helping them increase productivity, reduce environmental impact, and build sustainable agricultural practices for future generations.",
    whatWeOffer: "What We Offer",
    sustainableFarming: "Sustainable Farming",
    sustainableDesc: "Promoting eco-friendly agricultural practices for a greener future.",
    increasedYield: "Increased Yield",
    increasedYieldDesc: "AI-powered recommendations to maximize your crop production.",
    riskManagement: "Risk Management",
    riskManagementDesc: "Advanced weather monitoring and pest prediction systems.",
    ourImpact: "Our Impact",
    farmersServed: "Farmers Served",
    avgYieldIncrease: "Avg. Yield Increase",
    countries: "Countries",
    satisfactionRate: "Satisfaction Rate",
    meetOurTeam: "Meet Our Team",
    recognition: "Recognition",
    joinRevolution: "Join the Revolution",
    joinRevolutionText: "Ready to transform your farming practices with AI-powered insights?",
    getStartedToday: "Get Started Today",
    
    // Profile specific translations
    farmerName: "Farmer Name",
    location: "Location",
    language: "Language",
    security: "Security",
    changePassword: "Change Password",
    resetPassword: "Reset Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    updatePassword: "Update Password",
    resetViaEmail: "Reset password via email verification",
    sendResetEmail: "We will send a password reset link to your email",
    sendResetLink: "Send Reset Link",
    enterName: "Enter your name",
    enterFarmName: "Enter your farm name",
    enterPhone: "Enter your phone number",
    enterLocation: "Enter your location",
    enterCurrent: "Enter current password",
    enterNew: "Enter new password (min 6 characters)",
    confirmNew: "Confirm new password",
    enterCurrentNew: "Enter your current password and new password",
    notSet: "Not set",
    chooseLanguage: "Choose your preferred language",
    contactSupport: "Contact Support",
    getHelp: "Get help and support",
    aboutUs: "About Us",
    learnMore: "Learn more about SmartFarm",
    signOutAccount: "Sign out of your account",
  },
  hi: {
    // Header
    smartFarming: "स्मार्ट खेती",
    aiPoweredRecommendations: "AI-संचालित फसल सिफारिशें",
    
    // Navigation
    home: "होम",
    market: "बाज़ार",
    scan: "स्कैन",
    aiBot: "AI बॉट",
    profile: "प्रोफाइल",
    
    // Quick Actions
    quickActions: "त्वरित कार्य",
    cropAdvisory: "फसल सलाह",
    cropAdvisoryDesc: "विशेषज्ञ खेती युक्तियाँ और सिफारिशें",
    pestDiseases: "कीट और रोग",
    pestDiseasesDesc: "फसल की समस्याओं की पहचान और उपचार",
    soilConditions: "मिट्टी की स्थिति",
    soilConditionsDesc: "मिट्टी के स्वास्थ्य और पोषक तत्वों की निगरानी",
    aiRecommendations: "AI सिफारिशें",
    aiRecommendationsDesc: "स्मार्ट खेती सुझाव",
    
    // Weather
    weatherForecast: "मौसम पूर्वानुमान",
    
    // Activities
    todaysActivities: "आज की गतिविधियाँ",
    morningFieldInspection: "सुबह खेत निरीक्षण",
    northField: "उत्तरी खेत",
    checkRiceCrop: "चावल की फसल वृद्धि और सिंचाई आवश्यकताओं की जाँच",
    fertilizerApplication: "उर्वरक प्रयोग",
    southField: "दक्षिणी खेत",
    applyingFertilizer: "गेहूं की फसलों में जैविक उर्वरक का प्रयोग",
    marketVisit: "बाज़ार भ्रमण",
    localMarket: "स्थानीय बाज़ार",
    checkMarketPrices: "फसल योजना के लिए वर्तमान बाज़ार मूल्य देखें",
    
    // Market Trends
    marketTrends: "बाज़ार रुझान",
    
    // Tips
    todaysTip: "आज की सुझाव",
    farmingTip: "इस मौसम में अपनी फसलों पर बारीकी से नज़र रखें। वर्तमान मौसम की स्थिति तेज़ी से वृद्धि के लिए आदर्श है, लेकिन गर्म, आर्द्र स्थितियों में संभावित कीट गतिविधि पर भी ध्यान दें।",
    
    // Auth
    signIn: "साइन इन",
    signOut: "साइन आउट",
    login: "लॉगिन",
    logout: "लॉगआउट",
    
    // Market Hub
    marketHub: "बाज़ार केंद्र",
    todaysBestPrices: "आज की सर्वोत्तम कीमतें",
    premiumRice: "प्रीमियम चावल",
    organicWheat: "जैविक गेहूं",
    freshCorn: "ताज़ा मक्का",
    marketInsights: "बाज़ार अंतर्दृष्टि",
    riceUp: "उच्च मांग के कारण इस सप्ताह चावल की कीमतें 5% बढ़ीं",
    wheatFluctuation: "गेहूं बाज़ार में मौसमी उतार-चढ़ाव दिख रहा है",
    cornExport: "मक्के के लिए नए निर्यात अवसर",
    
    // Crop Scanner
    cropScanner: "फसल स्कैनर",
    scanYourCrop: "अपनी फसल स्कैन करें",
    scanDesc: "तत्काल AI-संचालित विश्लेषण के लिए अपना कैमरा फसलों पर करें",
    startScanning: "स्कैनिंग शुरू करें",
    recentScans: "हाल की स्कैन",
    tomatoPlant: "टमाटर का पौधा",
    riceField: "चावल का खेत",
    healthy: "स्वस्थ",
    monitor: "निगरानी करें",
    
    // AI Assistant
    aiAssistant: "AI सहायक",
    farmBotAI: "फार्मबॉट AI",
    farmingCompanion: "आपका खेती साथी",
    askAnything: "खेती, फसल, मौसम या बाज़ार रुझानों के बारे में मुझसे कुछ भी पूछें!",
    quickQuestions: "त्वरित प्रश्न",
    bestTimeRice: "चावल बोने का सबसे अच्छा समय क्या है?",
    preventPests: "कीटों के हमले को कैसे रोकें?",
    currentWeather: "खेती के लिए वर्तमान मौसम पैटर्न?",
    soilHealthTips: "बेहतर उत्पादन के लिए मिट्टी स्वास्थ्य सुझाव",
    askAboutFarming: "खेती के बारे में मुझसे कुछ भी पूछें...",
    
    // Profile
    farmDetails: "खेत विवरण",
    farmSize: "खेत का आकार",
    primaryCrops: "मुख्य फसलें",
    farmingExperience: "खेती का अनुभव",
    soilType: "मिट्टी का प्रकार",
    settings: "सेटिंग्स",
    weatherAlerts: "मौसम अलर्ट",
    marketUpdates: "बाज़ार अपडेट",
    pestWarnings: "कीट चेतावनी",
    
    // Units and Status
    acres: "एकड़",
    years: "साल",
    clayLoam: "मिट्टी दोमट",
    riceWheat: "चावल, गेहूं",
    completed: "पूर्ण",
    active: "सक्रिय",
    pending: "लंबित",
    
    // Profile specific translations
    farmerName: "किसान का नाम",
    farmName: "खेत का नाम",
    phone: "फोन",
    location: "स्थान",
    email: "ईमेल",
    language: "भाषा",
    security: "सुरक्षा",
    changePassword: "पासवर्ड बदलें",
    resetPassword: "पासवर्ड रीसेट करें",
    currentPassword: "वर्तमान पासवर्ड",
    newPassword: "नया पासवर्ड",
    confirmPassword: "नया पासवर्ड पुष्टि करें",
    updatePassword: "पासवर्ड अपडेट करें",
    resetViaEmail: "ईमेल सत्यापन के माध्यम से पासवर्ड रीसेट करें",
    sendResetEmail: "हम आपके ईमेल पर पासवर्ड रीसेट लिंक भेजेंगे",
    sendResetLink: "रीसेट लिंक भेजें",
    enterName: "अपना नाम दर्ज करें",
    enterFarmName: "अपने खेत का नाम दर्ज करें",
    enterPhone: "अपना फोन नंबर दर्ज करें",
    enterLocation: "अपना स्थान दर्ज करें",
    enterEmail: "अपना ईमेल दर्ज करें",
    enterCurrent: "वर्तमान पासवर्ड दर्ज करें",
    enterNew: "नया पासवर्ड दर्ज करें (कम से कम 6 अक्षर)",
    confirmNew: "नए पासवर्ड की पुष्टि करें",
    enterCurrentNew: "अपना वर्तमान पासवर्ड और नया पासवर्ड दर्ज करें",
    notSet: "सेट नहीं है",
    chooseLanguage: "अपनी पसंदीदा भाषा चुनें",
    contactSupport: "संपर्क सहायता",
    getHelp: "सहायता और समर्थन प्राप्त करें",
    aboutUs: "हमारे बारे में",
    learnMore: "SmartFarm के बारे में और जानें",
    signOutAccount: "अपने खाते से साइन आउट करें",
  },
  pa: {
    // Header
    smartFarming: "ਸਮਾਰਟ ਖੇਤੀ",
    aiPoweredRecommendations: "AI-ਸੰਚਾਲਿਤ ਫਸਲ ਸਿਫਾਰਸ਼ਾਂ",
    
    // Navigation
    home: "ਘਰ",
    market: "ਮਾਰਕੀਟ",
    scan: "ਸਕੈਨ",
    aiBot: "AI ਬੋਟ",
    profile: "ਪ੍ਰੋਫਾਈਲ",
    
    // Quick Actions
    quickActions: "ਤੁਰੰਤ ਕਾਰਵਾਈਆਂ",
    cropAdvisory: "ਫਸਲ ਸਲਾਹ",
    cropAdvisoryDesc: "ਮਾਹਰ ਖੇਤੀ ਸੁਝਾਅ ਅਤੇ ਸਿਫਾਰਸ਼ਾਂ",
    pestDiseases: "ਕੀੜੇ ਅਤੇ ਬਿਮਾਰੀਆਂ",
    pestDiseasesDesc: "ਫਸਲ ਸਮੱਸਿਆਵਾਂ ਦੀ ਪਛਾਣ ਅਤੇ ਇਲਾਜ",
    soilConditions: "ਮਿੱਟੀ ਦੀ ਸਥਿਤੀ",
    soilConditionsDesc: "ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਅਤੇ ਪੌਸ਼ਟਿਕ ਤੱਤਾਂ ਦੀ ਨਿਗਰਾਨੀ",
    aiRecommendations: "AI ਸਿਫਾਰਸ਼ਾਂ",
    aiRecommendationsDesc: "ਸਮਾਰਟ ਖੇਤੀ ਸੁਝਾਅ",
    
    // Weather
    weatherForecast: "ਮੌਸਮ ਪੂਰਵ-ਅਨੁਮਾਨ",
    
    // Activities
    todaysActivities: "ਅੱਜ ਦੀਆਂ ਗਤੀਵਿਧੀਆਂ",
    morningFieldInspection: "ਸਵੇਰੇ ਖੇਤ ਨਿਰੀਖਣ",
    northField: "ਉੱਤਰੀ ਖੇਤ",
    checkRiceCrop: "ਚਾਵਲ ਦੀ ਫਸਲ ਦੇ ਵਾਧੇ ਅਤੇ ਸਿੰਚਾਈ ਲੋੜਾਂ ਦੀ ਜਾਂਚ",
    fertilizerApplication: "ਖਾਦ ਪ੍ਰਯੋਗ",
    southField: "ਦੱਖਣੀ ਖੇਤ",
    applyingFertilizer: "ਕਣਕ ਦੀਆਂ ਫਸਲਾਂ ਵਿੱਚ ਜੈਵਿਕ ਖਾਦ ਦਾ ਪ੍ਰਯੋਗ",
    marketVisit: "ਮਾਰਕੀਟ ਦੌਰਾ",
    localMarket: "ਸਥਾਨਕ ਮਾਰਕੀਟ",
    checkMarketPrices: "ਫਸਲ ਯੋਜਨਾ ਲਈ ਮੌਜੂਦਾ ਮਾਰਕੀਟ ਕੀਮਤਾਂ ਦੇਖੋ",
    
    // Market Trends
    marketTrends: "ਮਾਰਕੀਟ ਰੁਝਾਨ",
    
    // Tips
    todaysTip: "ਅੱਜ ਦਾ ਸੁਝਾਅ",
    farmingTip: "ਇਸ ਮੌਸਮ ਵਿੱਚ ਆਪਣੀਆਂ ਫਸਲਾਂ ਦੀ ਨੇੜਿਓਂ ਨਿਗਰਾਨੀ ਕਰੋ। ਮੌਜੂਦਾ ਮੌਸਮੀ ਸਥਿਤੀਆਂ ਤੇਜ਼ ਵਾਧੇ ਲਈ ਆਦਰਸ਼ ਹਨ, ਪਰ ਗਰਮ, ਨਮੀ ਵਾਲੀਆਂ ਸਥਿਤੀਆਂ ਵਿੱਚ ਸੰਭਾਵਿਤ ਕੀੜੇ ਦੀ ਗਤੀਵਿਧੀ 'ਤੇ ਵੀ ਧਿਆਨ ਦਿਓ।",
    
    // Auth
    signIn: "ਸਾਈਨ ਇਨ",
    signOut: "ਸਾਈਨ ਆਉਟ",
    login: "ਲਾਗਇਨ",
    logout: "ਲਾਗਆਉਟ",
    
    // Market Hub
    marketHub: "ਮਾਰਕੀਟ ਹੱਬ",
    todaysBestPrices: "ਅੱਜ ਦੀਆਂ ਸਰਵੋਤਮ ਕੀਮਤਾਂ",
    premiumRice: "ਪ੍ਰੀਮੀਅਮ ਚਾਵਲ",
    organicWheat: "ਜੈਵਿਕ ਕਣਕ",
    freshCorn: "ਤਾਜ਼ਾ ਮੱਕੀ",
    marketInsights: "ਮਾਰਕੀਟ ਸੂਝ",
    riceUp: "ਉੱਚ ਮੰਗ ਕਾਰਨ ਇਸ ਹਫ਼ਤੇ ਚਾਵਲ ਦੀਆਂ ਕੀਮਤਾਂ 5% ਵਧੀਆਂ",
    wheatFluctuation: "ਕਣਕ ਮਾਰਕੀਟ ਵਿੱਚ ਮੌਸਮੀ ਉਤਾਰ-ਚਢ਼ਾਅ ਦਿਖ ਰਿਹਾ ਹੈ",
    cornExport: "ਮੱਕੀ ਲਈ ਨਵੇਂ ਨਿਰਯਾਤ ਮੌਕੇ",
    
    // Crop Scanner
    cropScanner: "ਫਸਲ ਸਕੈਨਰ",
    scanYourCrop: "ਆਪਣੀ ਫਸਲ ਸਕੈਨ ਕਰੋ",
    scanDesc: "ਤੁਰੰਤ AI-ਸੰਚਾਲਿਤ ਵਿਸ਼ਲੇਸ਼ਣ ਲਈ ਆਪਣਾ ਕੈਮਰਾ ਫਸਲਾਂ 'ਤੇ ਕਰੋ",
    startScanning: "ਸਕੈਨਿੰਗ ਸ਼ੁਰੂ ਕਰੋ",
    recentScans: "ਹਾਲੀਆ ਸਕੈਨ",
    tomatoPlant: "ਟਮਾਟਰ ਦਾ ਪੌਧਾ",
    riceField: "ਚਾਵਲ ਦਾ ਖੇਤ",
    healthy: "ਸਿਹਤਮੰਦ",
    monitor: "ਨਿਗਰਾਨੀ ਕਰੋ",
    
    // AI Assistant
    aiAssistant: "AI ਸਹਾਇਕ",
    farmBotAI: "ਫਾਰਮਬੋਟ AI",
    farmingCompanion: "ਤੁਹਾਡਾ ਖੇਤੀ ਸਾਥੀ",
    askAnything: "ਖੇਤੀ, ਫਸਲ, ਮੌਸਮ ਜਾਂ ਮਾਰਕੀਟ ਰੁਝਾਨਾਂ ਬਾਰੇ ਮੈਨੂੰ ਕੁਝ ਵੀ ਪੁੱਛੋ!",
    quickQuestions: "ਤੁਰੰਤ ਸਵਾਲ",
    bestTimeRice: "ਚਾਵਲ ਬੀਜਣ ਦਾ ਸਭ ਤੋਂ ਵਧੀਆ ਸਮਾਂ ਕੀ ਹੈ?",
    preventPests: "ਕੀੜਿਆਂ ਦੇ ਹਮਲੇ ਨੂੰ ਕਿਵੇਂ ਰੋਕਣਾ ਹੈ?",
    currentWeather: "ਖੇਤੀ ਲਈ ਮੌਜੂਦਾ ਮੌਸਮ ਪੈਟਰਨ?",
    soilHealthTips: "ਬਿਹਤਰ ਉਤਪਾਦਨ ਲਈ ਮਿੱਟੀ ਸਿਹਤ ਸੁਝਾਅ",
    askAboutFarming: "ਖੇਤੀ ਬਾਰੇ ਮੈਨੂੰ ਕੁਝ ਵੀ ਪੁੱਛੋ...",
    
    // Profile
    farmDetails: "ਖੇਤ ਵੇਰਵੇ",
    farmSize: "ਖੇਤ ਦਾ ਆਕਾਰ",
    primaryCrops: "ਮੁੱਖ ਫਸਲਾਂ",
    farmingExperience: "ਖੇਤੀ ਅਨੁਭਵ",
    soilType: "ਮਿੱਟੀ ਦੀ ਕਿਸਮ",
    settings: "ਸੈਟਿੰਗਾਂ",
    weatherAlerts: "ਮੌਸਮ ਅਲਰਟ",
    marketUpdates: "ਮਾਰਕੀਟ ਅਪਡੇਟ",
    pestWarnings: "ਕੀੜੇ ਚੇਤਾਵਨੀ",
    
    // Units and Status
    acres: "ਏਕੜ",
    years: "ਸਾਲ",
    clayLoam: "ਮਿੱਟੀ ਦੋਮਟ",
    riceWheat: "ਚਾਵਲ, ਕਣਕ",
    completed: "ਪੂਰਾ",
    active: "ਸਰਗਰਮ",
    pending: "ਬਾਕੀ",
    
    // Profile specific translations
    farmerName: "ਕਿਸਾਨ ਦਾ ਨਾਮ",
    farmName: "ਖੇਤ ਦਾ ਨਾਮ",
    phone: "ਫੋਨ",
    location: "ਸਥਿਤੀ",
    email: "ਈਮੇਲ",
    language: "ਭਾਸ਼ਾ",
    security: "ਸੁਰੱਖਿਆ",
    changePassword: "ਪਾਸਵਰਡ ਬਦਲੋ",
    resetPassword: "ਪਾਸਵਰਡ ਰੀਸੈੱਟ ਕਰੋ",
    currentPassword: "ਮੌਜੂਦਾ ਪਾਸਵਰਡ",
    newPassword: "ਨਵਾਂ ਪਾਸਵਰਡ",
    confirmPassword: "ਨਵੇਂ ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    updatePassword: "ਪਾਸਵਰਡ ਅੱਪਡੇਟ ਕਰੋ",
    resetViaEmail: "ਈਮੇਲ ਪ੍ਰਮਾਣਿਕਤਾ ਦੁਆਰਾ ਪਾਸਵਰਡ ਰੀਸੈੱਟ ਕਰੋ",
    sendResetEmail: "ਅਸੀਂ ਤੁਹਾਡੇ ਈਮੇਲ 'ਤੇ ਪਾਸਵਰਡ ਰੀਸੈੱਟ ਲਿੰਕ ਭੇਜਾਂਗੇ",
    sendResetLink: "ਰੀਸੈੱਟ ਲਿੰਕ ਭੇਜੋ",
    enterName: "ਆਪਣਾ ਨਾਮ ਦਰਜ ਕਰੋ",
    enterFarmName: "ਆਪਣੇ ਖੇਤ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ",
    enterPhone: "ਆਪਣਾ ਫੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ",
    enterLocation: "ਆਪਣੀ ਸਥਿਤੀ ਦਰਜ ਕਰੋ",
    enterEmail: "ਆਪਣਾ ਈਮੇਲ ਦਰਜ ਕਰੋ",
    enterCurrent: "ਮੌਜੂਦਾ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ",
    enterNew: "ਨਵਾਂ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ (ਘੱਟੋ-ਘੱਟ 6 ਅੱਖਰ)",
    confirmNew: "ਨਵੇਂ ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    enterCurrentNew: "ਆਪਣਾ ਮੌਜੂਦਾ ਪਾਸਵਰਡ ਅਤੇ ਨਵਾਂ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ",
    notSet: "ਸੈੱਟ ਨਹੀਂ ਹੈ",
    chooseLanguage: "ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ",
    contactSupport: "ਸਹਾਇਤਾ ਨਾਲ ਸੰਪਰਕ ਕਰੋ",
    getHelp: "ਸਹਾਇਤਾ ਅਤੇ ਸਮਰਥਨ ਪ੍ਰਾਪਤ ਕਰੋ",
    aboutUs: "ਸਾਡੇ ਬਾਰੇ",
    learnMore: "SmartFarm ਬਾਰੇ ਹੋਰ ਜਾਣੋ",
    signOutAccount: "ਆਪਣੇ ਖਾਤੇ ਤੋਂ ਸਾਈਨ ਆਉਟ ਕਰੋ",
  },
  mr: {
    // Header
    smartFarming: "स्मार्ट शेती",
    aiPoweredRecommendations: "AI-चालित पीक शिफारसी",
    
    // Navigation
    home: "मुख्यपृष्ठ",
    market: "बाजार",
    scan: "स्कॅन",
    aiBot: "AI बॉट",
    profile: "प्रोफाइल",
    
    // Quick Actions
    quickActions: "त्वरित कृती",
    cropAdvisory: "पीक सल्ला",
    cropAdvisoryDesc: "तज्ञ शेती सुचना आणि शिफारसी",
    pestDiseases: "कीड आणि रोग",
    pestDiseasesDesc: "पिकांच्या समस्यांची ओळख आणि उपचार",
    soilConditions: "जमिनीची स्थिती",
    soilConditionsDesc: "मातीच्या आरोग्य आणि पोषक घटकांचे निरीक्षण",
    aiRecommendations: "AI शिफारसी",
    aiRecommendationsDesc: "स्मार्ट शेती सुझाव",
    
    // Weather
    weatherForecast: "हवामान अंदाज",
    
    // Activities
    todaysActivities: "आजच्या क्रियाकलाप",
    morningFieldInspection: "सकाळी शेत तपासणी",
    northField: "उत्तर शेत",
    checkRiceCrop: "तांदुळाच्या पिकाची वाढ आणि सिंचनाच्या गरजा तपासल्या",
    fertilizerApplication: "खत वापर",
    southField: "दक्षिण शेत",
    applyingFertilizer: "गव्हाच्या पिकांवर सेंद्रिय खत वापरणे",
    marketVisit: "बाजार भेट",
    localMarket: "स्थानिक बाजार",
    checkMarketPrices: "कापणी नियोजनासाठी सध्याच्या बाजारभावा तपासा",
    
    // Market Trends
    marketTrends: "बाजार प्रवृत्ती",
    
    // Tips
    todaysTip: "आजची टीप",
    farmingTip: "या हंगामात आपल्या पिकांवर बारकाईने लक्ष ठेवा. सध्याची हवामान परिस्थिती वेगवान वाढीसाठी आदर्श आहे, परंतु उबदार, आर्द्र परिस्थितीत संभाव्य कीड क्रियाकलापांवरही लक्ष ठेवा.",
    
    // Auth
    signIn: "साइन इन",
    signOut: "साइन आउट",
    login: "लॉगिन",
    logout: "लॉगआउट",
    
    // Market Hub
    marketHub: "बाजार केंद्र",
    todaysBestPrices: "आजचे सर्वोत्तम दर",
    premiumRice: "प्रीमियम तांदूळ",
    organicWheat: "सेंद्रिय गहू",
    freshCorn: "ताजा मका",
    marketInsights: "बाजार अंतर्दृष्टी",
    riceUp: "जास्त मागणीमुळे या आठवड्यात तांदूळाच्या किमती ५% वाढल्या",
    wheatFluctuation: "गव्हाच्या बाजारात हंगामी चढउतार दिसत आहेत",
    cornExport: "मक्यासाठी नवीन निर्यात संधी",
    
    // Crop Scanner
    cropScanner: "पीक स्कॅनर",
    scanYourCrop: "आपले पीक स्कॅन करा",
    scanDesc: "तत्काळ AI-चालित विश्लेषणासाठी आपला कॅमेरा पिकांवर करा",
    startScanning: "स्कॅनिंग सुरू करा",
    recentScans: "अलीकडील स्कॅन",
    tomatoPlant: "टोमॅटोचे झाड",
    riceField: "तांदळाचे शेत",
    healthy: "निरोगी",
    monitor: "निरीक्षण करा",
    
    // AI Assistant
    aiAssistant: "AI सहाय्यक",
    farmBotAI: "फार्मबॉट AI",
    farmingCompanion: "तुमचा शेती साथीदार",
    askAnything: "शेती, पीक, हवामान किंवा बाजार प्रवृत्तीबद्दल मला काहीही विचारा!",
    quickQuestions: "त्वरित प्रश्न",
    bestTimeRice: "तांदूळ पेरण्याची सर्वोत्तम वेळ कोणती?",
    preventPests: "कीड हल्ले कसे टाळावे?",
    currentWeather: "शेतीसाठी सध्याचे हवामान स्वरूप?",
    soilHealthTips: "चांगल्या उत्पादनासाठी माती आरोग्य टिप्स",
    askAboutFarming: "शेतीबद्दल मला काहीही विचारा...",
    
    // Profile
    farmDetails: "शेत तपशील",
    farmSize: "शेताचा आकार",
    primaryCrops: "मुख्य पिके",
    farmingExperience: "शेती अनुभव",
    soilType: "मातीचा प्रकार",
    settings: "सेटिंग्स",
    weatherAlerts: "हवामान चेतावणी",
    marketUpdates: "बाजार अपडेट",
    pestWarnings: "कीड चेतावणी",
    
    // Units and Status
    acres: "एकर",
    years: "वर्षे",
    clayLoam: "चिकणमाती दुमट",
    riceWheat: "तांदूळ, गहू",
    completed: "पूर्ण",
    active: "सक्रिय",
    pending: "प्रलंबित",
    
    // Profile specific translations
    farmerName: "शेतकऱ्याचे नाव",
    farmName: "शेताचे नाव",
    phone: "फोन",
    location: "स्थान",
    email: "ईमेल",
    language: "भाषा",
    security: "सुरक्षा",
    changePassword: "पासवर्ड बदला",
    resetPassword: "पासवर्ड रीसेट करा",
    currentPassword: "सध्याचा पासवर्ड",
    newPassword: "नवीन पासवर्ड",
    confirmPassword: "नवीन पासवर्डची पुष्टी करा",
    updatePassword: "पासवर्ड अपडेट करा",
    resetViaEmail: "ईमेल प्रमाणीकरणाद्वारे पासवर्ड रीसेट करा",
    sendResetEmail: "आम्ही तुमच्या ईमेलवर पासवर्ड रीसेट लिंक पाठवू",
    sendResetLink: "रीसेट लिंक पाठवा",
    enterName: "तुमचे नाव प्रविष्ट करा",
    enterFarmName: "तुमच्या शेताचे नाव प्रविष्ट करा",
    enterPhone: "तुमचा फोन नंबर प्रविष्ट करा",
    enterLocation: "तुमचे स्थान प्रविष्ट करा",
    enterEmail: "तुमचा ईमेल प्रविष्ट करा",
    enterCurrent: "सध्याचा पासवर्ड प्रविष्ट करा",
    enterNew: "नवीन पासवर्ड प्रविष्ट करा (किमान 6 अक्षरे)",
    confirmNew: "नवीन पासवर्डची पुष्टी करा",
    enterCurrentNew: "तुमचा सध्याचा पासवर्ड आणि नवीन पासवर्ड प्रविष्ट करा",
    notSet: "सेट नाही",
    chooseLanguage: "तुमची आवडती भाषा निवडा",
    contactSupport: "समर्थनाशी संपर्क साधा",
    getHelp: "मदत आणि समर्थन मिळवा",
    aboutUs: "आमच्याबद्दल",
    learnMore: "SmartFarm बद्दल अधिक जाणून घ्या",
    signOutAccount: "तुमच्या खात्यातून साइन आउट करा",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};