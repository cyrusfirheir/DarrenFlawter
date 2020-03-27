
$("body").on("click", ".close-menu-link", () => Engine.play(passage()));

$("body").on("click", "#pause-link", function() {
	Engine.play("pauseMenu", true);
});

window.settingHandlers = {
	fancyGfx() {
		if (settings.fancyGfx) $(":root").addClass("fancy-gfx");
		else $(":root").removeClass("fancy-gfx");
	}
};


Setting.addToggle("fancyGfx", {
	label    : "Fancy graphics",
	default  : false,
	onInit   : settingHandlers.fancyGfx,
	onChange : settingHandlers.fancyGfx
});

window.settingToggleButton = function(_var) {
	let _val = settings[_var] ? settings[_var] : false;
	let retStr = `
	<div class="toggle-button ${_val ? "toggle-on" : ""}">
		{{{${_var}}}}
		<div class="toggle-button-knob"></div>
		<div class="toggle-button-value">${_val ? "ON" : "OFF"}</div>
	</div>
	`;
	return retStr.replace(/[\r\n]+/g, " ");
};

$("body").on("click", ".game-setting.toggle .toggle-button", function() {
	let _btn = $(this);
	let _var = _btn.children("code").text();
	_btn.toggleClass("toggle-on");
	let _val = _btn.hasClass("toggle-on");
	settings[_var] = _val;
	Setting.save();
	settingHandlers[_var]();
	_btn.children(".toggle-button-value").text(_val ? "ON" : "OFF");
});
