
;(function() {
	/**
  * Blocky Maps, by Cyrus Firheir; for SugarCube v2
  * requires _bm-styles.css and _bm-passage.tw/_bm-passage-twine.txt
  */

	let _bm = {};

	_bm.version = "v1.0.1";

	/**
	* Returns html for drawing map to screen
	* @constructor
	* @param {Object} mapObj - The Map object/JSON to draw on the map.
	* @param {boolean} [load=true] - Whether to skip loading map into $curMap.
	*/
	_bm.drawMap = function(mapObj, load=true) {
		if (!mapObj) return "";
		if (typeof mapObj === "string") mapObj = JSON.parse(mapObj.replace(/[\r\n]+/g, " "));
		if (load) variables().curMap = mapObj;
		let rows = mapObj.size.rows;
		let cols = mapObj.size.cols;
		let ret = "";
		ret += `<div id="map-background" class="${mapObj.cssClass ? mapObj.cssClass : ""}"></div>`;
		ret += `<div id="map-container">`
		ret += `<div id="map" class="${mapObj.cssClass ? mapObj.cssClass : ""}">`;
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				let cell = `r${r}c${c}`;
				let _o = Object.assign({}, mapObj._default, mapObj[cell]);

				let css = _o.css ? _o.css : "";
				let cssClass = _o.cssClass ? _o.cssClass : "";
				let content = _o.content ? _o.content : "";

				ret += `<span	id="${cell}" class="map-cell ${cssClass}" style="${css}"><span class="content">${content}</span></span>`;
				if (c === cols - 1) ret += `<br>`;
			}
		}
		ret += `</div></div>`;
		ret = ret.replace(/[\r\n\s]+/g, " ");
		return ret;
	};

	/**
	* Focuses 'camera' on the target block
	* @constructor
	* @param {string} [target="#r0c0"] - The target block.
	*/
	_bm.cameraFollow = function(target = "#r0c0") {
		let _t = $(`#map-container #map ${target}`);
		if (!_t.length) _t = $(`#map-container #map #r0c0`);
		let _pos = _t.attr("id")
									.replace(/r(\d+)?c(\d+)?/, "$1_$2")
									.split("_")
									.map(el => Number(el));
		let _map = $("#map-container #map");
		let _padding = _map.css("padding");
		let _margin = _t.css("margin");
		let _w = _t.css("width");
		let _h = _t.css("height");
		let _o = $("#map-container").css("transform-origin").split(" ");
		let size = variables().curMap.size;

		_map.css({
			"top": `calc(${_o[1]} - (${_pos[0]} * ${_h}) - (${_h}/2) - (${_pos[0]} * ${_margin} * 2) - (${_padding}*1.5))`,
			"left": `calc(${_o[0]} - (${_pos[1]} * ${_w}) - (${_w}/2) - (${_pos[1]} * ${_margin} * 2) - (${_padding}*1.5))`,
			"min-width": `calc((${size.cols} * (${_w} + (${_margin} * 2)) + 1.5em)`,
			"min-height": `calc((${size.rows} * (${_h} + (${_margin} * 2)) + 1.5em)`
		});
	};

	setup.zoomLevel = 100;

	/**
	* 'Zooms' map in or out.
	* @constructor
	* @param {number} [level=100] - Percentage zoom.
	*/
	_bm.mapZoom = function(level = 100) {
		let _t = $("#map-container");
		if (!_t.length) return;
		_t.css({
			"transform": `scale(${level/100})`
		});
		$(document).trigger(":map-zoomed");
	};

	/**
	* Moves the 'player' to the specified coordinates
	* @constructor
	* @param {string|Array|Object} coords - Destination coordinates.
	* @param {boolean} [override=false] - Whether to move into solid block.
	*/
	_bm.pMoveCoords = function(coords, override=false) {
		let _p = $("#map-container #map .player");
		if (!_p.length) return;
		let _t = _p;
		switch (typeof coords) {
			case "string":
				_t = coords.trim() ? $(`#map-container #map #${coords}`) : _p;
				break;
			case "object":
				if (Array.isArray(coords)) {
					_t = $(`#map-container #map #r${coords[0]}c${coords[1]}`);
				} else {
					_t = $(`#map-container #map #r${coords.row}c${coords.col}`);
				}
				break;
		}
		if (_t.length) {
			if (!_t.hasClass("solid") || override) {
				_p.removeClass("player");
				_t.addClass("player");
			}
		}
		$(document).trigger(":map-moved");
	};

	/**
	* Moves 'player' towards specified direction by specified distance.
	* @constructor
	* @param {string} dir - Direction of movement either of ["up", "down", "left", "right"].
	* @param {number} [dist=1] - Distance in amount of blocks to move in specified irection.
	*/
	_bm.pMove = function(dir, dist=1) {
		if (!$("#map-container #map .player").length || variables().mapEdit) return;
		if (dist === 0) {
			$(document).trigger(":map-moved");
			return;
		}
		let rMove = 0;
		let cMove = 0;
		switch (dir) {
			case "up": 			rMove = -1; 	break;
			case "down": 		rMove = 1; 		break;
			case "left": 		cMove = -1; 	break;
			case "right": 	cMove = 1; 		break;
		}
		for (let d = 0; d < dist; d++) {
			let _p = $("#map-container #map .player");
			let _cur = _p.attr("id")
										.replace(/r(\d+)?c(\d+)?/, "$1_$2")
										.split("_")
										.map(el => Number(el));
			_bm.pMoveCoords([
				_cur[0] + rMove,
				_cur[1] + cMove
			]);
		}
	};

	/**
	* Loads map and plays the 'bmPlayMap' passage to show the map.
	* @constructor
	* @param {Object} mapObj - Map Object/JSON.
	* @param {string} [coords=""] - Specific coordinates to start the player at when map is loaded.
	*/
	_bm.gotoMap = function(mapName, coords="") {
		if (!window.isElectron) return;
		let mapObj = {};
		try {
			mapObj = JSON.parse(
				NodeJS.fs.readFileSync(NodeJS.path.join(__dirname, "./worldData/maps/", `${mapName}.json`), "utf8")
			);
		} catch(err) {
			console.log(err);
			setup.notify(
				`<i class="material-icons">warning</i> Map load failed! See {{{console}}} for more details!`
				, 3000, "danger"
			);
			return;
		}
		if ($("#loading-cover").length) $("#loading-cover").addClass("closed");
		memorize("pCurPos", coords);
		variables().curPos = coords;
		variables().curMap = mapObj;
		$.wiki(`<<goto "playMap">>`);
	};

	window.bm = Object.freeze(_bm);
}());


