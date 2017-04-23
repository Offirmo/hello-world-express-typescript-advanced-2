import { React } from '../../globals'
import * as ReactDOM from 'react-dom/server'

import { HCard } from '../../models/hcard'

const hCardComponent = require('./public/main').default


interface InjectableDependencies {
}

const defaultDependencies: InjectableDependencies = {
}

function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const {} = Object.assign({}, defaultDependencies, dependencies)

	function renderToString(props: HCard) {
		const hCardElement = React.createElement(hCardComponent, props)
		return ReactDOM.renderToString(hCardElement)
	}

	return {
		renderToString
	}
}

export {
    InjectableDependencies,
    factory,
}
