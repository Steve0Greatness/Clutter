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

//replace the header and footer 
function replace(id, body) {
	document.getElementById(id).innerHTML = body
}
replace("head", `<a href="/" id="logo"></a> <a href="/create">Create</a> <a href="/about">About</a> <span id="login"></span>`)
replace("foot", `<table style="text-align:center">
	<thead>
		<tr>
			<th>For Devs</th> <th>info</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><a href="/api">API</a></td> <td><a href="/about">About</td>
		</tr>
		<tr>
			<td><a href="https://github.com/Steve0Greatness/Clutter">Github</a></td>
		</tr>
	</tbody>
</table>`)

/* related to projects*/
//editor
var newInput = `<input type="text"><br>`
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
		formValues.push(formData[i]["value"])
	}
	renderClutter(formValues)
}
//rendering clutters
var clutter = []
function renderClutter(array) {
	console.log(array, `this should repeat ${array.length} time(s)`)
	clutter = []
	for (let i = 0; i < array.length; i++) {
		if (array[i].includes("https://scratch.mit.edu/projects/")) {
			clutter.push(array[i])
		} else {
			console.error("Please make sure you added a Scratch project url")
		}
	}
	console.log(clutter)
	let cluttero = clutter[0]
	let embed = checkForSlash(cluttero)
	document.getElementById("iframe").src = clutter[0] + embed
}

function nextProject(array) {
	let current = array.indexOf(document.getElementById("iframe").src) + 1
	let next = array[current + 1]
	console.log(next)
	document.getElementById("iframe").src = next + checkForSlash(next)
}

function lastProject(array) {
	let current = array.indexOf(document.getElementById("iframe").src) + 1
	let last = array[current]
	console.log(last)
	document.getElementById("iframe").src = last + checkForSlash(last)
}

function checkForSlash(url) {
	if (url[url.length - 1] == "/") {
		return "embed"
	} else {
		return "/embed"
	}
}

/*relating to loging in*/

function getLoginURL() {
	return `https://fluffyscratch.hampton.pw/auth/getKeys/v2?redirect=${btoa(location.href.substr(8, location.href.length))}`
}

var loginLink = `<a href="${getLoginURL()}">Login with FluffyScratch</a>`
var login = document.getElementById("login")
var userIsnt = localStorage.getItem("user") != null|''

if (Object.keys(location.searchtree).includes("privateCode")) {
	//check if they have gone though varifacation.
	fetch("https://fluffyscratch.hampton.pw/auth/verify/v2/" + location.searchtree["privateCode"])
		.then(blob => blob.json())
		.then(data => {
			if (data["valid"] == true) {
				//check if valid
				let user = data["username"]
				login.innerHTML = `<a href="/users/${user}">${user}</a> <a title="logout" onclick="logout()"><img class="logout" src="/img/logout.png" width="25"></a>`
				localStorage.setItem("user", user)
			} else if (userIsnt) {
				//otherwise, check if they're logged in already
				let user = localStorage.getItem("user")
				login.innerHTML = `<a href="/users/${user}">${user}</a> <a title="logout" onclick="logout()"><img class="logout" src="/img/logout.png" width="25"></a>`
			} else { login.innerHTML = loginLink }
		})
} else if (userIsnt) {
	//if the user has a logged in cookie, show that they are logged in.
	let user = localStorage.getItem("user")
	login.innerHTML = `<a href="/users/${user}">${user}</a> <a title="logout" onclick="logout()"><img class="logout" src="/img/logout.png" width="25"></a>`
} else { login.innerHTML = loginLink }

function logout() {
	login.innerHTML = loginLink
	localStorage.removeItem("user")
}