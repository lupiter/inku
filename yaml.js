import * as utils from './utils.js';


export class YAML {
	constructor(dbx) {
		this.dbx = dbx;
	}

	addItem(template, item, list) {
		let newElem = document.importNode(template.content, true);
		let li = newElem.querySelector("li");
		newElem.querySelector("a").href = item.url;
		newElem.querySelector(".link-text").textContent = item.title;
		newElem.querySelector(".description").textContent = item.description;
		this.dbx.filesDownload({"path": item.image}).then(x => {
			let reader = new FileReader();
			reader.onload = function() {
				li.querySelector("img").src = reader.result;
			}
			reader.readAsDataURL(x.fileBlob);
		})
		.catch(e => console.log(e));
		list.appendChild(newElem);
	}
	
	getList() {
		return document.getElementById("link-list");
	}
	
	getTemplate() {
		return document.getElementById("list-template");
	}
	
	loadYaml(yamlString) {
		let list = this.getList();
		let template = this.getTemplate();
		
		list.innerHTML = '';
		let data = jsyaml.safeLoad(yamlString);
		data.forEach(x => {
			this.addItem(template, x, list);
		});
	}
	
	saveYaml() {
		let list = this.getList();
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
	
	showFileName(name) {
		document.getElementById('file-details').style.display = 'flex';
		document.getElementById('file-name').textContent = name;
	}

}