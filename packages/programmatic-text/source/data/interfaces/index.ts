// #region module
export type ProgrammaticTextLanguage = 'javascript' | 'python';


export interface ProgrammaticTextOptions {
    /**
     * The evaluation language.
     */
    language: ProgrammaticTextLanguage;

    /**
     * The evaluation type when `language` is `javascript`.
     */
    type: 'function' | 'variable';

    /**
     * Timeout for the code evaluation.
     */
    timeout: number;

    /**
     * Replace undefined variables with a certain string.
     */
    replaceUndefined: string | undefined;

    /**
     * Catch errors from the evaluation of the code.
     *
     * Default `__error__`
     */
    errorKey: string;

    logger: ((error: any) => void) | undefined;
}
// #endregion module
