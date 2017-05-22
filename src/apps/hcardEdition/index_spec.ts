
import * as request from 'supertest'

import { User } from '../../models/user'
import { CRUD } from '../../persistence/types'

import { factory } from '.'


describe('hCard edition app', function() {

	function makeUserCRUD(): CRUD<User> {
		async function create(candidateData: Partial<User> = {}): Promise<string> {
			throw new Error('Not implemented!')

		}

		async function read(userId: string): Promise<User | undefined> {
			throw new Error('Not implemented!')

		}

		async function update(userId: string, candidateData: Partial<User>): Promise<void> {
			throw new Error('Not implemented!')

		}

		async function purge(userId: string): Promise<void> {
			throw new Error('Not implemented!')
		}

		return {
			create,
			read,
			update,
			purge,
		}
	}

	describe('routes', function() {

		describe('/', function() {

			it('should serve an HTML page', (done) => {
				factory({ userCRUD: makeUserCRUD() }).then(app => {
					console.log(app)

					request(app)
					.get('/')
					//.expect('Content-Type', /json/)
					.expect(200, done)
				})
			})

			it('should serve a form')
		})

		describe('/submit', function() {
			it('accepts an urlencoded body containing from data')
			it('should reject malformed data')
		})

	})
})
