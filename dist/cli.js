#!/usr/bin/env node
'use strict';

var Tg = require('tg-yarl');
var Rx = require('rx');
var O = Rx.Observable;
var config = require('rss-o-bot').config;

var help = 'rss-o-bot-telegram poll\n  Continuously checks telegram for incomming messages.\n  When a message is sent to the defined Telegram Bot,\n  the ID of the sender will be displayed. This ID then\n  may be used as part of the configured\n  "telegram-recipients" array. For further information\n  on the configuration of Telegram notifications check\n  the configuration reference below.\n';

var action = process.argv[2];

if (action === 'poll') {
  (function () {
    var tg = Tg(config['telegram-api-token']);
    O.interval(1000).startWith(0).flatMap(function () {
      return O.fromPromise(tg.getUpdates());
    }).map(function (res) {
      return res.body.ok ? res.body.result.slice(-1)[0] : null;
    }).distinctUntilChanged(function (update) {
      return update ? update.update_id : null;
    }).map(function (update) {
      return update ? update.message.from.id : null;
    }).subscribe(console.log, console.error, function () {
      return process.exit();
    });
  })();
} else {
  console.log(help);
}