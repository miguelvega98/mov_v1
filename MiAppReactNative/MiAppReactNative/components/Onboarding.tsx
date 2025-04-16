import React, { useState } from 'react';
import { Globe2, Clock, GraduationCap, Heart, BarChart2, LogIn, X, Check, Sparkles } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface OnboardingProps {
    onComplete: (data: {
        nativeLanguage: string;
        targetLanguage: string;
        level: string;
        learningReason: string;
        timePerDay: string;
        interests: string[];
    }) => void;
}

const languages = [
    { code: 'en-UK', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
    { code: 'es-LATAM', name: 'Spanish (South America)', flag: '🌎' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
];

const levels = [
    { value: 'A1', description: 'Beginner - Can understand and use basic phrases' },
    { value: 'A2', description: 'Elementary - Can communicate in simple and routine tasks' },
    { value: 'B1', description: 'Intermediate - Can deal with most situations while traveling' },
    { value: 'B2', description: 'Upper Intermediate - Can interact with a degree of fluency' },
    { value: 'C1', description: 'Advanced - Can express ideas fluently and spontaneously' },
    { value: 'C2', description: 'Mastery - Can understand virtually everything heard or read' },
];

const learningReasons = [
    { id: 'travel', label: 'Travel', icon: '✈️' },
    { id: 'work', label: 'Work', icon: '💼' },
    { id: 'education', label: 'Education', icon: '📚' },
    { id: 'exam', label: 'Exam Preparation', icon: '📝' },
    { id: 'culture', label: 'Cultural Interest', icon: '🎭' },
];

const timeOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: 'More than 1 hour' },
];

const interests = [
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'news', label: 'Current Events', icon: '📰' },
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'culture', label: 'Culture & Arts', icon: '🎨' },
    { id: 'food', label: 'Food & Cooking', icon: '🍳' },
    { id: 'travel', label: 'Travel', icon: '✈️' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'science', label: 'Science', icon: '🔬' },
    { id: 'fashion', label: 'Fashion', icon: '👗' }
];

const pricingPlans = [
    {
        name: 'Free',
        price: '0',
        description: 'Perfect for getting started',
        features: [
            'Access to 300+ hours of content per level',
            'Basic vocabulary tools',
            'Limited translations per day',
            'Access to public videos'
        ],
        recommended: false
    },
    {
        name: 'Pro',
        price: '4',
        description: 'Most popular choice',
        features: [
            'Everything in Free, plus:',
            'Unlimited translations',
            'Add your own custom videos',
            'On-demand video transcription',
            '1000+ hours of premium content',
            'Advanced pronunciation feedback'
        ],
        recommended: true,
        priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID
    }
];

