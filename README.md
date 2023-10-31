# Chess.Tools Site

The ultimate Chess website for statiaticians. View all your chess stats across federations and chess websites on one site!

## Features

(All in progress, but planned!)

- [x] Notate your OTB games with the game viewer
- [x] View your Chess.com stats
- [x] View your Lichess stats
- [x] View your US Chess stats
- [x] View your FIDE stats

And even more features coming soon!

## Development

If you want to help contribute, you're more than welcome to! Just fork the repo and make a pull request.

This site uses Nuxt, a Vue framework. We use Bun as our package manager.

### Prerequisites

- [Bun](https://bun.sh)
- Some knowledge of Vue/JS

### Setting Up Development Environment

1. Fork and clone the repo
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
5. Fill out extra `.env` options as needed
6. Run `bun run dev` to start the development server
7. Go to `localhost:3000` to view the site
8. Make changes and submit a pull request!
