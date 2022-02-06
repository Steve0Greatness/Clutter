//libriaries
/*Important*/
const express = require('express'),
	app = express(),
	Database = require("@replit/database"),
	db = new Database(),
	cors = require('cors'),
	/*Not as important*/
	favicon = require('serve-favicon'),
	path = require("path"),
	cookieParser = require('cookie-parser'),
	less = require('less-middleware'),
	request = require('request'),
	url = require('url'),

	//Clutter things
	testProject = { name: "name:)", creator: "Steve0Greatness", included: ["588586405", "487519987"], date: "Sat, Nov 13 2021", thumb: 0, id: 1, remix: [false, "", "", ""], views: 3, reports: 0, comments: [] },
	featured = [1],

	//banned users, doesn't work yet.
	blackListed = ["S0G"],

	//date
	daysOfTheWeek = ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"],
	monthsOfTheYear = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"],

	//news
	news = [{ link: "#", name: "Clutter Almost Fully Open", body: "As of the time of writing this, Clutter is almost fully ready. You can currently post Clutters.", date: "Fri, Dec 10, 2021", icon: "/img/news/news1.svg" }]

//feel free to make the port not be random
var port = Math.round(Math.random() * 9999)
if (port < 1000) {
	port = 1000
}

//when testing, add the domain to the array below VVV. Make sure to remove it before you make a Pull Request.
const whitelist = ['https://clutter.stevesgreatness.repl.co']
const corsOptions = {
	origin: function(origin, callback) {
		if (whitelist.indexOf(origin) !== -1) {
			callback(null, true)
		} else {
			callback(new Error('403'))
		}
	}
}
const toBinary = (str = '') => {
	let res = str.split('').map(char => {
		return char.charCodeAt(0).toString(2);
	}).join(' ');
	return res;
}
const charAppears = (char, inside) => {
	let ammount = 0
	inside.split(char).forEach(elm => {
		if (elm == '') {
			ammount++
		}
	})
	return ammount
}

//setting the view engine
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//middleware
app.enable('trust proxy')
app.use((req, res, next) => {
	if (process.env.NODE_ENV != 'development' && !req.secure) {
		return res.redirect("https://" + req.headers.host + req.url);
	}
	next();
})
app.use(less(path.join(__dirname, "static"), { force: true }))
app.use(express.static("static"))
app.use(favicon(path.join(__dirname, "static", "img", "favicon.ico")))
app.use(express.json())

//login system
app.use(cookieParser("NBrKs14mvMM7EOv4hlYA"))
app.use((req, res, next) => {
	if (Object.keys(req.query).includes("privateCode") && !(Object.keys(req.signedCookies).includes("user")) && !(Object.keys(req.signedCookies).includes("login"))) {
		request.get("https://fluffyscratch.hampton.pw/auth/verify/v2/" + req.query.privateCode, { json: true }, (err, resp, body) => {
			if (body.valid) {
				if (!(blackListed.includes(body.username))) {
					res.cookie("loggedIn", true, { signed: true, httpOnly: true, expires: new Date(Date.now() + 1000*3600000) })
					res.cookie("user", body.username, { signed: true, httpOnly: true, expires: new Date(Date.now() + 1000*3600000) })
					res.cookie("login", Buffer.from(String(charAppears("1", toBinary(body.username)) + (toBinary(body.username).length + body.username.length * 2)), 'utf-8').toString('base64'), { signed: true, httpOnly: true, expires: new Date(Date.now() + 1000*3600000) })
					res.redirect(url.parse(req.url).pathname)
					next()
				} else {
					res.cookie("loggedIn", false, { signed: true, httpOnly: true })
					res.redirect(url.parse(req.url).pathname)
					next()
				}
			} else {
				res.cookie("loggedIn", false, { signed: true, httpOnly: true })
				res.redirect(url.parse(req.url).pathname)
				next()
			}
		})
	} else if (Object.keys(req.query).includes("logout")) {
		res.cookie("loggedIn", false, { signed: true, httpOnly: true })
		res.clearCookie("user")
		res.clearCookie("login")
		res.redirect(url.parse(req.url).pathname)
		next()
	} else {
		next()
	}
})

