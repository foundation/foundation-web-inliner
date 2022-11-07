// Command line interface to the inliner.
//
// Example usage:
//     $ node cli.js path/to/index.html path/to/css/foundation-emails.css > /tmp/output.html

const fs = require('fs');
const inline = require('./lib/inline');

const onSuccess = (html) => {
    console.log(html);
};

const onError = (err) => {
    console.log(`Error :( ${err}`);
};

const main = () => {
    const userArgs = process.argv.slice(2);
    const htmlSourceFile = userArgs[0];
    const cssSourceFile = userArgs[1];

    const htmlData = fs.readFileSync(htmlSourceFile);
    const cssData = fs.readFileSync(cssSourceFile);

    inline(htmlData.toString(), cssData.toString(), {
        compress: process.argv.indexOf('--compress') >= 0,
        onSuccess: onSuccess,
        onError: onError
    });
};

main();
