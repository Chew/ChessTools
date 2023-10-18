# Chess.Tools Site

View all your chess stats across federations and chess websites on one site!

## Features

(All in progress, but planned!)

- [x] View your USCF stats
- [x] View your Lichess stats
- [x] View your Chess.com stats
- [x] View your Chess24 stats
- [x] View your FIDE stats

More!

## Development

If you want to help contribute, you're more than welcome to! Just fork the repo and make a pull request.

This site uses Nuxt, a Vue framework. We use Bun as our package manager.

### Prerequisites

- [Bun](https://bun.sh)
- Some knowledge of Vue/JS

### Setting Up Development Environment

1. Clone the repo
2. Run `bun install` to install dependencies
3. Prepare the `.env` file as follows
    ```
    cp .env.example .env
    ```
4. Create a DB for your application in Supabase and put the connection information in the `.env` file.
    ```
    SUPABASE_URL="https://example.supabase.co"
    SUPABASE_KEY="<your_key>"
    SUPABASE_SERVICE_KEY="<your_service_key>"
    ```
5. Run `bun run dev` to start the development server
6. Go to `localhost:3000` to view the site
7. Make changes and submit a pull request!