//rendering pages
app.get('/', (req, res) => {
	let sendData = []
	for (let i = 0; i < featured.length; i++) {
		db.get(String(featured[i])).then(value => sendData.push(JSON.parse(value)))
	}
	let username = "not logged in"
	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {
		res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")
	}
	let hideCookieNotice = true
	if (req.cookies.cookieNotice != null|""|undefined) {
		hideCookieNotice = false
	}
	setTimeout(() => { res.render("home", { featured: sendData, loginName: username, pathname: "", news: news, cookieNotice: hideCookieNotice }) }, featured.length * 400)
})
app.get('/create', (req, res) => { 
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {
		res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")
	}
	res.render("editor", { isPre: false, name: req.body.name, loginName: username, pathname: "/create" })
})
app.get('/edit/:id', (req, res) => {
	let id = req.params.id
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {
		res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")
	}
	db.get(id).then(value => {
		let key = JSON.parse(value)
		res.render("editor", { isPre: true, proj: key["included"], cName: key["name"], thum: key["thumb"], id: id, creator: key["creator"], remixStuff: key.remix, loginName: username, pathname: "/edit" })
	})
})
app.get('/clutters/:id', (req, res) => {
	let id = req.params.id
	let username = "not logged in"; 
	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {
		res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")
	}
	db.get(id).then(value => {
		let key = JSON.parse(value)
		res.render('clutter', { cName: key["name"], proj: key["included"], dateP: key["date"], thum: key["thumb"], id: id, creator: key["creator"], remix: key["remix"][0], original: key["remix"][1], originalCreator: key["remix"][2], originalName: key["remix"][3], views: key["views"], comments: key.comments, loginName: username, pathname: "/clutters/" + id })
	}).catch(error => {
		res.render("404", { path: id, type: 1, loginName: username, pathname: "/clutters/" + id })
	})
})
app.get('/users/:name', (req, res) => {
	let name = req.params.name
	let clutters = []
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {
		res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")
	}
	request.get("https://scratchdb.lefty.one/v3/user/info/" + name, { json: true }, (err, resp, body) => {
		if (Object.keys(body).includes("error")) {
			res.render("404", { path: name, type: 2 })
		} else {
			db.list().then(keys => {
				for (var i in keys) {
					db.get(String(keys[i])).then(value => {
						let data = JSON.parse(value)
						if (data["creator"].toUpperCase() == name.toUpperCase()) {
							clutters.push(data)
						}
					})
				}
				setTimeout(function() {
					res.render("user", { name: body["username"], made: clutters, id: body["id"], loginName: username, pathname: "/users/" + name })
				}, keys.length * 400)
			})
		}
	})
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
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {
		res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")
	}
	const contributers = [{
		info: {
			name: "Steve0Greatness",
			avartar: "https://avatars.githubusercontent.com/u/75220768",
			link: "https://github.com/Steve0Greatness"
		},
		contributes: "🎨🤔💻🖋🚇"
	}]
	res.render("about", { contr: contributers, loginName: username, pathname: "/about" })
})
app.get("/getstarted", (req, res) => { 
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")}
	res.render("getStarted", { loginName: username, pathname: "/getstarted" })
})
app.get("/myStuff", (req, res) => {
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {
		res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")
		res.render("403", { loginName: username, pathname: "/mystuff" })
	}
	let myClutters = []
	db.list().then(keys => {
		for (let i = 1; i < keys.length + 1; i++) {
			db.get(`${i}`).then(value => {
				let parsed = JSON.parse(value)
				if (parsed.creator == req.signedCookies.user) {
					myClutters.push(parsed)
				}
			}).catch(err => {
				console.error(err)
			})
		}
		setTimeout(() => {
			res.render("myStuff", { loginName: username, pathname: "/mystuff", clutters: myClutters }) 
		}, keys.length * 500)
	})
})
app.get("/search", (req, res) => {
	let search = req.query.q
	let clutters = []
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")}
	db.list().then(keys => {
		for (let i = 1; i < keys.length + 1; i++) {
			db.get(String(i)).then(value => {
				let parsedValue = JSON.parse(value)
				if (parsedValue["name"].toUpperCase().includes(search.toUpperCase()) || parsedValue["creator"].toUpperCase().includes(search.toUpperCase())) { clutters.push(parsedValue) }
			})
		}
		setTimeout(function() {
			res.render("search", { q: search, returned: clutters, loginName: username, pathname: "/search?q=" + search })
		}, keys.length * 250)
	})
})
app.get("/news", (req, res) => {
	let username = "not logged in"
	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {
		res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")
	}
	res.render("news", { loginName: username, pathname: "/news", news: news })
})
app.get("/embed/:id", cors(), (req, res) => {
	let id = req.params.id
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")}
	db.get(id).then(value => {
		let key = JSON.parse(value)
		res.render('embed', { cName: key["name"], proj: key["included"], dateP: key["date"], thum: key["thumb"], id: id, creator: key["creator"], remix: key["remix"][0], original: key["remix"][1], originalCreator: key["remix"][2], originalName: key["remix"][3], loginName: username, pathname: "/embed/" + id })
	}).catch(error => {
		res.render("404", { path: id, type: 1, pathname: "/embed/" + id })
	})
})

