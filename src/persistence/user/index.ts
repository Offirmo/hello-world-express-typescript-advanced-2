import { ServerLogger, serverLoggerToConsole } from '@offirmo/loggers-types-and-stubs'
import { Db as MongoDb } from 'mongodb'
import { defaultsDeep } from 'lodash'

import { ExtendedError } from './../../types'
import { User, defaultUser } from '../../models/user'
import { validateKeysOrThrow as validateHCardKeysOrThrow } from '../../models/hcard'
import { CRUD } from '../types'

interface InjectableDependencies {
	logger: ServerLogger,
	db?: MongoDb
}

const defaultDependencies: InjectableDependencies = {
	logger: serverLoggerToConsole,
}


async function factory(dependencies: Partial<InjectableDependencies> = {}): Promise<CRUD<User>> {
	const { logger, db } = Object.assign({}, defaultDependencies, dependencies)
	logger.debug('Hello from user persistence!')

	if (!db)
		throw new Error('User persistence need a db connexion')

	const userCollection = db.collection('users')


	function validateUserIdOrThrow(userId: string): void {
		if (userId) return

		const err = new Error('user CRUD: missing user Id!') as ExtendedError
		err.httpStatusHint = 500
		throw err
	}


	async function create(candidateData: Partial<User> = {}): Promise<string> {
		validateHCardKeysOrThrow(candidateData.hCard || {})

		const data: User = defaultsDeep({}, candidateData, defaultUser) as User
		const { insertedId } = await userCollection.insertOne(data)
		return insertedId.toHexString()
	}


	async function read(userId: string): Promise<User | undefined> {
		validateUserIdOrThrow(userId)
		return await userCollection.findOne({ id: userId })
	}


	async function update(userId: string, candidateData: Partial<User>): Promise<void> {
		validateUserIdOrThrow(userId)
		validateHCardKeysOrThrow(candidateData.hCard || {})
		validateHCardKeysOrThrow(candidateData.pendingHCardUpdates || {})

		let existingData = await read(userId)
		if (!existingData) {
			const err = new Error(`User not found`) as ExtendedError
			err.httpStatusHint = 404
			err.details = { userId }
			throw err
		}
		
		console.log('data so far', existingData)
		console.log('data pending', defaultsDeep(candidateData, existingData))

		await userCollection.updateOne({ id: userId }, candidateData)
	}


	async function purge(userId: string): Promise<void> {
		validateUserIdOrThrow(userId)
		throw new Error('Not implemented!')
	}


	// XXX for the sake of the exercise,
	// autocreate user 1234 if missing
	if(!(await read('1234'))) {
		logger.info('Recreating the demo user...')
		create({
			id: '1234',
			hCard: {
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
		})
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
