import { Request, Router } from 'express'

import { CRUD } from '../../persistence/types'
import { HCard } from '../../models/hcard'


interface RequestWithUserId extends Request {
	userId: string
}

interface InjectableDependencies {
	logger: Console,
	hCardCRUD?: CRUD<HCard>
}

const defaultDependencies: InjectableDependencies = {
	logger: console,
}


function factory<ExtendedRequest extends RequestWithUserId>(dependencies: Partial<InjectableDependencies> = {}) {
	const { logger, hCardCRUD } = Object.assign({}, defaultDependencies, dependencies)
	logger.log('Hello from an API!')

	if(!hCardCRUD)
		throw new Error('hCard API: can’t work without a persistence layer!')

	const router = Router()

	router.post('/update', (req: ExtendedRequest, res, next) => {
		hCardCRUD.update(req.userId, req.body)
			.then(() => void res.end())
			.catch(next)
	})

	router.post('/submit', (req: ExtendedRequest, res, next) => {
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
