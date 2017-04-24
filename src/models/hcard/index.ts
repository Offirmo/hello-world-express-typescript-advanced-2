import { ExtendedError } from '../../types'
import { HCard } from './types'


const defaultHCard: HCard = {
	givenName: '',
	surname: '',
	email: '',
	phone: '',
	houseNumber: '',
	street: '',
	suburb: '',
	state: '',
	postcode: '',
	country: 'Australia'
}

const ALLOWED_KEYS: string[] = Object.keys(defaultHCard)

function validateKeysOrThrow(userFieldsToUpdate: Partial<HCard>): void {
	const fieldsToUpdate = Object.keys(userFieldsToUpdate)

	for (let key of fieldsToUpdate) {
		if (!ALLOWED_KEYS.includes(key)) {
			const err = new Error(`user: unrecognized key "${key}"`) as ExtendedError
			err.httpStatusHint = 422
			throw err
		}
	}
}

export {
	HCard,
	defaultHCard,
	validateKeysOrThrow,
}
