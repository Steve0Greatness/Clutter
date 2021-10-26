//Setting constants, and adding libriaries
const express = require('express')
const app = express()
const favicon = require('serve-favicon')
const path = require("path")
const Database = require("@replit/database")
const db = new Database()
const bodyParser = require('body-parser')

//setting the view engine
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//middleware
app.use(express.static("static"))
app.use(favicon(path.join(__dirname, "static", "img", "favicon.ico")))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

//rendering pages
app.get('/', (req, res) => { res.sendFile(`${__dirname}/home.html`) })
app.get('/create', (req, res) => { res.render("editor", { isPre: false, name: req.body.name })})
app.get('/edit/:id', (req, res) => {
	let id = req.params.id
	let key =  db.get("key")
	res.render("editor", { isPre: true, projects: key["included"] })
})
app.get('/clutters/:id', (req, res) => {
	let id = req.params.id
	let key =  db.get("key")
	res.render('clutter', { clutterName: key["name"], projects: key["included"], datePosted: key["date"] })
})
app.get('/users/:name', (req, res) => {
	let name = req.params.name
	res.render("user")
})
app.get("/api", (req, res) => { res.sendFile(`${__dirname}/api.html`) })
app.get("/about", (req, res) => { res.sendFile(`${__dirname}/about.html`) })
app.use(function(req, res) { res.sendFile(`${__dirname}/404.html`) })
//listening for a sever connection
app.listen(3000)

/*
inorder to use arrays, objects, and strings in static js files, use JSON.stringify(varName)

DB plan:
1: {
	"id": id of clutter,
	"name": "name:)",
	"included": [project links],
	"date": "date posted",
	"creator": "creator name"
}
*/