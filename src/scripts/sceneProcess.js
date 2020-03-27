window.processScene = function(stack) {
	let retStack = [];
	for (let i of stack) {
		let styles;
		i.header.replace(/\{(.*)\}/, (match, p1) => styles = p1);
		styles = (styles) ? styles : "";
		let block = i.header.includes("[]");
		let speaker = i.header.replace(/\{.*\}/, "").replace("[]", "").trim();
		if (speaker === "Darren") styles += " pc";
		if (block) {
			//blocks of text - use for choices, signs, big monologues, etc.
			let content = i.content.replace(/\n/, " ");
			if (i.content) {
				retStack.push({
					speaker: speaker,
					styles: styles,
					text: content
				});
			}
		} else {
			//single lines of text (speech, narration, whatevs)
			let pushContent = i.content.split(/\r?\n/).map(el => el.trim());
			pushContent.forEach(el => {
				if (el.trim()) {
					if (speaker.trim() && retStack.length >= 1) {
						if (speaker === retStack[retStack.length-1].speaker) styles += " continued-speech";
					}
					retStack.push({
						speaker: speaker,
						styles: styles,
						text: el
					});
				}
			});
		}
	}
	return retStack.map(el => textDisplay(el));
};


window.textDisplay = function(config = {
	speaker: "",
	styles: "",
	text: ""
}) {
	if (config.speaker === "||") {
		return `<span class="log-ignore">${config.text}</span>`;
	}

	let legend = (config.speaker) ? `<legend class="${config.styles}">${config.speaker}</legend>` : "";

	let bust = "";
	let _char = setup.charBusts[config.speaker];
	if (_char) {
		bust = `
			<div class="char-bust ${config.styles}">
				<img src="media/images/busts/${setup.chars[_char].images.bust}">
			</div>
		`;
	}
	bust = bust.replace(/[\r\n]+/g, " ");

	if (config.styles.includes("continued-speech")) {
		legend = "";
		bust = "";
	}
	let out = "";

	out += `<fieldset class="displayed-text">`;
	out += bust;
	out += legend;
	out += `<div class="${config.styles} ${config.speaker ? "speech" : ""}">`;
	out += config.text;
	out += `</div>`;
	out += `</fieldset>`;

	return out;
}


//doesn't clear the log if false is passed as second argument
window.loadScene = function(scene, clear=true) {
	let raw = processScene(headSplit(Story.get(scene).text, /\@(.*)/gi));
	variables().stack = variables().stack.concat(raw);
	if (clear) {
		variables().log = [];
		Engine.play("VNScreenTransition");
	}
};
