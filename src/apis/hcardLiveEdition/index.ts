import { Router } from 'express'
import { ServerLogger, serverLoggerToConsole } from '@offirmo/loggers-types-and-stubs'

import { CRUD } from '../../persistence/types'
import { User } from '../../models/user'
import { RequestWithUserId } from "../../types";
import {HCard} from "../../models/hcard/types";


interface InjectableDependencies {
	logger: ServerLogger
	userCRUD?: CRUD<User>
}

const defaultDependencies: InjectableDependencies = {
	logger: serverLoggerToConsole,
}


async function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const { logger, userCRUD } = Object.assign({}, defaultDependencies, dependencies)
	logger.debug('Initializing the client1 API…')

	if(!userCRUD)
		throw new Error('hCard live edition API: can’t work without a persistence layer!')

	const router = Router()

	router.post('/update', (req: RequestWithUserId, res, next) => {
		userCRUD.update(req.userId, {pendingHCardUpdates: req.body})
			.then(() => void res.end())
			.catch(next)
	})

	router.post('/submit', (req: RequestWithUserId, res, next) => {
		userCRUD.update(req.userId, {pendingHCardUpdates: req.body})
			.then(() => void res.end())
			.catch(next)
	})

	return router
}

export {
	CRUD,
	InjectableDependencies,
	factory,
}
