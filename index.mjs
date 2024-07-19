/*! (c) 2024 Andrea Giammarchi (ISC) */

import dedent from 'codedent';

for (var
  parse = function (txt) {
    var
      code = Object.create(null),
      multiLineCode = transform.multiLineCode.re,
      singleLineCode = transform.singleLineCode.re,
      storeAndHide = function (_, $1, $2, $3) {
        $3 = $3.replace(/%c/g, '%%c');
        return $1 + $2 + (code[$3] = md5Base64($3)) + $2;
      },
      restoreHidden = function (_, $1, __, $3) {
        return $1 + '%c' + getSource($3, code) + '%c';
      },
      out = [],
      args, i, j, length, css, key
    ;

    // match and hide possible code (which should not be parsed)
    match(txt, 'multiLineCode', out);
    txt = txt.replace(multiLineCode, storeAndHide);
    match(txt, 'singleLineCode', out);
    txt = txt.replace(singleLineCode, storeAndHide);

    // find all special cases preserving the order
    // in which are these found
    match(txt, 'header2', out);
    match(txt, 'header1', out);
    match(txt, 'blink', out);
    match(txt, 'bold', out);
    match(txt, 'dim', out);
    match(txt, 'hidden', out);
    match(txt, 'reverse', out);
    match(txt, 'strike', out);
    match(txt, 'underline', out);
    match(txt, 'color', out);

    // transform using all info

    // - - - or ___ or * * * with or without space in between
    txt = txt.replace(/^[ ]{0,2}([ ]?[*_-][ ]?){3,}[ \t]*$/gm, line);

    // ## Header
    txt = replace(txt, 'header2');

    // # Header
    txt = replace(txt, 'header1');

    // :blink: *bold* -dim- ?hidden? !reverse! _underline_ ~strike~
    txt = replace(txt, 'blink');
    txt = replace(txt, 'bold');
    txt = replace(txt, 'dim');
    txt = replace(txt, 'hidden');
    txt = replace(txt, 'reverse');
    txt = replace(txt, 'strike');
    txt = replace(txt, 'underline');

    //    * list bullets
    txt = txt.replace(/^([ \t]{1,})[*+-]([ \t]{1,})/gm, '$1•$2');

    // > simple quotes
    txt = txt.replace(/^[ \t]*>([ \t]?)/gm, function ($0, $1) {
      return Array($1.length + 1).join('▌') + $1;
    });

    // #RGBA(color) and !#RGBA(background-color)
    txt = replace(txt, 'color');

    // cleanup duplicates
    txt = txt.replace(/(%c)+/g, '%c');

    // put back code
    txt = txt.replace(singleLineCode, restoreHidden);
    txt = txt.replace(multiLineCode, restoreHidden);

    // create list of arguments to style the console
    args = [txt];
    length = out.length;
    for (i = 0; i < length; i++) {
      css = '';
      key = '';
      // group styles by type (start/end)
      for (j = i; j < length; j++) {
        i = j;  // update the i to move fast-forward
        if (j in out) {
          // first match or same kind of operation (start/end)
          if (!key || (key === out[j].k)) {
            key = out[j].k;
            css += out[j].v;
          } else {
            i--;  // if key changed, next loop should update
            break;
          }
        }
      }
      if (css) args.push(css);
    }
    return args;
  },
  line = Array(33).join('─'),
  // just using same name used in echomd, not actual md5
  md5Base64 = function (txt) {
    for (var out = [], i = 0; i < txt.length; i++) {
      out[i] = txt.charCodeAt(i).toString(32);
    }
    return out.join('').slice(0, txt.length);
  },
  getSource = function (hash, code) {
    for (var source in code) {
      if (code[source] === hash) {
        return source;
      }
    }
  },
  commonReplacer = function ($0, $1, $2, $3) {
    return '%c' + $2 + $3 + '%c';
  },
  match = function (txt, what, stack) {
    var info = transform[what], i, match;
    while (match = info.re.exec(txt)) {
      i = match.index;
      stack[i] = {
        k: 'start',
        v: typeof info.start === 'string' ?
          info.start : info.start(match)
      };
      i = i + match[0].length - 1;
      stack[i] = {
        k: 'end',
        v: typeof info.end === 'string' ?
          info.end : info.end(match)
      };
    }
  },
  replace = function (txt, what) {
    var info = transform[what];
    return txt.replace(info.re, info.place);
  },
  transform = {
    blink: {
      re: /(\:{1,2})(?=\S)(.*?)(\S)\1/g,
      place: commonReplacer,
      start: 'padding:0 2px;border:1px solid darkslategray;text-shadow:0 0 2px darkslategray;',
      end: 'padding:none;border:none;text-shadow:none;'
    },
    bold: {
      re: /(\*{1,2})(?=\S)(.*?)(\S)\1/g,
      place: commonReplacer,
      start: 'font-weight:bold;',
      end: 'font-weight:default;'
    },
    color: {
      re: /(!?)#([a-zA-Z0-9]{3,8})\((.+?)\)(?!\))/g,
      place: function (_, __, ___, txt) {
        return '%c' + txt + '%c';
      },
      start: function (match) {
        return (match[1] ? 'background-' : '') + 'color:' +
              (/^[a-fA-F0-9]{3,8}$/.test(match[2]) ? '#' : '') +
              match[2] + ';';
      },
      end: function (match) {
        return (match[1] ? 'background-' : '') + 'color:initial;';
      }
    },
    dim: {
      re: /(-{1,2})(?=\S)(.*?)(\S)\1/g,
      place: commonReplacer,
      start: 'color:dimgray;',
      end: 'color:none;'
    },
    header1: {
      re: /^(\#[ \t]+)(.+?)[ \t]*\#*([\r\n]+|$)/gm,
      place: commonReplacer,
      start: 'font-weight:bold;font-size:1.6em;',
      end: 'font-weight:default;font-size:default;'
    },
    header2: {
      re: /^(\#{2,6}[ \t]+)(.+?)[ \t]*\#*([\r\n]+|$)/gm,
      place: commonReplacer,
      start: 'font-weight:bold;font-size:1.3em;',
      end: 'font-weight:default;font-size:default;'
    },
    hidden: {
      re: /(\?{1,2})(?=\S)(.*?)(\S)\1/g,
      place: commonReplacer,
      start: 'color:rgba(0,0,0,0);',
      end: 'color:none;'
    },
    reverse: {
      re: /(\!{1,2})(?=\S)(.*?)(\S)\1/g,
      place: commonReplacer,
      start: 'padding:0 2px;background:darkslategray;color:lightgray;',
      end: 'padding:none;background:none;color:none;'
    },
    multiLineCode: {
      re: /(^|[^\\])(`{2,})([\s\S]+?)\2(?!`)/g,
      start: 'font-family:monospace;',
      end: 'font-family:default;'
    },
    singleLineCode: {
      re: /(^|[^\\])(`)(.+?)\2/gm,
      start: 'font-family:monospace;',
      end: 'font-family:default;'
    },
    strike: {
      re: /(~{1,2})(?=\S)(.*?)(\S)\1/g,
      place: commonReplacer,
      start: 'text-decoration:line-through;',
      end: 'text-decoration:default;'
    },
    underline: {
      re: /(_{1,2})(?=\S)(.*?)(\S)\1/g,
      place: commonReplacer,
      start: 'border-bottom:1px solid;',
      end: 'border-bottom:default;'
    }
  },
  // 'error', 'info', 'log', 'warn' are overwritten
  // it is possible to use original method at any time
  // simply accessing console.methodName.raw( ... ) instead
  overwrite = function (method) {
    var original = console[method];
    (exports[method] = function () {
      return arguments.length === 1 && typeof arguments[0] === 'string' ?
        original.apply(console, parse(dedent(arguments[0]))) :
        original.apply(console, arguments);
    }).raw = function () {
      return original.apply(console, arguments);
    };
  },
  exports = {},
  methods = ['error', 'info', 'log', 'warn'],
  i = 0; i < methods.length; overwrite(methods[i++])
);

const { error, info, log, warn } = exports;

export { error, info, log, warn };
