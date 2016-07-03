'use strict';

var Tg = require('tg-yarl');
var Rx = require('rx');

module.exports = function telegram(config) {
  var tg = Tg(config.get('telegram-api-token'));
  return function (subject, url, title) {
    return Rx.Observable.forkJoin(config.get('telegram-recipients').map(function (r) {
      return Rx.Observable.fromPromise(tg.sendMessage(r, subject + ' \n' + title + ': ' + url));
    }));
  };
};