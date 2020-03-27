
window.charInit = function() {
	let chars = {};
	let charBusts = {};

	if (!window.isElectron) {
		setup.chars = chars;
		setup.charBusts = charBusts;
		return;
	};

	chars = JSON.parse(
		NodeJS.fs.readFileSync(NodeJS.path.join(__dirname, "./worldData/characters.json"))
	);

	for (let char in chars) {
		let _char = chars[char];
		if (_char.images) {
			if (_char.images.bust) charBusts[_char.speech] = _char.id;
		}
	}

	setup.chars = chars;
	setup.charBusts = charBusts;
};
