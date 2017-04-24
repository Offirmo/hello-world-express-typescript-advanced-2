import { HCard } from '../hcard'

interface User {
	id?: string

	hCard: HCard

	pendingHCardUpdates: Partial<HCard>
}

export {
	User,
}
