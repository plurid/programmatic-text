// #region imports
    // #region external
    import {
        ProgrammaticTextOptions,
    } from '~data/interfaces';

    import {
        DEFAULTS,
        languages,
        pyodideCDN,
    } from '~data/constants';

    import {
        wait,
    } from '~services/utilities';
    // #endregion external
// #endregion imports



// #region module
class ProgrammaticText {
    #options: ProgrammaticTextOptions;
    #pyodide = {
        loading: false,
        loaded: false,
    };


    constructor(
        options?: Partial<ProgrammaticTextOptions>,
    ) {
        this.#options = this.#resolveOptions(options);
    }


    // #region private
    #resolveOptions(
        options?: Partial<ProgrammaticTextOptions>,
    ): ProgrammaticTextOptions {
        return {
            language: options?.language || DEFAULTS.language,
            type: options?.type || DEFAULTS.type,
            usePyodideCDN: options?.usePyodideCDN ?? DEFAULTS.usePyodideCDN,
            timeout: options?.timeout ?? DEFAULTS.timeout,
            replaceUndefined: options?.replaceUndefined || DEFAULTS.replaceUndefined,
            errorKey: options?.errorKey ?? DEFAULTS.errorKey,
            logger: options?.logger || DEFAULTS.logger,
        };
    }


    #getJavaScriptEval() {
        /**
         * https://stackoverflow.com/a/37154736
         *
         * @param untrustedCode
         * @returns
         */
        const safeEval = (
            untrustedCode: string,
        ) => {
            return new Promise((resolve, reject) => {
                const blobURL = URL.createObjectURL(new Blob(
                    [
                        '(',
                        function () {
                            const _postMessage = postMessage;
                            const _addEventListener = addEventListener;

                            (function (obj) {
                                'use strict';

                                let current = obj;
                                const keepProperties = [
                                    // required
                                    'Object', 'Function', 'Infinity', 'NaN', 'undefined', 'caches', 'TEMPORARY', 'PERSISTENT',
                                    // optional, but trivial to get back
                                    'Array', 'Boolean', 'Number', 'String', 'Symbol',
                                    // optional
                                    'Map', 'Set', 'Math', 'Date', 'JSON',
                                ];

                                do {
                                    Object.getOwnPropertyNames(current).forEach(function (name) {
                                        if (keepProperties.indexOf(name) === -1) {
                                            delete current[name];
                                        }
                                    });

                                    current = Object.getPrototypeOf(current);
                                } while (current !== Object.prototype);
                            })(this);

                            _addEventListener('message', function (e) {
                                const {
                                    code,
                                    type,
                                    errorKey,
                                } = e.data;

                                if (type === 'function') {
                                    var f = new Function(
                                        '',
                                        `try {
                                            ${code}
                                        } catch (e) {
                                            return {
                                                ${errorKey}: e.message,
                                            };
                                        }`,
                                    );
                                    _postMessage(f());
                                } else {
                                    var f = new Function('', 'return (' + code + '\n);');
                                    _postMessage(f());
                                }
                            });
                        }.toString(),
                        ')()',
                    ],
                    { type: 'application/javascript' },
                ));

                const worker = new Worker(blobURL);

                URL.revokeObjectURL(blobURL);

                worker.onmessage = function (event) {
                    worker.terminate();
                    resolve(event.data);
                };

                worker.onerror = function (event) {
                    reject(
                        new Error(event.message,
                    ));
                };

                worker.postMessage({
                    code: untrustedCode,
                    type: this.#options.type,
                    errorKey: this.#options.errorKey,
                });

                setTimeout(
                    function () {
                        worker.terminate();
                        reject(new Error('The worker timed out.'));
                    },
                    this.#options.timeout,
                );
            });
        }

        return safeEval;
    }

    async #javascriptValues(
        code: string,
    ) {
        const safeEval = this.#getJavaScriptEval();
        const values: any = await safeEval(code) || {};

        return values;
    }


    async #loadPyodide() {
        if ((window as any).programmaticTextPyodide) {
            return (window as any).programmaticTextPyodide;
        }


        if (this.#options.usePyodideCDN) {
            const script = document.createElement('script');
            script.src = pyodideCDN;
            document.head.appendChild(script);

            this.#pyodide.loading = true;

            const pyodide = await new Promise ((resolve, reject) => {
                script.onload = async () => {
                    const pyodide = await (window as any).loadPyodide();
                    (window as any).programmaticTextPyodide = pyodide;

                    this.#pyodide.loading = false;
                    this.#pyodide.loaded = true;
                    resolve(pyodide);
                }

                script.onerror = () => {
                    this.#pyodide.loading = false;
                    this.#pyodide.loaded = false;
                    reject();
                }
            });

            return pyodide;
        }


        this.#pyodide.loading = true;

        /**
         * HACK to prevent rollup bundling.
         */
        const packageName = 'pyodide/pyodide.js';
        const pyodidePackage = await import(packageName);
        const pyodide = await pyodidePackage.loadPyodide();
        (window as any).programmaticTextPyodide = pyodide;

        this.#pyodide.loading = false;
        this.#pyodide.loaded = true;

        return pyodide;
    }

    /**
     * Wait for pyodide to load if loading.
     */
    async #checkPyodide() {
        if (this.#pyodide.loading && !this.#pyodide.loaded) {
            const triesLimit = 11;
            const tryTime = 2_500;
            let tries = 0;

            while (tries < triesLimit) {
                await wait(tryTime);
                tries += 1;

                if (this.#pyodide.loaded) {
                    break;
                }
            }
        }
    }

    async #pythonValues(
        code: string,
    ) {
        await this.#checkPyodide();

        const pyodide = await this.#loadPyodide();

        pyodide.runPython(code);

        const valuesKey = 'values';
        const values = Object.fromEntries(
            (await pyodide.globals.get(valuesKey)).toJs(),
        ) || {};

        return values;
    }


    async #getValues(
        code: string,
    ): Promise<Record<string, string | number | boolean>> {
        if (typeof window === 'undefined') {
            return {};
        }

        if (this.#options.language === languages.python) {
            return this.#pythonValues(code);
        }

        return this.#javascriptValues(code);
    }


    #getVariables(
        text: string,
    ) {
        const variableRE = /\{(\w+)\}/gi;
        const variablesMatch = text.matchAll(variableRE);
        const variables = new Set<string>();

        for (const match of variablesMatch) {
            const variableName = match[1];
            variables.add(variableName);
        }

        return variables;
    }

    #replaceVariables(
        text: string,
        variables: Set<string>,
        values: Record<string, string | number | boolean>,
    ) {
        let programmaticText = text;

        for (const variable of variables) {
            const replaceRE = new RegExp(`\{${variable}\}`, 'g');
            const value = values[variable];

            if (typeof value === 'undefined') {
                if (typeof this.#options.replaceUndefined === 'string') {
                    programmaticText = programmaticText.replace(
                        replaceRE,
                        this.#options.replaceUndefined,
                    );
                }
                continue;
            }

            programmaticText = programmaticText.replace(
                replaceRE,
                value + '', // FORCE cast to string
            );
        }

        return programmaticText;
    }


    #logError(
        error: any,
    ) {
        if (this.#options.logger) {
            this.#options.logger(error);
        }
    }
    // #endregion private



    // #region public
    public async evaluate(
        text: string,
        code: string,
    ) {
        try {
            const variables = this.#getVariables(text);
            const values = await this.#getValues(code);

            const error = values[this.#options.errorKey];
            if (error) {
                this.#logError(error);

                return;
            }

            return this.#replaceVariables(
                text,
                variables,
                values,
            );
        } catch (error: any) {
            this.#logError(error);

            return;
        }
    }

    public async preload() {
        await this.#loadPyodide();
    }
    // #endregion public
}
// #endregion module



// #region exports
export default ProgrammaticText;
// #endregion exports
