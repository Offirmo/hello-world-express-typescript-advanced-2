import * as express from 'express'

import { factory as app1Factory } from '../apps/client1'

interface InjectableDependencies {
	logger: Console
}

const defaultDependencies: InjectableDependencies = {
	logger: console,
}

function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const { logger } = Object.assign({}, defaultDependencies, dependencies)
	logger.log('Hello from a route!')

	const router = express.Router()

	router.use('/', app1Factory({ logger }))

	return router
}

export {
	InjectableDependencies,
	factory,
}
