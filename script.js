import { DropExplorer } from './dropbox.js';
import * as utils from './utils.js';


document.addEventListener('DOMContentLoaded', function() {
	let dropbox = new DropExplorer();
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
	if (dropbox.getAccessTokenFromUrl()) {
		login.style.display = 'none';
		dropbox.setupSDK();
	} else {
		dropbox.setupLoginButton();
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
});
