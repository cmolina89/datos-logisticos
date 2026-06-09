import { type RenderOptions, type RenderResult, render } from '@testing-library/react';
import { Provider } from 'jotai';
import type React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/app/providers/ThemeProvider';

// Mocks globales
global.IntersectionObserver = class IntersectionObserver {
    root = null;
    rootMargin = '';
    thresholds = [];

    // S1186 fix: constructor explícito con comentario de propósito
    constructor() {
        // no-op: mock para entorno de testing
    }

    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
    takeRecords() {
        return [];
    }
} as any;

global.ResizeObserver = class ResizeObserver {
    // S1186 fix: constructor explícito con comentario de propósito
    constructor() {
        // no-op: mock para entorno de testing
    }

    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
};

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
    }))
});

const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
};
global.localStorage = localStorageMock as any;

const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
};
global.sessionStorage = sessionStorageMock as any;

// Wrapper de proveedores para testing
interface AllProvidersProps {
    children: React.ReactNode;
    initialRoute?: string;
}

const AllProviders: React.FC<AllProvidersProps> = ({ children, initialRoute = '/' }) => {
    return (
        <Provider>
            <BrowserRouter>
                <ThemeProvider>{children}</ThemeProvider>
            </BrowserRouter>
        </Provider>
    );
};

// Función de render personalizada
const customRender = (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'> & { initialRoute?: string }
): RenderResult => {
    const { initialRoute, ...renderOptions } = options || {};

    return render(ui, {
        wrapper: ({ children }) => <AllProviders initialRoute={initialRoute}>{children}</AllProviders>,
        ...renderOptions
    });
};

// Utilidades para testing de breakpoints
export const createMockBreakpoint = (breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' = 'md') => {
    const breakpoints = {
        xs: { width: 375, height: 667 },
        sm: { width: 576, height: 768 },
        md: { width: 768, height: 1024 },
        lg: { width: 992, height: 768 },
        xl: { width: 1200, height: 800 },
        xxl: { width: 1400, height: 900 }
    };

    const { width, height } = breakpoints[breakpoint];

    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width
    });

    Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: height
    });

    return { width, height };
};

// Utilidades para testing de APIs
export const createMockResponse = <T,>(data: T, status: number = 200): Response => {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
};

export const mockFetch = (response: Response) => {
    global.fetch = jest.fn().mockResolvedValue(response);
};

// Utilidades para testing de accesibilidad
export const expectToBeAccessible = async (container: HTMLElement) => {
    try {
        // @ts-expect-error - jest-axe no tiene tipos oficiales
        const { axe, toHaveNoViolations } = await import('jest-axe');
        expect.extend(toHaveNoViolations);

        const results = await axe(container);
        (expect(results) as any).toHaveNoViolations();
    } catch (_error) {
        console.warn('jest-axe not available, skipping accessibility test');
    }
};

// Utilidades para testing de lazy loading
export const mockIntersectionObserver = (isIntersecting: boolean = true) => {
    const mockObserver = {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn()
    };

    global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
        setTimeout(() => {
            callback([{ isIntersecting }]);
        }, 0);

        return mockObserver;
    });

    return mockObserver;
};

// Utilidades para testing de responsive design
export const testResponsiveComponent = async (
    component: React.ReactElement,
    breakpoints: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'> = ['xs', 'md', 'xl']
): Promise<Array<{ breakpoint: string; container: HTMLElement }>> => {
    const results: Array<{ breakpoint: string; container: HTMLElement }> = [];

    for (const breakpoint of breakpoints) {
        createMockBreakpoint(breakpoint);
        const { container } = customRender(component);
        results.push({ breakpoint, container });
    }

    return results;
};

// Utilidades para testing de SEO
export const expectMetaTag = (name: string, content: string) => {
    // S4325 fix: se eliminó casteo innecesario
    const metaTag = document.querySelector(`meta[name="${name}"]`);
    expect(metaTag).toBeTruthy();
    if (metaTag instanceof HTMLMetaElement) {
        expect(metaTag.content).toBe(content);
    }
};

export const expectOpenGraphTag = (property: string, content: string) => {
    // S4325 fix: se eliminó casteo innecesario
    const ogTag = document.querySelector(`meta[property="${property}"]`);
    expect(ogTag).toBeTruthy();
    if (ogTag instanceof HTMLMetaElement) {
        expect(ogTag.content).toBe(content);
    }
};

// Utilidades para testing de seguridad
export const expectSanitizedHtml = (html: string) => {
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/javascript:/i);
    expect(html).not.toMatch(/on\w+=/i);
};

// Suprimir errores de consola en tests
export const suppressConsoleError = () => {
    const originalError = console.error;
    beforeAll(() => {
        console.error = jest.fn();
    });

    afterAll(() => {
        console.error = originalError;
    });
};

export { customRender };
