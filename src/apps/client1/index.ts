import * as path from 'path'
import * as express from 'express'
import * as session from 'express-session'

import { consolidatedTemplates } from '../../globals'
import { factory as renderedHtmlAsStringFactory } from './server-rendered-index'

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
	logger.log('Hello from router!')
	if (!isHttps)
		logger.warn('XXX please activate HTTPS on this server !')
	if (sessionSecret === defaultDependencies.sessionSecret)
		logger.warn('XXX please set a secret for the session middleware !')

	const preRenderedHtml = renderedHtmlAsStringFactory({ logger })

	//const router = express.Router()
	const app = express()

	// https://expressjs.com/en/guide/using-template-engines.html
	app.engine('dust', consolidatedTemplates.dust) // *.dust templates will be rendered with...
	app.set('view engine', 'dust') // default extension to use when omitted
	app.set('views', path.join(__dirname, 'templates')) // views directory : from base dir, defaults to /views

	// https://github.com/expressjs/session
	// TODO store sessions in Redis
	app.use(session({
		secret: sessionSecret,
		resave: false,
		saveUninitialized: true,
		cookie: { secure: isHttps }
	}))

	// Access the session as req.session
	app.all('*', (req, res, next) => {
		console.log('sess', req.session!.id)
		next()
	})

	// https://expressjs.com/en/starter/static-files.html
	// REM: respond with index.html when a GET request is made to the homepage
	app.use(express.static(path.join(__dirname, 'public')))

	app.get('/', (req, res) => void res.render('index', {preRenderedHtml}))

	app.post('/update', (req, res) => void res.send('ok'))

	app.post('/submit', (req, res) => void res.send('ok'))

	return app
}

export {
	InjectableDependencies,
	factory,
}