//api(note, this would have been a subdomain but replit doesn't support them)
app.get("/api/docs", cors(), (req, res) => { 
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")}
	res.render("api", { pathname: "/api/docs", loginName: username }) 
})
app.get("/api/clutters/:id", cors(), (req, res) => {
	let id = req.params.id
	db.get(id).then(value => {
		res.send(JSON.parse(value))
	}).catch(error => { res.send({ notice: "couldn't find Clutter!", error: "404" }) })
})
app.get("/api/clutters/:id/comments", cors(), (req, res) => {
	let id = req.params.id
	db.get(id).then(value => {
		res.send({ notice: "Comments can't currently be read", error: "NotYours" })
	}).catch(error => { res.send({ notice: "couldn't find Clutter!", error: "404" }) })
})
app.get("/api/clutters/:id/thumbnail.png", cors(), (req, res) => {
	let id = req.params.id
	db.get(id).then(value => {
		let parse = JSON.parse(value)
		request.get({ url: "https://uploads.scratch.mit.edu/projects/thumbnails/" + parse.included[parse["thumb"]] + ".png", method: "GET", encoding: null }, (err, resp, body) => {
			res.set("Content-Type", "image/png")
			res.send(body)
		})
	}).catch(error => { res.send({ notice: "couldn't find Clutter!", error: "404" }) })
})
app.get('/api/users/:name', cors(), (req, res) => {
	let name = req.params.name
	let clutters = []
	request.get("https://scratchdb.lefty.one/v3/user/info/" + name, { json: true }, (err, resp, body) => {
		db.list().then(keys => {
			for (var i in keys) {
				db.get(String(keys[i])).then(value => {
					let data = JSON.parse(value)
					if (data["creator"].toUpperCase() == name.toUpperCase()) {
						clutters.push(data)
					}
				})
			}
			setTimeout(function() {
				let pfp = req.protocol + "://" + req.get('host') + "/api/users/" + body["username"] + "/avartar.png"
				let sendObject = { name: body["username"], profilePicture: pfp, clutters: clutters }
				res.send(sendObject)
			}, 300)
		})
	})
})
app.get('/api/users/:name/avartar.png', cors(), (req, res) => {
	let name = req.params.name
	let clutters = []
	request.get("https://scratchdb.lefty.one/v3/user/info/" + name, { json: true }, (err, resp, body) => {
		let id = body["id"]
		request.get({url: "https://uploads.scratch.mit.edu/users/avatars/" + id + ".png", method: "GET", encoding: null }, (erro, respo, data) => {
			res.set("Content-Type", "image/png")
			res.send(data)
		})
	})
})
app.get("/api/featured", cors(), (req, res) => {
	let sendData = []
	for (let i = 0; i < featured.length; i++) {
		db.get(String(featured[i])).then(value => sendData.push(JSON.parse(value)))
	}
	setTimeout(() => { res.send(sendData) }, featured.length * 200)
})
app.get("/api/news", cors(), (req, res) => {
	res.send(news)
})
app.get("/api/*", cors(), (req, res) => {
	res.send({ notice: "couldn't find endpoint", error: 404 })
})

