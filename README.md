# Web Inliner

This is the [web inliner](http://foundation.zurb.com/emails/inliner.html) used on the Foundation for Emails marketing site. The files generated here are copied to the Foundation marketing site codebase.

## API

`index.js` has DOM-specific functions that leverage the web inliner's guts. It should be Browserified to run in the browser. `lib/inline.js` is the inliner itself, and can be run in Node.

### inline(html, css, options)

Inline the contents of `html`, along with any code inside `css`.

#### html

**Type:** `String`

HTML to inline.

#### css

**Type:** `String`

CSS to inline into HTML.

#### options

**Type:** `Object`

- `compress` (`Boolean`): Compress final HTML output.
- `onSuccess` (`Function`): Callback to run when inlining is done. Includes an `html` parameter with the output.
- `onError` (`Function`): Callback to run if there's an error. Includes an `err` parameter with the error.

## Development

```bash
git clone https://github.com/zurb/web-inliner
cd web-inliner
npm install
```

Run `npm start` to start the build process. A new JavaScript bundle will be generated each time you save `index.js`.

Run `npm run build` to generate a compressed bundle. Use this compressed file on the Foundation marketing site.

## Running locally

You can use the small wrapper script (`cli.js`) to perform inlining from
the command line.

Example usage:

    $ node cli.js path/to/index.html path/to/css/foundation-emails.css > /tmp/output.html
