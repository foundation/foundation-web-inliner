if (!document.querySelector('[data-inliner]')) return;

var beautifyHtml = require('js-beautify').html;
var escapeHtml = require('escape-html');
var inlineCss = require('inline-css');
var parser = new DOMParser();
var siphonMQ = require('siphon-media-query');

var PH_HTML =
`<html>
  <head>
    <style>
      .button { color: blue; }

      @media screen and (min-width: 600px) {
        .button { background-color: red; }
      }
    </style>
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
  var css = cssInput.value;

  var inlineOpts = {
    url: '/',
    extraCss: css,
    preserveMediaQueries: true,
    applyLinkTags: false
  }

  var beautifyOpts = {
    indent_size: 2,
    quiet: true
  }

  var mqCss = siphonMQ(css);

  inlineCss(htmlInput.value, inlineOpts)
    .then(function(html) {
      // Convert the raw string into a full DOM tree
      var dom = parser.parseFromString(html, 'text/html');

      // Append media query-specific CSS to the <style> tag
      dom.querySelector('style').innerHTML += mqCss;

      // Convert the DOM tree back to a string
      var newHtml = $(dom).children('html').html();

      output.innerHTML = escapeHtml(beautifyHtml(newHtml, beautifyOpts));
    });
}
