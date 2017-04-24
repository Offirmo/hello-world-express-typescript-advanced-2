import * as path from 'path'
import * as express from 'express'
import { ServerLogger, serverLoggerToConsole } from '@offirmo/loggers-types-and-stubs'

import { CRUD } from '../../persistence/types'
import { User } from '../../models/user'
import { HCard, defaultHCard } from '../../models/hcard'
import { RequestWithUserId } from "../../types";

import { consolidatedTemplates } from '../../globals'
import { factory as renderedHtmlAsStringFactory } from './server-rendered-index'


interface InjectableDependencies {
	logger: ServerLogger
	userCRUD?: CRUD<User>
}

const defaultDependencies: InjectableDependencies = {
	logger: serverLoggerToConsole,
}

async function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const { logger, userCRUD } = Object.assign({}, defaultDependencies, dependencies)
	logger.debug('Initializing the client1 webapp…')

	if(!userCRUD)
		throw new Error('hCard edition app: can’t work without a persistence layer!')

	const renderedHtmlAsString = (await renderedHtmlAsStringFactory({ logger })).renderToString

	const app = express()

	// https://expressjs.com/en/guide/using-template-engines.html
	app.engine('dust', consolidatedTemplates.dust) // *.dust templates will be rendered with...
	app.set('view engine', 'dust') // default extension to use when omitted
	app.set('views', path.join(__dirname, 'templates')) // views directory : from base dir, defaults to /views

	// https://expressjs.com/en/starter/static-files.html
	// REM: respond with index.html when a GET request is made to the homepage
	app.use(express.static(path.join(__dirname, 'public')))

	async function handleAsync(req: RequestWithUserId, res) {
		let userData = await userCRUD!.read(req.userId)
		console.log('restoring...', userData)
		//console.log('restoring...', userData, userData!.hCard, userData!.pendingHCardUpdates)

		// TODO restore from live edit !
		let editorHCardData: HCard = Object.assign({}, userData!.hCard) as HCard

		const preRenderedHtml = renderedHtmlAsString(editorHCardData)
		//console.log('restoring...', hCardData, fullHCardData, preRenderedHtml)

		res.render('index', {
			preRenderedHtml,
			hCardData: editorHCardData,
		})
	}

	app.get('/', (req: RequestWithUserId, res, next) => {
		handleAsync(req, res)
			.catch(next)
	})

	return app
}

export {
	InjectableDependencies,
	factory,
}
