import { createServer } from 'http'
import { createLogger } from 'bunyan'
import { ServerLogger } from '@offirmo/loggers-types-and-stubs'

import { factory as expressAppFactory } from './express-app'

console.log('Starting_')

const PORT = process.env.PORT || 5000

const logger: ServerLogger = createLogger({ name: 'myapp' })
logger.info('Hello world from a node.js server!')

process.on('uncaughtException', err => {
	console.error(`Uncaught exception!`, err)
	setTimeout(() => process.exit(1), 250)
	logger.fatal(err, `Uncaught exception!`)
	// TODO cleanup
	// I've an experimental module for that…
})

process.on('unhandledRejection', (reason, p) => {
	console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
	setTimeout(() => process.exit(1), 250)
	logger.fatal({ reason, p }, `Uncaught exceptionUncaught exception!`)
	// TODO cleanup
	// I've an experimental module for that…
})

process.on('warning', warning => {
	console.warn(warning)
	logger.warn(warning)
})

const server = createServer(expressAppFactory({
	logger,
	dbConnexionSettings: 'TODO take from env',
}))

server.listen(PORT, (err: Error) => {
	if (err) {
		console.error(`Server error!`, err)
		logger.fatal(err, `Server error!`)
		return
	}

	logger.info(`server is listening on ${PORT}`)
})
