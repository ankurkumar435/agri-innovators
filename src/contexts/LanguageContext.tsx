import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

    // Common
    back: "Back",
    locationNotSet: "Location not set",
    guestUser: "Guest User",
    noPhone: "No phone",

    // Auth extras
    verifyEmail: "Verify Your Email",
    enterOtpSent: "Enter the 6-digit code sent to",
    verifyAndContinue: "Verify & Continue",
    verifying: "Verifying...",
    resendOtp: "Resend OTP",
    resendIn: "Resend in",
    didntReceiveCode: "Didn't receive the code?",
    forgotPassword: "Forgot Password?",
    enterFirstName: "Enter your first name",
    enterLastName: "Enter your last name",
    enterEmailAddress: "Enter your email address",
    enterPhone10: "Enter your 10-digit phone number",
    enterStrongPassword: "Enter a strong password",
    digitsEntered: "digits entered",
    phoneNumberLabel: "Phone Number (10 digits)",
    invalidPhone: "Invalid phone number",
    invalidPhoneDesc: "Please enter a valid 10-digit phone number.",
    invalidOtp: "Invalid OTP",
    invalidOtpDesc: "Please enter the 6-digit code.",
    otpSent: "OTP Sent!",
    otpSentDesc: "Please check your email for the verification code.",
    otpResent: "OTP Resent!",
    otpResentDesc: "Check your email for the new code.",
    accountVerified: "Account verified!",
    welcomeSmartFarming: "Welcome to Smart Farming.",
    registrationFailed: "Registration failed",
    verificationFailed: "Verification failed",
    resendFailedTitle: "Resend failed",
    loginFailed: "Login failed",
    resetLinkSent: "Reset link sent!",
    resetLinkSentDesc: "Check your email for the password reset link.",
    resetLinkFailed: "Failed to send reset link",
    enterEmailFirst: "Enter your email",
    enterEmailFirstDesc: "Please enter your email address first.",

    // About extras
    aboutTagline: "Revolutionizing agriculture with AI technology",

    // Contact extras
    contactUsTitle: "Contact Us",
    sendUsMessage: "Send us a message",
    messageSent: "Message Sent!",
    messageSentDesc: "Thank you for contacting us. We'll get back to you soon.",
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

    // Common
    back: "वापस",
    backToHome: "होम पर वापस",
    locationNotSet: "स्थान सेट नहीं है",
    guestUser: "अतिथि उपयोगकर्ता",
    noPhone: "फोन नहीं",

    // Auth extras
    signUp: "साइन अप",
    joinCommunity: "हमारे AI-संचालित खेती समुदाय में शामिल हों",
    firstName: "पहला नाम",
    lastName: "अंतिम नाम",
    verifyEmail: "अपना ईमेल सत्यापित करें",
    enterOtpSent: "इस ईमेल पर भेजा 6-अंकीय कोड दर्ज करें",
    verifyAndContinue: "सत्यापित करें और जारी रखें",
    verifying: "सत्यापित हो रहा है...",
    resendOtp: "OTP फिर से भेजें",
    resendIn: "पुनः भेजें",
    didntReceiveCode: "कोड प्राप्त नहीं हुआ?",
    forgotPassword: "पासवर्ड भूल गए?",
    enterFirstName: "अपना पहला नाम दर्ज करें",
    enterLastName: "अपना अंतिम नाम दर्ज करें",
    enterEmailAddress: "अपना ईमेल पता दर्ज करें",
    enterPhone10: "अपना 10-अंकीय फोन नंबर दर्ज करें",
    enterStrongPassword: "एक मजबूत पासवर्ड दर्ज करें",
    enterPassword: "अपना पासवर्ड दर्ज करें",
    createAccount: "खाता बनाएँ",
    creatingAccount: "खाता बनाया जा रहा है...",
    signingIn: "साइन इन हो रहा है...",
    digitsEntered: "अंक दर्ज किए",
    phoneNumberLabel: "फोन नंबर (10 अंक)",
    invalidPhone: "अमान्य फोन नंबर",
    invalidPhoneDesc: "कृपया एक मान्य 10-अंकीय फोन नंबर दर्ज करें।",
    invalidOtp: "अमान्य OTP",
    invalidOtpDesc: "कृपया 6-अंकीय कोड दर्ज करें।",
    otpSent: "OTP भेजा गया!",
    otpSentDesc: "कृपया सत्यापन कोड के लिए अपना ईमेल देखें।",
    otpResent: "OTP पुनः भेजा गया!",
    otpResentDesc: "नए कोड के लिए अपना ईमेल देखें।",
    accountVerified: "खाता सत्यापित!",
    welcomeSmartFarming: "स्मार्ट खेती में आपका स्वागत है।",
    welcomeBack: "वापसी पर स्वागत है!",
    registrationFailed: "पंजीकरण विफल",
    verificationFailed: "सत्यापन विफल",
    resendFailedTitle: "पुनः भेजना विफल",
    loginFailed: "लॉगिन विफल",
    resetLinkSent: "रीसेट लिंक भेजा गया!",
    resetLinkSentDesc: "पासवर्ड रीसेट लिंक के लिए अपना ईमेल देखें।",
    resetLinkFailed: "रीसेट लिंक भेजने में विफल",
    enterEmailFirst: "अपना ईमेल दर्ज करें",
    enterEmailFirstDesc: "कृपया पहले अपना ईमेल पता दर्ज करें।",

    // About
    aboutSmartFarm: "SmartFarm के बारे में",
    aboutTagline: "AI तकनीक के साथ कृषि में क्रांति",
    ourMission: "हमारा मिशन",
    missionText: "अत्याधुनिक AI तकनीक और डेटा-संचालित अंतर्दृष्टि के साथ दुनिया भर के किसानों को सशक्त बनाना, उन्हें उत्पादकता बढ़ाने, पर्यावरणीय प्रभाव कम करने और भविष्य की पीढ़ियों के लिए टिकाऊ कृषि पद्धतियाँ बनाने में मदद करना।",
    whatWeOffer: "हम क्या प्रदान करते हैं",
    sustainableFarming: "टिकाऊ खेती",
    sustainableDesc: "हरित भविष्य के लिए पर्यावरण-अनुकूल कृषि पद्धतियों को बढ़ावा देना।",
    increasedYield: "बढ़ी हुई उपज",
    increasedYieldDesc: "आपके फसल उत्पादन को अधिकतम करने के लिए AI-संचालित सिफारिशें।",
    riskManagement: "जोखिम प्रबंधन",
    riskManagementDesc: "उन्नत मौसम निगरानी और कीट पूर्वानुमान प्रणाली।",
    ourImpact: "हमारा प्रभाव",
    farmersServed: "सेवित किसान",
    avgYieldIncrease: "औसत उपज वृद्धि",
    countries: "देश",
    satisfactionRate: "संतुष्टि दर",
    meetOurTeam: "हमारी टीम से मिलें",
    recognition: "मान्यता",
    joinRevolution: "क्रांति में शामिल हों",
    joinRevolutionText: "AI-संचालित अंतर्दृष्टि के साथ अपनी खेती की पद्धतियों को बदलने के लिए तैयार हैं?",
    getStartedToday: "आज शुरू करें",

    // Contact
    contactUsTitle: "संपर्क करें",
    getInTouch: "हमारे खेती विशेषज्ञों से संपर्क करें",
    sendUsMessage: "हमें संदेश भेजें",
    yourName: "आपका नाम",
    yourEmail: "आपका ईमेल",
    subject: "विषय",
    subjectLabel: "विषय",
    yourMessage: "आपका संदेश",
    sendMessageBtn: "संदेश भेजें",
    address: "पता",
    addressLabel: "पता",
    supportHours: "सहायता समय",
    mondayFriday: "सोमवार - शुक्रवार",
    saturday: "शनिवार",
    sunday: "रविवार",
    closed: "बंद",
    messageSent: "संदेश भेजा गया!",
    messageSentDesc: "हमसे संपर्क करने के लिए धन्यवाद। हम जल्द ही आपसे संपर्क करेंगे।",
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

    // Common
    back: "ਵਾਪਸ",
    backToHome: "ਹੋਮ ਤੇ ਵਾਪਸ",
    locationNotSet: "ਸਥਿਤੀ ਸੈੱਟ ਨਹੀਂ ਹੈ",
    guestUser: "ਮਹਿਮਾਨ ਉਪਭੋਗਤਾ",
    noPhone: "ਕੋਈ ਫੋਨ ਨਹੀਂ",

    // Auth extras
    signUp: "ਸਾਈਨ ਅੱਪ",
    joinCommunity: "ਸਾਡੇ AI-ਸੰਚਾਲਿਤ ਖੇਤੀ ਭਾਈਚਾਰੇ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ",
    firstName: "ਪਹਿਲਾ ਨਾਮ",
    lastName: "ਆਖਰੀ ਨਾਮ",
    verifyEmail: "ਆਪਣਾ ਈਮੇਲ ਸਤਿਆਪਿਤ ਕਰੋ",
    enterOtpSent: "ਈਮੇਲ 'ਤੇ ਭੇਜਿਆ 6-ਅੰਕਾਂ ਵਾਲਾ ਕੋਡ ਦਰਜ ਕਰੋ",
    verifyAndContinue: "ਸਤਿਆਪਿਤ ਕਰੋ ਅਤੇ ਜਾਰੀ ਰੱਖੋ",
    verifying: "ਸਤਿਆਪਿਤ ਹੋ ਰਿਹਾ ਹੈ...",
    resendOtp: "OTP ਦੁਬਾਰਾ ਭੇਜੋ",
    resendIn: "ਦੁਬਾਰਾ ਭੇਜੋ",
    didntReceiveCode: "ਕੋਡ ਪ੍ਰਾਪਤ ਨਹੀਂ ਹੋਇਆ?",
    forgotPassword: "ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?",
    enterFirstName: "ਆਪਣਾ ਪਹਿਲਾ ਨਾਮ ਦਰਜ ਕਰੋ",
    enterLastName: "ਆਪਣਾ ਆਖਰੀ ਨਾਮ ਦਰਜ ਕਰੋ",
    enterEmailAddress: "ਆਪਣਾ ਈਮੇਲ ਪਤਾ ਦਰਜ ਕਰੋ",
    enterPhone10: "ਆਪਣਾ 10-ਅੰਕਾਂ ਵਾਲਾ ਫੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ",
    enterStrongPassword: "ਇੱਕ ਮਜ਼ਬੂਤ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ",
    enterPassword: "ਆਪਣਾ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ",
    createAccount: "ਖਾਤਾ ਬਣਾਓ",
    creatingAccount: "ਖਾਤਾ ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...",
    signingIn: "ਸਾਈਨ ਇਨ ਹੋ ਰਿਹਾ ਹੈ...",
    digitsEntered: "ਅੰਕ ਦਰਜ ਕੀਤੇ",
    phoneNumberLabel: "ਫੋਨ ਨੰਬਰ (10 ਅੰਕ)",
    invalidPhone: "ਅਵੈਧ ਫੋਨ ਨੰਬਰ",
    invalidPhoneDesc: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੈਧ 10-ਅੰਕਾਂ ਵਾਲਾ ਫੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ।",
    invalidOtp: "ਅਵੈਧ OTP",
    invalidOtpDesc: "ਕਿਰਪਾ ਕਰਕੇ 6-ਅੰਕਾਂ ਵਾਲਾ ਕੋਡ ਦਰਜ ਕਰੋ।",
    otpSent: "OTP ਭੇਜਿਆ ਗਿਆ!",
    otpSentDesc: "ਕਿਰਪਾ ਕਰਕੇ ਸਤਿਆਪਨ ਕੋਡ ਲਈ ਆਪਣਾ ਈਮੇਲ ਦੇਖੋ।",
    otpResent: "OTP ਦੁਬਾਰਾ ਭੇਜਿਆ ਗਿਆ!",
    otpResentDesc: "ਨਵੇਂ ਕੋਡ ਲਈ ਆਪਣਾ ਈਮੇਲ ਦੇਖੋ।",
    accountVerified: "ਖਾਤਾ ਸਤਿਆਪਿਤ!",
    welcomeSmartFarming: "ਸਮਾਰਟ ਖੇਤੀ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ।",
    welcomeBack: "ਵਾਪਸੀ 'ਤੇ ਸਵਾਗਤ ਹੈ!",
    registrationFailed: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਸਫਲ",
    verificationFailed: "ਸਤਿਆਪਨ ਅਸਫਲ",
    resendFailedTitle: "ਦੁਬਾਰਾ ਭੇਜਣਾ ਅਸਫਲ",
    loginFailed: "ਲਾਗਇਨ ਅਸਫਲ",
    resetLinkSent: "ਰੀਸੈੱਟ ਲਿੰਕ ਭੇਜਿਆ ਗਿਆ!",
    resetLinkSentDesc: "ਪਾਸਵਰਡ ਰੀਸੈੱਟ ਲਿੰਕ ਲਈ ਆਪਣਾ ਈਮੇਲ ਦੇਖੋ।",
    resetLinkFailed: "ਰੀਸੈੱਟ ਲਿੰਕ ਭੇਜਣ ਵਿੱਚ ਅਸਫਲ",
    enterEmailFirst: "ਆਪਣਾ ਈਮੇਲ ਦਰਜ ਕਰੋ",
    enterEmailFirstDesc: "ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਆਪਣਾ ਈਮੇਲ ਪਤਾ ਦਰਜ ਕਰੋ।",

    // About
    aboutSmartFarm: "SmartFarm ਬਾਰੇ",
    aboutTagline: "AI ਤਕਨਾਲੋਜੀ ਨਾਲ ਖੇਤੀ ਵਿੱਚ ਕ੍ਰਾਂਤੀ",
    ourMission: "ਸਾਡਾ ਮਿਸ਼ਨ",
    missionText: "ਅਤਿ-ਆਧੁਨਿਕ AI ਤਕਨਾਲੋਜੀ ਅਤੇ ਡੇਟਾ-ਸੰਚਾਲਿਤ ਸੂਝ ਨਾਲ ਦੁਨੀਆ ਭਰ ਦੇ ਕਿਸਾਨਾਂ ਨੂੰ ਸਸ਼ਕਤ ਕਰਨਾ, ਉਹਨਾਂ ਦੀ ਉਤਪਾਦਕਤਾ ਵਧਾਉਣ, ਵਾਤਾਵਰਣ ਪ੍ਰਭਾਵ ਨੂੰ ਘਟਾਉਣ ਅਤੇ ਭਵਿੱਖ ਦੀਆਂ ਪੀੜ੍ਹੀਆਂ ਲਈ ਟਿਕਾਊ ਖੇਤੀ ਪ੍ਰਥਾਵਾਂ ਬਣਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰਨਾ।",
    whatWeOffer: "ਅਸੀਂ ਕੀ ਪੇਸ਼ ਕਰਦੇ ਹਾਂ",
    sustainableFarming: "ਟਿਕਾਊ ਖੇਤੀ",
    sustainableDesc: "ਹਰੇ ਭਰੇ ਭਵਿੱਖ ਲਈ ਵਾਤਾਵਰਣ ਅਨੁਕੂਲ ਖੇਤੀ ਪ੍ਰਥਾਵਾਂ ਨੂੰ ਉਤਸ਼ਾਹਿਤ ਕਰਨਾ।",
    increasedYield: "ਵਧੀ ਹੋਈ ਉਪਜ",
    increasedYieldDesc: "ਤੁਹਾਡੇ ਫਸਲ ਉਤਪਾਦਨ ਨੂੰ ਵੱਧ ਤੋਂ ਵੱਧ ਕਰਨ ਲਈ AI-ਸੰਚਾਲਿਤ ਸਿਫਾਰਸ਼ਾਂ।",
    riskManagement: "ਜੋਖਮ ਪ੍ਰਬੰਧਨ",
    riskManagementDesc: "ਉੱਨਤ ਮੌਸਮ ਨਿਗਰਾਨੀ ਅਤੇ ਕੀੜੇ ਪੂਰਵ ਅਨੁਮਾਨ ਪ੍ਰਣਾਲੀ।",
    ourImpact: "ਸਾਡਾ ਪ੍ਰਭਾਵ",
    farmersServed: "ਸੇਵਾ ਪ੍ਰਾਪਤ ਕਿਸਾਨ",
    avgYieldIncrease: "ਔਸਤ ਉਪਜ ਵਾਧਾ",
    countries: "ਦੇਸ਼",
    satisfactionRate: "ਸੰਤੁਸ਼ਟੀ ਦਰ",
    meetOurTeam: "ਸਾਡੀ ਟੀਮ ਨੂੰ ਮਿਲੋ",
    recognition: "ਮਾਨਤਾ",
    joinRevolution: "ਕ੍ਰਾਂਤੀ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ",
    joinRevolutionText: "AI-ਸੰਚਾਲਿਤ ਸੂਝ ਨਾਲ ਆਪਣੀਆਂ ਖੇਤੀ ਪ੍ਰਥਾਵਾਂ ਨੂੰ ਬਦਲਣ ਲਈ ਤਿਆਰ ਹੋ?",
    getStartedToday: "ਅੱਜ ਸ਼ੁਰੂ ਕਰੋ",

    // Contact
    contactUsTitle: "ਸੰਪਰਕ ਕਰੋ",
    getInTouch: "ਸਾਡੇ ਖੇਤੀ ਮਾਹਿਰਾਂ ਨਾਲ ਸੰਪਰਕ ਕਰੋ",
    sendUsMessage: "ਸਾਨੂੰ ਸੁਨੇਹਾ ਭੇਜੋ",
    yourName: "ਤੁਹਾਡਾ ਨਾਮ",
    yourEmail: "ਤੁਹਾਡਾ ਈਮੇਲ",
    subject: "ਵਿਸ਼ਾ",
    subjectLabel: "ਵਿਸ਼ਾ",
    yourMessage: "ਤੁਹਾਡਾ ਸੁਨੇਹਾ",
    sendMessageBtn: "ਸੁਨੇਹਾ ਭੇਜੋ",
    address: "ਪਤਾ",
    addressLabel: "ਪਤਾ",
    supportHours: "ਸਹਾਇਤਾ ਸਮਾਂ",
    mondayFriday: "ਸੋਮਵਾਰ - ਸ਼ੁੱਕਰਵਾਰ",
    saturday: "ਸ਼ਨੀਵਾਰ",
    sunday: "ਐਤਵਾਰ",
    closed: "ਬੰਦ",
    messageSent: "ਸੁਨੇਹਾ ਭੇਜਿਆ ਗਿਆ!",
    messageSentDesc: "ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰਨ ਲਈ ਧੰਨਵਾਦ। ਅਸੀਂ ਜਲਦੀ ਹੀ ਤੁਹਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰਾਂਗੇ।",
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

const STORAGE_KEY = 'app.language';
const SUPPORTED: Language[] = ['en', 'hi', 'pa', 'mr'];

const detectInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch {}
  const nav = (navigator.language || 'en').toLowerCase();
  if (nav.startsWith('hi')) return 'hi';
  if (nav.startsWith('pa')) return 'pa';
  if (nav.startsWith('mr')) return 'mr';
  return 'en';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const map: Record<Language, string> = { en: 'en', hi: 'hi', pa: 'pa', mr: 'mr' };
      document.documentElement.lang = map[language];
    }
  }, [language]);

  const t = (key: string): string => {
    const dict = translations[language] as Record<string, string>;
    const fallback = translations.en as Record<string, string>;
    return dict[key] ?? fallback[key] ?? key;
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