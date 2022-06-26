// #region imports
    // #region external
    import ProgrammaticText from '../';
    // #endregion external
// #endregion imports



// #region module
describe('ProgrammaticText', () => {
    it('works', async () => {
        const programmaticText = new ProgrammaticText();

        const evaluated = await programmaticText.evaluate(
            `
            This happened {x} years ago, that means {y} days ago.
            `,
            `
            const x = new Date().getFullYear() - 2000;
            const y = x * 365;

            return {
                x,
                y,
            };
            `,
        );

        const x = new Date().getFullYear() - 2000;
        const y = x * 365;
        const resolved = `This happened ${x} years ago, that means ${y} days ago.`;

        // expect(evaluated).toEqual(resolved);
    });
});
// #endregion module
