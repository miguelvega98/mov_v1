// App.js
import React, { useState } from 'react';
import { View, Text } from 'react-native';

// Asegúrate de ajustar la ruta a tu componente de onboarding según donde lo hayas creado.
// En este ejemplo, se asume que la carpeta se llama "onbaording" y el archivo se llama "OnboardingQuestionnaire.js".
import OnboardingQuestionnaire from './onbaording/OnboardingQuestionnaire';

// Importa el componente de navegación de tabs (o el principal de tu app).
// La ruta dependerá de cómo esté estructurada tu aplicación.
import Tabs from './navigation/Tabs';

export default function App() {
    // Estado para controlar si el usuario ya completó el onboarding
    const [isOnboarded, setIsOnboarded] = useState(false);

    // Función que se llama cuando se completa el onboarding
    const handleOnboardingComplete = (data) => {
        console.log('Datos del onboarding:', data);
        setIsOnboarded(true);
        // Aquí podrías persistir este estado para que no se muestre el onboarding al reiniciar la app.
    };

    // Si el usuario aún no completó el onboarding, renderiza el OnboardingQuestionnaire
    if (!isOnboarded) {
        return <OnboardingQuestionnaire onComplete={handleOnboardingComplete} />;
    }

    // Una vez completado el onboarding, renderiza la navegación de tabs o el contenido principal de la app
    return <Tabs />;
}

