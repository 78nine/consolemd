/*! (c) 2013-2018 Andrea Giammarchi (ISC) */
!function(){"use strict";for(var r,n="object"==typeof process&&!process.browser,t=n?function(r,e){function n(e){return"string"==typeof e?r(e):e}return function(){return e.call(arguments,n)}}(require("echomd").raw,[].map):function(e){var r,n,t,o,a,l,c=(Object.create||Object)(null),i=y.multiLineCode.re,d=y.singleLineCode.re,f=function(e,r,n,t){return t=t.replace(/%c/g,"%%c"),r+n+(c[t]=p(t))+n},u=function(e,r,n,t){return r+"%c"+h(t,c)+"%c"},s=[];for(m(e,"multiLineCode",s),e=e.replace(i,f),m(e,"singleLineCode",s),e=e.replace(d,f),m(e,"header2",s),m(e,"header1",s),m(e,"blink",s),m(e,"bold",s),m(e,"dim",s),m(e,"hidden",s),m(e,"reverse",s),m(e,"strike",s),m(e,"underline",s),m(e,"color",s),e=e.replace(/^[ ]{0,2}([ ]?[*_-][ ]?){3,}[ \t]*$/gm,g),e=b(e,"header2"),e=b(e,"header1"),e=b(e,"blink"),e=b(e,"bold"),e=b(e,"dim"),e=b(e,"hidden"),e=b(e,"reverse"),e=b(e,"strike"),e=(e=(e=b(e,"underline")).replace(/^([ \t]{1,})[*+-]([ \t]{1,})/gm,"$1•$2")).replace(/^[ \t]*>([ \t]?)/gm,function(e,r){return Array(r.length+1).join("▌")+r}),r=[e=(e=(e=(e=b(e,"color")).replace(/(%c)+/g,"%c")).replace(d,u)).replace(i,u)],o=s.length,n=0;n<o;n++){for(l=a="",t=n;t<o;t++)if((n=t)in s){if(l&&l!==s[t].k){n--;break}l=s[t].k,a+=s[t].v}a&&r.push(a)}return r},g=Array(33).join("─"),p=function(e){for(var r=[],n=0;n<e.length;n++)r[n]=e.charCodeAt(n).toString(32);return r.join("").slice(0,e.length)},h=function(e,r){for(var n in r)if(r[n]===e)return n},e=function(e,r,n,t){return"%c"+n+t+"%c"},m=function(e,r,n){for(var t,o,a=y[r];o=a.re.exec(e);)n[t=o.index]={k:"start",v:"string"==typeof a.start?a.start:a.start(o)},n[t=t+o[0].length-1]={k:"end",v:"string"==typeof a.end?a.end:a.end(o)}},b=function(e,r){var n=y[r];return e.replace(n.re,n.place)},y={blink:{re:/(\:{1,2})(?=\S)(.*?)(\S)\1/g,place:e,start:"border:1px solid darkslategray;text-shadow:0 0 2px darkslategray;",end:"border:none;text-shadow:none;"},bold:{re:/(\*{1,2})(?=\S)(.*?)(\S)\1/g,place:e,start:"font-weight:bold;",end:"font-weight:default;"},color:{re:/(!?)#([a-zA-Z0-9]{3,8})\((.+?)\)(?!\))/g,place:function(e,r,n,t){return"%c"+t+"%c"},start:function(e){return(e[1]?"background-":"")+"color:"+(/^[a-fA-F0-9]{3,8}$/.test(e[2])?"#":"")+e[2]+";"},end:function(e){return(e[1]?"background-":"")+"color:initial;"}},dim:{re:/(-{1,2})(?=\S)(.*?)(\S)\1/g,place:e,start:"color:dimgray;",end:"color:none;"},header1:{re:/^(\#[ \t]+)(.+?)[ \t]*\#*([\r\n]+|$)/gm,place:e,start:"font-weight:bold;font-size:1.6em;",end:"font-weight:default;font-size:default;"},header2:{re:/^(\#{2,6}[ \t]+)(.+?)[ \t]*\#*([\r\n]+|$)/gm,place:e,start:"font-weight:bold;font-size:1.3em;",end:"font-weight:default;font-size:default;"},hidden:{re:/(\?{1,2})(?=\S)(.*?)(\S)\1/g,place:e,start:"color:rgba(0,0,0,0);",end:"color:none;"},reverse:{re:/(\!{1,2})(?=\S)(.*?)(\S)\1/g,place:e,start:"background:darkslategray;color:lightgray;",end:"background:none;color:none;"},multiLineCode:{re:/(^|[^\\])(`{2,})([\s\S]+?)\2(?!`)/g,start:"font-family:monospace;",end:"font-family:default;"},singleLineCode:{re:/(^|[^\\])(`)(.+?)\2/gm,start:"font-family:monospace;",end:"font-family:default;"},strike:{re:/(~{1,2})(?=\S)(.*?)(\S)\1/g,place:e,start:"text-decoration:line-through;",end:"text-decoration:default;"},underline:{re:/(_{1,2})(?=\S)(.*?)(\S)\1/g,place:e,start:"border-bottom:1px solid;",end:"border-bottom:default;"}},o=function(e){var r=console[e];r&&((a[e]=n?function(){return r.apply(console,t.apply(null,arguments))}:function(){return 1===arguments.length&&"string"==typeof arguments[0]?r.apply(console,t(arguments[0])):r.apply(console,arguments)}).raw=function(){return r.apply(console,arguments)})},a={},l=["error","info","log","warn"],c=0;c<l.length;c++)o(l[c]);try{for(r in module.exports=a,o=function(e){return function(){return e.apply(console,arguments)}},console)a.hasOwnProperty(r)||(a[r]=o(console[r]))}catch(e){for(c=0;c<l.length;c++)r=l[c],console[r].raw||(console[r]=a[r])}}();