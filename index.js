if (!document.querySelector('[data-inliner]')) return;

var inline = require('./lib/inline');
var copyHtml = require('./lib/copyHtml');
var escapeHtml = require('escape-html');

// DOM elements
var htmlInput = document.querySelector('[data-input-html]');
var cssInput = document.querySelector('[data-input-css]');
var output = document.querySelector('[data-output]');
var compileButton = document.querySelector('[data-compile]');
var compressFlag = document.querySelector('[data-compress]');
var copyButton = document.querySelector('[data-output-copy]');
var errorMessage = document.querySelector('[data-error]');

// Event listeners
compileButton.addEventListener('click', function() {
  // Don't do anything if the HTML textarea is empty
  if (!htmlInput.value) return;

  // Reset the error state of the UI
  errorMessage.classList.remove('is-visible');

  // Inline CSS
  inline(htmlInput.value, cssInput.value, {
    compress: compressFlag.checked,
    onSuccess: onSuccess,
    onError: onError
  });
});

copyButton.addEventListener('click', function() {
  copyHtml(output, copyButton);
});

/**
 * Updates the state of the UI to display inlined HTML. This function is called when the inlining process completes without errors.
 * @param {string} html - Unescpaed HTML output.
 */
function onSuccess(html) {
  output.innerHTML = escapeHtml(html);
}

/**
 * Updates the state of the UI to display an error message. This function is called if the inlining process encounters an error.
 */
function onError() {
  errorMessage.classList.add('is-visible');
}

// Remove the class that displays a loading indicator
document.querySelector('[data-inliner]').classList.remove('is-not-loaded');
