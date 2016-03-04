if (!document.querySelector('[data-inliner]')) return;

var beautifyHtml = require('./node_modules/js-beautify/js/lib/beautify-html.js').html_beautify;
var escapeHtml = require('escape-html');
var inlineCss = require('inline-css');
var parser = new DOMParser();
var siphonMQ = require('siphon-media-query');
var htmlMinifier = require('html-minifier').minify;
var clipboard = require('clipboard-js');

var htmlInput = document.querySelector('[data-input-html]');
var cssInput = document.querySelector('[data-input-css]');
var output = document.querySelector('[data-output]');
var compileButton = document.querySelector('[data-compile]');
var compressFlag = document.querySelector('[data-compress]');
var copyButton = document.querySelector('[data-output-copy]');

var DOCTYPE = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';

var HTML_TAG = '<html xmlns="http://www.w3.org/1999/xhtml">';

compileButton.addEventListener('click', inline);
copyButton.addEventListener('click', copyHtml);

document.querySelector('[data-inliner]').classList.remove('is-not-loaded');

function inline() {
  if (!htmlInput.value) return;

  var html = htmlInput.value;
  var css = cssInput.value;
  var mqCss = siphonMQ(css);
  var compressEnabled = compressFlag.checked;

  var inlineOpts = {
    url: '/',
    extraCss: css,
    preserveMediaQueries: true,
    applyStyleTags: !!hasStyleTag(html),
    applyLinkTags: false
  }

  var compressOpts = {
    collapseWhitespace: true,
    removeComments: true,
    keepClosingSlash: true,
    minifyCSS: true
  }

  var beautifyOpts = {
    indent_size: 2,
    quiet: true
  }

  inlineCss(html, inlineOpts)
    .then(function(html) {
      // Convert the raw string into a full DOM tree
      var dom = parser.parseFromString(html, 'text/html');
      var domBody = dom.querySelector('body');

      if (!dom.querySelector('style')) {
        var styleTag = document.createElement('style');
        dom.querySelector('head').appendChild(styleTag);
      }

      // Append media query-specific CSS to the <style> tag
      styleTag.innerHTML += mqCss;

      // Move the style tag into the body
      domBody.insertBefore(styleTag, domBody.firstChild);

      // Convert the DOM tree back to a string
      var newHtml = $(dom).children('html').html();

      // We lose the doctype and <html> tags in this whole process, so add them back
      newHtml = DOCTYPE + HTML_TAG + newHtml + '</html>';

      // If compression is enabled, compress the HTML
      // Otherwise, fix the indentation with beautify
      if (compressEnabled) {
        newHtml = htmlMinifier(newHtml, compressOpts);
      }
      else {
        newHtml = beautifyHtml(newHtml, beautifyOpts);
      }

      // Finally, escape the HTML so the output in the browser is literal
      output.innerHTML = escapeHtml(newHtml);
    });
}

function hasStyleTag(html) {
  var html = parser.parseFromString(html, 'text/html');
  return html.querySelector('style');
}

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
