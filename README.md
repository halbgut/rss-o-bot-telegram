# RSS-o-Bot Telegram

Send RSS-o-Bot Notifications over Telegram.

## Configuraion

This package require the following options inside your RSS-o-Bot settings (.rss-o-bot):

### telegram-api-token
A Telegram API token. It can be retrieved, by writting a message `/start` to `@BotFather`. The rest will be explained by the Bot Father. Notifications will be sent from the Bot if you include `telegram` in your `notification-methods`, set this option and set a `telegram-recipients`.

### telegram-recipients
An array of Telegram user IDs. User IDs may be retrieved using the `rss-o-bot poll-telegram` command. Check the description above for more information.

