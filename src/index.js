const Tg = require('tg-yarl')
const Rx = require('rxjs/Rx')

module.exports = function telegram (config) {
  const tg = Tg(config.get('telegram-api-token'))
  return (subject, url, title) =>
    Rx.Observable.forkJoin(
      config.get('telegram-recipients').map(r =>
        Rx.Observable.fromPromise(tg.sendMessage(r, `${subject} \n${title}: ${url}`))
      )
    )
}
