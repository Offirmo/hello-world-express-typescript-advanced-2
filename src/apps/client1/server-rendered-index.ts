import { React } from '../../globals'
import * as ReactDOM from 'react-dom/server'

const hCardComponent = require('./public/main').default

interface InjectableDependencies {
   logger: Console
}

const defaultDependencies: InjectableDependencies = {
	logger: console,
}

function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const { logger } = Object.assign({}, defaultDependencies, dependencies)

	const hCardProps = {
		givenName: 'Sam',
		surname: 'Fairfax',
		email: 'sam.fairfax@fairfaxmedia.com.au',
		phone: '0292822833',
		houseNumber: '100',
		street: 'Harris Street',
		suburb: 'Pyrmont',
		state: 'NSW',
		postcode: '2009',
		country: 'Australia'
	}

	const hCardElement = React.createElement(hCardComponent, hCardProps)

	return ReactDOM.renderToString(hCardElement)
}

export {
    InjectableDependencies,
    factory,
}
