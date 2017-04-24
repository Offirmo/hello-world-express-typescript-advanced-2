import * as express from 'express'
import * as uuid from 'uuid'
import * as session from 'express-session'
import * as redisSession from 'connect-redis'
import { urlencoded as bodyUrlencodedParser} from 'body-parser'
import * as morgan from 'morgan'
import * as helmet from 'helmet'
import { ServerLogger, serverLoggerToConsole } from '@offirmo/loggers-types-and-stubs'
import { Db as MongoDb } from 'mongodb'

import { factory as hCardCRUDFactory } from './persistence/hcard'
import { factory as routesFactory } from './routes'
import { RequestWithUUID, ExtendedRequest } from "./types"


interface InjectableDependencies {
	logger: ServerLogger
	sessionSecret: string
	isHttps: boolean
	dbHCard?: MongoDb
}


const defaultDependencies: InjectableDependencies = {
	logger: serverLoggerToConsole,
	sessionSecret: 'keyboard cat',
	isHttps: false,
}

async function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const { logger, sessionSecret, isHttps, dbHCard } = Object.assign({}, defaultDependencies, dependencies)
	logger.info('Initializing the top express app…')

	const RedisSessionStore = redisSession(session)

	if (!dbHCard)
		throw new Error('App: Need persistence link for hCards!')

	// TODO HTTPS
	if (!isHttps)
		logger.warn('XXX please activate HTTPS on this server !')

	if (sessionSecret === defaultDependencies.sessionSecret)
		logger.warn('XXX please set a secret for the session middleware !')

	const app = express()

	// https://expressjs.com/en/4x/api.html#app.settings.table
	app.enable('trust proxy')
	app.disable('x-powered-by') // safety

	app.use(function assignId(req: RequestWithUUID, res, next) {
		req.uuid = uuid.v4()
		next()
	})

	// log the request as early as possible
	app.use(morgan('combined')) // TODO remove
	app.use((req: RequestWithUUID, res, next) => {
		logger.info({
			uuid: req.uuid,
			method: morgan['method'](req),
			url: morgan['url'](req),
		})
		next()
	})

	// TODO activate CORS
	app.use(helmet())

	// https://github.com/expressjs/session
	app.use(session({
		store: new RedisSessionStore({
			host: 'localhost',
			port: 32770,
		}),
		secret: sessionSecret,
		resave: false,
		saveUninitialized: true,
		cookie: {
			secure: isHttps,
		}
	}))

	// link the session to a user ID
	app.use(async (req: ExtendedRequest, res, next) => {
		if (!req.session!.userId) {
			// NOTE
			// This is an exercise
			// We are supposing the user is previously connected
			// Thus we are always using the same user:
			req.session!.userId = 1234
		}

		req.userId = req.session!.userId

		logger.info({
			uuid: req.uuid,
			sessionId: req.session!.id,
			userId: req.userId,
		})


		next()
	})

	app.use(bodyUrlencodedParser({
		extended: false,
		parameterLimit: 100, // less than the default
		limit: '1Mb', // for profile image
	}))

	app.use(await routesFactory({
		logger,
		hCardCRUD: await hCardCRUDFactory({ logger, db: dbHCard })
	}))

	app.use((req, res) => {
		logger.error(`! 404 on "${req.path}" !"`)
		res.status(404).end()
	})

	app.use((err, req, res, next) => {
		logger.error(err.stack)
		res.status(500).send('Something broke !')
	})

	return app
}

export {
	InjectableDependencies,
	factory,
}
