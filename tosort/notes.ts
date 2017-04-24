import { factory as sessionCRUDFactory } from './persistence/session'

// TODO
const sessionCRUD = sessionCRUDFactory({
	logger,
	dbConnexionSettings,
})
