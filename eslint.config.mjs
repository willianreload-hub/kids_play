import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  // Regras Next.js + React + Core Web Vitals (erros) + TypeScript
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Pastas locais de rascunho e cache do ambiente:
    'scratch/**',
    'UsersPCtestnpmdirnpm-cache/**',
  ]),
  {
    rules: {
      // Padrão clássico de hidratação SSR do App Router: ler localStorage,
      // matchMedia ou service worker no mount e sincronizar via setState.
      // Legítimo no estado atual do projeto; manter como aviso até migrar
      // gradualmente para useSyncExternalStore.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]);

export default eslintConfig;
