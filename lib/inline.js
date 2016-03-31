var beautifyHtml = require('../node_modules/js-beautify/js/lib/beautify-html.js').html_beautify;
var cheerio = require('cheerio');
var inlineCss = require('inline-css');
var siphonMQ = require('siphon-media-query');
var htmlMinifier = require('html-minifier').minify;

// Options to pass to htmlMinifier()
var COMPRESS_OPTS = {
  collapseWhitespace: true,
  removeComments: true,
  keepClosingSlash: true,
  minifyCSS: true
}

// Options to pass to beautifyHtml()
var BEAUTIFY_OPTS = {
  indent_size: 2,
  quiet: true
}

/**
 * Inlines CSS into HTML, using the CSS defined in `css`, as well as any non-media query CSS in the `<style>` tag of the input HTML.
 * After inlining, the `<style>` tag of the document is moved inside the `<body>`.
 * @param {string} html - Input HTML.
 * @param {string} css - CSS to inline into HTML.
 * @param {object} options - Configuration options.
 * @param {boolean} options.compress - Compress the inlined HTML.
 * @param {successCallback} options.onSuccess - Callback to run when inlining is done.
 * @param {errorCallback} options.onError - Callback to run if there's an error.
 */
module.exports = function inline(html, css, options) {
  // Find all media query-specific CSS from the CSS field
  try {
    var mqCss = siphonMQ(css);
  }
  // ...but display an error if it don't work
  catch(e) {
    /**
     * Runs if the inlining process encounters an error.
     * @callback errorCallback
     */
    options.onError();
  }

  // Options to pass to inlineCss()
  var INLINE_OPTS = {
    url: '/',
    extraCss: css,
    preserveMediaQueries: true,
    applyStyleTags: true,
    applyLinkTags: false
  }

  // Run the inliner. When it's done, run the success() function below if it worked, or the error() function below if there's an error
  inlineCss(html, INLINE_OPTS).then(success, options.onError);

  /**
   * Massages the HTML output of inline-css and then displays it in the results area. This function is called if inline-css finishes without errors.
   * @param {string} html - HTML output of inline-css.
   */
  function success(html) {
    // Convert the raw string into a full DOM tree, and store the <body> and <style> elements
    var $ = cheerio.load(html);

    // If there's no <style> tag in the input HTML, let's make an empty one and add it
    if (!$('style').length) {
      INLINE_OPTS.applyStyleTags = false;
      $.root().prepend('<style></style>');
    }

    // Append media query-specific CSS to the <style> tag
    $('style').html($('style').html() + mqCss);

    // Move the <style> tag out of <head> and into <body>
    if ($('style').html().length === 0) {
      $('style').remove();
    }
    else {
      $('style').prependTo('body');
    }

    // Convert the DOM tree back to a string
    var newHtml = $.html();

    // If compression is enabled, compress the HTML
    // Otherwise, fix the indentation with beautify
    if (options.compress) {
      newHtml = htmlMinifier(newHtml, COMPRESS_OPTS);
    }
    else {
      newHtml = beautifyHtml(newHtml, BEAUTIFY_OPTS);
    }

    /**
     * Runs when the inlining process is done.
     * @callback successCallback
     * @param {string} html - Inlined HTML.
     */
    options.onSuccess(newHtml);
  }
}
