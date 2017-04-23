import * as express from 'express'

import { CRUD } from '../persistence/types'
import { factory as app1Factory } from '../apps/client1'
import { HCard, factory as api1Factory } from '../apis/client1'


interface InjectableDependencies {
	logger: Console
	hCardCRUD?: CRUD<HCard>
}

const defaultDependencies: InjectableDependencies = {
	logger: console,
}

function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const { logger, hCardCRUD } = Object.assign({}, defaultDependencies, dependencies)
	logger.log('Hello from a route!')

	const router = express.Router()

	router.use('/', app1Factory({
		logger,
	}))

	router.use('/', api1Factory({
		logger,
		hCardCRUD,
	}))

	return router
}

export {
	InjectableDependencies,
	factory,
}
