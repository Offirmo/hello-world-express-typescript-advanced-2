import { createServer } from 'http'
import { createLogger } from 'bunyan'
import { ServerLogger } from '@offirmo/loggers-types-and-stubs'
import { MongoClient } from 'mongodb'

import { factory as expressAppFactory } from './express-app'

async function factory() {
	console.log('Starting_')

	const PORT = process.env.PORT || 5000


	// TODO plug to a syslog
	const logger: ServerLogger = createLogger({
		name: 'ServerX',
		level: 'debug',
	})
	logger.info('Logger ready.')

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

	logger.debug('Now listening to uncaughts and warnings.')


	const dbMongo01 = await MongoClient.connect(url)


	const server = createServer(expressAppFactory({
		logger,
		dbHCard: dbMongo01,
	}))

	server.listen(PORT, (err: Error) => {
		if (err) {
			console.error(`Server error!`, err)
			logger.fatal(err, `Server error!`)
			return
		}

		logger.info(`Server launched, listening on :${PORT}`)
	})

}

factory()
