const express = require('express')
const cookieParser = require('cookie-parser')
const apiRoutes = require('./api')
const routes = require('./routes')

const port = process.env.PORT || 8080
const app = express()

const reExt = /\.([a-z]+)/i;

function contentTypeFromExtension(url) {
	const m = url.match(reExt)
	if (!m) return 'text/html'
	const ext = m[1].toLowerCase();
	switch(ext) {
		case 'js': return 'text/javascript';
		case 'css': return 'text/css';
		case 'html': return 'text/html';
		case 'svg': return 'image/svg+xml';
	}

	return 'text/plain'
}

// General app settings
const setContentType = function (req, res, next) {
	const contentType = req.baseUrl == '/api' ? 'application/json; charset=utf-8' : contentTypeFromExtension(req.url)
	res.setHeader('Content-Type', contentType);
	next()
}

app.use(setContentType) // set Content-Type to JSON
app.use(express.json())  // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })) // to support URL-encoded bodies
app.use(cookieParser())
//app.use(express.static('public'))
app.use(routes)
app.use('/api', ...apiRoutes)

app.listen(port, () => {
    console.log(`listening at port ${port}`)
})

module.exports = app