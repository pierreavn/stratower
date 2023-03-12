<img src="docs/assets/header.png" alt="stratower header" height="100">

Stratower is a simple dashboard to track Cloud resources consumption.

## Screenshots

<img src="docs/assets/screenshots/scaleway.png" alt="stratower scaleway" height="400">

## Security
To ensure API keys of Cloud providers are safe and never sent somewhere, Stratower is based on [Deno](http://deno.land/) with minimalist network permissions.  

For more information, see [`bin/stratower`](bin/stratower) file.

## Getting Started

With Docker:
```bash
docker run -d \
    --name stratower \
    -p 8080:8080 \
    -e STRATOWER_CLUSTERS=Scaleway \
    -e STRATOWER_Scaleway_PROVIDER=scaleway \
    -e STRATOWER_Scaleway_ORGANIZATION_ID=<org-id> \
    -e STRATOWER_Scaleway_AUTH_TOKEN=<auth-token> \
    stratower/stratower:latest
```

or from source:
```bash
cp .env.sample .env # Fill .env file
bin/stratower
```
