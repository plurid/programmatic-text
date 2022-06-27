// #region module
export const wait = async (
    time: number,
) => {
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
}
// #endregion module
