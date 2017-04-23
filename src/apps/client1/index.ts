import * as path from 'path'
import * as express from 'express'

import { consolidatedTemplates } from '../../globals'
import { factory as renderedHtmlAsStringFactory } from './server-rendered-index'

interface InjectableDependencies {
	logger: Console
}

const defaultDependencies: InjectableDependencies = {
	logger: console,
}

function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const { logger } = Object.assign({}, defaultDependencies, dependencies)
	logger.log('Hello from an app!')

	const preRenderedHtml = renderedHtmlAsStringFactory({ logger })

	//const router = express.Router()
	const app = express()

	// https://expressjs.com/en/guide/using-template-engines.html
	app.engine('dust', consolidatedTemplates.dust) // *.dust templates will be rendered with...
	app.set('view engine', 'dust') // default extension to use when omitted
	app.set('views', path.join(__dirname, 'templates')) // views directory : from base dir, defaults to /views

	// https://expressjs.com/en/starter/static-files.html
	// REM: respond with index.html when a GET request is made to the homepage
	app.use(express.static(path.join(__dirname, 'public')))

	// TODO populate initial datas !
	app.get('/', (req, res) => void res.render('index', { preRenderedHtml }))

	return app
}

export {
	InjectableDependencies,
	factory,
}
