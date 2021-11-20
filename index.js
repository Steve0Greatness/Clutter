//Setting constants, and adding libriaries
const express = require('express')
const app = express()
const favicon = require('serve-favicon')
const path = require("path")
const Database = require("@replit/database")
const db = new Database()
const bodyParser = require('body-parser')
const less = require('less-middleware')
const port = 3000
const testProject = {
	name: "name:)",
	creator: "Steve0Greatness",
	included: ["588586405", "487519987"],
	date: "Sat, Nov 13 2021",
	thumb: 0,
	id: 1,
	remix: [false, "", "", ""]
}
var featured = [testProject]

//setting the view engine
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//middleware
app.use(function(req, res, next) {
	//https://stackoverflow.com/questions/8605720/how-to-force-ssl-https-in-express-js#31144924
	if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
		return res.redirect('https://' + req.get('host') + req.url);
	}
	next();
})
app.use(less(path.join(__dirname, "static"), { force: true }))
app.use(express.static("static"))
app.use(favicon(path.join(__dirname, "static", "img", "favicon.ico")))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

//rendering pages
app.get('/', (req, res) => {
	res.render("home", { featured: featured })
})
app.get('/create', (req, res) => { res.render("editor", { isPre: false, name: req.body.name }) })
app.get('/edit/:id', (req, res) => {
	let id = req.params.id
	db.get(id).then(value => {
		let key = JSON.parse(value)
		res.render("editor", { isPre: true, proj: key["included"], cName: key["name"], thum: key["thumb"], id: id })
	})
})
app.get('/clutters/:id', (req, res) => {
	let id = req.params.id
	db.get(id).then(value => {
		let key = JSON.parse(value)
		res.render('clutter', { cName: key["name"], proj: key["included"], dateP: key["date"], thum: key["thumb"], id: id, creator: key["creator"], remix: key["remix"][0], original: key["remix"][1], originalCreator: key["remix"][2], originalName: key["remix"][3] })
	}).catch(error => {
		console.log("error")
		res.render("404", { path: id, type: 1 })
	})
})
app.get('/users/:name', (req, res) => {
	let name = req.params.name
	res.render("user", { name: name })
})
app.get("/about", (req, res) => {
	/*
	template for contributers:
	{ info: { 
			name: "Github UserName",
			avartar: "https://avatars.githubusercontent.com/u/avartar id",
			link: "https://github.com/username"
		},
		contributes: "use https://allcontributors.org/docs/en/emoji-key to add your what you did"
	}
	*/
	const contributers = [{
		info: {
			name: "Steve0Greatness",
			avartar: "https://avatars.githubusercontent.com/u/75220768",
			link: "https://github.com/Steve0Greatness"
		},
		contributes: "🎨🤔💻🖋🚇"
	}]
	res.render("about", { contr: contributers })
})
app.get("/getstarted", (req, res) => { res.render("getStarted") })
app.get("/search", (req, res) => {
	let search = req.query.q
	res.render("search", { q: search })
})

//api(note, this would have been a subdomain but replit doesn't support them)
app.get("/api", (req, res) => { 
	res.send({ notice: "couldn't find endpoint", error: 404 })
})
app.get("/api/docs", (req, res) => { res.render("api") })
app.get("/api/clutter/:id", (req, res) => {
	let id = req.params.id
	db.get(id).then(value => { 
		if (value["included"]) {}
		res.send(JSON.parse(value)) 
	}).catch(error => {res.send({ notice: "couldn't find Clutter!", error: "404" })})
})
app.get('/api/user/:name', (req, res) => {
	let name = req.params.name
	res.send({ notice: "Users don't have data in the backend yet, only clutters", error: "NotYours" })
})
app.get("/api/featured", (req, res) => {
	res.send(featured)
})

//errors
app.use(function(req, res) {
	res.render("404", { path: req.path, type: 0 })
})
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).render("500")
})

//listening for a sever connection
app.listen(port)

/*
inorder to use arrays, objects, and strings in static ejs files, use JSON.stringify(varName)

api layout plan:
1: {
	"id": #,
	"name": "name:)",
	"included": [project urls],
	"date": "date posted",
	"creator": "creator name",
	"thumb": #
}
*/