import * as express from 'express'
import { ServerLogger, serverLoggerToConsole } from '@offirmo/loggers-types-and-stubs'

import { CRUD } from '../persistence/types'
import { factory as baseAppFactory } from '../apps/base'
import { factory as client1APIFactory } from '../apis/client1'
import { HCard, factory as client1AppFactory } from '../apps/client1'


interface InjectableDependencies {
	logger: ServerLogger
	hCardCRUD?: CRUD<HCard>
}

const defaultDependencies: InjectableDependencies = {
	logger: serverLoggerToConsole,
}

async function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const { logger, hCardCRUD } = Object.assign({}, defaultDependencies, dependencies)
	logger.debug('Hello from main route!')

	const router = express.Router()

	router.use('/', await baseAppFactory({
		logger,
	}))

	router.use('/', await client1APIFactory({
		logger,
		hCardCRUD,
	}))

	router.use('/domain', await client1AppFactory({
		logger,
		hCardCRUD,
	}))

	return router
}

export {
	InjectableDependencies,
	factory,
}
