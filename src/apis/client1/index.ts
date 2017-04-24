import { Request, Router } from 'express'
import { ServerLogger, serverLoggerToConsole } from '@offirmo/loggers-types-and-stubs'

import { CRUD } from '../../persistence/types'
import { HCard } from '../../models/hcard'
import { RequestWithUserId } from "../../types";


interface InjectableDependencies {
	logger: ServerLogger
	hCardCRUD?: CRUD<HCard>
}

const defaultDependencies: InjectableDependencies = {
	logger: serverLoggerToConsole,
}


function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const { logger, hCardCRUD } = Object.assign({}, defaultDependencies, dependencies)
	logger.debug('* Client1 API instanciating…')

	if(!hCardCRUD)
		throw new Error('hCard API: can’t work without a persistence layer!')

	const router = Router()

	router.post('/update', (req: RequestWithUserId, res, next) => {
		hCardCRUD.update(req.userId, req.body)
			.then(() => void res.end())
			.catch(next)
	})

	router.post('/submit', (req: RequestWithUserId, res, next) => {
		hCardCRUD.update(req.userId, req.body)
			.then(() => void res.end())
			.catch(next)
	})

	return router
}

export {
	CRUD,
	HCard,
	InjectableDependencies,
	factory,
}
