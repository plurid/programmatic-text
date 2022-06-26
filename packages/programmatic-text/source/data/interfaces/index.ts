// #region module
export interface ProgrammaticTextOptions {
    timeout?: number;
    evaluationType?: 'function' | 'variable';
    evaluationLanguage?: 'javascript' | 'python';
    replaceUndefined?: string | undefined;

    logger?: (error: any) => void | undefined;
}
// #endregion module
