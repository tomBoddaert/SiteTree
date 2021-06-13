# SiteTree

This is a web templating library I wrote in TypeScript. I don't recommend using it as I just made it for fun, although I am ( will be ) using it for my website.

## Installation with NPM
`npm i @tom.boddaert/sitetree`

## Use

### Recomended project file structure:
- ( hosting code )
- **stproject.json** ( JSON file that describes the pages )
- **pages** ( out directory for compiled pages )
- **src** ( source directory for pages )
  - **components** ( directory for partial html files of reusable components )
  - ( other pages )

### In html files:
```
<{ folder/file.html }>  - insert file ( relative path )
[{ constantKey }]       - the key of a constant
{{ variable }}          - the key of a variable ( evaluated at runtime )
```

### stproject.json:
``` json
{
  "root": "./path/to/src",
  "out": "./path/to/output",
  "pages": [
    {
      "file": "file1.html",
      "consts": {
        "a": "a string constant",
        "n": 5
      }
    },
    {
      "file": "file2.html",
      "outFile": "definitelyNotFile2.html",
      "consts": {
        "file input": "<{ another/file.txt }>"
      }
    }
  ]
}
```

### Compile:
`> npx stcp ( optional path to project.json )`

Or in JS ( or TS ):
``` JavaScript
import { compile } from '@tom.boddaert/sitetree';

compile();
compile('./path/to/project.json');
```

### Evaluate:
``` JavaScript
import { evaluate } from '@tom.boddaert/sitetree';

var data = {
  "1 - 100": Math.floor(Math.random() * 101)
}

evaluate('./path/to/file.html', data, console.log);
```

## Advanced

### Promises:
Add 'Async' to the end of any compilation or evaluation command to make it promise based
e.g.
``` JavaScript
import { evaluate } from '@tom.boddaert/sitetree';

var data = {
  "1 - 100": Math.floor(Math.random() * 101)
}

evaluateAsync('./path/to/file.html', data)
  .then(console.log)
  .catch(console.error);
```

### Templating:
1. Create a template ( 'src/components/template.html' )
2. Add content to pages using constant -> file
3. Create content ( 'src/home.html', 'src/about.html' )
4. Add pages to 'stproject.json' using the template as 'file'

e.g.

src/components/template.html
``` html
<!DOCTYPE html>
<html>

<head>
  <!-- You could add CSS or JS files here -->
</head>

<body>
  <h1> Some content on all pages... </h1>
  <h2> [{ pageName }] </h2>
  [{ content }]
</body>

</html>
```

src/home.html
``` html
<p> This is the home content </p>
<a href="https://github.com/tomBoddaert/SiteTree">\> This project \<</a>
```

src/about.html
``` html
<p> This is the about page... </p>
```

stproject.html
``` json
{
  "root": "./src",
  "out": "./pages",
  "pages": [
    {
      "file": "components/template.html",
      "outFile": "home.html",
      "consts": {
        "pageName": "Home",
        "content": "<{ home.html }>"
      }
    },
    {
      "file": "components/template.html",
      "outFile": "about.html",
      "consts": {
        "pageName": "About",
        "content": "<{ about.html }>"
      }
    }
  ]
}
```

This will create 'pages/home.html', with the home content in the template and 'pages/about.html' with the about content in the same template.
