import { factory as sessionCRUDFactory } from './persistence/session'

// TODO
const sessionCRUD = sessionCRUDFactory({
	logger,
	dbConnexionSettings,
})



import { factory as hcardLiveEditionAPIFactory } from '../apis/hcardLiveEdition'

router.use('/', await hcardLiveEditionAPIFactory({
	logger,
	userCRUD,
}))
