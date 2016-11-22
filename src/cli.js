#!/usr/bin/env node

const { spawn } = require('child_process')
const Tg = require('tg-yarl')
const Rx = require('rxjs/Rx')
const O = Rx.Observable
const rssOBot = require('rss-o-bot')

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

const instantiate = () =>
  rssOBot.getConfig()
    .map(config => [config, Tg(config.get('telegram-api-token'))])

const poll = (filter = false) => ([config, tg]) =>
  O.interval(2000)
    .startWith(0)
    .switchMap(() => O.fromPromise(tg.getUpdates(-1)))
    .switchMap(res => res.body.ok
      ? O.of(res.body.result)
      : O.throw([res.status, res.body])
    )
    .concatMap(v => O.from(v))
    .filter(v =>
      !filter ||
      // If `filter` is true, check that the sender is in `telegram-commanders`
      config
        .get('telegram-commanders')
        .includes(v.message.from.id.toString())
    )
    .distinctUntilChanged((a, b) => b.update_id === a.update_id)
    .skip(1)

const runCommand = args => O.create(o => {
  const proc = spawn('rss-o-bot', args)
  let data = ''
  proc.stdout.on('data', x => { data += x })
  proc.stdout.on('error', x => { data += x })
  proc.on('close', () => {
    o.next(data)
  })
})

if (action === 'poll') {
  instantiate()
    .switchMap(poll())
    .map(update => update ? update.message.from.id : null)
    .filter(a => a)
    .subscribe(console.log, console.error)
} else if (action === 'run') {
  instantiate()
    .switchMap(([config, tg]) =>
      poll(true)([config, tg])
        .concatMap(t =>
          runCommand(t.message.text.split(' '))
            .switchMap(data => data.split('\n'))
            .concatMap(msg => O.fromPromise(tg.sendMessage(t.message.chat.id, msg)))
        )
    )
    .subscribe(console.log, console.error)
} else {
  console.log(help)
}

