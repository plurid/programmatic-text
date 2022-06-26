// #region imports
    // #region libraries
    import ttypescript from 'ttypescript';
    import typescript from 'rollup-plugin-typescript2';
    import { terser } from 'rollup-plugin-terser';
    // #endregion libraries


    // #region external
    import pkg from '../package.json';
    // #endregion external
// #endregion imports



// #region module
export default {
    input: './source/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            exports: 'named',
        },
    ],
    external: [
        'pyodide',
    ],
    watch: {
        include: 'source/**',
    },
    plugins: [
        typescript({
            typescript: ttypescript,
            tsconfig: './tsconfig.json',
        }),
        terser({
            mangle: false,
            compress: false,
            format: {
                beautify: true,
                comments: false,
            },
        }),
    ],
};
// #endregion module
