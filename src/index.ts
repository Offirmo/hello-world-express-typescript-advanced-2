import { createServer } from 'http'

import { factory as expressAppFactory } from './express-app'

console.log('Hello world from express server!')

const PORT = process.env.PORT || 5000

const server = createServer(expressAppFactory())

server.listen(PORT, (err: Error) => {
	if (err)
		return console.error('something bad happened', err)

	console.info(`server is listening on ${PORT}`)
})
