if (!document.querySelector('[data-inliner]')) return;

// Dependencies
var beautifyHtml = require('./node_modules/js-beautify/js/lib/beautify-html.js').html_beautify;
var escapeHtml = require('escape-html');
var inlineCss = require('inline-css');
var parser = new DOMParser();
var siphonMQ = require('siphon-media-query');
var htmlMinifier = require('html-minifier').minify;
var clipboard = require('clipboard-js');

// DOM elements
var htmlInput = document.querySelector('[data-input-html]');
var cssInput = document.querySelector('[data-input-css]');
var output = document.querySelector('[data-output]');
var compileButton = document.querySelector('[data-compile]');
var compressFlag = document.querySelector('[data-compress]');
var copyButton = document.querySelector('[data-output-copy]');
var errorMessage = document.querySelector('[data-error]');

// Event listeners
compileButton.addEventListener('click', inline);
copyButton.addEventListener('click', copyHtml);

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

// Remove the class that displays a loading indicator
document.querySelector('[data-inliner]').classList.remove('is-not-loaded');

/**
 * Performs the inlining process using the HTML and CSS found in the inliner form. The HTML output is printed in the results area.
 */
function inline() {
  // Don't do anything if the HTML textarea is empty
  if (!htmlInput.value) return;

  // Reset the error state of the UI
  errorMessage.classList.remove('is-visible');

  // Get the values of the form, which includes two textareas and a checkbox
  var html = htmlInput.value;
  var css = cssInput.value;
  var compressEnabled = compressFlag.checked;

  // Find all media query-specific CSS from the CSS field
  try {
    var mqCss = siphonMQ(css);
  }
  // ...but display an error if it don't work
  catch(e) {
    error();
  }

  // Options to pass to inlineCss()
  var INLINE_OPTS = {
    url: '/',
    extraCss: css,
    preserveMediaQueries: true,
    applyStyleTags: !!hasStyleTag(html),
    applyLinkTags: false
  }

  // Run the inliner. When it's done, run the success() function below if it worked, or the error() function below if there's an error
  inlineCss(html, INLINE_OPTS).then(success, error);

  /**
   * Massages the HTML output of inline-css and then displays it in the results area. This function is called if inline-css finishes without errors.
   * @param {string} html - HTML output of inline-css.
   */
  function success(html) {
    // Convert the raw string into a full DOM tree, and store the <body> and <style> elements
    var dom = parser.parseFromString(html, 'text/html');
    var domBody = dom.querySelector('body');
    var styleTag = dom.querySelector('style');

    // If there's no <style> tag in the input HTML, let's make an empty one and add it
    if (!dom.querySelector('style')) {
      styleTag = document.createElement('style');
      dom.querySelector('head').appendChild(styleTag);
    }

    // Append media query-specific CSS to the <style> tag
    styleTag.innerHTML += mqCss;

    // Move the <style> tag out of <head> and into <body>
    domBody.insertBefore(styleTag, domBody.firstChild);

    // Convert the DOM tree back to a string
    var newHtml = $(dom).children('html').html();

    // We lose the doctype and <html> tags in this whole process, so add them back
    newHtml = DOCTYPE + HTML_TAG + newHtml + '</html>';

    // If compression is enabled, compress the HTML
    // Otherwise, fix the indentation with beautify
    if (compressEnabled) {
      newHtml = htmlMinifier(newHtml, COMPRESS_OPTS);
    }
    else {
      newHtml = beautifyHtml(newHtml, BEAUTIFY_OPTS);
    }

    // Finally, escape the HTML so the output in the browser is literal
    output.innerHTML = escapeHtml(newHtml);
  }

  /**
   * Updates the state of the UI to display an error message. This function is called if inline-css encounters an error.
   */
  function error(err) {
    errorMessage.classList.add('is-visible');
  }
}

/**
 * Check if an HTML string contains a `<style>` element.
 * @param {string} html - HTML to check.
 * @returns {boolean} `true` if the HTML contains a `<style>` tag, or `false` if not.
 */
function hasStyleTag(html) {
  var html = parser.parseFromString(html, 'text/html');
  return html.querySelector('style');
}

/**
 * Copy the contents of the results area to the user's clipboard. Called when the user clicks on the copy button.
 */
function copyHtml() {
  var text = output.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  clipboard.copy(text).then(function() {
    var oldValue = copyButton.innerHTML;
    copyButton.innerHTML = 'Successfully copied!';

    window.setTimeout(function() {
      copyButton.innerHTML = oldValue;
    }, 3000);
  });
}
