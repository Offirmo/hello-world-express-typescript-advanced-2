// unfortunately, we have some globals
// due to badly written libs

import * as React from 'react'
// Client bundle expects React to be a global
(global as any).React = React


// node specific global side-effects on require
const consolidatedTemplates = require('consolidate') // always needed
// now require all templating engines we wish to use
const dust = require('dustjs-linkedin') // http://dejanglozic.com/2014/01/27/dust-js-such-templating/
require('dustjs-helpers') // also
// config : remove whitespace suppression or it wrecks javascript
// https://github.com/linkedin/dustjs/wiki/Dust-Tutorial#controlling-whitespace-suppression
dust.optimizers.format = (ctx, node) => node


export {
	consolidatedTemplates,
	dust,
	React,
}
