function addItem(template, item, list) {
	let newElem = document.importNode(template.content, true);
	newElem.querySelector("a").href = item.url;
	newElem.querySelector(".link-text").textContent = item.title;
	newElem.querySelector(".description").textContent = item.description;
	newElem.querySelector("img").src = item.image;
	list.appendChild(newElem);
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

function fetchYaml(url) {
	fetch(url, {mode: 'cors'}).then(x => x.text()).then(x => {
		loadYaml(x);
	});
}

function showFile(file) {
	let link = file.link;
	document.getElementById('file-details').style.display = 'flex';
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

function setupDropboxSave() {
	// Requires the URL to be public, doesn't support a data url. Bummer.
	Dropbox.createSaveButton(url, filename, options);
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
	
	setupDropboxOpen();
});
