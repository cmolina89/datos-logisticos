// src/setupTests.ts
import '@testing-library/jest-dom'

// Puedes añadir mocks globales aquí si los necesitas.
// Ejemplo: Silenciar console.error para ciertos errores esperados en pruebas
// const originalError = console.error;
// beforeAll(() => {
//   jest.spyOn(console, 'error').mockImplementation((...args) => {
//     if (typeof args[0] === 'string' && args[0].includes('Warning: validateDOMNesting')) {
//       return;
//     }
//     originalError.call(console, ...args);
//   });
// });
// afterAll(() => {
//   (console.error as jest.Mock).mockRestore();
// });
