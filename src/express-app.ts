import * as express from 'express'
import * as uuid from 'uuid'
import * as session from 'express-session'
import { urlencoded as bodyUrlencodedParser} from 'body-parser'
import * as morgan from 'morgan'
import * as helmet from 'helmet'
import { ServerLogger, serverLoggerToConsole } from '@offirmo/loggers-types-and-stubs'

import { factory as sessionCRUDFactory } from './persistence/session'
import { factory as hCardCRUDFactory } from './persistence/hcard'
import { factory as routesFactory } from './routes'
import { RequestWithUUID, ExtendedRequest } from "./types";


interface InjectableDependencies {
	logger: ServerLogger
	sessionSecret: string
	isHttps: boolean
	dbConnexionSettings?: any
}


const defaultDependencies: InjectableDependencies = {
	logger: serverLoggerToConsole,
	sessionSecret: 'keyboard cat',
	isHttps: false,
}


function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const { logger, sessionSecret, isHttps, dbConnexionSettings } = Object.assign({}, defaultDependencies, dependencies)

	logger.info('Hello from express app!') // TODO remove

	if (!dbConnexionSettings)
		throw new Error('App: Need persistence settings!')

	// TODO HTTPS
	if (!isHttps)
		logger.warn('XXX please activate HTTPS on this server !')

	if (sessionSecret === defaultDependencies.sessionSecret)
		logger.warn('XXX please set a secret for the session middleware !')

	const sessionCRUD = sessionCRUDFactory({
		logger,
		dbConnexionSettings,
	})
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
	// TODO store sessions in Redis
	app.use(session({
		secret: sessionSecret,
		resave: false,
		saveUninitialized: true,
		cookie: {
			secure: isHttps,
		}
	}))

	// Use the session to link to a user ID
	// TODO
	let crudeUserIdGenerator = 0
	const sessionKey = Symbol('session to user')
	app.use(async (req: ExtendedRequest, res, next) => {
		// TODO
		const sessionId: string = req.session!.id
		let session = await sessionCRUD.read(sessionId)
		if (!session ) {
			session = {
				userId: `${++crudeUserIdGenerator}`
			}
			// TODO
			console.log('created userId', session.userId)
			await sessionCRUD.create(sessionId, session)
		}
		const { userId } = session
		console.log({userId})
		req.userId = userId!

		logger.info({
			uuid: req.uuid,
			sessionId,
			userId,
		})
		next()
	})

	app.use(bodyUrlencodedParser({
		extended: false,
		parameterLimit: 100, // less than the default
		limit: '1Mb', // for profile image
	}))

	app.use(routesFactory({
		logger,
		hCardCRUD: hCardCRUDFactory({ logger, dbConnexionSettings })
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
