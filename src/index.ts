import { createServer } from 'http'
import { createLogger } from 'bunyan'
import { ServerLogger } from '@offirmo/loggers-types-and-stubs'
import { MongoClient } from 'mongodb'

import { factory as expressAppFactory } from './express-app'
import {ExtendedError} from "./types";


async function factory() {
	console.log('Starting_')


	const config = {
		port: process.env.PORT || 5000,
		isHttps: !!process.env.IS_HTTPS,
		sessionSecret: process.env.SESSION_SECRET,
		dbUrlMongo01: process.env.DB_URL_MONGO_01,
		dbUrlRedis01: process.env.DB_URL_REDIS_01,
	}


	// TODO plug to a syslog
	const logger: ServerLogger = createLogger({
		name: 'ServerX',
		level: 'debug',
	})
	logger.info('Logger ready.')

	process.on('uncaughtException', (err: ExtendedError) => {
		console.error(`Uncaught exception!`, err)
		setTimeout(() => process.exit(1), 250)
		logger.fatal(err, `Uncaught exception!`)
		// TODO cleanup
		// I've an experimental module for that…
	})

	process.on('unhandledRejection', (reason: ExtendedError | any, p: Promise<any>) => {
		console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
		setTimeout(() => process.exit(1), 250)
		logger.fatal({ reason, p }, `Uncaught rejection!`)
		// TODO cleanup
		// I've an experimental module for that…
	})

	process.on('warning', (warning: { name: string, message: string, stack: string}) => {
		console.warn(warning)
		logger.warn(warning)
	})

	logger.debug('Now listening to uncaughts and warnings.')


	const dbMongo01 = await MongoClient.connect(config.dbUrlMongo01)


	const server = createServer(await expressAppFactory({
		logger,
		isHttps: config.isHttps,
		sessionSecret: config.sessionSecret,
		dbUsers: dbMongo01,
		dbSessionRedisUrl: config.dbUrlRedis01,
	}))

	server.listen(config.port, (err: Error) => {
		if (err) {
			console.error(`Server error!`, err)
			logger.fatal(err, `Server error!`)
			return
		}

		logger.info(`Server launched, listening on :${config.port}`)
	})

}

factory()
