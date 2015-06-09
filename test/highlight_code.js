<html>
  <head>
    <link rel="stylesheet" href="../vendor/qunit.css"/>
    <link rel="stylesheet" href="../dist/droplet.min.css"/>
    <style>
      #test-main {
        position: absolute;
        top: 100px;
        right: 0;
        border: 5px solid red;
        height: 300px;
        width: 500px;
      }
    </style>
  </head>
  <div id="qunit"></div>
  <div id="qunit-fixture"></div>
  <div id="test-main">
  </div>
  <script src="../vendor/require.js"></script>
  <script src="../vendor/ace/ace.js"></script>
  <script src="../dist/droplet-full.js"></script>
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
  <script src="../vendor/qunit.js"></script>
<script>
require([
  'droplet-helper',
  'droplet-model',
  'droplet-parser',
  'droplet-view',
  'droplet'
], function(helper, model, parser, view, droplet) {
  function simulate(type, target, options) {
    if ('string' == typeof(target)) {
      target = $(target).get(0);
    }
    options = options || {};
    var pageX = pageY = clientX = clientY = dx = dy = 0;
    var location = options.location || target;
    if (location) {
      if ('string' == typeof(location)) {
        location = $(location).get(0);
      }
      var gbcr = location.getBoundingClientRect();
      clientX = gbcr.left,
      clientY = gbcr.top,
      pageX = clientX + window.pageXOffset;
      pageY = clientY + window.pageYOffset;
      dx = Math.floor((gbcr.right - gbcr.left) / 2);
      dy = Math.floor((gbcr.bottom - gbcr.top) / 2);
    }
    if ('dx' in options) dx = options.dx;
    if ('dy' in options) dy = options.dy;
    pageX = (options.pageX == null ? pageX : options.pageX) + dx;
    pageY = (options.pageY == null ? pageY : options.pageY) + dy;
    clientX = pageX - window.pageXOffset;
    clientY = pageY - window.pageYOffset;
    var opts = {
        bubbles: options.bubbles || true,
        cancelable: options.cancelable || true,
        view: options.view || target.ownerDocument.defaultView,
        detail: options.detail || 1,
        pageX: pageX,
        pageY: pageY,
        clientX: clientX,
        clientY: clientY,
        screenX: clientX + window.screenLeft,
        screenY: clientY + window.screenTop,
        ctrlKey: options.ctrlKey || false,
        altKey: options.altKey || false,
        shiftKey: options.shiftKey || false,
        metaKey: options.metaKey || false,
        button: options.button || 0,
        which: options.which || 1,
        relatedTarget: options.relatedTarget || null,
    }
    var evt;
    try {
      // Modern API supported by IE9+
      evt = new MouseEvent(type, opts);
    } catch (e) {
      // Old API still required by PhantomJS.
      evt = target.ownerDocument.createEvent('MouseEvents');
      evt.initMouseEvent(type, opts.bubbles, opts.cancelable, opts.view,
        opts.detail, opts.screenX, opts.screenY, opts.clientX, opts.clientY,
        opts.ctrlKey, opts.altKey, opts.shiftKey, opts.metaKey, opts.button,
        opts.relatedTarget);
    }
    target.dispatchEvent(evt);
  }
  function sequence(delay) {
    var seq = [],
        chain = { then: function(fn) { seq.push(fn); return chain; } };
    function advance() {
      setTimeout(function() {
        if (seq.length) {
          (seq.shift())();
          advance();
        }
      }, delay);
    }
    advance();
    return chain;
  }
  asyncTest('Controller: palette block expansion', function() {
    var editor, states;
    states = [];
    document.getElementById('test-main').innerHTML = '';
    varcount = 0;
    window.editor = editor = new droplet.Editor(document.getElementById('test-main'), {
      mode: 'coffeescript',
      palette: [{
        name: 'Draw',
        color: 'blue',
        blocks: [{
          block: 'pen()',
          expansion: 'pen red',
          title: 'ptest'
        }, {
          block: 'a = b',
          expansion: function() { return 'a' + (++varcount) + ' = b'; },
          title: 'ftest'
        },
        ],
      }]
    });
    simulate('mousedown', '[title=ptest]');
    simulate('mousemove', '.droplet-drag-cover',
      { location: '[title=ptest]', dx: 5 });
    simulate('mousemove', '.droplet-drag-cover',
      { location: '.droplet-main-scroller' });
    simulate('mouseup', '.droplet-drag-cover',
      { location: '.droplet-main-scroller' });
    equal(editor.getValue().trim(), 'pen red');
    simulate('mousedown', '[title=ftest]');
    simulate('mousemove', '.droplet-drag-cover',
      { location: '[title=ftest]', dx: 5 });
    simulate('mousemove', '.droplet-drag-cover',
      { location: '.droplet-main-scroller', dx: 40, dy: 50 });
    simulate('mouseup', '.droplet-drag-cover',
      { location: '.droplet-main-scroller', dx: 40, dy: 50 });
    equal(editor.getValue().trim(), 'pen red\na1 = b');
    simulate('mousedown', '[title=ftest]');
    simulate('mousemove', '.droplet-drag-cover',
      { location: '[title=ftest]', dx: 5 });
    simulate('mousemove', '.droplet-drag-cover',
      { location: '.droplet-main-scroller', dx: 40, dy: 80 });
    simulate('mouseup', '.droplet-drag-cover',
      { location: '.droplet-main-scroller', dx: 40, dy: 80 });
    equal(editor.getValue().trim(), 'pen red\na1 = b\na2 = b');
    start();
  });
});
</script>
</html>