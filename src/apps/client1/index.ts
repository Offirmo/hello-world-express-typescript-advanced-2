import * as path from 'path'
import * as express from 'express'
import { ServerLogger, serverLoggerToConsole } from '@offirmo/loggers-types-and-stubs'

import { CRUD } from '../../persistence/types'
import { HCard, defaultHCard } from '../../models/hcard'
import { RequestWithUserId } from "../../types";

import { consolidatedTemplates } from '../../globals'
import { factory as renderedHtmlAsStringFactory } from './server-rendered-index'


interface InjectableDependencies {
	logger: ServerLogger
	hCardCRUD?: CRUD<HCard>
}

const defaultDependencies: InjectableDependencies = {
	logger: serverLoggerToConsole,
}

function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const { logger, hCardCRUD } = Object.assign({}, defaultDependencies, dependencies)
	logger.debug('Hello from client1 app!')

	if(!hCardCRUD)
		throw new Error('Client1 app: can’t work without a persistence layer!')

	const renderedHtmlAsString = renderedHtmlAsStringFactory({ logger }).renderToString

	const app = express()

	// https://expressjs.com/en/guide/using-template-engines.html
	app.engine('dust', consolidatedTemplates.dust) // *.dust templates will be rendered with...
	app.set('view engine', 'dust') // default extension to use when omitted
	app.set('views', path.join(__dirname, 'templates')) // views directory : from base dir, defaults to /views

	// https://expressjs.com/en/starter/static-files.html
	// REM: respond with index.html when a GET request is made to the homepage
	app.use(express.static(path.join(__dirname, 'public')))

	async function handleAsync(req: RequestWithUserId, res) {
		let hCardData: Partial<HCard> = await hCardCRUD!.read(req.userId) || {}
		const fullHCardData: HCard = Object.assign({}, defaultHCard, hCardData)

		const preRenderedHtml = renderedHtmlAsString(fullHCardData)
		//console.log('restoring...', hCardData, fullHCardData, preRenderedHtml)

		res.render('index', {
			preRenderedHtml,
			hCardData: fullHCardData,
		})
	}

	app.get('/', (req: RequestWithUserId, res, next) => {
		handleAsync(req, res)
			.catch(next)
	})

	return app
}

export {
	HCard,
	InjectableDependencies,
	factory,
}
