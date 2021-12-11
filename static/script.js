//setting some constents, and a search tree
const search = location.search.split(/[?&]/)
search.shift()
location.searchtree = {}
for (let i = 0; i < search.length; i++) {
	if (search[i].includes("=")) {
		location.searchtree[search[i].split(/=/)[0]] = search[i].split(/=/)[1]
	} else {
		location.searchtree[search[i]] = search[i]
	}
}
const path = location.pathname

/* related to projects*/
//editor
var projectIds = document.getElementById("projectIds")
function addInput() {
	let input = document.createElement("input")
	let newline = document.createElement("br")
	input.placeholder = "add link to a shared Scratch project."
	projectIds.appendChild(input)
	projectIds.appendChild(newline)
}
function removeInput() {
	let newest = projectIds.getElementsByTagName("input")
	let newlineNewest = projectIds.getElementsByTagName("br")
	projectIds.removeChild(newest[newest.length - 1])
	projectIds.removeChild(newlineNewest[newlineNewest.length - 1])
}
function submitClutter() {
	let form = document.forms["projectIds"]
	let formData = Object.values(form)
	let formValues = []
	for (let i = 0; i < formData.length; i++) {
		if (formData[i]["value"].includes("https://scratch.mit.edu/projects/")) {
			formValues.push(formData[i]["value"].substr(33, formData[i]["value"].length))
		} else {
			alert("Something doesn't seem right about the project at spot " + i + ". Please make sure it's a full project url.")
		}
	}
	renderClutter(formValues)
}
//rendering clutters
var clutter = []
function renderClutter(array) {
	console.log(array, `this should repeat ${array.length} time(s)`)
	clutter = []
	for (let i = 0; i < array.length; i++) {
		clutter.push(`//turbowarp.org/${array[i]}`)
	}
	console.log(clutter)
	let cluttero = clutter[0]
	let embed = checkForSlash(cluttero)
	let user = checkLogin()
	document.getElementById("iframe").src = clutter[0] + embed + "?autoplay&username=" + user
}

function nextProject(array) {
	if (document.getElementById("iframe").className == "beforeStart") { return; }
	let current = array.indexOf(document.getElementById("iframe").src) + 1
	let next = array[current + 1]
	let user = checkLogin()
	console.log(next)
	document.getElementById("iframe").src = next + checkForSlash(next) + "?autoplay&username=" + user
}

function lastProject(array) {
	if (document.getElementById("iframe").className == "beforeStart") { return; }
	let current = array.indexOf(document.getElementById("iframe").src) + 1
	let last = array[current]
	console.log(last)
	let user = checkLogin()
	document.getElementById("iframe").src = last + checkForSlash(last) + "?autoplay&username=" + user
}

function checkForSlash(url) {
	if (url[url.length - 1] == "/") {
		return "embed"
	} else {
		return "/embed"
	}
}
function checkForSlashTF(url) {
	if (url[url.length - 1] == "/") {
		return true
	} else {
		return false
	}
}

/*relating to loging in*/

//gets the url for redirecting back
function getLoginURL() {
	return `https://fluffyscratch.hampton.pw/auth/getKeys/v2?redirect=${btoa(location.origin.substr(8, location.origin.length) + location.pathname)}`
}

var loginLink = `<a href="${getLoginURL()}">Login with FluffyScratch</a>`
var login = document.getElementById("login")
var userIsnt = localStorage.getItem("user") != null | ''

//check if they have logged in already
function checkLogin() {
	let user = ""
	if (localStorage.getItem("user") != null|undefined) {
		user = localStorage.getItem("user")
	}
	return user
}

function setLogin() {

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

const toBinary = (str = '') => {
	let res = str.split('').map(char => {
		return char.charCodeAt(0).toString(2);
	}).join(' ');
	return res;
}

//log them out
function logout() {
	location = "/?logout=true"
}

/*Relating to Searching*/
function searchBar(searchText) {
	if (searchText == "") {
		return;
	}
	location = "/search?q=" + searchText
}

/*Relating to the footer*/
function randomClutter() {
	fetch("/post/randomClutter", { method: "PUT" })
		.then(res => res.json())
		.then(data => {
			location = data.link
		})
}

/*Relating to Following*/
function follow(user) {
	if (!Object.keys(localStorage).includes("follows")) { localStorage.setItem("follows", "[]") }
	let parsed = JSON.parse(localStorage.getItem("follows"))
	if (parsed.includes(user)) {
		parsed = parsed.filter((value, index, arr) => {
			return index != arr.indexOf(user)
		})
	} else {
		parsed.push(user)
	}
	localStorage.setItem("follows", JSON.stringify(parsed))
}

function getActivities() {
	JSON.parse(localStorage.follows).forEach(elm => {
		console.log("getting activities for " + elm)
	})
}