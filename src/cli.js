#!/usr/bin/env node

const { Observable: O } = require('rxjs')

const { sendMessage, instantiate, poll, runCommand } = require('./lib')

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
  instantiate()
    .switchMap(poll())
    .map(update => update.message.from.id)
    .subscribe(console.log, console.error)
} else if (action === 'run') {
  instantiate()
    .switchMap(([config, tg]) =>
      poll(true)([config, tg])
        .concatMap(t =>
          runCommand(t.message.text.split(' '))
            .concatMap(v => O.from(
              v.split('\n').reduce((m, s) => {
                const last = m.length - 1
                if (!m[last] || m[last].length + s.length > 2500) {
                  return m.concat(s)
                } else {
                  m[last] += '\n' + s
                  return m
                }
              }, [])
            ))
            .concatMap(sendMessage(tg, t))
        )
    )
    .last()
    .subscribe(console.log, console.error)
} else {
  console.log(help)
}
