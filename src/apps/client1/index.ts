import * as path from 'path'
import * as express from 'express'

import { CRUD } from '../../persistence/types'
import { HCard, defaultHCard } from '../../models/hcard'

import { consolidatedTemplates } from '../../globals'
import { factory as renderedHtmlAsStringFactory } from './server-rendered-index'


interface RequestWithUserId extends Request {
	userId: string
}

interface InjectableDependencies {
	logger: Console
	hCardCRUD?: CRUD<HCard>
}

const defaultDependencies: InjectableDependencies = {
	logger: console,
}

function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const { logger, hCardCRUD } = Object.assign({}, defaultDependencies, dependencies)
	logger.log('Hello from an app!')

	if(!hCardCRUD)
		logger.warn('Client1 app: I won’t be able to prefill data without persistence connexion infos for hCard.')

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
		let hCardData: Partial<HCard> = {}
		if (hCardCRUD) {
			hCardData = await hCardCRUD.read(req.userId) || {}
		}

		const fullHCardData: HCard = Object.assign({}, defaultHCard, hCardData)

		const preRenderedHtml = renderedHtmlAsString(fullHCardData)
		console.log('restoring...', hCardData, fullHCardData, preRenderedHtml)

		res.render('index', {
			preRenderedHtml,
			hCardData: fullHCardData,
		})
	}

	app.get('/', (req, res, next) => {
		handleAsync(req as any as RequestWithUserId, res).catch(next)
	})

	return app
}

export {
	InjectableDependencies,
	factory,
}
