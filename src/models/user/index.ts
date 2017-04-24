import { User } from './types'
import { defaultHCard } from '../hcard'


const defaultUser: User = {
	hCard: defaultHCard,
	pendingHCardUpdates: {}
}


export {
	User,
	defaultUser,
}
