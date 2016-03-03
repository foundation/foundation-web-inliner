if (!document.querySelector('[data-inliner]')) return;

var beautifyHtml = require('js-beautify').html;
var escapeHtml = require('escape-html');
var inlineCss = require('inline-css');
var parser = new DOMParser();
var siphonMQ = require('siphon-media-query');

var htmlInput = document.querySelector('[data-input-html]');
var cssInput = document.querySelector('[data-input-css]');
var output = document.querySelector('[data-output]');
var compileButton = document.querySelector('[data-compile]');

compileButton.addEventListener('click', inline);

function inline() {
  if (!htmlInput.value) return;

  var html = htmlInput.value;
  var css = cssInput.value;
  var mqCss = siphonMQ(css);

  var inlineOpts = {
    url: '/',
    extraCss: css,
    preserveMediaQueries: true,
    applyStyleTags: !!hasStyleTag(html),
    applyLinkTags: false
  }

  var beautifyOpts = {
    indent_size: 2,
    quiet: true
  }

  inlineCss(html, inlineOpts)
    .then(function(html) {
      // Convert the raw string into a full DOM tree
      var dom = parser.parseFromString(html, 'text/html');

      if (!dom.querySelector('style')) {
        var styleTag = document.createElement('style');
        dom.querySelector('head').appendChild(styleTag);
      }

      // Append media query-specific CSS to the <style> tag
      styleTag.innerHTML += mqCss;

      // Convert the DOM tree back to a string
      var newHtml = $(dom).children('html').html();

      output.innerHTML = escapeHtml(beautifyHtml(newHtml, beautifyOpts));
    });
}

function hasStyleTag(html) {
  var html = parser.parseFromString(html, 'text/html');
  return html.querySelector('style');
}
