var inlineCss = require('inline-css');
var escapeHtml = require('escape-html');
var siphonMQ = require('siphon-media-query');
var parser = new DOMParser();

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

  var opts = {
    url: '/',
    extraCss: css,
    preserveMediaQueries: true,
    applyLinkTags: false
  }

  var mqCss = siphonMQ(css);

  inlineCss(htmlInput.value, opts)
    .then(function(html) {
      var dom = parser.parseFromString(html, 'text/html');
      dom.querySelector('style').innerHTML += mqCss;
      output.innerHTML = escapeHtml($(dom).children('html').html());
    });
}
