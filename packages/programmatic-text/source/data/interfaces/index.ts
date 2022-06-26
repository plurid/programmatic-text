// #region module
export interface ProgrammaticTextOptions {
    timeout: number;
    evaluationType: 'function' | 'variable';
    evaluationLanguage: 'javascript' | 'python';
    replaceUndefined: string | undefined;
    errorKey: string;
    logger: ((error: any) => void) | undefined;
}
// #endregion module