$(window).on("resize", () => setTimeout(() => $(document).trigger(":map-moved"), 200));

$(document).on(":map-moved", function() {
	if (!$("#map-container").length) return;
	bm.cameraFollow(".player");

	let _def = variables().curMap._default;

	let _p = $("#map-container #map .player").attr("id");
	variables().curPos = _p;
	let _cur = variables().curMap[_p];
	memorize("pCurPos", _p);

	let _o = Object.assign({}, _def, _cur);

	let _n = $("#cur-block-name .content");
	let _d = $("#cur-block-desc .content");
	let _a = $("#cur-block-acts .content");

	_n.empty();
	_d.empty();
	_a.empty();

	if (!$("#map-container #map .player").hasClass("exit")) {
		_n.wiki(_o.name ? _o.name : "");
		_d.wiki(_o.desc ? _o.desc : "");
		_a.wiki(_o.acts ? _o.acts.reduce((acc, cur) => {
			return acc + cur.content;
		}, "") : "");
	}

	$.wiki(_o.trig ? _o.trig.reduce((acc, cur) => {
		return acc + cur.content;
	}, "") : "");
});

$(document).on("keydown", function(ev) {
	if (Game.input.movement) {
		switch (ev.code) {
			case "KeyW": case "ArrowUp":
				bm.pMove("up");
				break;
			case "KeyS": case "ArrowDown":
				bm.pMove("down");
				break;
			case "KeyA": case "ArrowLeft":
				bm.pMove("left");
				break;
			case "KeyD": case "ArrowRight":
				bm.pMove("right");
				break;
		}
	}
	switch (ev.code) {
		case "PageDown":
			setup.zoomLevel -= 5;
			setup.zoomLevel = setup.zoomLevel.clamp(10, 250);
			bm.mapZoom(setup.zoomLevel);
			break;
		case "PageUp":
			setup.zoomLevel += 5;
			setup.zoomLevel = setup.zoomLevel.clamp(10, 250);
			bm.mapZoom(setup.zoomLevel);
			break;
	}
});

$("html").on("click", "#movement-buttons .material-button", function() {
	let _dir = $(this).attr("id").split("-")[2];
	bm.pMove(_dir);
});
