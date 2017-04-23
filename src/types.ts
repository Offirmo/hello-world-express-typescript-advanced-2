import * as Express from 'express'
import 'express-session'


interface ExtendedRequest extends Express.Request {
	uuid: string
	body: object
}


export {
	ExtendedRequest,
}
