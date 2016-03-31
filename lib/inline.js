var beautifyHtml = require('../node_modules/js-beautify/js/lib/beautify-html.js').html_beautify;
var cheerio = require('cheerio');
var inlineCss = require('inline-css');
var parser = new DOMParser();
var siphonMQ = require('siphon-media-query');
var htmlMinifier = require('html-minifier').minify;

// Doctype used for emails
var DOCTYPE = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';

// HTML tag used for emails
var HTML_TAG = '<html xmlns="http://www.w3.org/1999/xhtml">';

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
 * Performs the inlining process using the HTML and CSS found in the inliner form. The HTML output is printed in the results area.
 */
module.exports = function inline(html, css, options) {
  // Find all media query-specific CSS from the CSS field
  try {
    var mqCss = siphonMQ(css);
  }
  // ...but display an error if it don't work
  catch(e) {
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
    $('style').prependTo('body');

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

    // Finally, escape the HTML so the output in the browser is literal
    options.onSuccess(newHtml);
  }
}
