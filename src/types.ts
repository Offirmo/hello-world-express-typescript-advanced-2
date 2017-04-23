import * as Express from 'express'


// TODO cleanup
interface RequestWithUserId extends Express.Request {
	userId: string // to be set via session
}

interface ExtendedRequest extends RequestWithUserId, Express.Request {
	uuid: string // module uuid
	body: object // body parser TODO use JSON type
}

interface ExtendedError extends Error {
	httpStatusHint: number
}


export {
	ExtendedError,
	ExtendedRequest,
}
