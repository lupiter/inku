function addItem(template, item, list) {
	let newElem = document.importNode(template.content, true);
	newElem.querySelector("a").href = item.url;
	newElem.querySelector(".link-text").textContent = item.title;
	newElem.querySelector(".description").textContent = item.description;
	newElem.querySelector("img").src = item.image;
	list.appendChild(newElem);
}

function loadYaml(yamlString) {
	let list = document.getElementById("link-list");
	let template = document.getElementById("list-template");
	
	list.innerHTML = '';
	let data = jsyaml.load(yamlString);
	data.forEach(x => {
		addItem(template, x, list);
	});
}

function fetchYaml(url) {
	fetch(url, {mode: 'cors'}).then(x => x.text()).then(x => {
		loadYaml(x);
	});
}

function showFile(file) {
	let link = file.link;
	document.getElementById('file-details').style.display = 'flex';
	document.getElementById('file-icon').src = file.icon;
	document.getElementById('file-name').textContent = file.name;
	fetchYaml(file.link);
}

function setupDropboxOpen() {
	options = {
	    success: function(files) {
	        showFile(files[0]);
	    },
	    linkType: "direct",
	    multiselect: false,
	    extensions: ['.yaml'],
	    folderselect: false
	};
	let button = Dropbox.createChooseButton(options);
	document.getElementById("dropbox-button").appendChild(button);
}

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('file-details').style.display = 'none';
	setupDropboxOpen();
});
