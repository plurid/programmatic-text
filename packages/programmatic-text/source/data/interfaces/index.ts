// #region module
export interface ProgrammaticTextOptions {
    evaluationLanguage: 'javascript' | 'python';

    /**
     * Used when `evaluationLanguage` is `javascript`.
     */
    evaluationType: 'function' | 'variable';

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
