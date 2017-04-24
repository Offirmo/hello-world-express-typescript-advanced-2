import { ServerLogger, serverLoggerToConsole } from '@offirmo/loggers-types-and-stubs'

import { ExtendedError } from './../../types'
import { HCard, defaultHCard } from '../../models/hcard'
import { CRUD } from '../types'

interface InjectableDependencies {
	logger: ServerLogger,
	dbConnexionSettings?: any
}

const defaultDependencies: InjectableDependencies = {
	logger: serverLoggerToConsole,
}


function factory(dependencies: Partial<InjectableDependencies> = {}): CRUD<HCard> {
	const { logger, dbConnexionSettings } = Object.assign({}, defaultDependencies, dependencies)
	logger.debug('Hello from hcard persistence!')

	if (!dbConnexionSettings)
		throw new Error('DB access need connexion settings!')

	const MEMORY_STORE: { [k: string]: Partial<HCard> } = {}

	const ALLOWED_HCARD_KEYS: string[] = Object.keys(defaultHCard)


	function validateIdOrThrow(userId: string): void {
		if (userId) return

		const err = new Error('hCard CRUD: missing user Id!') as ExtendedError
		err.httpStatusHint = 500
		throw err
	}

	function validateKeysOrThrow(hCardFieldsToUpdate: Partial<HCard>): void {
		const fieldsToUpdate = Object.keys(hCardFieldsToUpdate)

		for (let key of fieldsToUpdate) {
			if (!ALLOWED_HCARD_KEYS.includes(key)) {
				const err = new Error(`hCard: unrecognized key "${key}"`) as ExtendedError
				err.httpStatusHint = 422
				throw err
			}
		}
	}


	async function create(userId?: string, candidateData: Partial<HCard> = {}): Promise<string> {
		const err = new Error('hCard CRUD: not implemented!') as ExtendedError
		err.httpStatusHint = 501
		throw err
	}


	async function read(userId: string): Promise<Partial<HCard>> {
		validateIdOrThrow(userId)

		let res = MEMORY_STORE[userId]
		if (!res) {
			// XXX
			// for the sake of the exercise, let's pretend we have existing data
			res = {
				givenName: 'Sam',
				surname: 'Fairfax',
				email: 'sam.fairfax@fairfaxmedia.com.au',
				phone: '0292822833',
				houseNumber: '100',
				street: 'Harris Street',
				suburb: 'Pyrmont',
				state: 'NSW',
				postcode: '2009',
				country: 'Australia'
			}
		}
		if (res) res = Object.assign({}, res)

		return res
	}


	async function update(userId: string, candidateData: Partial<HCard>): Promise<void> {
		validateIdOrThrow(userId)
		validateKeysOrThrow(candidateData)

		let needUpdate = false
		let existingData = await read(userId)
		if (!existingData) {
			existingData = {}
			needUpdate = true
		}
		const fieldsToUpdate = Object.keys(candidateData)
		const newData = existingData

		console.log('data so far', existingData)
		console.log('data to update', candidateData)

		for (let key of fieldsToUpdate) {
			if (existingData[key] === candidateData[key])
				continue

			needUpdate = true
			newData[key] = candidateData[key]
		}

		if (needUpdate)
			MEMORY_STORE[userId] = newData

		console.log('data now', MEMORY_STORE[userId])
	}


	async function purge(userId: string): Promise<void> {
		validateIdOrThrow(userId)

		delete MEMORY_STORE[userId]
	}


	return {
		create,
		read,
		update,
		purge,
	}
}

export {
	InjectableDependencies,
	factory,
}
