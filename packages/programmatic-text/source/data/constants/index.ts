// #region imports
    // #region external
    import {
        ProgrammaticTextOptions,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export const DEFAULTS: ProgrammaticTextOptions = {
    timeout: 2_500,
    evaluationType: 'function',
    evaluationLanguage: 'javascript',
    replaceUndefined: undefined,
    errorKey: '__error__',
    logger: undefined,
};
// #endregion module
