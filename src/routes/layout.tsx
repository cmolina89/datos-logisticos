import { ThemeProvider } from '@/app/providers/ThemeProvider';
import SEOHead from '@/components/common/SEOHead/SEOHead';
// S1128 fix: se eliminó el import no usado de LanguageSwitcher
import { applyClientSecurityHeaders } from '@/utils/securityHeaders';
import { Outlet } from '@modern-js/runtime/router';
import { Provider as JotaiProvider } from 'jotai';
import { PrimeReactProvider } from 'primereact/api';
import { useEffect } from 'react';
import { CookiesProvider } from 'react-cookie';

// Estilos base de PrimeReact y tus estilos globales
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';

import 'coltrane-css/coltrane.min.css';
import 'coltrane-icon-font/coltrane-icons.css';

import '@/styles/global.scss';

// Componente interno
function LayoutContent() {
    // S1854 fix: se eliminó `const { t } = useTranslation()` — la variable t no se usa en este componente

    useEffect(() => {
        applyClientSecurityHeaders();
    }, []);

    return (
        <div id="remote-app" className="sgc-mfe-attributes" role="application">
            <SEOHead />
            <main id="main-content" className="cv-main-content">
                <Outlet />
            </main>
        </div>
    );
}

export default function Layout() {
    return (
        <CookiesProvider>
            <JotaiProvider>
                <PrimeReactProvider>
                    <ThemeProvider>
                        <LayoutContent />
                    </ThemeProvider>
                </PrimeReactProvider>
            </JotaiProvider>
        </CookiesProvider>
    );
}
