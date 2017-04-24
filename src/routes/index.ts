import * as express from 'express'
import { ServerLogger, serverLoggerToConsole } from '@offirmo/loggers-types-and-stubs'

import { CRUD } from '../persistence/types'
import { User } from '../models/user'
import { factory as splashAppFactory } from '../apps/splash'
import { factory as hcardEditionAppFactory } from '../apps/hcardEdition'


interface InjectableDependencies {
	logger: ServerLogger
	userCRUD?: CRUD<User>
}

const defaultDependencies: InjectableDependencies = {
	logger: serverLoggerToConsole,
}

async function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const { logger, userCRUD } = Object.assign({}, defaultDependencies, dependencies)
	logger.debug('Hello from main route!')

	const router = express.Router()

	router.use('/s', await splashAppFactory({
		logger,
	}))

	router.use('/', await hcardEditionAppFactory({
		logger,
		userCRUD,
	}))

	return router
}

export {
	InjectableDependencies,
	factory,
}
