function addItem(template, item, list) {
	let newElem = document.importNode(template.content, true);
	newElem.querySelector("a").href = item.url;
	newElem.querySelector(".link-text").textContent = item.title;
	newElem.querySelector(".description").textContent = item.description;
	newElem.querySelector("img").src = item.image;
	list.appendChild(newElem);
}

function loadYaml(template, list, yamlString) {
	list.innerHTML = '';
	let data = jsyaml.load(yamlString);
	data.forEach(x => {
		addItem(template, x, list);
	});
}

function fetchYaml(url, template, list) {
	fetch(url).then(x => x.text()).then(x => {
		loadYaml(template, list, x);
	});
}

let sample = "https://www.dropbox.com/s/st98mzqgvsdho9t/books.yaml?raw=1";

function readFile(fileNameDisplay, template, list) {
	let hash = decodeURI(window.location.hash.substring(1));
	if (!hash) {
		let encoded = encodeURIComponent(sample);
		window.location.hash = '#' + encoded;
	}
	let showing = hash || sample;
	fileNameDisplay.textContent = showing;
	fetchYaml(showing, template, list);
}


document.addEventListener('DOMContentLoaded', function() {
	let list = document.getElementById("link-list");
	let template = document.getElementById("list-template");
	let form = document.getElementById("upload-form");
	let edit = document.getElementById("edit-button");
	let editCancel = document.getElementById("cancel-button");
	let editSave = document.getElementById("save-button");
	let urlField = document.getElementById("url-field");
	let fileNameDisplay = document.getElementById("file-name");
	edit.onclick = (e => { 
		edit.style.display = 'none';
		form.style.display = 'flex';
	});
	editCancel.onclick = (e => {
		edit.style.display = 'inline';
		form.style.display = 'none';
	});
	editSave.onclick = (e => {
		let encoded = encodeURIComponent(urlField.value);
		window.location.hash = '#' + encoded;
		readFile(fileNameDisplay, template, list);
	});
	readFile(fileNameDisplay, template, list);
});
