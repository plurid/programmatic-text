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
    Client-Side Compute Over User Text
</h3>



`programmatic text` allows users to input a `text` with `{variables}` which will be replaced after `evaluation` with the results of the user-input `code`.



## Install

``` bash
npm install @plurid/programmatic-text
```


## Usage

``` typescript
import ProgrammaticText from '@plurid/programmatic-text';


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
```


``` typescript
import ProgrammaticText from '@plurid/programmatic-text';


const programmaticText = new ProgrammaticText({
    evaluationLanguage: 'python',
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
        "x": x,
        "y": y,
    }
    `,
));
```


## [Codeophon](https://github.com/ly3xqhl8g9/codeophon)

+ licensing: [delicense](https://github.com/ly3xqhl8g9/delicense)
+ versioning: [αver](https://github.com/ly3xqhl8g9/alpha-versioning)
