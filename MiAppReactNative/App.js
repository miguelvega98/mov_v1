// App.js
import React, { useState } from 'react';
import { View, Text } from 'react-native';

// Aseg�rate de ajustar la ruta a tu componente de onboarding seg�n donde lo hayas creado.
// En este ejemplo, se asume que la carpeta se llama "onbaording" y el archivo se llama "OnboardingQuestionnaire.js".
import OnboardingQuestionnaire from './onbaording/OnboardingQuestionnaire';

// Importa el componente de navegaci�n de tabs (o el principal de tu app).
// La ruta depender� de c�mo est� estructurada tu aplicaci�n.
import Tabs from './navigation/Tabs';

export default function App() {
    // Estado para controlar si el usuario ya complet� el onboarding
    const [isOnboarded, setIsOnboarded] = useState(false);

    // Funci�n que se llama cuando se completa el onboarding
    const handleOnboardingComplete = (data) => {
        console.log('Datos del onboarding:', data);
        setIsOnboarded(true);
        // Aqu� podr�as persistir este estado para que no se muestre el onboarding al reiniciar la app.
    };

    // Si el usuario a�n no complet� el onboarding, renderiza el OnboardingQuestionnaire
    if (!isOnboarded) {
        return <OnboardingQuestionnaire onComplete={handleOnboardingComplete} />;
    }

    // Una vez completado el onboarding, renderiza la navegaci�n de tabs o el contenido principal de la app
    return <Tabs />;
}

