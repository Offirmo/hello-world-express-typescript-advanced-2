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
		console.log('reading...', userId, typeof userId)

		return await userCollection.findOne({ id: userId })
			.then(u => {
				console.log(u)
				return u
			})
	}


	async function update(userId: string, candidateData: Partial<User>): Promise<void> {
		validateUserIdOrThrow(userId)
		validateHCardKeysOrThrow(candidateData.hCard || {})

		throw new Error('Not implemented!')

		/*
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

		console.log('data now', MEMORY_STORE[userId])*/
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
	await read('1234')
	await read('1234')


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
