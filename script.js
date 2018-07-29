document.addEventListener('DOMContentLoaded', function() {
	let yamlString = `
- url: https://google.com
  title: Google
  description: Search the web
  image: https://images.unsplash.com/photo-1531752074002-abf991376d04
- url: https://github.com
  title: Github
  description: Sharing code
  image: https://images.unsplash.com/photo-1496200186974-4293800e2c20
- url: https://github.com
  title: Github
  description: Sharing code
  image: https://images.unsplash.com/photo-1496200186974-4293800e2c20
- url: https://github.com
  title: Github
  description: Sharing code
  image: https://images.unsplash.com/photo-1496200186974-4293800e2c20
- url: https://github.com
  title: Github
  description: Sharing code
  image: https://images.unsplash.com/photo-1496200186974-4293800e2c20
- url: https://github.com
  title: Github
  description: Sharing code
  image: https://images.unsplash.com/photo-1496200186974-4293800e2c20
- url: https://github.com
  title: Github
  description: Sharing code
  image: https://images.unsplash.com/photo-1496200186974-4293800e2c20
- url: https://github.com
  title: Github
  description: Sharing code
  image: https://images.unsplash.com/photo-1496200186974-4293800e2c20
- url: https://github.com
  title: Github
  description: Sharing code
  image: https://images.unsplash.com/photo-1496200186974-4293800e2c20
`

	let preview = document.getElementById("preview-frame");
	let list = document.getElementById("link-list");
	let template = document.getElementById("list-template");
	let data = nativeObject = YAML.parse(yamlString);
	data.forEach(x => {
		let newElem = document.importNode(template.content, true);
		newElem.querySelector("a").href = x.url;
		newElem.querySelector(".link-text").textContent = x.title;
		newElem.querySelector(".description").textContent = x.description;
		newElem.querySelector("img").src = x.image;
		list.appendChild(newElem);
	});
});
