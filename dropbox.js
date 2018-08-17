
import { YAML } from './yaml.js';
import * as utils from './utils.js';

export class DropExplorer {
	constructor() {
		this.APP_KEY = "pqfc8frnfzizk0h";
		this.APP_SECRET = "8fv2q7qoyd9j315";
		this.dbx = undefined;
		this.viewPath = [];
		this.yaml = undefined;
	}
	
	getFileTemplate() {
		return document.getElementById("file-template")
	}
	
	getDropboxList() {
		return document.getElementById("file-explorer")
	}
	
	isDir(item) {
		return item[".tag"] === "folder";
	}
	
	addFileItem(template, item, list) {
		let newElem = document.importNode(template.content, true);
		newElem.querySelector(".file-name").textContent = item.name;
		newElem.querySelector("li").className = item[".tag"];
		newElem.querySelector("li").id = item.id;
		newElem.querySelector("li").onclick = (e) => {
			if (this.isDir(item)) {
				this.viewPath.push(item);
				this.listFiles(item.id)
			} else {
				this.showFile(item)
			}
		}
		list.appendChild(newElem);
	}
	
	renderFiles(fileList) {
		let template = this.getFileTemplate();
		let list = this.getDropboxList();
		fileList.forEach(x => {
			if (this.isDir(x) || x.name.endsWith(".yaml")) {
				this.addFileItem(template, x, list);
			}
		});
	}
	
	setupLoginButton() {
		let login = document.getElementById('login');
		this.dbx = new Dropbox.Dropbox({ clientId: this.APP_KEY });
		let authUrl = this.dbx.getAuthenticationUrl(window.location.origin + window.location.pathname);
		document.getElementById('authlink').href = authUrl;
		login.style.display = 'flex';
	}
	
	getAccessTokenFromUrl() {
	    return utils.parseQueryString(window.location.hash).access_token;
	}
	
	listMoreFiles(cursor) {
		this.dbx.filesListFolderContinue({cursor: cursor})
		.then(response => {
			this.renderFiles(response.entries);
			if (response.has_more) {
				this.listMoreFiles(response.cursor);
			}
		})
	}
	
	fetchYaml(fileId) {
		this.dbx.filesDownload({"path": fileId}).then(x => {
			let reader = new FileReader();
			reader.onload = () => {
			    this.yaml.loadYaml(reader.result);
			}
			reader.readAsText(x.fileBlob);
		})
		.catch(e => console.log(e));
	}
	
	listFiles(path) {
		this.dbx.filesListFolder({path: path})
		.then(response => {
			this.getDropboxList().innerHTML = '';
			let up = this.getDropboxList().parentElement.querySelector("button");
			if (this.viewPath && this.viewPath.length > 1) {
				let parent = this.viewPath[this.viewPath.length -2];
				up.textContent = parent.name ? parent.name : parent !== "" ? parent : "Up";
				up.style.display = 'flex';
				up.onclick = e => {
					this.viewPath.pop();
					this.listFiles(parent.id ? parent.id : parent);
				};
			} else {
				up.style.display = 'none';
			}
			this.renderFiles(response.entries, path);
			if (response.has_more) {
				this.listMoreFiles(response.cursor, path);
			}
		})
		.catch(error => {
			console.error(error);
		});
	}
	
	showFile(file) {
		this.yaml.showFileName(file.name);
		utils.updateQueryString("fileName", file.name);
		utils.updateQueryString("path", file.id);
		this.fetchYaml(file.id);
	}
	
	setupSDK() {
		this.dbx = new Dropbox.Dropbox({ accessToken: this.getAccessTokenFromUrl() });
		this.yaml = new YAML(this.dbx);
		let query = utils.parseQueryString(window.location.hash);
		this.viewPath.push('');
		this.listFiles('');
		if (query && query.path && query.fileName) {
			this.fetchYaml(query.path);
			this.yaml.showFileName(query.fileName);
		}
	}
}
