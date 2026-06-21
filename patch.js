Object.defineProperty(globalThis, 'localStorage', { value: { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} }, configurable: true, writable: true });
