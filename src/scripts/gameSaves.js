
Config.history.controls = false;
Config.history.maxStates = 2;

window.createSave = function() {
	return JSON.stringify({
		chapter: setup.chapters[variables().currentChapter].saveString,
		location: variables().currentLocation,
		date: new Date(),
		saveString: Save.serialize()
	}, null, "\t");
};

$("body").on("click", "#saves-link", function() {
	forget("pCurPos");
	State.create(State.passage);
	Engine.play("saveMenu", true);
});

$("body").on("click", "button.game-save-acts", function() {
	if (!window.isElectron) return;
	let fName = "";

	if ($(this).hasClass("game-save-new")) {
		fName = $("input#game-save-name").val().trim();
		fName = fName
							? Util.slugify(fName)
							: `flawter_${Util.slugify((new Date()).toLocaleString()).split("-").join("")}`;
		fName += ".json";
		try {
			NodeJS.fs.writeFileSync(NodeJS.path.join(__dirname, "./saves/", fName), createSave());
			$("input#game-save-name").val("");
		} catch(err) {
			console.log(err);
			setup.notify(
				`<i class="material-icons">warning</i> Save function failed! See {{{console}}} for more details!`
				, 3000, "danger"
			);
		}
		$(document).trigger(":files-modded", {type: "save"});

	} else {
		fName = $(this)
							.parent()
							.siblings(".save-meta-file")
							.children(".save-meta-filename")
							.text();

		if ($(this).hasClass("game-save-save")) {
			try {
				NodeJS.fs.writeFileSync(NodeJS.path.join(__dirname, "./saves/", fName), createSave());
			} catch(err) {
				console.log(err);
				setup.notify(
					`<i class="material-icons">warning</i> Save function failed! See {{{console}}} for more details!`
					, 3000, "danger"
				);
			}
			$(document).trigger(":files-modded", {type: "save"});

		} else if ($(this).hasClass("game-save-load")) {
			try {
				Save.deserialize(
					JSON.parse(
						NodeJS.fs.readFileSync(NodeJS.path.join(__dirname, "./saves/", fName), "utf8")
					).saveString
				);
			} catch(err) {
				console.log(err);
				setup.notify(
					`<i class="material-icons">warning</i> Load function failed! See {{{console}}} for more details!`
					, 3000, "danger"
				);
			}

		} else if ($(this).hasClass("game-save-delete")) {
			try {
				NodeJS.fs.unlinkSync(NodeJS.path.join(__dirname, "./saves/", fName));
			} catch(err) {
				console.log(err);
				setup.notify(
					`<i class="material-icons">warning</i> Delete function failed! See {{{console}}} for more details!`
					, 3000, "danger"
				);
			}
			$(document).trigger(":files-modded", {type: "delete"});
		}
	}
});


$(document).on(":files-modded", function(ev, evData = {type: ""}) {
	// switch(evData.type) {
	// 	case "save": break;
	// 	case "delete": break;
	// }
	if ($("#saves-container").length) $("#saves-container").html(getGameSaves());
});


window.getGameSaves = function() {
	if (!window.isElectron) return "No saves found...";

	let saves = NodeJS.glob.sync("*.json", {
		cwd: NodeJS.path.join(__dirname, "./saves/")
	})
	.map(el => {
		let data = {};
		try {
			data = JSON.parse(NodeJS.fs.readFileSync(NodeJS.path.join(__dirname, "./saves/", el), "utf8"));
		} catch(err) {
			data = {
				chapter: "INVALID SAVE",
				location: "INVALID SAVE",
				date: "INVALID SAVE",
				saveString: "INVALID SAVE"
			};
		}
		data.fileName = el;
		return data;
	})
	.sort((d1, d2) => d2.date - d1.date);

	if (saves.length === 0) return "No saves found...";

	let retStr = "";
	for (let save of saves) {
		retStr += `
		<div class="game-save">
			<div class="save-meta-chapter">${save.chapter}</div>
			<div class="save-meta-location">${save.location}</div>
			<div class="save-meta-file">
				<div class="save-meta-filename">${save.fileName}</div>
				<div class="save-meta-date-saved">${save.date.toLocaleString()}</div>
			</div>
			<div class="game-save-actions">
				${
					Story.get(passage()).tags.includes("nosave")
						? ""
						: `
							<button class="game-save-acts game-save-save button-material-icon">
								<div>
									<i class="material-icons">save</i>
								</div>
								Save
							</button>
							`
				}
				<button class="game-save-acts game-save-load button-material-icon">
					<div>
						<i class="material-icons">history</i>
					</div>
					Load
				</button>
				<button class="game-save-acts game-save-delete button-material-icon">
					<div>
						<i class="material-icons">delete_forever</i>
					</div>
					Delete
				</button>
			</div>
		</div>
		`;
	}
	return retStr.replace(/[\r\n]+/g, " ");
};
