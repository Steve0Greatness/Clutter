//Setting constants, and adding libriaries
const express = require('express')
const app = express()
const favicon = require('serve-favicon')
const path = require("path")
const Database = require("@replit/database")
const db = new Database()
const bodyParser = require('body-parser')
const testProject = {
	name: "name:)",
	included: ["https://scratch.mit.edu/projects/588586405", "https://scratch.mit.edu/projects/487519987"],
	date: "10/26/21",
	thumb: 0
}

//setting the view engine
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//middleware(https://en.wikipedia.org/wiki/Middleware)
app.use(express.static("static"))
app.use(favicon(path.join(__dirname, "static", "img", "favicon.ico")))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

//rendering pages
app.get('/', (req, res) => { res.sendFile(`${__dirname}/home.html`) })
app.get('/create', (req, res) => { res.render("editor", { isPre: false, name: req.body.name })})
app.get('/edit/:id', (req, res) => {
	let id = req.params.id
	let key = testProject
	//db.get("key")
	res.render("editor", { isPre: true, proj: key["included"], cName: key["name"], thum: key["thumb"], id: id })
})
app.get('/clutters/:id', (req, res) => {
	let id = req.params.id
	let key = testProject
	//db.get("key")
	res.render('clutter', { cName: key["name"], proj: key["included"], dateP: key["date"], thum: key["thumb"], id: id })
})
app.get('/users/:name', (req, res) => {
	let name = req.params.name
	res.render("user")
})
app.get("/api", (req, res) => { res.sendFile(`${__dirname}/api.html`) })
app.get("/about", (req, res) => { res.sendFile(`${__dirname}/about.html`) })
app.get("/getstarted", (req, res) => { res.sendFile(`${__dirname}/getStarted.html`) })
app.get("/search", (req, res) => { 
	let search = req.query.q
	res.render("search", {q: search}) 
})
app.get("/sendData", (req, res) => {
	if (req.query.type == "c") {
		let body = req.query.body
		let poster = req.query.user
		let project = req.query.id
		let fullPost = `<div class="comment"><h2 class="commentUser">${poster}</h2>${body}</div>`
		res.send(`<link rel='stylesheet' href='/style.css'>this post is on <span id="path">${project}</span><br>${fullPost}`)
	} else if (req.query.type == "p") {
		let projects = req.query.ids.split(" ")
		let poster = req.query.user
		res.send(`<link rel='stylesheet' href='/style.css'>posted by user <span id="path">${poster}</span>, including the projects:<br>${projects.join("<br>")}`)
	}
})
app.use(function(req, res) { res.sendFile(`${__dirname}/404.html`) })

//listening for a sever connection
app.listen(3001)

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