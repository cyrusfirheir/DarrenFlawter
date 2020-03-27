/*
The 'first' argument controls whether the call for advanceScene is for the very first entry or not.
Is false by default, meaning it will continue to push items to the log as normal.
When passed true, the function will not push anything to the log after the first item has been pushed.
*/
window.advanceScene = function(first = false) {
	let log = $(".text-log");
	if (!log) return;

	function scroll2End() {
		log.stop().animate({
			scrollTop: log[0].scrollHeight
		}, 500);
	}

	if (
		!variables().stack.length ||
		first && variables().log.length !== 0 ||
		log.has("a").length ||
		(log.has("input").length ? log.find("input").val().trim() === "" : false)
	) {
		scroll2End();
		return;
	}

	if (log.has("input.macro-textbox")) {
		$("input.macro-textbox")
			.parents("span.macro-append-insert").empty()
			.wiki(variables().log[variables().log.length-1]);
	}

	variables().log.push(variables().stack[0]);
	variables().stack.shift();

	$.wiki(`<<append ".text-log" t8n>><<= $log[$log.length-1]>><</append>>`);

	scroll2End();

	let _log = variables().log;
	let _logLast = _log[_log.length - 1];

	if (_log.length >= 1) {
		if (_logLast.includes(`<span class="log-ignore">`)){
			variables().log.pop();
		}
		if (_logLast.includes(`<<textbox`)) {
			variables().log[_log.length-1] = _logLast
																				.replace(
																					/\<\<textbox\s*\"([\s\S]+)\"\s*\"\"\s*autofocus\>\>/,
																					`<div class="selected-choice"><<= ` + "$1" + `>></div>`
																				);
		} else {
			State.create(State.passage);
		}
	}

	if ($("span.log-ignore").length) {
		$("span.log-ignore").remove();
		advanceScene();
	}
};


window.textboxCheck = function() {
	let _log = variables().log;
	let _stack = variables().stack;

	if (_log.length >= 1 && !!_stack[0]) {
		if (
			_log[_log.length-1].includes(`class="selected-choice"`) &&
			_stack[0].includes(`<<textbox`)
		) {
			advanceScene();
		}
	}
};


$("body").on("click", ".text-log a", function() {
	let _a = $(this);
	let aText = `<div class="selected-choice">${_a.text()}</div>`;
	let log = variables().log;
	if (log[log.length - 1]) {
		variables().log[log.length - 1] = log[log.length - 1]
																				.replace(
																					/(\<div[\s\S]*?class\=\"choice[\s\S]*?\"\>)[\s\S]*?(\<\/div\>)/,
																					"$1" + aText + "$2"
																				);
	}
	_a.parent().empty().wiki(aText);
	advanceScene();
});


//uses an arrow function to avoid preventDefault
$("body").on("click", "#advance-scene-link", () => advanceScene());
