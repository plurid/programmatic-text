// #region imports
    // #region external
    import {
        ProgrammaticTextOptions,
        ProgrammaticTextLanguage,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export const DEFAULTS: ProgrammaticTextOptions = {
    language: 'javascript',
    type: 'function',
    timeout: 2_500,
    replaceUndefined: undefined,
    errorKey: '__error__',
    logger: undefined,
};


export const languages: Record<ProgrammaticTextLanguage, ProgrammaticTextLanguage> = {
    javascript: 'javascript',
    python: 'python',
};
// #endregion module
