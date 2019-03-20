var querystring = require('querystring');
var got = require('got');

var token = require('./token');
var languages = require('./languages');

function tts(text, opts) {
    opts = opts || {};
    var e;
    if (opts.to && !languages.isSupported(opts.to)) {
        e = new Error();
        e.code = 400;
        e.message = 'The language \'' + lang + '\' is not supported';
    }
    if (text.length > 200) {
      e = new Error();
      e.code = 400;
      e.message = 'text length (' + text.length + ') should be less than 200 characters';
    }
    if (e) {
        return new Promise(function (resolve, reject) {
            reject(e);
        });
    }

    opts.to = opts.to || 'en';
    opts.to = languages.getCode(opts.to);

    return token.get(text).then(function (token) {
        var url = 'https://translate.google.cn/translate_tts';
        var data = {
            client: opts.client || 't',
            tl: opts.to,
            ie: 'UTF-8',
            idx: 0,
            total: 1,
            textlen: text.length,
            q: text
        };
        data[token.name] = token.value;
        return url + '?' + querystring.stringify(data);
    }).then(function (url) {
        return got(url, {encoding: null}).then(function (res) {
          
            return res.body;
            
        }).catch(function (err) {
            err.message += `\nUrl: ${url}`;
            if (err.statusCode !== undefined && err.statusCode !== 200) {
                err.code = 'BAD_REQUEST';
            } else {
                err.code = 'BAD_NETWORK';
            }
            throw err;
        });
    });
}

module.exports = tts;