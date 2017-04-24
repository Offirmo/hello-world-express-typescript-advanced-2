# hello-world-express-advanced
Advanced express.js app in typescript, deployable on heroku :rooster: :koala: :dragon: :construction_worker:


## Introduction

Iterating on previous Hello World:
* https://github.com/Offirmo/hello-world-typescript
* https://github.com/Offirmo/hello-world-heroku

References:
* https://github.com/Offirmo-team/wiki/wiki/express.js
* https://expressjs.com/en/4x/api.html



## Installation and launch

### prerequisites
This app needs node >= 7

This app needs a Redis and a Mongo databases. Suggestion: use the default docker images.
* https://hub.docker.com/r/library/mongo/
* https://hub.docker.com/r/library/redis/

Then provides their url in env vars `DB_URL_MONGO_01` and `DB_URL_REDIS_01` or through a `.env` file, example:
```bash
touch .env
echo 'DB_URL_MONGO_01="mongodb://localhost:32773"' >> .env
echo 'DB_URL_REDIS_01="redis://localhost:32774"' >> .env
```

### Launch
```bash
yarn --production
yarn start
```

For more readable logs:
```bash
npm i bunyan
yarn start | ./node_modules/.bin/bunyan
```

## Contributing
see CONTRIBUTING.md
