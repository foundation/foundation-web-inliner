var inlineCss = require('inline-css');
var escapeHtml = require('escape-html');

var PH_HTML =
`<html>
  <head>
    <style>.button { color: blue; }</style>
  </head>
  <body>
    <div class="button"></div>
  </body>
</html>`;

var PH_CSS =
`.button {
  font-size: 2rem;
}

@media (min-width: 200px) {
  .button {
    font-size: 10rem;
  }
}`;

var htmlInput = document.querySelector('[data-input-html]');
var cssInput = document.querySelector('[data-input-css]');
var output = document.querySelector('[data-output]');
var compileButton = document.querySelector('[data-compile]');

htmlInput.value = PH_HTML;
cssInput.value = PH_CSS;

compileButton.addEventListener('click', inline);

function inline() {
  var opts = {
    url: '/',
    extraCss: cssInput.value,
    preserveMediaQueries: true,
    applyLinkTags: false
  }

  inlineCss(htmlInput.value, opts)
    .then(function(html) {
      output.innerHTML = escapeHtml(html);
    });
}
