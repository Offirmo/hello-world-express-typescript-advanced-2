import * as express from 'express'
import * as uuid from 'uuid'
import * as session from 'express-session'
import { urlencoded as bodyUrlencodedParser} from 'body-parser'
import { createLogger } from 'bunyan'
import * as morgan from 'morgan'

import { factory as routesFactory } from './routes'


interface InjectableDependencies {
	logger: Console
	sessionSecret: string
	isHttps: boolean
}


const defaultDependencies: InjectableDependencies = {
	logger: console,
	sessionSecret: 'keyboard cat',
	isHttps: false,
}


function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const { logger, sessionSecret, isHttps } = Object.assign({}, defaultDependencies, dependencies)

	logger.log('Hello from express app!') // TODO remove

	// TODO HTTPS
	if (!isHttps)
		logger.warn('XXX please activate HTTPS on this server !')

	if (sessionSecret === defaultDependencies.sessionSecret)
		logger.warn('XXX please set a secret for the session middleware !')

	// TODO make that better
	const log = createLogger({name: "myapp"})
	log.info("hi")

	const app = express()

	// https://expressjs.com/en/4x/api.html#app.settings.table
	app.enable('trust proxy')
	app.disable('x-powered-by') // safety

	app.use(function assignId(req, res, next) {
		(req as any).uuid = uuid.v4()
		next()
	})

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

	// log the request
	app.use(morgan('combined')) // TODO remove
	app.use((req, res, next) => {
		log.info({
			uuid: (req as any).uuid,
			method: morgan['method'](req),
			url: morgan['url'](req),
		})
		log.info({
			uuid: (req as any).uuid,
			sessionId: req.session!.id,
		})
		next()
	})

	app.use(bodyUrlencodedParser({
		parameterLimit: 100, // less than the default
		limit: '1Mb', // for profile image
	}))

	app.use(routesFactory({ logger }))

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
