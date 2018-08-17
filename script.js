APP_KEY = "pqfc8frnfzizk0h";
APP_SECRET = "8fv2q7qoyd9j315";
let dbx = undefined;
let viewPath = [];

function addItem(template, item, list) {
	let newElem = document.importNode(template.content, true);
	let li = newElem.querySelector("li");
	newElem.querySelector("a").href = item.url;
	newElem.querySelector(".link-text").textContent = item.title;
	newElem.querySelector(".description").textContent = item.description;
	dbx.filesDownload({"path": item.image}).then(x => {
		let reader = new FileReader();
		reader.onload = function() {
			li.querySelector("img").src = reader.result;
		}
		reader.readAsDataURL(x.fileBlob);
	})
	.catch(e => console.log(e));
	list.appendChild(newElem);
}

function parseQueryString(str) {
	var ret = Object.create(null);
	
	if (typeof str !== 'string') {
		return ret;
	}
	
	str = str.trim().replace(/^(\?|#|&)/, '');
	
	if (!str) {
		return ret;
	}
	
	str.split('&').forEach(function (param) {
		var parts = param.replace(/\+/g, ' ').split('=');
		// Firefox (pre 40) decodes `%3D` to `=`
		// https://github.com/sindresorhus/query-string/pull/37
		var key = parts.shift();
		var val = parts.length > 0 ? parts.join('=') : undefined;
	
		key = decodeURIComponent(key);
	
		// missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		val = val === undefined ? null : decodeURIComponent(val);
		
		if (ret[key] === undefined) {
		    ret[key] = val;
		} else if (Array.isArray(ret[key])) {
		    ret[key].push(val);
		} else {
			ret[key] = [ret[key], val];
		}
	});
	
	return ret;
}

function updateQueryString(key, value) {
	let current = parseQueryString(window.location.hash);
	current[key] = value;
	let pairs = [];
	Object.keys(current).forEach((k) => {
		pairs.push(`${k}=${encodeURIComponent(current[k])}`);
		
	})
	let str = pairs.join("&");
	window.location.hash = str;
}

function getList() {
	return document.getElementById("link-list");
}

function getTemplate() {
	return document.getElementById("list-template");
}

function loadYaml(yamlString) {
	let list = getList();
	let template = getTemplate();
	
	list.innerHTML = '';
	let data = jsyaml.safeLoad(yamlString);
	data.forEach(x => {
		addItem(template, x, list);
	});
}

function saveYaml() {
	let list = getList();
	let objs = list.children.map(x => {
		return {
			url: x.querySelector("a").href,
			title: x.querySelector(".link-text").textContent,
			description: x.querySelector(".description").textContent,
			image: x.querySelector("img").src
		};
	});
	return jsyaml.safeDump(objs);
}

function fetchYaml(fileId) {
	dbx.filesDownload({"path": fileId}).then(x => {
		let reader = new FileReader();
		reader.onload = function() {
		    loadYaml(reader.result);
		}
		reader.readAsText(x.fileBlob);
	})
	.catch(e => console.log(e));
}

function showFileName(name) {
	document.getElementById('file-details').style.display = 'flex';
	document.getElementById('file-name').textContent = name;
}

function showFile(file) {
	showFileName(file.name);
	updateQueryString("fileName", file.name);
	updateQueryString("path", file.id);
	fetchYaml(file.id);
}

function getFileTemplate() {
	return document.getElementById("file-template")
}

function getDropboxList() {
	return document.getElementById("file-explorer")
}

function isDir(item) {
	return item[".tag"] === "folder";
}

function addFileItem(template, item, list) {
	let newElem = document.importNode(template.content, true);
	newElem.querySelector(".file-name").textContent = item.name;
	newElem.querySelector("li").className = item[".tag"];
	newElem.querySelector("li").id = item.id;
	newElem.querySelector("li").onclick = (e) => {
		if (isDir(item)) {
			viewPath.push(item);
			listFiles(item.id)
		} else {
			showFile(item)
		}
	}
	list.appendChild(newElem);
}

function renderFiles(fileList) {
	let template = getFileTemplate();
	let list = getDropboxList();
	fileList.forEach(x => {
		if (isDir(x) || x.name.endsWith(".yaml")) {
			addFileItem(template, x, list);
		}
	});
}

function setupLoginButton() {
	let login = document.getElementById('login');
	dbx = new Dropbox.Dropbox({ clientId: APP_KEY });
	let authUrl = dbx.getAuthenticationUrl('https://cathywise.net/inku');
	document.getElementById('authlink').href = authUrl;
	login.style.display = 'flex';
}

function getAccessTokenFromUrl() {
    return parseQueryString(window.location.hash).access_token;
}

function listMoreFiles(cursor) {
	dbx.filesListFolderContinue({cursor: cursor})
	.then(response => {
		renderFiles(response.entries);
		if (response.has_more) {
			listMoreFiles(response.cursor);
		}
	})
}

function listFiles(path) {
	dbx.filesListFolder({path: path})
	.then(response => {
		getDropboxList().innerHTML = '';
		let up = getDropboxList().parentElement.querySelector("button");
		if (viewPath && viewPath.length > 1) {
			let parent = viewPath[viewPath.length -2];
			up.textContent = parent.name ? parent.name : parent !== "" ? parent : "Up";
			up.style.display = 'flex';
			up.onclick = e => {
				viewPath.pop();
				listFiles(parent.id ? parent.id : parent);
			};
		} else {
			up.style.display = 'none';
		}
		renderFiles(response.entries, path);
		if (response.has_more) {
			listMoreFiles(response.cursor, path);
		}
	})
	.catch(error => {
		console.error(error);
	});
}

function setupSDK() {
	dbx = new Dropbox.Dropbox({ accessToken: getAccessTokenFromUrl() });
	let query = parseQueryString(window.location.hash);
	viewPath.push('');
	listFiles('');
	if (query && query.path && query.fileName) {
		fetchYaml(query.path);
		showFileName(query.fileName);
	}
}

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('file-details').style.display = 'none';
	
	let addForm = document.getElementById('add-form');
	addForm.style.display = 'none';
	let add = document.getElementById('add-button');
	let save = document.getElementById('save-button');
	let cancel = document.getElementById('cancel-button');
	
	let imgLabel = document.getElementById("img-label");
	let imgUploadMode = document.getElementById('upload-mode');
	let imgUrlMode = document.getElementById("url-mode");
	let imgUploadField = document.getElementById("img-file");
	let imgUrlField = document.getElementById("img-url");
	
	let urlField = document.getElementById("link-url");
	let titleField = document.getElementById("link-title");
	let descriptionField = document.getElementById("link-description");
	
	let login = document.getElementById('login');
	if (getAccessTokenFromUrl()) {
		login.style.display = 'none';
		setupSDK();
	} else {
		setupLoginButton();
	}
	
	let updateImgInputs = (e) => {
		if (imgUploadMode.checked) {
			imgLabel.for = imgUploadMode.id;
			imgUrlField.style.display = 'none';
			imgUploadField.style.display = 'block';
		} else {
			imgLabel.for = imgUrlMode.id;
			imgUrlField.style.display = 'block';
			imgUploadField.style.display = 'none';
		}	
	};
	imgUploadMode.onchange = updateImgInputs;
	imgUrlMode.onchange = updateImgInputs;
	updateImgInputs();
	
	let close = (e) => {
		addForm.style.display = 'none';
		add.style.display = 'inline';
	};
	cancel.onclick = close;
	save.onclick = (e) => {
		close(e);
		addItem(getTemplate(), {
			url: urlField.value,
			title: titleField.value,
			description: descriptionField.value,
			img: imgUrlField.value
		}, getList());
	}
	
	add.onclick = (e) => {
		addForm.style.display = 'flex';
		add.style.display = 'none';
	}
	
	
	
// 	setupDropboxOpen();
});
