// Coloca todos los imports al inicio del archivo
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Globe2 } from 'lucide-react';

// Define las constantes de idiomas
const languages = [
    { code: 'en-UK', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
    { code: 'es-LATAM', name: 'Spanish (South America)', flag: '🌎' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
];

// Define el componente OnboardingQuestionnaire sin Stripe ni lógica de precios
const OnboardingQuestionnaire = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        nativeLanguage: '',
        targetLanguage: '',
    });

    // Función para manejar la selección de una opción
    const handleOptionSelect = (field, value) => {
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);
        setStep(step + 1);
    };

    // Renderiza los pasos del onboarding
    const renderStep = () => {
        if (step === 1) {
            return (
                <View style={styles.stepContainer}>
                    <Text style={styles.stepTitle}>What's your native language?</Text>
                    {languages.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            onPress={() => handleOptionSelect('nativeLanguage', lang.code)}
                            style={styles.optionButton}
                        >
                            <Text style={styles.optionText}>
                                {lang.flag} {lang.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        } else if (step === 2) {
            // Filtra para que no se pueda seleccionar el mismo idioma que es nativo
            const availableLanguages = languages.filter(
                (lang) => lang.code !== formData.nativeLanguage
            );
            return (
                <View style={styles.stepContainer}>
                    <Text style={styles.stepTitle}>What language do you want to learn?</Text>
                    {availableLanguages.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            onPress={() => {
                                // Actualiza la información y llama onComplete
                                handleOptionSelect('targetLanguage', lang.code);
                                onComplete({ ...formData, targetLanguage: lang.code });
                            }}
                            style={styles.optionButton}
                        >
                            <Text style={styles.optionText}>
                                {lang.flag} {lang.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }
        return <Text style={styles.stepTitle}>Thank you!</Text>;
    };

    return (
        <View style={styles.onboardingContainer}>
            {renderStep()}
        </View>
    );
};

// Define el componente principal que utiliza el onboarding
const TabTwoScreen = () => {
    const [isOnboarded, setIsOnboarded] = useState(false);

    const handleOnboardingComplete = (data) => {
        console.log('Onboarding complete:', data);
        setIsOnboarded(true);
    };

    if (!isOnboarded) {
        return <OnboardingQuestionnaire onComplete={handleOnboardingComplete} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.mainContent}>Contenido de TabTwoScreen (después del onboarding)</Text>
        </View>
    );
};

export default TabTwoScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    onboardingContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#1a2234',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepContainer: {
        width: '100%',
        alignItems: 'center',
    },
    stepTitle: {
        fontSize: 20,
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
    },
    optionButton: {
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 8,
        marginVertical: 4,
        width: '80%',
        alignItems: 'center',
    },
    optionText: {
        color: '#fff',
        fontSize: 16,
    },
    mainContent: {
        fontSize: 18,
        color: '#333',
    },
});
