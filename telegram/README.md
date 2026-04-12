# Telegram Channel Bot — Silicon Valley Designer

Automatically generates and posts Russian-language design content to your Telegram channel using Claude AI.

## Setup

### 1. Create a Telegram bot

1. Open [@BotFather](https://t.me/BotFather) in Telegram
2. Send `/newbot` and follow the prompts
3. Copy the **bot token** you receive

### 2. Add the bot as channel admin

1. Open your channel settings → Administrators → Add Administrator
2. Search for your bot by username
3. Grant it **Post Messages** permission

### 3. Configure environment variables

```bash
cp .env.example .env
# Edit .env and fill in all values
```

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Claude API key |
| `TELEGRAM_BOT_TOKEN` | Token from @BotFather |
| `TELEGRAM_CHANNEL_ID` | Channel username with `@`, e.g. `@SiliconValleyDesigner` |
| `POST_SCHEDULE` | Cron expression (default: Mon/Wed/Fri at 10:00 Moscow time) |

### 4. Install dependencies

```bash
npm install
```

## Usage

**Run the scheduler** (posts on the configured schedule):
```bash
npm start
```

**Post immediately** (test or manual post):
```bash
npm run post-now
```

## Post schedule

Default cron `0 7 * * 1,3,5` = **Monday, Wednesday, Friday at 10:00 AM Moscow time** (UTC+3).

To post daily at 9 AM Moscow time: `0 6 * * *`

## What gets posted

Claude generates varied Russian-language posts rotating through:
- UI/UX practical tips
- Product design breakdowns (Apple, Google, Figma, etc.)
- Silicon Valley career advice for designers
- Figma tips & tricks
- Design system principles
- Typography & visual design insights
