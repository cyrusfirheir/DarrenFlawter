module.exports = {
	fix: function() {
		const fs = require('fs'),
					path = require('path');
		let project_folder;
		if (process.pkg) project_folder = path.dirname(process.execPath);
		else project_folder = __dirname;
		let filePath = path.join(project_folder, "../index.html");
		data = fs.readFileSync(filePath, 'utf8');
		let result = data;
		if (!data.includes("window.nodeRequire = require")) {
			result = data.replace(
				`<meta name="viewport" content="width=device-width,initial-scale=1" />`,
				`<meta name="viewport" content="width=device-width,initial-scale=1" />
<script>
	window.isElectron = true;
	window.nodeRequire = require;
	delete window.require;
	delete window.exports;
	delete window.module;
</script>`
			);
		}
		fs.writeFileSync(filePath, result);
		return true;
	}
}
