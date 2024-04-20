export async function cardPileObsever() {
	lib.arenaReady.push(function () {
		const observerCallback = function (mutationsList, observer) {
			if (_status.gameStarted) {
				var next = game.createEvent("pileChanged", false);
				mutationsList.forEach((mutation) => {
					if (mutation.type === "childList") {
					}
				});
				next.position = "c";
				next.setContent("emptyEvent");
			}
		};
		const observer = new MutationObserver(observerCallback);
		const observer_config = {
			childList: true,
		};
		const targetNode = ui.cardPile;
		observer.observe(targetNode, observer_config);
		lib.onover.push(function () {
			observer.disconnect();
		});
	});
}

export async function discardPileObsever() {
	lib.arenaReady.push(function () {
		const observerCallback = function (mutationsList, observer) {
			if (_status.gameStarted) {
				var next = game.createEvent("pileChanged", false);
				mutationsList.forEach((mutation) => {
					if (mutation.type === "childList") {
					}
				});
				next.position = "d";
				next.setContent("emptyEvent");
			}
		};
		const observer = new MutationObserver(observerCallback);
		const observer_config = {
			childList: true,
		};
		const targetNode = ui.discardPile;
		observer.observe(targetNode, observer_config);
		lib.onover.push(function () {
			observer.disconnect();
		});
	});
}

export async function orderingObsever() {
	lib.arenaReady.push(function () {
		const observerCallback = function (mutationsList, observer) {
			if (_status.gameStarted) {
				var next = game.createEvent("pileChanged", false);
				mutationsList.forEach((mutation) => {
					if (mutation.type === "childList") {
					}
				});
				next.position = "o";
				next.setContent("emptyEvent");
			}
		};
		const observer = new MutationObserver(observerCallback);
		const observer_config = {
			childList: true,
		};
		const targetNode = ui.ordering;
		observer.observe(targetNode, observer_config);
		lib.onover.push(function () {
			observer.disconnect();
		});
	});
}

export async function specialObsever() {
	lib.arenaReady.push(function () {
		const observerCallback = function (mutationsList, observer) {
			if (_status.gameStarted) {
				var next = game.createEvent("pileChanged", false);
				mutationsList.forEach((mutation) => {
					if (mutation.type === "childList") {
					}
				});
				next.position = "s";
				next.setContent("emptyEvent");
			}
		};
		const observer = new MutationObserver(observerCallback);
		const observer_config = {
			childList: true,
		};
		const targetNode = ui.special;
		observer.observe(targetNode, observer_config);
		lib.onover.push(function () {
			observer.disconnect();
		});
	});
}
