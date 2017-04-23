import { ExtendedError } from './../../types'
import { CRUD } from '../types'


interface Session {
	userId?: string
}

interface InjectableDependencies {
	logger: Console,
	dbConnexionSettings?: any
}

const defaultDependencies: InjectableDependencies = {
	logger: console,
}


function factory(dependencies: Partial<InjectableDependencies> = {}): CRUD<Session> {
	const { logger, dbConnexionSettings } = Object.assign({}, defaultDependencies, dependencies)
	logger.log('Hello from session persistence!')

	if (!dbConnexionSettings)
		throw new Error('DB access need connexion settings!')

	const MEMORY_STORE: { [k: string]: Partial<Session> } = {}
	let crudeSessionIdGenerator = 0

	function validateIdOrThrow(sessionId: string): void {
		if (sessionId) return

		const err = new Error('Session CRUD: missing session id!') as ExtendedError
		err.httpStatusHint = 500
		throw err
	}


	async function create(sessionId?: string, candidateData: Partial<Session> = {}): Promise<string> {
		if (sessionId) {
			if(MEMORY_STORE.hasOwnProperty(sessionId)) {
				const err = new Error('Session CRUD: id conflict!') as ExtendedError
				err.httpStatusHint = 500
				throw err
			}
		}
		sessionId = sessionId || `${++crudeSessionIdGenerator}`

		MEMORY_STORE[sessionId] = Object.assign({}, candidateData)

		return sessionId
	}


	async function read(sessionId: string): Promise<Partial<Session>> {
		validateIdOrThrow(sessionId)

		return MEMORY_STORE[sessionId]
	}


	async function update(userId: string, candidateData: Partial<Session>): Promise<Partial<Session>> {
		validateIdOrThrow(userId)

		const err = new Error('Session CRUD: not implemented!') as ExtendedError
		err.httpStatusHint = 501
		throw err
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
	Session,
	InjectableDependencies,
	factory,
}
