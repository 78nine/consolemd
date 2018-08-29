/*! (c) 2013-2018 Andrea Giammarchi (ISC) */
/**
 * Fully inspired by the work of John Gruber
 * <http://daringfireball.net/projects/markdown/>
 */
(function () {'use strict';
  for (var
    isNodeJS = typeof process === 'object' && !process.browser,
    parse = isNodeJS ?
      // on NodeJS simply fallback to echomd
      (function (echomd, map) {
        function parse(value) {
          return typeof value === 'string' ?
            echomd(value) : value;
        }
        return function () {
          return map.call(arguments, parse);
        };
      }(require('echomd').raw, [].map)) :
      // on browsers implement some %cmagic%c
      // The current algorithm is based on two passes:
      //  1. collect all info ordered by string index
      //  2. transform surrounding with special %c chars
      // Info are grouped together whenever is possible
      // since the console does not support one style per %c
      (function () {
        return function (txt) {
          var
            code = (Object.create || Object)(null),
            multiLineCode = transform.multiLineCode.re,
            singleLineCode = transform.singleLineCode.re,
            storeAndHide = function ($0, $1, $2, $3) {
              $3 = $3.replace(/%c/g, '%%c');
              return $1 + $2 + (code[$3] = md5Base64($3)) + $2;
            },
            restoreHidden = function ($0, $1, $2, $3) {
              return $1 + '%c' + getSource($3, code) + '%c';
            },
            out = [],
            args, i, j, length, css, key, re
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
        };
      }())
    ,
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
        start: 'border:1px solid darkslategray;text-shadow:0 0 2px darkslategray;',
        end: 'border:none;text-shadow:none;'
      },
      bold: {
        re: /(\*{1,2})(?=\S)(.*?)(\S)\1/g,
        place: commonReplacer,
        start: 'font-weight:bold;',
        end: 'font-weight:default;'
      },
      color: {
        re: /(!?)#([a-zA-Z0-9]{3,8})\((.+?)\)(?!\))/g,
        place: function ($0, bg, rgb, txt) {
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
        start: 'background:darkslategray;color:lightgray;',
        end: 'background:none;color:none;'
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
      if (original) (consolemd[method] = isNodeJS ?
        function () {
          return original.apply(console, parse.apply(null, arguments));
        } :
        function () {
          return arguments.length === 1 && typeof arguments[0] === 'string' ?
            original.apply(console, parse(arguments[0])) :
            original.apply(console, arguments);
        }).raw = function () {
          return original.apply(console, arguments);
        };
    },
    consolemd = {},
    methods = ['error', 'info', 'log', 'warn'],
    key,
    i = 0; i < methods.length; i++
  ) {
    overwrite(methods[i]);
  }
  // if this is a CommonJS module
  try {
    // export consolemd fake object
    module.exports = consolemd;
    overwrite = function (original) {
      return function () {
        return original.apply(console, arguments);
      };
    };
    for (key in console) {
      if (!consolemd.hasOwnProperty(key)) {
        consolemd[key] = overwrite(console[key]);
      }
    }
  } catch(e) {
    // otherwise replace global console methods
    for (i = 0; i < methods.length; i++) {
      key = methods[i];
      if (!console[key].raw) {
        console[key] = consolemd[key];
      }
    }
  }
}());
