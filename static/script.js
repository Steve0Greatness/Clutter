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
	for (let i = 0; i < array.length; i++) { clutter.push(`//turbowarp.org/${array[i]}` )
	}
	console.log(clutter)
	let cluttero = clutter[0]
	let embed = checkForSlash(cluttero)
	let user = checkLogin()
	document.getElementById("iframe").src = clutter[0] + embed + "?username=" + user
}

function nextProject(array) {
	let current = array.indexOf(document.getElementById("iframe").src) + 1
	let next = array[current + 1]
	let user = checkLogin()
	console.log(next)
	document.getElementById("iframe").src = next + checkForSlash(next) + "?username=" + user
}

function lastProject(array) {
	let current = array.indexOf(document.getElementById("iframe").src) + 1
	let last = array[current]
	console.log(last)
	let user = checkLogin()
	document.getElementById("iframe").src = last + checkForSlash(last) + user
}

function checkForSlash(url) {
	if (url[url.length - 1] == "/") {
		return "embed"
	} else {
		return "/embed"
	}
}

/*relating to loging in*/

//gets the url for redirecting back
function getLoginURL() {
	return `https://fluffyscratch.hampton.pw/auth/getKeys/v2?redirect=${btoa(location.href.substr(8, location.href.length))}`
}

var loginLink = `<a href="${getLoginURL()}">Login with FluffyScratch</a>`
var login = document.getElementById("login")
var userIsnt = localStorage.getItem("user") != null|''

//check if they have logged in already
if (Object.keys(location.searchtree).includes("privateCode")) {
	//check if they have gone though varifacation.
	fetch("https://fluffyscratch.hampton.pw/auth/verify/v2/" + location.searchtree["privateCode"])
		.then(blob => blob.json())
		.then(data => {
			if (data["valid"] == true) {
				//check if valid
				let user = data["username"]
				login.innerHTML = `<a href="/users/${user}">${user}</a> <a title="logout" onclick="logout()"><img class="logout" src="/img/logout.png" alt="logout" width="25"></a>`
				localStorage.setItem("user", user)
			} else if (userIsnt) {
				//otherwise, check if they're logged in already
				let user = localStorage.getItem("user")
				login.innerHTML = `<a href="/users/${user}">${user}</a> <a title="logout" onclick="logout()"><img class="logout" src="/img/logout.png" alt="logout" width="25" height="25"></a>`
			} else { login.innerHTML = loginLink }
		})
} else if (userIsnt) {
	//if the user has a logged in cookie, show that they are logged in.
	let user = localStorage.getItem("user")
	login.innerHTML = `<a href="/users/${user}">${user}</a> <a title="logout" onclick="logout()"><img class="logout" src="/img/logout.png" alt="logout" width="25" height="25"></a>`
} else { login.innerHTML = loginLink }

function checkLogin() {
	let user = ""
	if (localStorage.getItem("user") != null|undefined) {
		user = localStorage.getItem("user")
	}
	return user
}

//log them out
function logout() {
	login.innerHTML = loginLink
	localStorage.removeItem("user")
}

/*Relating to Searching*/
function searchBar(searchText) {
	location = "/search/?q=" + searchText
}