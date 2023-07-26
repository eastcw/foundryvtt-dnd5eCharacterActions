import { nodeResolve } from '@rollup/plugin-node-resolve';

export default () => ({
  input: 'src/module/foundryvtt-dnd5eCharacterActions.js',
  output: {
    dir: 'dist/module',
    format: 'es',
    sourcemap: true,
  },
  plugins: [nodeResolve()],
});
