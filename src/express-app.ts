import * as express from 'express'
import * as uuid from 'uuid'
import * as session from 'express-session'
import { urlencoded as bodyUrlencodedParser} from 'body-parser'
import { createLogger } from 'bunyan'
import * as morgan from 'morgan'

import { factory as app1Factory } from './apps/client1'
import { SessionData, HCard } from './types'

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

	const defaultHCardProps = {
		givenName: 'Sam',
		surname: 'Fairfax',
		email: 'sam.fairfax@fairfaxmedia.com.au',
		phone: '0292822833',
		houseNumber: '100',
		street: 'Harris Street',
		suburb: 'Pyrmont',
		state: 'NSW',
		postcode: '2009',
		country: 'Australia'
	}
	const allowedKeys: string[] = Object.keys(defaultHCardProps)

	function validateKeys(hCardFieldsToUpdate: Partial<HCard>): boolean {
		const fieldsToUpdate = Object.keys(hCardFieldsToUpdate)

		for (let key of fieldsToUpdate) {
			if (!allowedKeys.includes(key)) {
				logger.error(`unrecognized key "${key}"`)
				return false
			}
		}

		return true
	}

	function updateKeys(hCardFieldsToUpdate: Partial<HCard>, dbHCard: Partial<HCard>) {
		const fieldsToUpdate = Object.keys(hCardFieldsToUpdate)

		console.log('data so far', dbHCard)
		console.log('data to update', hCardFieldsToUpdate)

		for (let key of fieldsToUpdate) {
			if (dbHCard[key] === hCardFieldsToUpdate[key])
				continue

			// TODO call DB
			dbHCard[key] = hCardFieldsToUpdate[key]
		}

		console.log('data now', dbHCard)
	}


	app.post('/update', (req, res) => {
		const session: SessionData = req.session as SessionData
		if (!session.hCard) session.hCard = {}
		logger.log('session IN', session)

		let status = 200
		if (!validateKeys(req.body))
			status = 422
		else
			updateKeys(req.body, session.hCard)

		logger.log('session OUT', session)

		res.status(status).end()
	})

	app.post('/submit', (req, res) => {
		logger.log(req.body)
		 res.send('ok')
	})

	app.use('/sub-app', subAppRouteFactory({ logger }))


	app.use((req, res) => {
		logger.error(`! 404 on "${req.path}" !"`)
		res.status(404).send(`Sorry, "${req.path}" is missing !`)
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
