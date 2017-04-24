import { Router } from 'express'
import { ServerLogger, serverLoggerToConsole } from '@offirmo/loggers-types-and-stubs'

import { CRUD } from '../../persistence/types'
import { HCard, validateKeysOrThrow } from '../../models/hcard'
import { User } from '../../models/user'
import { ExtendedRequest } from "../../types";


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
	logger.debug('Initializing the client1 API…')

	if(!userCRUD)
		throw new Error('hCard live edition API: can’t work without a persistence layer!')

	const router = Router()

	router.post('/update', (req: ExtendedRequest, res, next) => {
		(async function updatePendingChanges() {
			const candidateData: Partial<HCard> = req.body
			validateKeysOrThrow(candidateData)
			// todo remove unchanged fields
			req.session![sharedSessionKeyPendingHCardEdits] =
				Object.assign(req.session![sharedSessionKeyPendingHCardEdits] || {}, candidateData)
		})()
			.then(() => void res.end())
			.catch(next)
	})

	router.post('/submit', (req: ExtendedRequest, res, next) => {
		userCRUD.update(req.userId, { hCard: req.body })
			.then(() => {
				req.session![sharedSessionKeyPendingHCardEdits] = {}
				res.send(`
<!DOCTYPE html>
<head>
	<title>Live hCard Preview, by Yves Jutard</title>
	<link href="domain/css/bootstrap.min.css" rel="stylesheet" >
	<link href="domain/css/main.css" rel="stylesheet">
</head>
Saved.<br />
<a href="/domain">Go back to edition</a>
	`)
			})
			.catch(next)
	})

	return router
}

export {
	InjectableDependencies,
	factory,
}
