import type { NextConfig } from "next";

if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {}
    },
    configurable: true,
    writable: true
  });
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
