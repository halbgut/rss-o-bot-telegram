const { spawn } = require('child_process')
const { Observable: O } = require('rxjs')
const rssOBot = require('rss-o-bot')
const Tg = require('tg-yarl')

module.exports.sendMessage = (tg, t) => msg => O.fromPromise(
  tg.sendMessage(
    t.message.chat.id,
    msg,
    { parse_mode: 'HTML' }
  )
)

module.exports.instantiate = () =>
  rssOBot.getConfig()
    .map(config => [config, Tg(config.get('telegram-api-token'))])

module.exports.poll = (filter = false) => ([config, tg]) =>
  O.interval(2000)
    .startWith(0)
    .switchMap(() => O.fromPromise(tg.getUpdates(-1)))
    .switchMap(res => res.body.ok
      ? O.of(res.body.result)
      : O.throw([res.status, res.body])
    )
    .map(v => v[0])
    .filter(v => v && v.message)
    .filter(v =>
      !filter ||
      // If `filter` is true, check that the sender is in `telegram-commanders`
      config
        .get('telegram-commanders')
        .includes(v.message.from.id.toString())
    )
    .distinctUntilChanged((a, b) => b.update_id === a.update_id)
    .skip(1)

module.exports.runCommand = args => O.create(o => {
  const proc = spawn('rss-o-bot', args.concat('--ugly'))
  let data = ''
  proc.stdout.on('data', x => { data += x })
  proc.stderr.on('data', x => { data += x })
  proc.on('close', () => {
    o.next(data)
    o.complete()
  })
})
