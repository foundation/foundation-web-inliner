var clipboard = require('clipboard-js');

/**
 * Copy the contents of the results area to the user's clipboard. Called when the user clicks on the copy button.
 * @param {HTMLElement} output - DOM element containing HTML output.
 * @param {HTMLElement} copyButton - DOM element for copy button.
 */
module.exports = function copyHtml(output, copyButton) {
  var text = output.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  clipboard.copy(text).then(function() {
    var oldValue = copyButton.innerHTML;
    copyButton.innerHTML = 'Successfully copied!';

    window.setTimeout(function() {
      copyButton.innerHTML = oldValue;
    }, 3000);
  });
}
