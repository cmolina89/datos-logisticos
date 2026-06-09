import { useCallback, useEffect, useState } from 'react';

// Hook para manejo de focus
export const useFocusManagement = () => {
    const focusableElementsSelector = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
    ].join(', ');

    const trapFocus = useCallback((container: HTMLElement) => {
        const focusableElements = container.querySelectorAll(focusableElementsSelector);
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        container.addEventListener('keydown', handleTabKey);
        firstElement?.focus();

        return () => {
            container.removeEventListener('keydown', handleTabKey);
        };
    }, []);

    const restoreFocus = useCallback((element: HTMLElement | null) => {
        if (element && typeof element.focus === 'function') {
            element.focus();
        }
    }, []);

    return { trapFocus, restoreFocus };
};

// Hook para anuncios de screen reader
export const useScreenReader = () => {
    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            if (document.body.contains(announcement)) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }, []);

    return { announce };
};

// Hook para navegación por teclado
export const useKeyboardNavigation = (
    onEnter?: () => void,
    onEscape?: () => void,
    onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void
) => {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            switch (event.key) {
                case 'Enter':
                    if (onEnter) {
                        event.preventDefault();
                        onEnter();
                    }
                    break;
                case 'Escape':
                    if (onEscape) {
                        event.preventDefault();
                        onEscape();
                    }
                    break;
                case 'ArrowUp':
                    if (onArrowKeys) {
                        event.preventDefault();
                        onArrowKeys('up');
                    }
                    break;
                case 'ArrowDown':
                    if (onArrowKeys) {
                        event.preventDefault();
                        onArrowKeys('down');
                    }
                    break;
                case 'ArrowLeft':
                    if (onArrowKeys) {
                        event.preventDefault();
                        onArrowKeys('left');
                    }
                    break;
                case 'ArrowRight':
                    if (onArrowKeys) {
                        event.preventDefault();
                        onArrowKeys('right');
                    }
                    break;
            }
        },
        [onEnter, onEscape, onArrowKeys]
    );

    const keyboardProps = {
        onKeyDown: handleKeyDown,
        tabIndex: 0
    };

    return { handleKeyDown, keyboardProps };
};

// Hook para detectar preferencias de accesibilidad
export const useAccessibilityPreferences = () => {
    const [preferences, setPreferences] = useState({
        prefersReducedMotion: false,
        prefersHighContrast: false,
        prefersReducedTransparency: false
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const updatePreferences = () => {
            setPreferences({
                prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
                prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
                prefersReducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches
            });
        };

        updatePreferences();

        const mediaQueries = [
            window.matchMedia('(prefers-reduced-motion: reduce)'),
            window.matchMedia('(prefers-contrast: high)'),
            window.matchMedia('(prefers-reduced-transparency: reduce)')
        ];

        mediaQueries.forEach((mq) => mq.addEventListener('change', updatePreferences));

        return () => {
            mediaQueries.forEach((mq) => mq.removeEventListener('change', updatePreferences));
        };
    }, []);

    return preferences;
};

// Hook para validación de formularios accesibles
export const useAccessibleForm = () => {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const setFieldError = useCallback((fieldName: string, error: string) => {
        setErrors((prev) => ({ ...prev, [fieldName]: error }));
    }, []);

    const clearFieldError = useCallback((fieldName: string) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }, []);

    const getFieldProps = useCallback(
        (fieldName: string) => {
            const hasError = !!errors[fieldName];
            return {
                'aria-invalid': hasError,
                'aria-describedby': hasError ? `${fieldName}-error` : undefined
            };
        },
        [errors]
    );

    const getErrorProps = useCallback((fieldName: string) => {
        return {
            id: `${fieldName}-error`,
            role: 'alert',
            'aria-live': 'polite'
        };
    }, []);

    return {
        errors,
        setFieldError,
        clearFieldError,
        getFieldProps,
        getErrorProps
    };
};

// Hook para landmarks ARIA
export const useLandmarks = () => {
    const setLandmark = useCallback((element: HTMLElement, role: string, label?: string) => {
        element.setAttribute('role', role);
        if (label) {
            element.setAttribute('aria-label', label);
        }
    }, []);

    const setRegion = useCallback(
        (element: HTMLElement, label: string) => {
            setLandmark(element, 'region', label);
        },
        [setLandmark]
    );

    return { setLandmark, setRegion };
};

// Utilidades para ARIA
export const ariaUtils = {
    // Generar ID único para elementos
    generateId: (prefix: string = 'aria') => {
        return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
    },

    // Crear descripción accesible
    createDescription: (element: HTMLElement, description: string) => {
        const id = ariaUtils.generateId('desc');
        const descElement = document.createElement('div');
        descElement.id = id;
        descElement.className = 'sr-only';
        descElement.textContent = description;

        element.parentNode?.insertBefore(descElement, element.nextSibling);
        element.setAttribute('aria-describedby', id);

        return id;
    },

    // Crear label accesible
    createLabel: (element: HTMLElement, label: string) => {
        const id = ariaUtils.generateId('label');
        const labelElement = document.createElement('label');
        labelElement.id = id;
        labelElement.className = 'sr-only';
        labelElement.textContent = label;

        element.parentNode?.insertBefore(labelElement, element);
        element.setAttribute('aria-labelledby', id);

        return id;
    }
};
