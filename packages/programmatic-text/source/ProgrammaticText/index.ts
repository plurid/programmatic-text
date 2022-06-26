// #region imports
    // #region external
    import {
        ProgrammaticTextOptions,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
class ProgrammaticText {
    private options: ProgrammaticTextOptions;


    constructor(
        options?: Partial<ProgrammaticTextOptions>,
    ) {
        this.options = this.resolveOptions(options);
    }


    private resolveOptions(
        options?: Partial<ProgrammaticTextOptions>,
    ): ProgrammaticTextOptions {
        return {
            timeout: options?.timeout ?? 2_500,
            evaluationType: options?.evaluationType || 'function',
            evaluationLanguage: options?.evaluationLanguage || 'javascript',
            replaceUndefined: options?.replaceUndefined || undefined,
            logger: options?.logger || undefined,
        };
    }


    private getJavaScriptEval() {
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
                                    type,
                                    code,
                                } = e.data;

                                if (type === 'function') {
                                    var f = new Function(
                                        '',
                                        `try {
                                            ${code}
                                        } catch (e) {
                                            return {
                                                __error__: e.message,
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

                worker.onmessage = function (evt) {
                    worker.terminate();
                    resolve(evt.data);
                };

                worker.onerror = function (evt) {
                    reject(new Error(evt.message));
                };

                worker.postMessage({
                    type: this.options.evaluationType,
                    code: untrustedCode,
                });

                setTimeout(
                    function () {
                        worker.terminate();
                        reject(new Error('The worker timed out.'));
                    },
                    this.options.timeout,
                );
            });
        }

        return safeEval;
    }

    private async javascriptValues(
        code: string,
    ) {
        const safeEval = this.getJavaScriptEval();
        const values: any = await safeEval(code);
        return values;
    }


    private async loadPyodide() {
        if ((window as any).programmaticTextPyodide) {
            return (window as any).programmaticTextPyodide;
        }

        /**
         * HACK to prevent rollup bundling.
         */
        const packageName = 'pyodide/pyodide.js';
        const pyodidePackage = await import(packageName);
        const pyodide = await pyodidePackage.loadPyodide();
        (window as any).programmaticTextPyodide = pyodide;

        return pyodide;
    }

    private async pythonValues(
        code: string,
    ) {
        const pyodide = await this.loadPyodide();

        pyodide.runPython(code);

        const values = Object.fromEntries(
            (await pyodide.globals.get('values')).toJs(),
        );

        return values;
    }


    private async getValues(
        code: string,
    ) {
        if (typeof window === 'undefined') {
            return;
        }

        if (this.options.evaluationLanguage === 'python') {
            return this.pythonValues(code);
        }

        return this.javascriptValues(code);
    }


    private getVariables(
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

    private replaceVariables(
        text: string,
        variables: Set<string>,
        values: any,
    ) {
        let programmaticText = text;

        for (const variable of variables) {
            const replaceRE = new RegExp(`\{${variable}\}`, 'g');
            const value = values[variable];

            if (typeof value === 'undefined') {
                if (typeof this.options.replaceUndefined === 'string') {
                    programmaticText = programmaticText.replace(replaceRE, this.options.replaceUndefined);
                }
                continue;
            }

            programmaticText = programmaticText.replace(replaceRE, value);
        }

        return programmaticText;
    }


    public async evaluate(
        text: string,
        code: string,
    ) {
        try {
            const variables = this.getVariables(text);
            const values: any = await this.getValues(code);

            return this.replaceVariables(
                text,
                variables,
                values,
            );
        } catch (error: any) {
            if (this.options.logger) {
                this.options.logger(error);
            }

            return;
        }
    }
}
// #endregion module




// #region exports
export default ProgrammaticText;
// #endregion exports
