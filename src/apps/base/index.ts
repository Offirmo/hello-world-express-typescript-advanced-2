import * as express from 'express'
import { ServerLogger, serverLoggerToConsole } from '@offirmo/loggers-types-and-stubs'


interface InjectableDependencies {
	logger: ServerLogger
}

const defaultDependencies: InjectableDependencies = {
	logger: serverLoggerToConsole,
}

function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const { logger } = Object.assign({}, defaultDependencies, dependencies)
	logger.debug('Hello from base app!')

	const app = express.Router()

	app.get('/', (req, res) => {
		res.send('hello')
	})

	return app
}

export {
	InjectableDependencies,
	factory,
}
