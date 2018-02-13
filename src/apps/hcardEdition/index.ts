import * as path from 'path'
import * as express from 'express'
import { ServerLogger, serverLoggerToConsole } from '@offirmo/loggers-types-and-stubs'

import { CRUD } from '../../persistence/types'
import { User } from '../../models/user'
import { HCard, validateKeysOrThrow } from '../../models/hcard'
import { ExtendedRequest } from '../../types'

import { consolidatedTemplates } from '../../globals'
import { factory as renderedHtmlAsStringFactory } from './server-rendered-index'


interface InjectableDependencies {
	logger: ServerLogger
	sharedSessionKeyPendingHCardEdits: string
	userCRUD?: CRUD<User>
}

const defaultDependencies: InjectableDependencies = {
	logger: serverLoggerToConsole,
	sharedSessionKeyPendingHCardEdits: 'hcardLiveEdition',
}

async function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const { logger, userCRUD, sharedSessionKeyPendingHCardEdits } = Object.assign({}, defaultDependencies, dependencies)
	logger.debug('Initializing the hCard edition webapp…')

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

	app.get('/', (untyped_req, res, next): void => {
		const req: ExtendedRequest = untyped_req as ExtendedRequest

		(async function render() {
			let userData = await userCRUD!.read(req.userId)
			const savedHCardData = userData!.hCard
			const pendingHCardData: Partial<HCard> = req.session![sharedSessionKeyPendingHCardEdits] || {}
			let editorHCardData: HCard = Object.assign({}, savedHCardData, pendingHCardData) as HCard

			const preRenderedHtml = renderedHtmlAsString(editorHCardData)

			res.render('index', {
				preRenderedHtml,
				hCardData: editorHCardData,
			})
		})()
			.catch(next)
	})

	app.post('/update', (req, res, next): void => {
		(async function updateHcard() {
			const candidateData: Partial<HCard> = req.body
			validateKeysOrThrow(candidateData)
			// TODO remove unchanged fields
			req.session![sharedSessionKeyPendingHCardEdits] =
				Object.assign(req.session![sharedSessionKeyPendingHCardEdits] || {}, candidateData)
		})()
		.then(() => void res.end())
		.catch(next)
	})

	app.post('/submit', (untyped_req, res, next): void => {
		const req: ExtendedRequest = untyped_req as ExtendedRequest

		userCRUD.update(req.userId, { hCard: req.body })
		.then(() => {
			req.session![sharedSessionKeyPendingHCardEdits] = {}
			res.send(`
<!DOCTYPE html>
<head>
	<title>Live hCard Preview, by Yves Jutard</title>
	<link href="css/bootstrap.min.css" rel="stylesheet" >
	<link href="css/main.css" rel="stylesheet">
</head>
Saved.<br />
<a href="/">Go back to edition</a>
	`)
		})
		.catch(next)
	})

	return app
}

export {
	InjectableDependencies,
	factory,
}