export default function OnboardingQuestionnaire({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        nativeLanguage: '',
        targetLanguage: '',
        level: '',
        learningReason: '',
        timePerDay: '',
        interests: [] as string[],
    });
    const [showAccountOptions, setShowAccountOptions] = useState(false);
    const [showPricingPlans, setShowPricingPlans] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authView, setAuthView] = useState<'login' | 'register'>('register');
    const [username, setUsername] = useState('');
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleOptionSelect = (field: string, value: string) => {
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);

        if (step < 6) {
            setStep(step + 1);
        }
    };

    const handleInterestToggle = (interestId: string) => {
        setFormData(prev => {
            const newInterests = prev.interests.includes(interestId)
                ? prev.interests.filter(id => id !== interestId)
                : [...prev.interests, interestId];

            return { ...prev, interests: newInterests };
        });
    };

    const handleInterestsContinue = () => {
        if (formData.interests.length >= 2) {
            setShowAccountOptions(true);
        }
    };

    const handleContinueWithoutAccount = () => {
        onComplete(formData);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(formData);
    };

    const handleGoogleLogin = () => {
        onComplete(formData);
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(formData);
    };

    const handleSelectPlan = async (planName: string) => {
        setSelectedPlan(planName);

        const plan = pricingPlans.find(p => p.name === planName);

        if (plan?.name === 'Pro') {
            try {
                setIsLoading(true);
                const stripe = await stripePromise;

                if (!stripe) throw new Error('Stripe failed to load');

                const { error } = await stripe.redirectToCheckout({
                    lineItems: [{ price: plan.priceId, quantity: 1 }],
                    mode: 'subscription',
                    successUrl: `${window.location.origin}/success`,
                    cancelUrl: `${window.location.origin}/cancel`,
                });

                if (error) {
                    console.error('Error:', error);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            setShowPricingPlans(false);
            setShowAuthModal(true);
        }
    };

    const renderStep = () => {
        if (showPricingPlans) {
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 text-xl font-semibold">
                        <Sparkles className="text-blue-400" />
                        <h2>Choose your plan</h2>
                    </div>
                    <p className="text-white/60">Select the plan that best fits your learning goals</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pricingPlans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative card-gradient border rounded-xl p-6 transition-all ${plan.recommended
                                        ? 'border-blue-500/50 shadow-lg shadow-blue-500/20'
                                        : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                {plan.recommended && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="px-3 py-1 bg-blue-500 rounded-full text-xs font-medium">
                                            Recommended
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-3xl font-bold">${plan.price}</span>
                                        {plan.price !== '0' && <span className="text-white/60">/month</span>}
                                    </div>
                                    <p className="text-white/60 text-sm mt-2">{plan.description}</p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {plan.features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <Check size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                            <span className="text-sm text-white/80">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleSelectPlan(plan.name)}
                                    disabled={isLoading}
                                    className={`w-full px-5 py-2.5 rounded-xl transition-all font-medium ${plan.recommended
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20'
                                            : 'bg-white/5 hover:bg-white/10 border border-white/10'
                                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? 'Processing...' : 'Get Started'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (showAccountOptions) {
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 text-xl font-semibold">
                        <LogIn className="text-blue-400" />
                        <h2>One last step!</h2>
                    </div>
                    <p className="text-white/60">Create an account to save your progress and sync across devices</p>
                    <div className="grid gap-3">
                        <button
                            onClick={() => setShowPricingPlans(true)}
                            className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 font-medium"
                        >
                            Create Account
                        </button>
                        <button
                            onClick={handleContinueWithoutAccount}
                            className="w-full px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-white/60 hover:text-white/80"
                        >
                            Continue without Account
                        </button>
                    </div>
                    <p className="text-center text-white/40 text-sm">
                        You can always create an account later
                    </p>
                </div>
            );
        }

        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-xl font-semibold">
                            <Globe2 className="text-blue-400" />
                            <h2>What's your native language?</h2>
                        </div>
                        <div className="grid gap-3">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleOptionSelect('nativeLanguage', lang.code)}
                                    className={`w-full p-4 rounded-xl border transition-all flex items-center gap-3
                    ${formData.nativeLanguage === lang.code
                                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                            : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <span className="text-2xl">{lang.flag}</span>
                                    <span>{lang.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-xl font-semibold">
                            <Globe2 className="text-blue-400" />
                            <h2>What language do you want to learn?</h2>
                        </div>
                        <div className="grid gap-3">
                            {languages
                                .filter(lang => lang.code !== formData.nativeLanguage)
                                .map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleOptionSelect('targetLanguage', lang.code)}
                                        className={`w-full p-4 rounded-xl border transition-all flex items-center gap-3
                      ${formData.targetLanguage === lang.code
                                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                                : 'border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <span className="text-2xl">{lang.flag}</span>
                                        <span>{lang.name}</span>
                                    </button>
                                ))}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-xl font-semibold">
                            <BarChart2 className="text-blue-400" />
                            <h2>What's your current level?</h2>
                        </div>
                        <div className="grid gap-3">
                            {levels.map((level) => (
                                <button
                                    key={level.value}
                                    onClick={() => handleOptionSelect('level', level.value)}
                                    className={`w-full p-4 rounded-xl border transition-all
                    ${formData.level === level.value
                                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                            : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="font-semibold text-lg">{level.value}</span>
                                        <span className="text-sm text-white/60">{level.description}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-xl font-semibold">
                            <GraduationCap className="text-blue-400" />
                            <h2>Why are you learning this language?</h2>
                        </div>
                        <div className="grid gap-3">
                            {learningReasons.map((reason) => (
                                <button
                                    key={reason.id}
                                    onClick={() => handleOptionSelect('learningReason', reason.id)}
                                    className={`w-full p-4 rounded-xl border transition-all flex items-center gap-3
                    ${formData.learningReason === reason.id
                                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                            : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <span className="text-2xl">{reason.icon}</span>
                                    <span>{reason.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-xl font-semibold">
                            <Clock className="text-blue-400" />
                            <h2>How much time can you dedicate per day?</h2>
                        </div>
                        <div className="grid gap-3">
                            {timeOptions.map((time) => (
                                <button
                                    key={time.value}
                                    onClick={() => handleOptionSelect('timePerDay', time.value)}
                                    className={`w-full p-4 rounded-xl border transition-all flex items-center gap-3
                    ${formData.timePerDay === time.value
                                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                            : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <span>{time.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-xl font-semibold mb-2">
                            <Heart className="text-blue-400" />
                            <h2>What topics interest you?</h2>
                        </div>
                        <p className="text-white/60 text-sm">Select at least 2 topics to personalize your content</p>
                        <div className="grid grid-cols-2 gap-3">
                            {interests.map((interest) => (
                                <button
                                    key={interest.id}
                                    onClick={() => handleInterestToggle(interest.id)}
                                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 text-center
                    ${formData.interests.includes(interest.id)
                                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                            : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <span className="text-2xl">{interest.icon}</span>
                                    <span className="text-sm">{interest.label}</span>
                                </button>
                            ))}
                        </div>
                        {formData.interests.length >= 2 && (
                            <button
                                onClick={handleInterestsContinue}
                                className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 font-medium mt-4"
                            >
                                Continue
                            </button>
                        )}
                        <p className="text-center text-white/40 text-sm">
                            {formData.interests.length < 2
                                ? `Select ${2 - formData.interests.length} more topic${2 - formData.interests.length === 1 ? '' : 's'}`
                                : `${formData.interests.length} topics selected`
                            }
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-dark text-white flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                        Welcome to Language Labs
                    </h1>
                    <p className="text-white/60">Let's personalize your learning experience</p>
                </div>

                {/* Progress bar */}
                {!showAccountOptions && !showPricingPlans && (
                    <div className="h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                            style={{ width: `${(step / 6) * 100}%` }}
                        />
                    </div>
                )}

                {renderStep()}
            </div>

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#1a2234] rounded-2xl p-6 w-full max-w-md mx-4 border border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {authView === 'login' ? 'Sign In' : 'Create Account'}
                                </h2>
                                {selectedPlan && (
                                    <p className="text-sm text-white/60 mt-1">
                                        Selected plan: <span className="text-blue-400">{selectedPlan}</span>
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1  12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </button>
                        </div>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[#1a2234] text-white/40">Or continue with</span>
                            </div>
                        </div>

                        <form onSubmit={authView === 'login' ? handleLogin : handleRegister} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    placeholder="Enter your username"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    placeholder="Enter your password"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 font-medium"
                            >
                                {authView === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')}
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                {authView === 'login'
                                    ? "Don't have an account? Sign up"
                                    : 'Already have an account? Sign in'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}