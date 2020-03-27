UIBar.destroy();

Config.passages.nobr = true;
Config.passages.transitionOut = 10;

window.Game = {
	debug: true,
	version: {
		number: "0.1.0",
		name: "Amethyst"
	},
	tbc: "two_00",
	input: {
		movement: false
	}
};

if (window.isElectron) {
	window.NodeJS = {
		fs: nodeRequire('fs'),
		path: nodeRequire('path'),
		glob: nodeRequire('glob')
	};
}

//debug keyboard toggles
$(document).on("keydown", function(ev) {
	switch (ev.code) {
		case "Backquote":
			if (Game.debug && ev.ctrlKey) Engine.restart();
			break;
		case "Digit1":
			if (Game.debug && ev.ctrlKey) {
				settings.fancyGfx = !settings.fancyGfx;
				Setting.save();
				settingHandlers.fancyGfx();
			}
			break;
		case "Space":
			if (Game.debug && passage() === "VNScreen") advanceScene();
			break;
		case "Escape":
			$(".close-menu-link").trigger("click");
			break;
	}
});


$("html").on('click', 'a, button, .material-button', ripple);

$("html").on('click', '#new-game-link', () => loadScene("prologue_00"));

//disables autocomplete
$("html").on("focus", "input", function(){
  $(this).attr("autocomplete", "off");
});