//backend
app.put("/post/clutter", cors(corsOptions), (req, res) => {
	let data = req.body
	let date = new Date()
	finalDate = `${daysOfTheWeek[date.getDay()]}, ${monthsOfTheYear[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`
	data["date"] = finalDate
	data.reports = 0
	data.views = 0
	data.comments = []
	if (data["isEdit"]) { data["id"] = data["originalId"] } else { db.list().then(keys => data["id"] = Number(keys[keys.length - 1]) + 1) }
	data["originalId"] = null
	setTimeout(function() {
		let dbData = JSON.stringify(data)
		db.set(String(data["id"]), dbData)
		res.send(data)
	}, 1000)
})
app.put("/post/comment", cors(corsOptions), (req, res) => {
	let data = req.body
	res.send(`<div class="comment">
				<div class="commentUser"><a href="/users/${data["user"]}">${data["user"]}</a></div>
				${data["body"]}
			</div>`)
	db.get(String(data.for)).then(value => {
		let parsed = JSON.parse(value)
		if (!(parsed.comments.length >= 10)) {
			parsed.comments.push({ user: data.user, body: data.body })
			//db.set(String(data.for), JSON.stringify(parsed))
		}
	})
})
app.put("/post/loginReq", cors(corsOptions), (req, res) => {
	let loginWant = req["body"]["want"]
	let loginBase64 = req["body"]["c"]
	let binary = Buffer.from(String(charAppears("1", toBinary(loginWant)) + (toBinary(loginWant).length + loginWant.length * 2)), 'utf-8').toString('base64')
	if (binary == loginBase64 && !(blackListed.includes(loginWant.toUpperCase()))) {
		res.send(loginWant)
	} else {
		res.send('')
	}
})
app.put("/post/getCluttersByUser", cors(corsOptions), (req, res) => {
	let name = req.body.user
	let clutters = []
	db.list().then(keys => {
		for (var i in keys) {
			db.get(String(keys[i])).then(value => {
				let data = JSON.parse(value)
				if (data["creator"].toUpperCase() == name.toUpperCase()) {
					clutters.push(data)
				}
			})
		}
		setTimeout(function() {
			res.send({ clutters: clutters })
		}, keys.length * 300)
	})
})
app.put("/post/randomClutter", cors(corsOptions), (req, res) => {
	db.list().then(keys => {
		res.send({ link: `/clutters/${keys[Math.floor(Math.random() * keys.length)]}` })
	})
})
app.put("/post/clutterStarted", cors(corsOptions), (req, res) => {
	let id = String(req.body["id"])
	db.get(id).then(value => {
		let parsed = JSON.parse(value)
		parsed.views++
		db.set(id, JSON.stringify(parsed))
	})
})
app.put("/post/clutterReport", cors(corsOptions), (req, res) => {
	let id = String(req.body["id"])
	db.get(id).then(value => {
		let parsed = JSON.parse(value)
		parsed.reports++
		if (parsed.reports >= 10) {
			console.warn("Please look at " + id)
		}
		db.set(id, JSON.stringify(parsed))
	})
})
app.put("/post/logout", cors(corsOptions), (req, res) => {
	res.cookie("user", null)
	res.cookie("login", null)
	res.cookie("loggedIn", false, { signed: true })
})
app.all("/post/*", (req, res) => {
	sendOtherCodeError(405, res, req.method)
})

//debug pages
app.get("/debug/", (req, res) => {
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")}
	res.render("debugindex", {loginName: username, pathname: "/debug/"})
})
app.get("/debug/project-404", (req, res) => {
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")}
	res.render("404", { path: 606852261, type: 1, loginName: username, pathname: "/debug/project-404" })
})
app.get("/debug/500", (req, res) => {
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")}
	res.render("500", { loginName: username, pathname: "/debug/500" })
})
app.get("/debug/403", (req, res) => {
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")}
	res.render("403", { loginName: username, pathname: "/debug/403" })
})
app.get("/debug/405", (req, res) => {
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")}
	let method = req.query.method.toUpperCase()
	res.render("405", { method: method, loginName: username, pathname: "/debug/405" })
})
app.get("/debug/Clutter", (req, res) => {
	let key = testProject
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")}
	res.render('clutter', { cName: key["name"], proj: key["included"], dateP: key["date"], thum: key["thumb"], id: key["id"], creator: key["creator"], remix: key["remix"][0], original: key["remix"][1], originalCreator: key["remix"][2], originalName: key["remix"][3], views: key["views"], loginName: username, comments: key["comments"], pathname: "/debug/Clutter" })
})

//third party stuff
app.get("/thirdparty/i/:imageUrl", (req, res) => {
	let imageLink = Buffer.from(req.params.imageUrl, 'base64').toString('utf8')
	request.get({url: "http://" + imageLink, method: "GET", encoding: null }, (erro, respo, data) => {
			res.set("Content-Type", respo.toJSON().headers["content-type"])
			res.send(data)
		})
})

//errors
app.use(function(req, res) {
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")}
	res.render("404", { path: req.path, type: 0, loginName: username, pathname: req.path })
})
app.use(function(err, req, res, next) {
	console.error(err.stack)
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")}
	res.status(500).render("500", { loginName: username, pathname: req.path })
})
function sendOtherCodeError(error = 404, res, method) {
	let username = "not logged in"; 	if (req.signedCookies.user != null|undefined && !(blackListed.includes(req.signedCookies.user)) && req.signedCookies.login == Buffer.from(String(charAppears("1", toBinary(req.signedCookies.user)) + (toBinary(req.signedCookies.user).length + req.signedCookies.user.length * 2)), 'utf-8').toString('base64')) {
		username = req.signedCookies.user
	} else {res.cookie("loggedIn", false, { signed: true })
		res.clearCookie("user")
		res.clearCookie("login")}
	res.status(error).render(String(error), { method: method, loginName: username, pathname: req.path })
}

//listening for a sever connection
app.listen(port, () => {
	console.log("If you're using this locally on your machine, you can find this at http://localhost:" + port)
	db.getAll().then(data => console.log(data))
})

/*
inorder to use arrays, objects, and strings in static ejs files, use JSON.stringify(varName)
*/