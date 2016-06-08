#!/usr/bin/env node

const Tg = require('tg-yarl')
const Rx = require('rx')
const O = Rx.Observable
const config = require('rss-o-bot').config

const help =
`rss-o-bot-telegram poll
  Continuously checks telegram for incomming messages.
  When a message is sent to the defined Telegram Bot,
  the ID of the sender will be displayed. This ID then
  may be used as part of the configured
  "telegram-recipients" array. For further information
  on the configuration of Telegram notifications check
  the configuration reference below.
`

const action = process.argv[2]

if (action === 'poll') {
  const tg = Tg(config['telegram-api-token'])
  O.interval(1000).startWith(0)
    .flatMap(() => O.fromPromise(tg.getUpdates()))
    .map(res => res.body.ok
      ? res.body.result.slice(-1)[0]
      : null
    )
    .distinctUntilChanged(update => update ? update.update_id : null)
    .map(update => update ? update.message.from.id : null)
    .subscribe(console.log, console.error, () => process.exit())
} else {
  console.log(help)
}

