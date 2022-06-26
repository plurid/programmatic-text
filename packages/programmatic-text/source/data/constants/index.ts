// #region imports
    // #region external
    import {
        ProgrammaticTextOptions,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export const DEFAULTS: ProgrammaticTextOptions = {
    evaluationLanguage: 'javascript',
    evaluationType: 'function',
    timeout: 2_500,
    replaceUndefined: undefined,
    errorKey: '__error__',
    logger: undefined,
};
// #endregion module
