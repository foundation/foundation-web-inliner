var expect = require('chai').expect;
var inline = require('../lib/inline');

describe('Inliner', () => {
  it('inlines CSS into HTML', done => {
    var html = `<p></p>`;
    var css = `p { color: red; }`;

    inline(html, css, {
      compress: true,
      onSuccess(html) {
        expect(html).to.equal('<p style="color:red"></p>');
        done();
      }
    });
  });

  it('retains media query CSS in a <style> tag', done => {
    var html = `<p></p>`;
    var css = `@media { p { color: red; } }`;

    inline(html, css, {
      compress: true,
      onSuccess(html) {
        expect(html).to.contain('<style>@media{p{color');
        done();
      }
    });
  });

  it('inlines non-media query CSS from the <style> tag', done => {
    var html = `
      <style>
        p {
          color: red;
        }
      </style>
      <p></p>
    `;
    var css = ``;

    inline(html, css, {
      compress: true,
      onSuccess(html) {
        expect(html).to.contain('<p style="color:red">');
        done();
      }
    });
  });

  it('retains media query CSS in the <style> tag', done => {
    var html = `
      <style>
        @media {
          p {
            color: red;
          }
        }
      </style>
      <p></p>
    `;
    var css = ``;

    inline(html, css, {
      compress: true,
      onSuccess(html) {
        expect(html).to.contain('<style>@media{p{color');
        done();
      }
    });
  });

  it('appends media query-specific CSS to an existing <style> tag', done => {
    var html = `
      <style>
        @media {
          div {
            color: red;
          }
        }
      </style>
      <p></p>
    `;
    var css = `
      @media {
        span {
          color: red;
        }
      }
    `;

    inline(html, css, {
      compress: true,
      onSuccess(html) {
        expect(html).to.contain('div').and.contain('span');
        done();
      }
    });
  });

  it('moves the <style> tag to be inside the <body>', done => {
    var html = `
      <style>
        @media {
          p {
            color: red;
          }
        }
      </style>
      <body>
        <p></p>
      </body>
    `;
    var css = ``;

    inline(html, css, {
      compress: true,
      onSuccess(html) {
        expect(html).to.contain('<body><style>');
        done();
      }
    });
  });

  it('does not write a <style> tag in the final output if not needed', done => {
    var html = `<p></p>`;
    var css = ``;

    inline(html, css, {
      compress: true,
      onSuccess(html) {
        expect(html).to.equal('<p></p>');
        done();
      }
    });
  });

  it('preserves HTML structure', done => {
    var html = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head></head>
        <body></body>
      </html>
    `
    var css = ``;

    inline(html, css, {
      compress: true,
      onSuccess(html) {
        expect(html).to.contain('<!DOCTYPE');
        expect(html).to.contain('<html').and.contain('</html>');
        expect(html).to.contain('<body').and.contain('</body>')
        done();
      }
    });
  });

  it('catches CSS parsing errors', done => {
    var html = `<p></p>`;
    var css = `p { color red }`;

    inline(html, css, {
      compress: true,
      onError() {
        done();
      },
      onSuccess() {}
    })
  });

  xit('does not fail if an empty <style> tag is in the input', done => {
    var html = `<style></style><p></p>`;
    var css = `p { color red }`;

    inline(html, css, {
      compress: true,
      onError(err) {
        done(err);
      },
      onSuccess() {
        done();
      }
    })
  });
});
