<p align="center">
    <a target="_blank" href="https://plurid.com/programmatic-text">
        <img src="https://raw.githubusercontent.com/plurid/programmatic-text/master/about/identity/programmatic-text-logo.png" height="250px">
    </a>
    <br />
    <br />
    <a target="_blank" href="https://github.com/plurid/programmatic-text/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-DEL-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: DEL">
    </a>
</p>



<h1 align="center">
    programmatic-text
</h1>


<h3 align="center">
    Client-Side Evaluation of User Text Based on User Code
</h3>



`programmatic text` provides an `evaluation context` to allow users to input a `text` containing `{variables}` which will be replaced after `evaluation` with the results of the user-input `code`.

Considering the following user `text` input

```
simple {example} with one variable
```

and the following user `code` input in `javascript`

``` javascript
const example = 'fake world example';

return {
    example,
};
```

will evaluate to the content

```
simple fake world example with one variable
```



## Install

``` bash
npm install @plurid/programmatic-text
```

or

``` bash
yarn add @plurid/programmatic-text
```



## Usage

The evaluation language of the `code` is by default `javascript`

``` typescript
import ProgrammaticText from '@plurid/programmatic-text';


const main = async () => {
    const programmaticText = new ProgrammaticText();

    const evaluated = await programmaticText.evaluate(
        // text
        'This happened {x} years ago, that means {y} days ago.',
        // code
        `
        const x = new Date().getFullYear() - 2000;
        const y = x * 365;

        return {
            x,
            y,
        };
        `,
    ));
}
```

and it can also be `python`

``` typescript
import ProgrammaticText from '@plurid/programmatic-text';


const main = async () => {
    // preload pyodide before using ProgrammaticText
    const pyodide = await loadPyodide();
    window.programmaticTextPyodide = pyodide;


    const programmaticText = new ProgrammaticText({
        language: 'python',
    });

    const evaluated = await programmaticText.evaluate(
        // text
        'This happened {x} years ago, that means {y} days ago.',
        // code
        `
        from datetime import date

        x = date.today().year - 2000;
        y = x * 365;

        values = {
            'x': x,
            'y': y,
        }
        `,
    ));
}
```

For `javascript` the `code` must simply return an object where the keys are the variable names from the `text`.

For `python` the `code` must contain a `values` dictionary which will be used to resolve the `text`.



### Constructor Options

``` typescript
interface ProgrammaticTextOptions {
    /**
     * The evaluation language.
     */
    language: 'javascript' | 'python';

    /**
     * The evaluation type when `language` is `javascript`.
     */
    type: 'function' | 'variable';

    /**
     * Load `pyodide` for `python` from CDN.
     *
     * Default `true`
     */
    usePyodideCDN: boolean;

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
```



## Packages

<a target="_blank" href="https://www.npmjs.com/package/@plurid/programmatic-text">
    <img src="https://img.shields.io/npm/v/@plurid/programmatic-text.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/programmatic-text][programmatic-text]

[programmatic-text]: https://github.com/plurid/programmatic-text/tree/master/packages/programmatic-text



## [Codeophon](https://github.com/ly3xqhl8g9/codeophon)

+ licensing: [delicense](https://github.com/ly3xqhl8g9/delicense)
+ versioning: [αver](https://github.com/ly3xqhl8g9/alpha-versioning)
