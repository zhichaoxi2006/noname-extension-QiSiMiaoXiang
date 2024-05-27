import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";
import { watch } from "../../../../../game/vue.esm-browser.js";
import { content } from "../../content.js";
export const skill = {
	//在这里编写技能。
	skill: {
		qmsx_zhengli: {
			_priority: 0,
		},
		qsmx_qichong: {
			forced: true,
			silent: true,
			firstDo: true,
			group: ["qsmx_qichong_win", "qsmx_qichong_damageAfter"],
			trigger: {
				global: "gameStart",
				player: "enterGame",
			},
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_SevenGod")) {
					player.removeSkill(skill);
				} else {
					player.initCharacterLocker();
				}
			},
			onremove: function (player, skill) {
				player.addSkill(skill);
			},
			filter: function (event, player) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_SevenGod")) return false;
				return true;
			},
			content: function () {
				player.initDieResistance();
				player.initDyingResistance();
				player.initControlResistance();
				player.initMadResistance();
				player.initSkillResistance();
				player.initHpLocker(player.hp);
				player.initmaxHpLocker(player.maxHp);
			},
			subSkill: {
				win: {
					charlotte: true,
					forced: true,
					silent: true,
					usable: 1,
					trigger: {
						global: "pileWashed",
					},
					filter: function (event, player) {
						return game.shuffleNumber >= 7;
					},
					content() {
						"step 0";
						player.$skill("七重");
						var list = game.players;
						var targets = list.filter((c) => c != player);
						for (let index = 0; index < targets.length; index++) {
							const target = targets[index];
							if (
								(get.mode() == "identity" &&
									target.identity != "zhu") ||
								(get.mode() != "identity" &&
									target.isEnemyOf(player))
							)
								target.AntiResistanceDie();
						}
						("step 1");
						var list = game.players;
						var targets = list.filter((c) => c != player);
						for (let index = 0; index < targets.length; index++) {
							const target = targets[index];
							if (target.isEnemyOf(player))
								target.AntiResistanceDie();
						}
					},
					sub: true,
					popup: false,
					_priority: 1,
				},
				damageAfter: {
					charlotte: true,
					forced: true,
					silent: true,
					trigger: {
						player: "damageAfter",
					},
					filter: function (event, player) {
						if (!event.card || !event.cards) return false;
						var card = event.card;
						var cards = card.cards;
						var nature_num = [
							...new Set(cards.map((c) => get.nature(c))),
						].length;
						var type_num = [
							...new Set(cards.map((c) => get.type(c))),
						].length;
						var cardname_num = [
							...new Set(cards.map((c) => get.name(c))),
						].length;
						var suit_num = [
							...new Set(cards.map((c) => get.suit(c))),
						].length;
						var color_num = [
							...new Set(cards.map((c) => get.color(c))),
						].length;
						var number_num = 0;
						for (let index = 0; index < cards.length; index++) {
							const element = cards[index];
							number_num = number_num + get.number(element);
						}
						var cardNameLength_num = 0;
						for (let index = 0; index < cards.length; index++) {
							const element = cards[index];
							cardNameLength_num =
								cardNameLength_num +
								get.cardNameLength(element);
						}
						var result =
							suit_num -
							color_num +
							Math.pow(
								type_num / (number_num * cardNameLength_num),
								cardname_num - nature_num
							);
						//game.log(result,'|',nature_num,'|',cardname_num);
						if (result == 42) return true;
					},
					content: function () {
						player.AntiResistanceDie();
					},
					ai: {
						effect: {
							target(card, player, target) {
								var cards = ui.selected.cards;
								var nature_num = [
									...new Set(cards.map((c) => get.nature(c))),
								].length;
								var type_num = [
									...new Set(cards.map((c) => get.type(c))),
								].length;
								var cardname_num = [
									...new Set(cards.map((c) => get.name(c))),
								].length;
								var suit_num = [
									...new Set(cards.map((c) => get.suit(c))),
								].length;
								var color_num = [
									...new Set(cards.map((c) => get.color(c))),
								].length;
								var number_num = 0;
								for (
									let index = 0;
									index < cards.length;
									index++
								) {
									const element = cards[index];
									number_num =
										number_num + get.number(element);
								}
								var cardNameLength_num = 0;
								for (
									let index = 0;
									index < cards.length;
									index++
								) {
									const element = cards[index];
									cardNameLength_num =
										cardNameLength_num +
										get.cardNameLength(element);
								}
								var result =
									suit_num -
									color_num +
									Math.pow(
										type_num /
											(number_num * cardNameLength_num),
										cardname_num - nature_num
									);
								if (get.tag(card, "damage")) {
									if (result == 42) {
										return [7, -358];
									}
									return "zerotarget";
								}
							},
						},
					},
					_priority: 0,
					sub: true,
					popup: false,
					audioname2: {
						key_shiki: "shiki_omusubi",
					},
				},
			},
			ai: {
				HpResistance: true,
				maxHpResistance: true,
				DieResistance: true,
			},
			popup: false,
			audioname2: {
				key_shiki: "shiki_omusubi",
			},
			_priority: 1,
		},
		qmsx_duanwu: {
			locked: false,
			enable: "phaseUse",
			usable: 1,
			content() {
				"step 0";
				var cardPile = Array.from(ui.cardPile.childNodes);
				var discardPile = Array.from(ui.discardPile.childNodes);
				var complexPile = [].concat(cardPile).concat(discardPile);
				var equip1 = complexPile.filter(
					(c) => get.subtype(c) == "equip1"
				);
				player.chooseCardButton(equip1, [1, 4]);
				("step 1");
				var cards = result.links;
				for (let index = 0; index < cards.length; index++) {
					const card = cards[index];
					player.expandEquip(1);
					player.equip(card);
				}
			},
			ai: {
				order: 1,
				result: {
					player: 1,
				},
				threaten: 1.5,
			},
			_priority: 0,
		},
		qsmx_difu: {
			trigger: {
				global: ["phaseUseBegin"],
			},
			filter: function (event, player) {
				return (
					event.player.countCards("h") > event.player.maxHp &&
					((get.mode() == "identity" &&
						get.attitude(player, event.player) < 0) ||
						(get.mode() != "identity" &&
							event.player.isEnemyOf(player)))
				);
			},
			forced: true,
			logTarget: "player",
			content: function () {
				var handcard = trigger.player.getCards("h");
				var cards = handcard.randomGets(
					handcard.length - trigger.player.hp
				);
				trigger.player.loseToDiscardpile(cards, ui.discardPile);
			},
			_priority: 0,
		},
		qsmx_xingpan: {
			forced: true,
			silent: true,
			fixed: true,
			mark: true,
			marktext: "判",
			intro: {
				content: function (storage, player) {
					return (
						"记录了" +
						get.translation(storage) +
						"共" +
						get.cnNumber(storage.length) +
						"种花色"
					);
				},
			},
			group: ["qsmx_xingpan_judgeCancelled", "qsmx_xingpan_judgeFixing"],
			trigger: {
				player: ["Qsmx_XingPan"],
			},
			filter: function (event, player) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_baozheng")) return false;
				return true;
			},
			content: function () {
				"step 0";
				player.getStorage("qsmx_xingpan").length = 0;
				player.syncStorage("qsmx_xingpan");
				("step 1");
				var prompt = "【刑判】：你可以对一名其他角色进行地狱审判。";
				var toSortPlayers = game.players.filter((c) => c != player);
				var next = player.chooseButton([1, 1]).set("createDialog", [
					prompt,
					[
						toSortPlayers.map((i) => `${i.playerid}|${i.name}`),
						(item, type, position, noclick, node) => {
							const info = item.split("|"),
								_item = item;
							const playerid = parseInt(info[0]);
							item = info[1];
							if (node) {
								node.classList.add("button");
								node.classList.add("player");
								node.style.display = "";
							} else {
								node = ui.create.div(
									".button.character",
									position
								);
							}
							node._link = item;
							node.link = item;

							const func = function (node, item) {
								if (item != "unknown")
									node.setBackground(item, "character");
								if (node.node) {
									node.node.name.remove();
									node.node.hp.remove();
									node.node.group.remove();
									node.node.intro.remove();
									if (node.node.replaceButton)
										node.node.replaceButton.remove();
								}
								node.node = {
									name: ui.create.div(".name", node),
									group: ui.create.div(".identity", node),
									intro: ui.create.div(".intro", node),
								};
								const currentPlayer = game.players.find(
									(current) => current.playerid == playerid
								);
								const infoitem = [
									currentPlayer.sex,
									currentPlayer.group,
									`${currentPlayer.hp}/${currentPlayer.maxHp}/${currentPlayer.hujia}`,
								];
								node.node.name.innerHTML = get.slimName(item);
								if (
									lib.config.buttoncharacter_style ==
										"default" ||
									lib.config.buttoncharacter_style == "simple"
								) {
									if (
										lib.config.buttoncharacter_style ==
										"simple"
									) {
										node.node.group.style.display = "none";
									}
									node.classList.add("newstyle");
									node.node.name.dataset.nature =
										get.groupnature(
											get.bordergroup(infoitem)
										);
									node.node.group.dataset.nature =
										get.groupnature(
											get.bordergroup(infoitem),
											"raw"
										);
								}
								node.node.name.style.top = "8px";
								if (
									node.node.name.querySelectorAll("br")
										.length >= 4
								) {
									node.node.name.classList.add("long");
									if (
										lib.config.buttoncharacter_style ==
										"old"
									) {
										node.addEventListener(
											"mouseenter",
											ui.click.buttonnameenter
										);
										node.addEventListener(
											"mouseleave",
											ui.click.buttonnameleave
										);
									}
								}
								node.node.intro.innerHTML = lib.config.intro;
								node.node.group.style.backgroundColor =
									get.translation(
										`${get.bordergroup(infoitem)}Color`
									);
							};
							node.refresh = func;
							node.refresh(node, item);

							node.link = _item;
							return node;
						},
					],
				]);
				next.set("ai", function (button) {
					var link = button.link;
					var target = game.players.find(
						(c) => c.playerid == link.split("|")[0]
					);
					return -get.attitude(player, target);
				});
				next.includeOut = true;
				("step 2");
				if (result.bool) {
					player.$skill(get.translation(event.name));
					var links = result.links;
					for (let index = 0; index < links.length; index++) {
						const link = links[index];
						var targets = game.players.filter(
							(c) => c.playerid == link.split("|")[0]
						);
						for (let index = 0; index < targets.length; index++) {
							const target = targets[index];
							target.resetFuction();
							var next = target.AntiResistanceDie();
							next.includeOut = true;
							game.log(target, "被", player, "送进无间地狱");
						}
					}
				}
				("step 3");
				player.turnOver();
				game.delayx();
			},
			subSkill: {
				judgeCancelled: {
					forced: true,
					trigger: {
						player: "judgeCancelled",
					},
					filter: function (event, player) {
						var name = [player.name, player.name1, player.name2];
						if (!name.includes("qsmx_baozheng")) return false;
						return true;
					},
					content: function () {
						event.trigger("Qsmx_XingPan");
					},
					sub: true,
					_priority: 0,
				},
				judgeFixing: {
					forced: true,
					trigger: {
						player: "judgeFixing",
					},
					filter: function (event, player) {
						var name = [player.name, player.name1, player.name2];
						if (!name.includes("qsmx_baozheng")) return false;
						return true;
					},
					content: function () {
						"step 0";
						card = trigger.result.card;
						suits = card.suit;
						if (player.getStorage("qsmx_xingpan").contains(suits)) {
							event.trigger("Qsmx_XingPan");
						} else {
							player.markAuto("qsmx_xingpan", suits);
						}
						("step 1");
						game.log(
							player,
							"#g【刑判】",
							"：",
							player.getStorage("qsmx_xingpan")
						);
					},
					sub: true,
					_priority: 0,
				},
			},
			ai: {
				effect: {
					target(card, player, target) {
						if (get.type(card) == "delay") {
							return [1, -1.5, 42, 0];
						}
					},
					player(card, player, target) {
						if (get.type(card) == "delay") {
							return [1, 42];
						}
					},
				},
			},
			init: function (player, skill) {
				player.storage[skill] = [];
			},
			popup: false,
			_priority: 1,
		},
		qsmx_jibao: {
			audio: "ext:极略:2",
			trigger: {
				player: "gainAfter",
				global: [
					"loseAfter",
					"cardsDiscardAfter",
					"loseAsyncAfter",
					"equipAfter",
				],
			},
			forced: true,
			filter: function (event, player) {
				if (event.name == "gain") {
					return (
						event.cards &&
						event.cards.some((c) => get.type(c) == "equip")
					);
				}
				return event
					.getd()
					.filterInD("d")
					.some((c) => get.type(c) == "equip");
			},
			intro: {
				content: "expansion",
				markcount: "expansion",
			},
			mod: {
				globalFrom: function (from, to, distance) {
					var num =
						distance +
						from
							.getExpansions("qsmx_jibao")
							.map((c) => {
								let d = get.info(c).distance;
								return d && d.globalFrom;
							})
							.reduce((a, b) => a + (b ? b : 0), 0);
					return num;
				},
				globalTo: function (from, to, distance) {
					var num =
						distance +
						to
							.getExpansions("qsmx_jibao")
							.map((c) => {
								let d = get.info(c).distance;
								return d && d.globalTo;
							})
							.reduce((a, b) => a + (b ? b : 0), 0);
					return num;
				},
				maxHandcard: function (player, num) {
					return (num += 7);
				},
			},
			content: function () {
				let cards, animation;
				if (trigger.name == "gain") {
					cards = trigger.cards.filter(
						(c) =>
							get.type(c) == "equip" &&
							!get.cardtag(c, "gifts") &&
							!get.tag(c, "zq_gifts")
					);
					animation = "give";
				} else {
					cards = trigger
						.getd()
						.filterInD("d")
						.filter(
							(c) =>
								get.type(c) == "equip" &&
								!get.cardtag(c, "gifts") &&
								!get.tag(c, "zq_gifts")
						);
					animation = "gain2";
				}
				player.addToExpansion(cards, animation).gaintag.add(event.name);
				player.addAdditionalSkill(
					event.name,
					cards.map((c) => get.info(c).skills || []).flat(),
					true
				);
				player.draw(cards.length);
			},
			_priority: 0,
		},
		qsmx_gongzheng: {
			preHidden: true,
			forced: true,
			firstDo: true,
			trigger: {
				global: ["useCard", "respondBefore"],
			},
			filter: function (event, player) {
				if (event.card.isCard && !get.tag(event.card, "recover"))
					return false;
				return true;
			},
			logTarget: "player",
			content: function () {
				"step 0";
				trigger.cancel();
				game.broadcastAll(ui.clear);
				("step 1");
				game.delayx();
			},
			_priority: 0,
		},
		qsmx_buqu: {
			trigger: {
				player: ["dyingBefore"],
			},
			group: ["qsmx_buqu_roundStart", "qsmx_buqu_maxhp"],
			forced: true,
			filter: function (event, player) {
				return player.getExpansions("qsmx_buqu").length > 0;
			},
			mark: true,
			intro: {
				content: "expansion",
				markcount: "expansion",
			},
			mod: {
				ignoredHandcard: function (card, player) {
					if (card.hasGaintag("qsmx_buqu")) {
						return true;
					}
				},
				cardDiscardable: function (card, player, name) {
					if (
						name == "phaseDiscard" &&
						card.hasGaintag("qsmx_buqu")
					) {
						return false;
					}
				},
			},
			logTarget: "player",
			content: function () {
				"step 0";
				var cards = get.cards(1);
				var expansion = player.getExpansions("qsmx_buqu");
				var nums = [];
				player.showCards(cards);
				for (var i = 0; i < expansion.length; i++) {
					if (get.number(cards[0]) == get.number(expansion[i])) {
						player.discard(expansion[i]);
					} else {
						player.recover(1 - player.hp);
						player.gain(cards).gaintag.add("qsmx_buqu");
					}
				}
				("step 1");
				if (
					player.dying() &&
					player.getExpansions("qsmx_buqu").length > 0
				) {
					event.goto(0);
				}
			},
			subSkill: {
				roundStart: {
					trigger: {
						global: ["roundStart"],
					},
					forced: true,
					filter: function (event, player) {
						return true;
					},
					content: function () {
						var cards = get.cards(1);
						var expansion = player.getExpansions("qsmx_buqu");
						if (expansion.length == 0) {
							player
								.addToExpansion(cards, "give")
								.gaintag.add("qsmx_buqu");
						}
						for (var i = 0; i < expansion.length; i++) {
							if (
								get.number(cards[0]) == get.number(expansion[i])
							) {
								player.discard(expansion[i]);
							} else {
								player
									.addToExpansion(cards, "give")
									.gaintag.add("qsmx_buqu");
							}
						}
					},
					sub: true,
					_priority: 0,
				},
				maxhp: {
					forced: true,
					trigger: {
						player: ["loseMaxHpBefore", "gainMaxHpBefore"],
					},
					content: function () {
						trigger.cancel();
					},
					sub: true,
					_priority: 0,
				},
			},
			_priority: 0,
		},
		qsmx_jiuzhu: {
			trigger: {
				global: ["damageBefore"],
			},
			frequent: function (event, player) {
				return (
					(get.mode() == "identity" &&
						get.attitude(player, event.player) > 0) ||
					(get.mode() != "identity" &&
						event.player.isFriendOf(player))
				);
			},
			check: function (event, player) {
				return (
					(get.mode() == "identity" &&
						get.attitude(player, event.player) > 0) ||
					(get.mode() != "identity" &&
						event.player.isFriendOf(player))
				);
			},
			filter: function (event, player) {
				return event.player != player;
			},
			logTarget: "player",
			content: function () {
				trigger.player = player;
				//player.damage(trigger.source,trigger.num);
			},
			_priority: 0,
		},
		qsmx_boming: {
			trigger: {
				player: ["damageEnd"],
			},
			locked: true,
			frequent: function (event, player) {
				return (
					(get.mode() == "identity" &&
						get.attitude(player, event.source) < 0) ||
					(get.mode() != "identity" && event.source.isEnemyOf(player))
				);
			},
			check: function (event, player) {
				return (
					(get.mode() == "identity" &&
						get.attitude(player, event.source) < 0) ||
					(get.mode() != "identity" && event.source.isEnemyOf(player))
				);
			},
			filter: function (event, player) {
				return event.source != player;
			},
			logTarget: "player",
			content: function () {
				var damage = trigger.num;
				var MaxHp = trigger.source.maxHp / 2;
				trigger.source.damage(player, damage);
				//trigger.source.loseMaxHp(Math.ceil(MaxHp))
			},
			ai: {
				effect: function (card, player, target) {
					if (get.tag(card, "damage")) {
						if (player.hasSkillTag("jueqi", true)) return [1, -1];
						if (player.hp == 1) return [-4, -1];
						return [-1, -1];
					}
				},
			},
			_priority: 0,
			init: (player, skill) => (player.storage[skill] = 0),
		},
		qsmx_xunbao: {
			trigger: {
				player: ["phaseBegin"],
			},
			filter: function (event, player) {
				return true;
			},
			forced: true,
			content: function () {
				var list = [];
				for (var i in lib.card) {
					if (!lib.translate[i + "_info"]) continue;
					if (
						lib.card[i].mode &&
						lib.card[i].mode.contains(lib.config.mode) == false
					)
						continue;
					if (lib.config.hiddenCardPack.indexOf(i) == 0) continue;
					var info = lib.card[i];
					if (info.type && info.type == "equip") list.push(i);
				}
				player.gain(game.createCard(list.randomGet()));
			},
			_priority: 0,
		},
		qsmx_draw: {
			trigger: {
				global: ["phaseBegin"],
			},
			forced: true,
			filter: function (event, player) {
				return true;
			},
			logTarget: "player",
			content: function () {
				console.log(lib.filter.cardGiftable);
				player.draw(40);
			},
			_priority: 0,
		},
		qsmx_shefu: {
			trigger: {
				global: ["useSkill", "logSkillBegin"],
			},
			filter: function (event, player) {
				if (event.skill == "qsmx_shefu") return false;
				return event.player != player;
			},
			prompt: function (event, player) {
				return get.translation(event.skill);
			},
			audio: "ext:奇思妙想:true",
			content: function () {
				trigger.untrigger();
				trigger.finish();
			},
			_priority: 0,
		},
		qsmx_shunjia: {
			trigger: {
				player: ["dieBegin"],
			},
			group: ["qsmx_shunjia_gameStart"],
			forced: true,
			mark: true,
			intro: {
				content: "characters",
			},
			filter: function (event, player) {
				return player.storage.qsmx_shunjia.length !== 0;
			},
			logTarget: "player",
			content: function () {
				"step 0";
				trigger.cancel();
				("step 1");
				var object = lib.character;
				var list = player.storage.qsmx_shunjia;
				var dialog = ui.create.dialog("选择一张武将牌", "hidden");
				dialog.add([list, "character"]);
				player.chooseButton(dialog, true);
				if (list.length == 0) {
					player.die();
				}
				("step 2");
				event.nametarget = result.links[0];
				player.storage.qsmx_shunjia.remove(name);
				("step 3");
				player.init(event.nametarget);
				("step 4");
				player.addSkill("qsmx_shunjia");
				player.recover(player.maxHp - player.hp);
				player.draw(player.maxHp);
			},
			subSkill: {
				gameStart: {
					trigger: {
						global: ["gameStart"],
					},
					silent: true,
					forced: true,
					filter: function (event, player) {
						return true;
					},
					content: function () {
						player.storage.qsmx_shunjia = [];
						var object = lib.character;
						var list = player.storage.qsmx_shunjia;
						for (const key in object) {
							if (Object.hasOwnProperty.call(object, key)) {
								if (lib.translate[key] !== undefined) {
									var name = lib.translate[key];
									if (
										lib.translate[key + "_prefix"] !==
										undefined
									)
										name = name.replace(
											lib.translate[key + "_prefix"],
											""
										);
									if (
										name.startsWith("孙") &&
										!player.storage.qsmx_shunjia.contains(
											key
										)
									) {
										list.push(key);
									}
								}
							}
						}
					},
					sub: true,
					_priority: 0,
					popup: false,
				},
			},
			_priority: 0,
		},
		qsmx_mingpan: {
			trigger: {
				player: "recoverEnd",
			},
			forced: true,
			audio: "ext:奇思妙想:2",
			content: function () {
				var num = trigger.num;
				player.draw(3 * num);
			},
			ai: {
				maihp: true,
			},
			_priority: 0,
		},
		qsmx_miehuan: {
			audio: "danshou",
			trigger: {
				source: "damageSource",
			},
			check: function (event, player) {
				return get.attitude(player, event.player) <= 0;
			},
			content: function () {
				"step 0";
				player.draw();
				var cards = Array.from(ui.ordering.childNodes);
				while (cards.length) {
					cards.shift().discard();
				}
				("step 1");
				trigger.untrigger();
			},
			ai: {
				jueqing: true,
			},
			_priority: 0,
		},
		qsmx_maxhp: {
			trigger: {
				player: "loseHpEnd",
			},
			forced: true,
			audio: "ext:奇思妙想:2",
			content: function () {
				var num = trigger.num;
				player.gainMaxHp(num);
			},
			_priority: 0,
		},
		qsmx_void: {
			audio: "ext:奇思妙想:2",
			trigger: {
				player: "damageBefore",
			},
			filter: function (event) {
				return true;
			},
			forced: true,
			content: function () {
				"step 0";
				trigger.cancel();
				player.loseHp();
				("step 1");
				player.draw(player.maxHp - player.hp);
			},
			ai: {
				dieBlocker: true,
				effect: {
					target: function (card, player, target, current) {
						if (get.tag(card, "damage")) return [1, -1];
					},
				},
			},
			_priority: 0,
		},
		qsmx_pingjian: {
			trigger: {
				player: ["useSkill", "logSkillBegin"],
			},
			forced: true,
			locked: false,
			filter: function (event, player) {
				var skill = event.sourceSkill || event.skill;
				return (
					player.invisibleSkills.contains(skill) &&
					lib.skill.qsmx_yingmen
						.getSkills(player.getStorage("qsmx_yingmen"), player)
						.contains(skill)
				);
			},
			content: function () {
				"step 0";
				var visitors = player.getStorage("qsmx_yingmen").slice(0);
				var drawers = visitors.filter(function (name) {
					return (
						Array.isArray(lib.character[name]) &&
						lib.character[name][3].contains(trigger.sourceSkill)
					);
				});
				event.drawers = drawers;
				if (visitors.length == 1)
					event._result = { bool: true, links: visitors };
				else {
					var dialog = ["评鉴：请选择移去一张“访客”"];
					if (drawers.length)
						dialog.push(
							'<div class="text center">如果移去' +
								get.translation(drawers) +
								"，则你摸一张牌</div>"
						);
					dialog.push([visitors, "character"]);
					player.chooseButton(dialog, true);
				}
				("step 1");
				if (result.bool) {
					lib.skill.qsmx_yingmen.removeVisitors(result.links, player);
					game.log(
						player,
						"移去了",
						"#y" + get.translation(result.links[0])
					);
					if (event.drawers.contains(result.links[0])) {
						player.addTempSkill("qsmx_pingjian_draw");
						player.storage.qsmx_pingjian_draw.push(trigger.skill);
					}
				}
			},
			group: "qsmx_pingjian_trigger",
			subSkill: {
				draw: {
					charlotte: true,
					init: function (player, skill) {
						if (!player.storage[skill]) player.storage[skill] = [];
					},
					onremove: true,
					trigger: {
						player: ["useSkillAfter", "logSkill"],
					},
					forced: true,
					popup: false,
					filter: function (event, player) {
						return player
							.getStorage("qsmx_pingjian_draw")
							.contains(event.skill);
					},
					content: function () {
						player.storage.qsmx_pingjian_draw.remove(trigger.skill);
						player.draw();
						if (!player.storage.qsmx_pingjian_draw.length)
							player.removeSkill("qsmx_pingjian_draw");
					},
					sub: true,
					_priority: 0,
				},
				trigger: {
					trigger: {
						player: "triggerInvisible",
					},
					forced: true,
					forceDie: true,
					popup: false,
					charlotte: true,
					priority: 10,
					filter: function (event, player) {
						if (event.revealed) return false;
						var info = get.info(event.skill);
						if (info.charlotte) return false;
						var skills = lib.skill.qsmx_yingmen.getSkills(
							player.getStorage("qsmx_yingmen"),
							player
						);
						game.expandSkills(skills);
						return skills.contains(event.skill);
					},
					content: function () {
						"step 0";
						if (get.info(trigger.skill).silent) {
							event.finish();
						} else {
							var info = get.info(trigger.skill);
							var event = trigger,
								trigger = event._trigger;
							var str;
							var check = info.check;
							if (info.prompt) str = info.prompt;
							else {
								if (typeof info.logTarget == "string") {
									str = get.prompt(
										event.skill,
										trigger[info.logTarget],
										player
									);
								} else if (
									typeof info.logTarget == "function"
								) {
									var logTarget = info.logTarget(
										trigger,
										player
									);
									if (
										get
											.itemtype(logTarget)
											.indexOf("player") == 0
									)
										str = get.prompt(
											event.skill,
											logTarget,
											player
										);
								} else {
									str = get.prompt(event.skill, null, player);
								}
							}
							if (typeof str == "function") {
								str = str(trigger, player);
							}
							var next = player.chooseBool("评鉴：" + str);
							next.set(
								"yes",
								!info.check || info.check(trigger, player)
							);
							next.set("hsskill", event.skill);
							next.set("forceDie", true);
							next.set("ai", function () {
								return _status.event.yes;
							});
							if (typeof info.prompt2 == "function") {
								next.set(
									"prompt2",
									info.prompt2(trigger, player)
								);
							} else if (typeof info.prompt2 == "string") {
								next.set("prompt2", info.prompt2);
							} else if (info.prompt2 != false) {
								if (lib.dynamicTranslate[event.skill])
									next.set(
										"prompt2",
										lib.dynamicTranslate[event.skill](
											player,
											event.skill
										)
									);
								else if (lib.translate[event.skill + "_info"])
									next.set(
										"prompt2",
										lib.translate[event.skill + "_info"]
									);
							}
							if (trigger.skillwarn) {
								if (next.prompt2) {
									next.set(
										"prompt2",
										'<span class="thundertext">' +
											trigger.skillwarn +
											"。</span>" +
											next.prompt2
									);
								} else {
									next.set("prompt2", trigger.skillwarn);
								}
							}
						}
						("step 1");
						if (result.bool) {
							trigger.revealed = true;
						} else {
							trigger.untrigger();
							trigger.cancelled = true;
						}
					},
					sub: true,
					_priority: 1000,
				},
			},
			_priority: 0,
		},
		qsmx_yingmen: {
			trigger: {
				global: "phaseBefore",
				player: "enterGame",
			},
			forced: true,
			filter: function (event, player) {
				return event.name != "phase" || game.phaseNumber == 0;
			},
			content: function () {
				"step 0";
				var list = _status.characterlist;
				_status.yingmen_list = list;
				("step 1");
				var list = _status.yingmen_list.removeArray(
					player.getStorage("qsmx_yingmen")
				);
				list = list.randomSort();
				if (player.getStorage("qsmx_yingmen") == undefined) {
					var can_select_num = 4;
				} else {
					var can_select_num =
						4 - player.getStorage("qsmx_yingmen").length;
				}
				var dialog = ui.create.dialog("选择一张武将牌", "hidden");
				dialog.add([list, "character"]);
				player
					.chooseButton(dialog, can_select_num, true)
					.set("ai", function (button) {
						var name = button.link;
						var info = lib.character[name];
						var skills = info[3].filter(function (skill) {
							var info = get.skillInfoTranslation(skill);
							var list = get.skillCategoriesOf(skill);
							return list.length == 0;
						});
						var eff = 0.2;
						for (var i of skills) {
							eff += get.skillRank(i);
						}
						return eff;
					});
				("step 2");
				lib.skill.pingjian.initList();
				var characters = result.links;
				lib.skill.qsmx_yingmen.addVisitors(characters, player);
				_status.characterlist.removeArray(characters);
				game.delayx();
			},
			group: "qsmx_yingmen_reload",
			subSkill: {
				reload: {
					trigger: {
						player: "phaseBegin",
					},
					forced: true,
					locked: false,
					filter: function (event, player) {
						return player.getStorage("qsmx_yingmen").length < 4;
					},
					content: function () {
						"step 0";
						var list = _status.yingmen_list.removeArray(
							player.getStorage("qsmx_yingmen")
						);
						list = list.randomSort();
						if (player.getStorage("qsmx_yingmen") == undefined) {
							var can_select_num = 4;
						} else {
							var can_select_num =
								4 - player.getStorage("qsmx_yingmen").length;
						}
						var dialog = ui.create.dialog(
							"选择一张武将牌",
							"hidden"
						);
						dialog.add([list, "character"]);
						player
							.chooseButton(dialog, can_select_num, true)
							.set("ai", function (button) {
								var name = button.link;
								var info = lib.character[name];
								var skills = info[3].filter(function (skill) {
									var info = get.skillInfoTranslation(skill);
									var list = get.skillCategoriesOf(skill);
									return list.length == 0;
								});
								var eff = 0.2;
								for (var i of skills) {
									eff += get.skillRank(i);
								}
								return eff;
							});
						("step 1");
						lib.skill.pingjian.initList();
						var characters = result.links;
						lib.skill.qsmx_yingmen.addVisitors(characters, player);
						game.delayx();
					},
					sub: true,
					_priority: 0,
				},
			},
			getSkills: function (characters, player) {
				var skills = [];
				for (var name of characters) {
					if (Array.isArray(lib.character[name])) {
						for (var skill of lib.character[name][3]) {
							var list = get.skillCategoriesOf(skill, player);
							list.remove("锁定技");
							if (list.length > 0) continue;
							var info = get.info(skill);
							if (info && (!info.unique || info.gainable)) {
								// lib.skill.rehuashen.createAudio(name,skill,'jsrg_xushao');
								skills.add(skill);
							}
						}
					}
				}
				return skills;
			},
			addVisitors: function (characters, player) {
				player.addSkillBlocker("qsmx_yingmen");
				game.log(
					player,
					"将",
					"#y" + get.translation(characters),
					"加入了",
					"#g“访客”"
				);
				game.broadcastAll(
					function (player, characters) {
						player.tempname.addArray(characters);
						player.$draw(
							characters.map(function (name) {
								var cardname = "huashen_card_" + name;
								lib.card[cardname] = {
									fullimage: true,
									image: "character:" + name,
								};
								lib.translate[cardname] = get.rawName2(name);
								return game.createCard(cardname, " ", " ");
							}),
							"nobroadcast"
						);
					},
					player,
					characters
				);
				player.markAuto("qsmx_yingmen", characters);
				var storage = player.getStorage("qsmx_yingmen");
				var skills = lib.skill.qsmx_yingmen.getSkills(storage, player);
				player.addInvisibleSkill(skills);
			},
			removeVisitors: function (characters, player) {
				var skills = lib.skill.qsmx_yingmen.getSkills(
					characters,
					player
				);
				var characters2 = player.getStorage("qsmx_yingmen").slice(0);
				characters2.removeArray(characters);
				skills.removeArray(
					lib.skill.qsmx_yingmen.getSkills(characters2, player)
				);
				game.broadcastAll(
					(player, characters) =>
						player.tempname.removeArray(characters),
					player,
					characters
				);
				player.unmarkAuto("qsmx_yingmen", characters);
				_status.characterlist.addArray(characters);
				player.removeInvisibleSkill(skills);
			},
			onremove: function (player, skill) {
				lib.skill.qsmx_yingmen.removeVisitors(
					player.getSkills("qsmx_yingmen"),
					player
				);
				player.removeSkillBlocker("qsmx_yingmen");
			},
			skillBlocker: function (skill, player) {
				if (
					!player.invisibleSkills.contains(skill) ||
					skill == "qsmx_pingjian" ||
					skill == "qsmx_pingjian"
				)
					return false;
				return !player.hasSkill("qsmx_pingjian");
			},
			marktext: "客",
			intro: {
				name: "访客",
				mark: function (dialog, storage, player) {
					if (!storage || !storage.length) return "当前没有“访客”";
					dialog.addSmall([storage, "character"]);
					var skills = lib.skill.qsmx_yingmen.getSkills(
						storage,
						player
					);
					if (skills.length)
						dialog.addText(
							"<li>当前可用技能：" + get.translation(skills),
							false
						);
				},
			},
			_priority: 0,
		},
		qsmx_huiwan: {
			audio: "ext:奇思妙想:2",
			trigger: {
				player: "drawBegin",
			},
			forced: true,
			filter: function (event, player) {
				return true;
			},
			content: function () {
				"step 0";
				event.auto = _status.auto;
				event.HuiwanCards = [];
				event.count = trigger.num;
				("step 1");
				var list = [];
				for (var i = 0; i < lib.inpile.length; i++) {
					var name = lib.inpile[i];
					var type = get.type(name);
					list.push([type, "", name]);
					if (
						lib.card[name].nature !== undefined &&
						lib.card[name].nature.length > 0
					) {
						for (var j of lib.inpile_nature)
							list.push([type, "", name, j]);
					}
				}
				var next = player.chooseButton(
					["会玩", [list, "vcard"]],
					1,
					true
				);
				next.set("filterButton", function (button) {
					var n = [];
					var cardPile = Array.from(ui.cardPile.childNodes);
					for (var c = 0; c < cardPile.length; c++) {
						if (cardPile[c].name == button.link[2]) {
							n.push(cardPile[c].name);
						}
						if (cardPile[c].nature == button.link[3]) {
							n.push(cardPile[c].nature);
						}
					}
					if (
						n.includes(button.link[2]) &&
						n.includes(button.link[3])
					)
						return true;
				});
				("step 2");
				if (result.bool) {
					var choice = result.links[0];
					var cardPile = Array.from(ui.cardPile.childNodes);
					var list = cardPile;
					var cards = [];
					for (let index = 0; index < list.length; index++) {
						const card = list[index];
						if (card.name == choice[2] && card.nature == choice[3])
							cards.push(card);
					}
					if (event.auto) {
						var CanBeChoice = 1;
					} else {
						var CanBeChoice = event.count;
					}
					player.chooseCardButton("会玩", cards, [1, CanBeChoice]);
				}
				("step 3");
				if (result.bool) {
					var cards = result.links;
					event.count -= result.links.length;
					player
						.addToExpansion(player, cards, "give")
						.gaintag.add(event.name);
				}
				("step 4");
				if (event.count > 0) {
					event.goto(1);
				}
				("step 5");
				var cards = player.getExpansions(event.name);
				cards.reverse();
				while (cards.length) {
					if (trigger.bottom) {
						var card = cards.shift();
						ui.cardPile.appendChild(card);
					} else {
						var card = cards.pop();
						ui.cardPile.insertBefore(card, ui.cardPile.firstChild);
					}
				}
			},
			_priority: -100,
		},
		qsmx_yishua: {
			enable: ["chooseToUse"],
			filterCard(card, player) {
				return get.name(card) == "qsmx_paper";
			},
			lose: false,
			discard: false,
			position: "hes",
			content: function () {
				"step 0";
				var list = [];
				event.suitx = [];
				event.suitx = event.suitx.concat(lib.suit);
				for (var x = 0; x < 4; x++) {
					for (var i = 1; i < 14; i++) {
						list.add(i);
					}
				}
				list.push("cancel2");
				event.suitx.push("cancel2");
				player
					.chooseControl(list)
					.set("choice", event.numberchoice).prompt =
					"【印刷】:请选择牌的点数";
				("step 1");
				if (result.control !== "cancel2") {
					event.cardNumber = result.control;
				} else {
					event.finish();
				}
				("step 2");
				player
					.chooseControl(event.suitx)
					.set("choice", event.suitchoice).prompt =
					"【印刷】：请选择牌的花色";
				("step 3");
				if (result.control !== "cancel2") {
					event.cardSuit = result.control;
				} else {
					event.finish();
				}
				("step 4");
				var everycards = [];
				var object = lib.cardPack;
				for (const key in object) {
					if (Object.hasOwnProperty.call(object, key)) {
						const element = object[key];
						everycards.addArray(element);
					}
				}
				var list = [];
				for (var i = 0; i < everycards.length; i++) {
					var name = everycards[i];
					var type = get.type(name);
					list.push([type, "", name]);
					if (
						lib.card[name].nature !== undefined &&
						lib.card[name].nature.length > 0
					) {
						for (var j of lib.card[name].nature)
							list.push([type, "", name, j]);
					}
				}
				var dialog = ui.create.dialog("印刷", [list, "vcard"]);
				player.chooseButton(dialog);
				("step 5");
				if (result.bool) {
					var card = {
						name: result.links[0][2],
						suit: event.cardSuit,
						number: event.cardNumber,
						nature: result.links[0][3],
					};
					player.discard(event.cards);
					player.gain(game.createCard(card));
				}
			},
			ai: {
				threaten: function (player, target) {
					return 1.6;
				},
			},
			_priority: 0,
		},
		qsmx_craft: {
			enable: "phaseUse",
			filter: function (event, player) {
				var he = player.getCards("he");
				var num = 0;
				for (var i = 0; i < he.length; i++) {
					var info = lib.card[he[i].name];
					if (info.type == "equip" && !info.nomod && !info.unique) {
						num++;
						if (num >= 2) return true;
					}
				}
			},
			filterCard: function (card) {
				if (
					ui.selected.cards.length &&
					card.name == ui.selected.cards[0].name
				)
					return false;
				var info = get.info(card);
				return info.type == "equip" && !info.nomod && !info.unique;
			},
			selectCard: 2,
			position: "he",
			check: function (card) {
				return get.value(card);
			},
			content: function () {
				var name = cards[0].name + "_" + cards[1].name;
				var info1 = get.info(cards[0]),
					info2 = get.info(cards[1]);
				if (!lib.card[name]) {
					var info = {
						enable: true,
						type: "equip",
						subtype: get.subtype(cards[0]),
						vanish: true,
						cardimage: info1.cardimage || cards[0].name,
						filterTarget: function (card, player, target) {
							return target == player;
						},
						selectTarget: -1,
						modTarget: true,
						content: lib.element.content.equipCard,
						legend: true,
						source: [cards[0].name, cards[1].name],
						onEquip: [],
						onLose: [],
						skills: [],
						distance: {},
						ai: {
							order: 8.9,
							equipValue: 10,
							useful: 2.5,
							value: function (card, player) {
								var value = 0;
								var info = get.info(card);
								var current = player.getEquip(info.subtype);
								if (current && card != current) {
									value = get.value(current, player);
								}
								var equipValue =
									info.ai.equipValue ||
									info.ai.basic.equipValue;
								if (typeof equipValue == "function")
									return equipValue(card, player) - value;
								return equipValue - value;
							},
							result: {
								target: function (player, target) {
									return get.equipResult(
										player,
										target,
										name
									);
								},
							},
						},
					};
					for (var i in info1.distance) {
						info.distance[i] = info1.distance[i];
					}
					for (var i in info2.distance) {
						if (typeof info.distance[i] == "number") {
							info.distance[i] += info2.distance[i];
						} else {
							info.distance[i] = info2.distance[i];
						}
					}
					if (info1.skills) {
						info.skills = info.skills.concat(info1.skills);
					}
					if (info2.skills) {
						info.skills = info.skills.concat(info2.skills);
					}
					if (info1.onEquip) {
						if (Array.isArray(info1.onEquip)) {
							info.onEquip = info.onEquip.concat(info1.onEquip);
						} else {
							info.onEquip.push(info1.onEquip);
						}
					}
					if (info2.onEquip) {
						if (Array.isArray(info2.onEquip)) {
							info.onEquip = info.onEquip.concat(info2.onEquip);
						} else {
							info.onEquip.push(info2.onEquip);
						}
					}
					if (info1.onLose) {
						if (Array.isArray(info1.onLose)) {
							info.onLose = info.onLose.concat(info1.onLose);
						} else {
							info.onLose.push(info1.onLose);
						}
					}
					if (info2.onLose) {
						if (Array.isArray(info2.onLose)) {
							info.onLose = info.onLose.concat(info2.onLose);
						} else {
							info.onLose.push(info2.onLose);
						}
					}
					if (info.onEquip.length == 0) delete info.onEquip;
					if (info.onLose.length == 0) delete info.onLose;
					lib.card[name] = info;
					lib.translate[name] =
						get.translation(cards[0].name, "skill") +
						get.translation(cards[1].name, "skill");
					var str = lib.translate[cards[0].name + "_info"];
					if (
						str[str.length - 1] == "." ||
						str[str.length - 1] == "。"
					) {
						str = str.slice(0, str.length - 1);
					}
					lib.translate[name + "_info"] =
						str + "；" + lib.translate[cards[1].name + "_info"];
					try {
						game.addVideo("newcard", null, {
							name: name,
							translate: lib.translate[name],
							info: lib.translate[name + "_info"],
							card: cards[0].name,
							legend: true,
						});
					} catch (e) {
						console.log(e);
					}
				}
				player.gain(
					game.createCard({
						name: name,
						suit: cards[0].suit,
						number: cards[0].number,
					}),
					"gain2"
				);
			},
			ai: {
				order: 9.5,
				result: {
					player: 1,
				},
			},
			_priority: 0,
		},
		qsmx_dingjun: {
			usable: 1,
			enable: "phaseUse",
			complexCard: true,
			selectCard: [1, Infinity],
			check: function (card) {
				return true;
			},
			filterCard: function (card) {
				var suit = get.suit(card);
				for (var i = 0; i < ui.selected.cards.length; i++) {
					if (get.suit(ui.selected.cards[i]) == suit) return false;
				}
				return true;
			},
			discard: false,
			lose: false,
			onremove: function (player, skill) {
				var cards = player.getExpansions(skill);
				if (cards.length) player.loseToDiscardpile(cards);
			},
			marktext: "军",
			intro: {
				content: "expansion",
				markcount: "expansion",
			},
			content: function () {
				"step 0";
				player
					.addToExpansion(player, cards, "give")
					.gaintag.add(event.name);
				player.addTempSkill("qsmx_dingjun_temp");
				var targets = game.filterPlayer((current) => current != player);
				var suits = cards.map((c) => get.suit(c, player));
				for (var target of targets) {
					target.addTempSkill("qsmx_dingjun_ban");
					target.markAuto("qsmx_dingjun_ban", suits);
				}
			},
			subSkill: {
				temp: {
					onremove: function (player, skill) {
						var cards = player.getExpansions("qsmx_dingjun");
						if (cards.length) player.gain(cards);
					},
					sub: true,
					_priority: 0,
				},
				ban: {
					onremove: true,
					charlotte: true,
					mod: {
						cardEnabled: function (card, player) {
							if (
								player
									.getStorage("qsmx_dingjun_ban")
									.contains(get.suit(card))
							)
								return false;
						},
						cardRespondable: function (card, player) {
							if (
								player
									.getStorage("qsmx_dingjun_ban")
									.contains(get.suit(card))
							)
								return false;
						},
						cardSavable: function (card, player) {
							if (
								player
									.getStorage("qsmx_dingjun_ban")
									.contains(get.suit(card))
							)
								return false;
						},
					},
					mark: true,
					marktext: "军",
					intro: {
						content: "本回合内不能使用或打出$的牌",
					},
					sub: true,
					_priority: 0,
				},
			},
			ai: {
				order: 13,
				result: {
					player: 1,
				},
			},
			_priority: 0,
		},
		qsmx_guangxin: {
			trigger: {
				global: ["drawBegin", "judgeBegin"],
			},
			direct: true,
			filter: function () {
				return ui.cardPile.childNodes.length > 0;
			},
			content: function () {
				"step 0";
				player.chooseButton(
					[
						"印卡：请选择要置于牌堆" +
							(trigger.bottom ? "底" : "顶") +
							"的牌（先选择的在上）",
						Array.from(ui.cardPile.childNodes),
					],
					[1, trigger.num || 1]
				);
				("step 1");
				if (result.bool) {
					while (result.links.length) {
						if (trigger.bottom) {
							var card = result.links.shift();
							ui.cardPile.removeChild(card);
							ui.cardPile.appendChild(card);
						} else {
							var card = result.links.pop();
							ui.cardPile.removeChild(card);
							ui.cardPile.insertBefore(
								card,
								ui.cardPile.firstChild
							);
						}
					}
				}
			},
			ai: {
				isLuckyStar: true,
			},
			_priority: 0,
		},
		qsmx_mingqu: {
			forced: true,
			silent: true,
			firstDo: true,
			mark: true,
			marktext: "冥",
			intro: {
				content: function (storage, player) {
					return (
						"记录了" +
						get.translation(storage) +
						"共" +
						get.cnNumber(storage.length) +
						"种颜色"
					);
				},
			},
			group: ["qsmx_mingqu_phaseEnd", "qsmx_mingqu_mark"],
			mod: {
				maxHandcard: function (player, num) {
					return player.maxHp;
				},
			},
			trigger: {
				global: "gameStart",
				player: "enterGame",
			},
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_baozheng")) {
					player.removeSkill(skill);
				} else {
					player.storage[skill] = [];
					player.initCharacterLocker();
				}
			},
			onremove: function (player, skill) {
				player.addSkill(skill);
			},
			filter: function (event, player) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_baozheng")) return false;
				return true;
			},
			content: function () {
				player.initDieResistance();
				player.initDyingResistance();
				player.initControlResistance();
				player.initMadResistance();
				player.initSkillResistance();
				player.initHpLocker(player.hp);
				player.initmaxHpLocker(player.maxHp);
			},
			subSkill: {
				phaseEnd: {
					trigger: {
						global: "phaseEnd",
					},
					forced: true,
					charlotte: true,
					popup: false,
					silent: true,
					lastDo: true,
					filter: function (event, player) {
						if (player.name !== "qsmx_baozheng") return false;
						return true;
					},
					content: function () {
						if (player.getStorage("qsmx_mingqu").length >= 3) {
							player.AntiResistanceDie();
						} else {
							player.unmarkSkill("qsmx_mingqu");
						}
					},
					sub: true,
					_priority: 1,
				},
				mark: {
					charlotte: true,
					forced: true,
					silent: true,
					trigger: {
						player: "damageEnd",
					},
					filter: function (event, player) {
						var currentPhase = _status.currentPhase;
						if (!currentPhase) return false;
						var handcard = currentPhase.getCards("h");
						var number_num = handcard.map((c) =>
							get.number(c)
						).length;
						if (!event.nature) return false;
						if (event.num !== number_num + 1) return false;
						if (!event.card || !event.cards) return false;
						return true;
					},
					content: function () {
						var card = trigger.card;
						player.markAuto("qsmx_mingqu", get.color(card));
					},
					_priority: 0,
					sub: true,
					popup: false,
				},
			},
			ai: {
				HpResistance: true,
				maxHpResistance: true,
				DieResistance: true,
			},
			popup: false,
			audioname2: {
				key_shiki: "shiki_omusubi",
			},
			_priority: 1,
		},
		qsmx_guiwang: {
			audio: "ext:奇思妙想:true",
			forced: true,
			trigger: {
				player: ["turnOverAfter", "linkAfter"],
			},
			filter: function (event, player) {
				if (player.name !== "qsmx_baozheng") return false;
				return true;
			},
			content: function () {
				"step 0";
				var next = player.judge(function (result) {
					return get.color(result) == "black" ? 2 : -2;
				});
				//next.noJudgeTrigger=true;
				("step 1");
				if (result.bool == true) {
					player.draw(3);
				} else {
					player.draw(1);
				}
			},
			group: ["qsmx_guiwang_turnOver"],
			subSkill: {
				turnOver: {
					trigger: {
						player: ["loseAfter", "phaseEnd"],
					},
					forced: true,
					filter: function (event, player) {
						if (player.countCards("h")) return false;
						return true;
					},
					content: function () {
						player.turnOver();
					},
					sub: true,
					_priority: 0,
				},
			},
			ai: {
				effect: function (card, player, target) {
					if (card.name == "tiesuo") {
						return [1, 5];
					}
				},
			},
			_priority: 0,
		},
		qsmx_tiemian: {
			audio: "ext:奇思妙想:2",
			trigger: {
				target: "useCardToTargeted",
			},
			forced: true,
			logTarget: "player",
			filter: function (event, player) {
				return event.card.name == "sha";
			},
			content: function () {
				"step 0";
				player.judge(function (result) {
					if (get.color(result) == "black") return 2;
					return -1;
				}).judge2 = function (result) {
					return result.bool;
				};
				("step 1");
				if (result.bool) {
					trigger.targets.remove(player);
					trigger.getParent().triggeredTargets2.remove(player);
					trigger.untrigger();
				}
			},
			ai: {
				effect: {
					target: function (card, player, target, current, isLink) {
						if (card.name == "sha" && !isLink) return 0.5;
					},
				},
			},
			_priority: 0,
		},
		qsmx_jijun: {
			usable: 1,
			enable: "phaseUse",
			complexCard: true,
			selectCard: [1, Infinity],
			check: function (card) {
				return true;
			},
			filterCard: function (card) {
				return true;
			},
			discard: false,
			lose: false,
			onremove: function (player, skill) {
				var cards = player.getExpansions(skill);
				if (cards.length) player.loseToDiscardpile(cards);
			},
			marktext: "军",
			intro: {
				content: "expansion",
				markcount: "expansion",
			},
			content: function () {
				player
					.addToExpansion(player, cards, "give")
					.gaintag.add(event.name);
				player.addTempSkill("qsmx_dingjun_temp");
			},
			subSkill: {
				temp: {
					onremove: function (player, skill) {
						var cards = player.getExpansions("qsmx_dingjun");
						if (cards.length) player.gain(cards);
					},
					sub: true,
					_priority: 0,
				},
			},
			ai: {
				order: 1,
				result: {
					player: 1,
				},
			},
			_priority: 0,
		},
		qsmx_tieqi: {
			forced: true,
			charlotte: true,
			trigger: {
				player: "phaseBefore",
			},
			filter: function (event, player) {
				return true;
			},
			content: function () {
				"step 0";
				var prompt = "【铁骑】：选择一名其他角色复原函数。";
				player
					.chooseTarget(prompt, lib.filter.notMe)
					.set("ai", function (target) {
						return -get.attitude(player, target);
					});
				("step 1");
				if (result.bool) {
					var target = result.targets[0];
					lib.skill.qsmx_hacker.resetFuction(target);
				}
			},
			_priority: 0,
		},
		qsmx_dinghhuo: {
			audio: "nzry_dinghuo",
			enable: ["chooseToUse"],
			filterCard: function (card) {
				var type = get.type(card);
				var viewAsType = ["delay", "trick", "basic"];
				if (!viewAsType.includes(type)) return false;
				for (var i = 0; i < ui.selected.cards.length; i++) {
					if (get.type(ui.selected.cards[i]) !== type) return false;
				}
				return true;
			},
			position: "hesj",
			viewAs: function (cards, player) {
				var name = false;
				var nature = null;
				switch (get.type(cards[0], player)) {
					case "delay":
						name = "huoshan";
						break;
					case "trick":
						name = "huoshaolianying";
						break;
					case "basic":
						name = "sha";
						nature = "fire";
						break;
				}
				if (name) return { name: name, nature: nature };
				return null;
			},
			viewAsFilter: function (player) {
				if (player.countCards("hes")) return true;
			},
			prompt: "将普通锦囊牌当【火烧连营】，延时锦囊牌当【火山】，基本牌当【火杀】",
			check: function (card) {
				var val = get.value(card);
				return 5 - val;
			},
			group: ["qsmx_dinghhuo_source", "qsmx_dinghhuo_player"],
			subSkill: {
				source: {
					trigger: {
						source: "damageBegin1",
					},
					forced: true,
					filter: function (event, player) {
						return event.hasNature();
					},
					content: function () {
						trigger.num++;
					},
					_priority: 0,
					sub: true,
				},
				player: {
					trigger: {
						player: "damageBegin4",
					},
					forced: true,
					filter: function (event, player) {
						return event.hasNature();
					},
					content: function () {
						trigger.num--;
					},
					_priority: 0,
					sub: true,
				},
			},
			ai: {
				skillTagFilter: function (player) {
					if (!player.countCards("hes")) return false;
				},
				respondSha: true,
				yingbian: function (card, player, targets, viewer) {
					if (get.attitude(viewer, player) <= 0) return 0;
					var base = 0,
						hit = false;
					if (get.cardtag(card, "yingbian_hit")) {
						hit = true;
						if (
							targets.some((target) => {
								return (
									target.mayHaveShan(viewer) &&
									get.attitude(viewer, target) < 0 &&
									get.damageEffect(
										target,
										player,
										viewer,
										get.natureList(card)
									) > 0
								);
							})
						)
							base += 5;
					}
					if (get.cardtag(card, "yingbian_add")) {
						if (
							game.hasPlayer(function (current) {
								return (
									!targets.contains(current) &&
									lib.filter.targetEnabled2(
										card,
										player,
										current
									) &&
									get.effect(current, card, player, player) >
										0
								);
							})
						)
							base += 5;
					}
					if (get.cardtag(card, "yingbian_damage")) {
						if (
							targets.some((target) => {
								return (
									get.attitude(player, target) < 0 &&
									(hit ||
										!target.mayHaveShan(viewer) ||
										player.hasSkillTag(
											"directHit_ai",
											true,
											{
												target: target,
												card: card,
											},
											true
										)) &&
									!target.hasSkillTag("filterDamage", null, {
										player: player,
										card: card,
										jiu: true,
									})
								);
							})
						)
							base += 5;
					}
					return base;
				},
				canLink: function (player, target, card) {
					if (
						!target.isLinked() &&
						!player.hasSkill("wutiesuolian_skill")
					)
						return false;
					if (
						target.mayHaveShan() &&
						!player.hasSkillTag(
							"directHit_ai",
							true,
							{
								target: target,
								card: card,
							},
							true
						)
					)
						return false;
					if (
						player.hasSkill("jueqing") ||
						player.hasSkill("gangzhi") ||
						target.hasSkill("gangzhi")
					)
						return false;
					return true;
				},
				basic: {
					useful: [5, 3, 1],
					value: [5, 3, 1],
				},
				order: function (item, player) {
					if (player.hasSkillTag("presha", true, null, true))
						return 10;
					if (game.hasNature(item, "linked")) {
						if (
							game.hasPlayer(function (current) {
								return (
									current != player &&
									current.isLinked() &&
									player.canUse(item, current, null, true) &&
									get.effect(current, item, player, player) >
										0 &&
									lib.card.sha.ai.canLink(
										player,
										current,
										item
									)
								);
							}) &&
							game.countPlayer(function (current) {
								return (
									current.isLinked() &&
									get.damageEffect(
										current,
										player,
										player,
										get.nature(item)
									) > 0
								);
							}) > 1
						)
							return 3.1;
						return 3;
					}
					return 3.05;
				},
				result: {
					target: function (player, target, card, isLink) {
						var eff = (function () {
							if (!isLink && player.hasSkill("jiu")) {
								if (
									!target.hasSkillTag("filterDamage", null, {
										player: player,
										card: card,
										jiu: true,
									})
								) {
									if (get.attitude(player, target) > 0) {
										return -7;
									} else {
										return -4;
									}
								}
								return -0.5;
							}
							return -1.5;
						})();
						if (
							!isLink &&
							target.mayHaveShan() &&
							!player.hasSkillTag(
								"directHit_ai",
								true,
								{
									target: target,
									card: card,
								},
								true
							)
						)
							return eff / 1.2;
						return eff;
					},
				},
				tag: {
					respond: 1,
					respondShan: 1,
					damage: function (card) {
						if (game.hasNature(card, "poison")) return;
						return 1;
					},
					natureDamage: function (card) {
						if (game.hasNature(card, "linked")) return 1;
					},
					fireDamage: function (card, nature) {
						if (game.hasNature(card, "fire")) return 1;
					},
					thunderDamage: function (card, nature) {
						if (game.hasNature(card, "thunder")) return 1;
					},
					poisonDamage: function (card, nature) {
						if (game.hasNature(card, "poison")) return 1;
					},
				},
				value: 6,
			},
			_priority: 0,
		},
		qsmx_qianxun: {
			mod: {
				targetEnabled: function (card, player, target, now) {
					if (card.name == "shunshou" || card.name == "lebu")
						return false;
				},
			},
			audio: "qianxun",
			_priority: 0,
		},
		qmsx_lianying: {
			audio: "lianying",
			trigger: {
				player: "loseAfter",
				global: [
					"equipAfter",
					"addJudgeAfter",
					"gainAfter",
					"loseAsyncAfter",
					"addToExpansionAfter",
				],
			},
			frequent: true,
			filter: function (event, player) {
				if (player.countCards("h")) return false;
				var evt = event.getl(player);
				return (
					evt && evt.player == player && evt.hs && evt.hs.length > 0
				);
			},
			content: function () {
				var evt = player.draw();
			},
			group: ["qmsx_lianying_link"],
			subSkill: {
				link: {
					locked: false,
					enable: "phaseUse",
					filterCard: true,
					selectCard: [1, Infinity],
					position: "hesj",
					discard: false,
					lose: false,
					filterTarget(card, player, target) {
						return !target.isLinked();
					},
					delay: 0,
					content: function () {
						player.give(event.cards, event.target);
						event.target.link();
					},
					ai: {
						order: 1,
						result: {
							player: 1,
						},
						threaten: 1.5,
					},
					_priority: 0,
					sub: true,
				},
			},
			ai: {
				threaten: 0.8,
				effect: {
					target: function (card) {
						if (card.name == "guohe" || card.name == "liuxinghuoyu")
							return 0.5;
					},
				},
				noh: true,
				skillTagFilter: function (player, tag) {
					if (tag == "noh") {
						if (player.countCards("h") != 1) return false;
					}
				},
			},
			_priority: 0,
		},
		qsmx_hunyou: {
			forced: true,
			silent: true,
			firstDo: true,
			mark: true,
			group: ["qsmx_hunyou_dying", "qsmx_hunyou_dyingAfter"],
			trigger: {
				global: "gameStart",
				player: "enterGame",
			},
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_sunce")) {
					player.removeSkill(skill);
				} else {
					player.initCharacterLocker();
				}
			},
			onremove: function (player, skill) {
				player.addSkill(skill);
			},
			filter: function (event, player) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_sunce")) return false;
				return true;
			},
			content: function () {
				player.initDieResistance();
				player.initSkillResistance();
				player.initControlResistance();
				player.initMadResistance();
				player.initmaxHpLocker(player.maxHp);
			},
			subSkill: {
				dying: {
					charlotte: true,
					forced: true,
					silent: true,
					trigger: {
						player: "dying",
					},
					filter: function (event, player) {
						return true;
					},
					content: function () {
						player.addSkill("reyingzi");
						player.addSkill("hongyan");
						var evt = trigger.getParent();
						if (
							evt.name == "damage" &&
							(evt.card || evt.cards) &&
							get.color(evt.card) == "red" &&
							get.is.ordinaryCard(evt.card)
						) {
							player.changeHp(-player.hp, false);
						} else {
							player.changeHp(1 - player.hp, false);
						}
						player.addTempSkill("qianxing");
						player.addTempSkill("mianyi");
					},
					_priority: 0,
					sub: true,
					popup: false,
				},
				dyingAfter: {
					charlotte: true,
					forced: true,
					silent: true,
					trigger: {
						player: "dyingAfter",
					},
					filter: function (event, player) {
						return player.hp <= 0;
					},
					content: function () {
						player.AntiResistanceDie();
					},
					_priority: 0,
					sub: true,
					popup: false,
				},
			},
			ai: {
				maxHpResistance: true,
				DieResistance: true,
			},
			init: (player, skill) => (player.storage[skill] = []),
			popup: false,
			audioname2: {
				key_shiki: "shiki_omusubi",
			},
			_priority: 1,
		},
		qsmx_jiang: {
			audio: "jiang",
			preHidden: true,
			audioname: ["sp_lvmeng", "re_sunben", "re_sunce"],
			mod: {
				aiValue(player, card, num) {
					if (card.name === "zhangba") {
						return 114154;
					}
				},
				cardUsable: function (card, player) {
					const color = get.color(card, player);
					//颜色为"unsure"时放行
					if (color == "unsure" || color == "red") return Infinity;
				},
				ignoredHandcard: function (card, player) {
					if (get.color(card, player) == "red") {
						return true;
					}
				},
				cardDiscardable: function (card, player, name) {
					if (
						name == "phaseDiscard" &&
						get.color(card, player) == "red"
					)
						return false;
				},
			},
			trigger: {
				player: ["loseAfter"],
			},
			filter: function (event, player) {
				var cards = event.cards;
				var colors = cards.map((c) => get.color(c, player));
				if (colors.includes("red")) return true;
			},
			group: ["qsmx_jiang_directHit"],
			locked: false,
			frequent: true,
			content: function () {
				var cards = trigger.cards;
				var redCards = cards.filter(
					(c) => get.color(c, player) == "red"
				);
				player.draw(redCards.length);
				var length = redCards.length;
				while (length) {
					length--;
					player.useCard({ name: "jiu" }, player);
				}
			},
			subSkill: {
				directHit: {
					audio: 2,
					shaRelated: true,
					trigger: {
						player: "useCard",
					},
					filter(event, player) {
						var card = event.card;
						if (event.targets.includes(player)) return false;
						return get.color(card, player) == "red";
					},
					logTarget: "target",
					forced: true,
					preHidden: true,
					async content(event, trigger, player) {
						trigger.directHit.addArray(trigger.targets);
					},
					_priority: 0,
					sub: true,
				},
			},
			ai: {
				jiuSustain: true,
				effect: {
					target: function (card, player, target) {
						if (get.color(card) == "red") return [1, 0.6];
					},
					player: function (card, player, target) {
						if (get.color(card) == "red") return [1, 1];
					},
				},
			},
			_priority: 0,
		},
		qsmx_taoni: {
			forced: true,
			group: ["qsmx_taoni_judgeFixing"],
			trigger: {
				global: ["judgeCancelled"],
			},
			filter: function (event, player) {
				if (player.name !== "qsmx_sunce") return false;
				return true;
			},
			content: function () {
				"step 0";
				"step 1";
				var prompt = "【讨逆】：你可以选择一名其他角色作为讨伐对象。";
				var toSortPlayers = game.players.filter((c) => c != player);
				var next = player.chooseButton([1, 1]).set("createDialog", [
					prompt,
					[
						toSortPlayers.map((i) => `${i.playerid}|${i.name}`),
						(item, type, position, noclick, node) => {
							const info = item.split("|"),
								_item = item;
							const playerid = parseInt(info[0]);
							item = info[1];
							if (node) {
								node.classList.add("button");
								node.classList.add("player");
								node.style.display = "";
							} else {
								node = ui.create.div(
									".button.character",
									position
								);
							}
							node._link = item;
							node.link = item;

							const func = function (node, item) {
								if (item != "unknown")
									node.setBackground(item, "character");
								if (node.node) {
									node.node.name.remove();
									node.node.hp.remove();
									node.node.group.remove();
									node.node.intro.remove();
									if (node.node.replaceButton)
										node.node.replaceButton.remove();
								}
								node.node = {
									name: ui.create.div(".name", node),
									group: ui.create.div(".identity", node),
									intro: ui.create.div(".intro", node),
								};
								const currentPlayer = game.players.find(
									(current) => current.playerid == playerid
								);
								const infoitem = [
									currentPlayer.sex,
									currentPlayer.group,
									`${currentPlayer.hp}/${currentPlayer.maxHp}/${currentPlayer.hujia}`,
								];
								node.node.name.innerHTML = get.slimName(item);
								if (
									lib.config.buttoncharacter_style ==
										"default" ||
									lib.config.buttoncharacter_style == "simple"
								) {
									if (
										lib.config.buttoncharacter_style ==
										"simple"
									) {
										node.node.group.style.display = "none";
									}
									node.classList.add("newstyle");
									node.node.name.dataset.nature =
										get.groupnature(
											get.bordergroup(infoitem)
										);
									node.node.group.dataset.nature =
										get.groupnature(
											get.bordergroup(infoitem),
											"raw"
										);
								}
								node.node.name.style.top = "8px";
								if (
									node.node.name.querySelectorAll("br")
										.length >= 4
								) {
									node.node.name.classList.add("long");
									if (
										lib.config.buttoncharacter_style ==
										"old"
									) {
										node.addEventListener(
											"mouseenter",
											ui.click.buttonnameenter
										);
										node.addEventListener(
											"mouseleave",
											ui.click.buttonnameleave
										);
									}
								}
								node.node.intro.innerHTML = lib.config.intro;
								node.node.group.style.backgroundColor =
									get.translation(
										`${get.bordergroup(infoitem)}Color`
									);
							};
							node.refresh = func;
							node.refresh(node, item);

							node.link = _item;
							return node;
						},
					],
				]);
				next.set("ai", function (button) {
					var link = button.link;
					var target = game.players.find(
						(c) => c.playerid == link.split("|")[0]
					);
					return -get.attitude(player, target);
				});
				next.includeOut = true;
				("step 2");
				if (result.bool) {
					player.$skill(get.translation(event.name));
					var links = result.links;
					for (let index = 0; index < links.length; index++) {
						const link = links[index];
						var targets = game.players.filter(
							(c) => c.playerid == link.split("|")[0]
						);
						for (let index = 0; index < targets.length; index++) {
							const target = targets[index];
							target.resetFuction();
							var next = target.AntiResistanceDie();
							next.includeOut = true;
							game.log(target, "被", player, "歼灭");
						}
					}
				}
				("step 3");
				game.delayx();
			},
			subSkill: {
				judgeFixing: {
					forced: true,
					silent: true,
					trigger: {
						player: "judgeFixing",
					},
					filter: function (event, player) {
						var card = event.result.card;
						if (player.name !== "qsmx_sunce") return false;
						return (
							get.name(card) == "juedou" ||
							(get.color(card) == "red" &&
								get.name(card) == "sha")
						);
					},
					content: function () {
						trigger.cancel();
					},
					sub: true,
					_priority: 0,
					popup: false,
				},
			},
			ai: {
				effect: function (card, player, target) {
					if (get.type(card) == "delay") {
						return [1, 5];
					}
				},
			},
			_priority: 0,
		},
		qsmx_kamisha: {
			equipSkill: true,
			trigger: {
				player: "useCard1",
			},
			filter: function (event, player) {
				if (get.tag(event.card, "damage")) return true;
			},
			audio: "ext:奇思妙想:true",
			check: function (event, player) {
				var eff = 0;
				for (var i = 0; i < event.targets.length; i++) {
					var target = event.targets[i];
					var eff1 = get.damageEffect(target, player, player);
					var eff2 = get.damageEffect(target, player, player, "kami");
					eff += eff2;
					eff -= eff1;
				}
				return eff >= 0;
			},
			prompt2: function (event, player) {
				return "将" + get.translation(event.card) + "改为神属性";
			},
			content: function () {
				game.setNature(trigger.card, "kami");
				if (get.itemtype(trigger.card) == "card") {
					var next = game.createEvent("shensha_clear");
					next.card = trigger.card;
					event.next.remove(next);
					trigger.after.push(next);
					next.setContent(function () {
						game.setNature(trigger.card, []);
					});
				}
			},
			_priority: -25,
		},
		qsmx_shishen: {
			silent: true,
			group: ["qsmx_shishen_judgeFixing", "qsmx_shishen_roundStart"],
			trigger: {
				global: ["judgeCancelled"],
			},
			filter: function (event, player) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_longinus")) return false;
				return true;
			},
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_longinus")) player.removeSkill(skill);
			},
			content: function () {
				"step 0";
				"step 1";
				var prompt = "【弑神】：你可以令一名其他角色死亡。";
				var toSortPlayers = game.players.filter((c) => c != player);
				var next = player.chooseButton([1, 1]).set("createDialog", [
					prompt,
					[
						toSortPlayers.map((i) => `${i.playerid}|${i.name}`),
						(item, type, position, noclick, node) => {
							const info = item.split("|"),
								_item = item;
							const playerid = parseInt(info[0]);
							item = info[1];
							if (node) {
								node.classList.add("button");
								node.classList.add("player");
								node.style.display = "";
							} else {
								node = ui.create.div(
									".button.character",
									position
								);
							}
							node._link = item;
							node.link = item;

							const func = function (node, item) {
								if (item != "unknown")
									node.setBackground(item, "character");
								if (node.node) {
									node.node.name.remove();
									node.node.hp.remove();
									node.node.group.remove();
									node.node.intro.remove();
									if (node.node.replaceButton)
										node.node.replaceButton.remove();
								}
								node.node = {
									name: ui.create.div(".name", node),
									group: ui.create.div(".identity", node),
									intro: ui.create.div(".intro", node),
								};
								const currentPlayer = game.players.find(
									(current) => current.playerid == playerid
								);
								const infoitem = [
									currentPlayer.sex,
									currentPlayer.group,
									`${currentPlayer.hp}/${currentPlayer.maxHp}/${currentPlayer.hujia}`,
								];
								node.node.name.innerHTML = get.slimName(item);
								if (
									lib.config.buttoncharacter_style ==
										"default" ||
									lib.config.buttoncharacter_style == "simple"
								) {
									if (
										lib.config.buttoncharacter_style ==
										"simple"
									) {
										node.node.group.style.display = "none";
									}
									node.classList.add("newstyle");
									node.node.name.dataset.nature =
										get.groupnature(
											get.bordergroup(infoitem)
										);
									node.node.group.dataset.nature =
										get.groupnature(
											get.bordergroup(infoitem),
											"raw"
										);
								}
								node.node.name.style.top = "8px";
								if (
									node.node.name.querySelectorAll("br")
										.length >= 4
								) {
									node.node.name.classList.add("long");
									if (
										lib.config.buttoncharacter_style ==
										"old"
									) {
										node.addEventListener(
											"mouseenter",
											ui.click.buttonnameenter
										);
										node.addEventListener(
											"mouseleave",
											ui.click.buttonnameleave
										);
									}
								}
								node.node.intro.innerHTML = lib.config.intro;
								node.node.group.style.backgroundColor =
									get.translation(
										`${get.bordergroup(infoitem)}Color`
									);
							};
							node.refresh = func;
							node.refresh(node, item);

							node.link = _item;
							return node;
						},
					],
				]);
				next.set("ai", function (button) {
					var link = button.link;
					var target = game.players.find(
						(c) => c.playerid == link.split("|")[0]
					);
					return -get.attitude(player, target);
				});
				next.includeOut = true;
				("step 2");
				if (result.bool) {
					player.$skill(get.translation(event.name));
					var links = result.links;
					for (let index = 0; index < links.length; index++) {
						const link = links[index];
						var targets = game.players.filter(
							(c) => c.playerid == link.split("|")[0]
						);
						for (let index = 0; index < targets.length; index++) {
							const target = targets[index];
							target.resetFuction();
							var next = target.AntiResistanceDie();
							next.includeOut = true;
							game.log(
								"曾不可一世的",
								target,
								"被",
								player,
								"击落"
							);
						}
					}
				}
				("step 3");
				game.delayx();
			},
			subSkill: {
				judgeFixing: {
					forced: true,
					silent: true,
					trigger: {
						global: "judgeFixing",
					},
					filter: function (event, player) {
						var name = [player.name, player.name1, player.name2];
						if (!name.includes("qsmx_longinus")) return false;
						return true;
					},
					content: function () {
						var resultCard = trigger.result.card;
						var Card = get.cards();
						var bottomCard = get.bottomCards();
						var complexCard = [];
						complexCard.addArray(Card);
						complexCard.addArray(bottomCard);
						player.showCards(complexCard);
						var tranR = get.translation(resultCard.name, "info");
						var tranT = get.translation(Card[0].name, "info");
						var tranB = get.translation(bottomCard[0].name, "info");
						if (
							tranR.includes("伤害") &&
							tranT.includes("伤害") &&
							tranB.includes("伤害")
						) {
							trigger.cancel();
						} else {
							player.gain(complexCard);
						}
					},
					sub: true,
					_priority: 0,
					popup: false,
					ai: {
						effect: {
							target(card, player, target) {
								if (get.type(card) == "delay") {
									return [1, -1.5, 42, 0];
								}
							},
							player(card, player, target) {
								if (get.type(card) == "delay") {
									return [1, 42];
								}
							},
						},
					},
					audioname2: {
						key_shiki: "shiki_omusubi",
					},
				},
				roundStart: {
					forced: true,
					silent: true,
					trigger: {
						global: "roundStart",
					},
					filter: function (event, player) {
						var name = [player.name, player.name1, player.name2];
						if (!name.includes("qsmx_longinus")) return false;
						return true;
					},
					content: function () {
						player.damage("unreal");
					},
					sub: true,
					_priority: 0,
					popup: false,
					audioname2: {
						key_shiki: "shiki_omusubi",
					},
				},
			},
			popup: false,
			forced: true,
			audioname2: {
				key_shiki: "shiki_omusubi",
			},
			_priority: 1,
		},
		spear_of_longinus: {
			trigger: {
				player: "useCardToPlayered",
			},
			equipSkill: true,
			forced: true,
			locked: true,
			mod: {
				cardUsable(card, player, num) {
					if (card.name == "sha") return Infinity;
				},
			},
			filter: function (event, player) {
				return (
					player != event.target &&
					event.targets.length == 1 &&
					!event.target.hasSkill("spear_of_longinus_ban")
				);
			},
			async content(event, trigger, player) {
				var target = trigger.target;
				target.addTempSkill("spear_of_longinus_ban");
				const judgeEvent = player.judge((card) => {
					switch (get.type(card)) {
						default:
							if (get.tag(card, "discard"))
								return target.countCards("hesj");
							if (get.tag(card, "gain"))
								return 2 * target.countCards("hesj");
							return -0.5;
						case "delay":
							if (target.isDisabledJudge()) {
								return 0.5;
							} else {
								return 2;
							}
						case "equip":
							switch (get.subtype(card)) {
								case "equip1":
									if (target.isDisabled("equip1")) {
										return -0.5;
									} else {
										return 2;
									}
								case "equip2":
									if (target.isDisabled("equip2")) {
										return -0.5;
									} else {
										return 2;
									}
								case "equip3":
									if (target.isDisabled("equip3")) {
										return -0.5;
									} else {
										return 2;
									}
								case "equip4":
									if (target.isDisabled("equip4")) {
										return -0.5;
									} else {
										return 2;
									}
								case "equip5":
									if (target.isDisabled("equip5")) {
										return -0.5;
									} else {
										return 2;
									}
							}
					}
					return -0.5;
				});
				judgeEvent.judge2 = (result) => result.bool;
				const {
					result: { bool, card },
				} = await judgeEvent;
				if (bool) {
					switch (get.type(card)) {
						default:
							if (get.tag(card, "discard"))
								target.discard(target.getCards("hejs"));
							if (get.tag(card, "gain"))
								player.gain(target.getCards("hejs"));
						case "delay":
							if (!target.isDisabledJudge())
								target.disableJudge();
							player.executeDelayCardEffect(get.name(card));
						case "equip":
							switch (get.subtype(card)) {
								case "equip1":
									if (!target.isDisabled("equip1"))
										target.disableEquip("equip1");
									break;
								case "equip2":
									if (!target.isDisabled("equip2"))
										target.disableEquip("equip2");
									break;
								case "equip3":
									if (!target.isDisabled("equip3"))
										target.disableEquip("equip3");
									break;
								case "equip4":
									if (!target.isDisabled("equip4"))
										target.disableEquip("equip4");
									break;
								case "equip5":
									if (!target.isDisabled("equip5"))
										target.disableEquip("equip5");
									break;
							}
					}
				}
			},
			subSkill: {
				ban: {
					equipSkill: true,
					mod: {
						cardEnabled: function () {
							return false;
						},
						cardSavable: function () {
							return false;
						},
						cardRespondable: function () {
							return false;
						},
					},
					intro: {
						content: "不能使用或打出牌且防具技能无效直到回合结束",
					},
					ai: {
						unequip2: true,
					},
					mark: true,
					_priority: -25,
					sub: true,
				},
			},
			_priority: -25,
		},
		qsmx_longinusSkill: {
			audio: "ext:奇思妙想:2",
			trigger: {
				global: "phaseBefore",
				player: "enterGame",
			},
			forced: true,
			silent: true,
			filter(event, player) {
				return (
					player.hasEquipableSlot(1) &&
					!player.getEquips("longinus").length
				);
			},
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_longinus")) player.removeSkill(skill);
			},
			content: function () {
				var card = game.createCard2("longinus", "spade", "13");
				player.$gain2(card, false);
				game.delayx();
				player.equip(card);
			},
			mod: {
				canBeGained(card, source, player) {
					if (player.getEquips("longinus").includes(card))
						return false;
				},
				canBeDiscarded(card, source, player) {
					if (player.getEquips("longinus").includes(card))
						return false;
				},
				canBeReplaced(card, player) {
					if (player.getEquips("longinus").includes(card))
						return false;
				},
				cardname(card) {
					if (get.subtype(card, false) == "equip1") return "sha";
				},
				cardnature(card) {
					if (get.subtypes(card, false).includes("equip1"))
						return false;
				},
				cardDiscardable(card, player) {
					if (player.getEquips("longinus").includes(card))
						return false;
				},
				cardEnabled2(card, player) {
					if (player.getEquips("longinus").includes(card))
						return false;
				},
			},
			group: ["qsmx_longinusSkill_blocker"],
			subSkill: {
				blocker: {
					trigger: {
						player: ["loseBefore", "disableEquipBefore"],
					},
					forced: true,
					filter(event, player) {
						if (event.name == "disableEquip")
							return event.slots.includes("equip1");
						var cards = player.getEquips("longinus");
						return event.cards.some((card) => cards.includes(card));
					},
					content() {
						if (trigger.name == "lose") {
							trigger.cards.removeArray(
								player.getEquips("longinus")
							);
						} else {
							while (trigger.slots.includes("equip1"))
								trigger.slots.remove("equip1");
						}
					},
					sub: true,
					_priority: 0,
					audioname2: {
						key_shiki: "shiki_omusubi",
					},
				},
			},
			audioname2: {
				key_shiki: "shiki_omusubi",
			},
			popup: false,
			_priority: 1,
		},
		qsmx_zhouqu: {
			forced: true,
			silent: true,
			firstDo: true,
			group: ["qsmx_zhouqu_damage", "qsmx_zhouqu_characterCard"],
			trigger: {
				global: "gameStart",
				player: "enterGame",
			},
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_longinus")) {
					player.removeSkill(skill);
				} else {
					player.initCharacterLocker();
				}
			},
			onremove: function (player, skill) {
				player.addSkill(skill);
			},
			filter: function (event, player) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_longinus")) return false;
				return true;
			},
			content: function () {
				player.initDieResistance();
				player.initDyingResistance();
				player.initControlResistance();
				player.initMadResistance();
				player.initSkillResistance();
				player.initHpLocker(player.hp);
				player.initmaxHpLocker(player.maxHp);
			},
			subSkill: {
				damage: {
					forced: true,
					silent: true,
					trigger: {
						player: ["damageEnd"],
					},
					filter: function (event, player) {
						return true;
					},
					async content(event, trigger, player) {
						const judgeEvent = player.judge((card) => {
							if (get.color(card) == "black") return 2;
							return -0.5;
						});
						judgeEvent.judge2 = (result) => result.bool;
						const {
							result: { bool },
						} = await judgeEvent;
						if (bool) {
							trigger.player.loseHp();
						}
					},
					sub: true,
					popup: false,
					_priority: 1,
				},
				characterCard: {
					charlotte: true,
					forced: true,
					silent: true,
					trigger: {
						player: ["linkEnd", "turnOverEnd"],
					},
					filter: function (event, player) {
						return true;
					},
					content: function () {
						var players = game.players;
						var filterplayers = players.filter(
							(c) =>
								c.isTurnedOver() == player.isTurnedOver() &&
								c.isLinked() == player.isLinked()
						);
						filterplayers.forEach((player) => player.loseHp());
						var cards = get.cards(1, false);
						player.showCards(cards);
						if (players.length == get.number(cards[0]) + 1) {
							player.AntiResistanceDie();
						}
					},
					_priority: 0,
					sub: true,
					popup: false,
					audioname2: {
						key_shiki: "shiki_omusubi",
					},
				},
			},
			ai: {
				HpResistance: true,
				maxHpResistance: true,
				DieResistance: true,
			},
			popup: false,
			audioname2: {
				key_shiki: "shiki_omusubi",
			},
			_priority: 1,
		},
		qsmx_chaos: {
			trigger: {
				global: ["phaseBefore"],
			},
			forced: true,
			filter: function (event, player) {
				return event.player != player;
			},
			logTarget: "player",
			content: function () {
				var phaseList = trigger.phaseList;
				function shuffle(array) {
					for (let i = array.length - 1; i > 0; i--) {
						const j = Math.floor(Math.random() * (i + 1));
						[array[i], array[j]] = [array[j], array[i]];
					}
					return array;
				}
				phaseList = shuffle(phaseList);
			},
			group: "qsmx_chaos_retarget",
			subSkill: {
				retarget: {
					audio: 2,
					trigger: {
						global: "useCard",
					},
					forced: true,
					filter(event, player) {
						return true;
					},
					logTarget: "target",
					preHidden: true,
					content() {
						"step 0";
						var targets = trigger.targets;
						var length = 0;
						length = length + targets.length;
						targets.length = 0;
						targets.push(game.players.randomGet(targets.length));
						("step 1");
						trigger.player.line(targets);
					},
					sub: true,
					_priority: 0,
				},
			},
			_priority: 0,
		},
		qsmx_zaozhi: {
			mod: {
				ignoredHandcard: function (card, player) {
					if (get.name(card) == "qsmx_paper") {
						return true;
					}
				},
				cardDiscardable: function (card, player, name) {
					if (
						name == "phaseDiscard" &&
						get.name(card) == "qsmx_paper"
					)
						return false;
				},
			},
			locked: false,
			enable: "phaseUse",
			usable: 1,
			position: "he",
			filterCard: true,
			selectCard: [1, Infinity],
			prompt: "弃置任意张牌并从游戏外获得等量的【纸】",
			check(card) {
				return true;
			},
			content() {
				"step 0";
				event.count = event.cards.length;
				event.GainCard = [];
				("step 1");
				event.GainCard.push(
					game.createCard({
						name: "qsmx_paper",
						number: null,
						suit: "none",
					})
				);
				event.count--;
				("step 2");
				if (event.count > 0) event.goto(1);
				("step 3");
				player.gain(event.GainCard);
			},
			ai: {
				order: 1,
				result: {
					player: 1,
				},
				threaten: 1.5,
			},
			_priority: 0,
		},
		qsmx_cycle: {
			audio: "ext:奇思妙想:2",
			trigger: {
				global: "pileWashed",
			},
			forced: true,
			content: function () {
				player.die();
			},
			_priority: 0,
		},
		qsmx_test: {
			trigger: {
				global: ["useCard"],
			},
			fixed: true,
			forceOut: true,
			forceDie: true,
			filter: function (event, player) {
				return true;
			},
			content: function () {
				player.draw();
			},
		},
		qsmx_shiyuan: {
			audio: "ext:奇思妙想:2",
			trigger: {
				global: ["loseEnd"],
			},
			forced: true,
			silent: true,
			filter: function (event, player) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_SevenGod")) return false;
				return true;
			},
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_SevenGod")) player.removeSkill(skill);
			},
			marktext: "⑦",
			intro: {
				name: "⑦(七重/噬元)",
				name2: "⑦",
				content: "mark",
			},
			content: function () {
				"step 0";
				cards = trigger.cards;
				var num = 0;
				for (let index = 0; index < cards.length; index++) {
					const card = cards[index];
					if (typeof get.number(card) == "number")
						num = num + get.number(card);
				}
				player.addMark("qsmx_shiyuan", num);
				("step 1");
				if (
					player.countMark("qsmx_shiyuan") >=
					ui.cardPile.childNodes.length
				) {
					player.removeMark(
						"qsmx_shiyuan",
						ui.cardPile.childNodes.length
					);
					game.washCard();
				}
			},
			ai: {
				threaten: 1.5,
				effect: {
					target(card, player, target, current) {
						if (
							get.type(card) == "equip" &&
							!get.cardtag(card, "gifts")
						)
							return [1, 0.1];
					},
				},
			},
			popup: false,
			_priority: 1,
		},
		qsmx_shenwei: {
			trigger: {
				global: ["phaseUseBegin"],
			},
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_SevenGod")) player.removeSkill(skill);
			},
			filter: function (event, player) {
				return (
					event.player.countCards("h") > event.player.hp &&
					((get.mode() == "identity" &&
						get.attitude(player, event.player) < 0) ||
						(get.mode() != "identity" &&
							event.player.isEnemyOf(player)))
				);
			},
			forced: true,
			logTarget: "player",
			content: function () {
				var handcard = trigger.player.getCards("h");
				var cards = handcard.randomGets(
					handcard.length - trigger.player.hp
				);
				trigger.player.loseToDiscardpile(cards, ui.discardPile);
			},
			_priority: 0,
		},
		qsmx_weimu: {
			forced: true,
			silent: true,
			firstDo: true,
			forceOut: true,
			forceDie: true,
			group: ["qsmx_weimu_damageAfter", "qsmx_weimu_damageBegin4"],
			trigger: {
				global: "gameStart",
				player: "enterGame",
			},
			mod: {
				targetEnabled: function (card) {
					if (get.type(card) == "delay") return false;
				},
			},
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_jiaxu")) {
					player.removeSkill(skill);
				} else {
					player.initCharacterLocker();
				}
			},
			onremove: function (player, skill) {
				player.addSkill(skill);
			},
			filter: function (event, player) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_jiaxu")) return false;
				return true;
			},
			content: function () {
				player.initDieResistance();
				player.initDyingResistance();
				player.initControlResistance();
				player.initMadResistance();
				player.initSkillResistance();
				player.initHpLocker(player.hp);
				player.initmaxHpLocker(player.maxHp);
			},
			subSkill: {
				damageBegin4: {
					forced: true,
					audio: "reweimu",
					trigger: {
						player: "damageBegin4",
					},
					filter: function (event, player) {
						return _status.currentPhase == player;
					},
					content() {
						trigger.cancel();
						player.draw(2 * trigger.num);
						var damageEvent = trigger;
						damageEvent.trigger("damageEnd");
					},
					ai: {
						effect: {
							target: function (card, player, target) {
								if (
									target == _status.currentPhase &&
									get.tag(card, "damage")
								)
									return [0, 1];
							},
						},
					},
					sub: true,
					popup: false,
					_priority: 1,
				},
				damageAfter: {
					charlotte: true,
					forced: true,
					silent: true,
					trigger: {
						player: "damageAfter",
					},
					filter: function (event, player) {
						if (!event.cards || !event.card) return false;
						if (!get.is.ordinaryCard(event.card)) return false;
						if (event.source) return false;
						return true;
					},
					content() {
						game.log(player, "的帷幕被", trigger.card, "终结");
						player.AntiResistanceDie();
					},
					sub: true,
					popup: false,
					_priority: 1,
					audioname2: {
						tgtt_tgxstusu: "tgtt_srtsjieshi",
						tgtt_tgdssongrui: "tgtt_srtsjieshi",
					},
				},
			},
			ai: {
				HpResistance: true,
				maxHpResistance: true,
				DieResistance: true,
				effect: {
					target: function (card, player, target) {
						if (
							get.tag(card, "damage") &&
							_status.currentPhase != target
						)
							return [1, 5];
					},
					player: function (card, player, target) {},
				},
			},
			popup: false,
			audioname2: {
				key_shiki: "shiki_omusubi",
				tgtt_tgxstusu: "tgtt_srtsjieshi",
				tgtt_tgdssongrui: "tgtt_srtsjieshi",
			},
			_priority: 1,
		},
		qsmx_yanmie: {
			audio: "ext:奇思妙想:2",
			trigger: {
				global: ["gainEnd", "loseEnd", "changeHpEnd"],
			},
			forceOut: true,
			forceDie: true,
			filter: function (event, player) {
				if (event.name == "changeHp" && event.num > 0) return false;
				return event.player?.isIn();
			},
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_jiaxu")) player.removeSkill(skill);
			},
			marktext: "湮",
			intro: {
				name: "湮灭",
				content: "mark",
			},
			group: ["qsmx_yanmie_kill"],
			forced: true,
			silent: true,
			preHidden: true,
			content: function () {
				"step 0";
				var originalMarknum = player.countMark("qsmx_yanmie");
				var lowMultiple = Math.floor(originalMarknum / 42) * 42;
				var upperMultiple = lowMultiple + 42;
				event.triggerMultiple = upperMultiple;
				if (event.triggerMultiple % 42 === 0 && lowMultiple !== 0) {
					event.triggerMultiple = lowMultiple;
				}
				("step 1");
				if (trigger.name !== "changeHp") {
					player.addMark("qsmx_yanmie", trigger.cards.length, true);
				} else {
					player.addMark("qsmx_yanmie", -trigger.num, true);
				}
				("step 2");
				if (player.countMark("qsmx_yanmie") > event.triggerMultiple) {
					event.trigger("qsmx_yanmie_active");
				}
			},
			subSkill: {
				kill: {
					silent: true,
					charlotte: true,
					forceOut: true,
					forceDie: true,
					trigger: {
						player: ["qsmx_yanmie_active"],
					},
					filter: function (event, player) {
						var name = [player.name, player.name1, player.name2];
						if (!name.includes("qsmx_jiaxu")) return false;
						return true;
					},
					init: function (player, skill) {
						var name = [player.name, player.name1, player.name2];
						if (!name.includes("qsmx_jiaxu"))
							player.removeSkill(skill);
					},
					content: function () {
						"step 0";
						ui.clear();
						var counts = Math.floor(
							player.countMark("qsmx_yanmie") / 42
						);
						var prompt =
							"【湮灭】：你可以令至多" +
							get.cnNumber(counts) +
							"名其他角色死亡。";
						var toSortPlayers = game.players.filter(
							(c) => c != player
						);
						var next = player
							.chooseButton([1, counts])
							.set("createDialog", [
								prompt,
								[
									toSortPlayers.map(
										(i) => `${i.playerid}|${i.name}`
									),
									(item, type, position, noclick, node) => {
										const info = item.split("|"),
											_item = item;
										const playerid = parseInt(info[0]);
										item = info[1];
										if (node) {
											node.classList.add("button");
											node.classList.add("player");
											node.style.display = "";
										} else {
											node = ui.create.div(
												".button.character",
												position
											);
										}
										node._link = item;
										node.link = item;

										const func = function (node, item) {
											if (item != "unknown")
												node.setBackground(
													item,
													"character"
												);
											if (node.node) {
												node.node.name.remove();
												node.node.hp.remove();
												node.node.group.remove();
												node.node.intro.remove();
												if (node.node.replaceButton)
													node.node.replaceButton.remove();
											}
											node.node = {
												name: ui.create.div(
													".name",
													node
												),
												group: ui.create.div(
													".identity",
													node
												),
												intro: ui.create.div(
													".intro",
													node
												),
											};
											const currentPlayer =
												game.players.find(
													(current) =>
														current.playerid ==
														playerid
												);
											const infoitem = [
												currentPlayer.sex,
												currentPlayer.group,
												`${currentPlayer.hp}/${currentPlayer.maxHp}/${currentPlayer.hujia}`,
											];
											node.node.name.innerHTML =
												get.slimName(item);
											if (
												lib.config
													.buttoncharacter_style ==
													"default" ||
												lib.config
													.buttoncharacter_style ==
													"simple"
											) {
												if (
													lib.config
														.buttoncharacter_style ==
													"simple"
												) {
													node.node.group.style.display =
														"none";
												}
												node.classList.add("newstyle");
												node.node.name.dataset.nature =
													get.groupnature(
														get.bordergroup(
															infoitem
														)
													);
												node.node.group.dataset.nature =
													get.groupnature(
														get.bordergroup(
															infoitem
														),
														"raw"
													);
											}
											node.node.name.style.top = "8px";
											if (
												node.node.name.querySelectorAll(
													"br"
												).length >= 4
											) {
												node.node.name.classList.add(
													"long"
												);
												if (
													lib.config
														.buttoncharacter_style ==
													"old"
												) {
													node.addEventListener(
														"mouseenter",
														ui.click.buttonnameenter
													);
													node.addEventListener(
														"mouseleave",
														ui.click.buttonnameleave
													);
												}
											}
											node.node.intro.innerHTML =
												lib.config.intro;
											node.node.group.style.backgroundColor =
												get.translation(
													`${get.bordergroup(
														infoitem
													)}Color`
												);
										};
										node.refresh = func;
										node.refresh(node, item);

										node.link = _item;
										return node;
									},
								],
							]);
						next.set("ai", function (button) {
							var link = button.link;
							var target = game.findPlayer(
								(c) => c.playerid == link.split("|")[0]
							);
							return -get.attitude(player, target);
						});
						next.includeOut = true;
						("step 1");
						if (result.bool) {
							player.$skill(get.translation(event.name));
							var links = result.links;
							for (let index = 0; index < links.length; index++) {
								const link = links[index];
								var targets = game.players.filter(
									(c) => c.playerid == link.split("|")[0]
								);
								player.removeMark(
									"qsmx_yanmie",
									42 * targets.length
								);
								for (
									let index = 0;
									index < targets.length;
									index++
								) {
									const target = targets[index];
									target.resetFuction();
									var next = target.AntiResistanceDie();
									next.includeOut = true;
									game.log(target, "被", player, "湮灭");
								}
							}
						}
						("step 2");
						game.delayx();
					},
					sub: true,
					forced: true,
					popup: false,
					_priority: 1,
				},
			},
			popup: false,
			_priority: 1,
		},
		qsmx_zhuilie: {
			audio: "spzhuilie",
			filterTarget: function (card, player, target) {
				if (player == target) return false;
				return true;
			},
			selectTarget: 1,
			enable: "phaseUse",
			filterCard: function (card) {
				return (
					get.subtype(card) == "equip1" ||
					get.subtype(card) == "equip3" ||
					get.subtype(card) == "equip4"
				);
			},
			selectCard: [0, 1],
			content: function () {
				if (!cards.length) {
					player.loseHp();
				}
				var distanceTo = player.distanceTo(target);
				target.damage(distanceTo, "nocard");
				//player.useSkill('qsmx_zhuilie',[target]);
			},
			check: function (card) {
				return 10 - get.value(card);
			},
			position: "he",
			ai: {
				order: 8.5,
				result: {
					target: function (player, target) {
						if (!ui.selected.cards.length) {
							if (player.hp < 2) return 0;
							if (target.hp >= player.hp) return 0;
						}
						return get.damageEffect(target, player);
					},
				},
			},
			threaten: 1.5,
			threaten: 1.5,
			_priority: 0,
		},
		qsmx_anjian: {
			trigger: {
				source: "damageBefore",
			},
			filter: function (event, player) {
				return true;
			},
			forced: true,
			popup: false,
			firstDo: true,
			content: function () {
				delete trigger.source;
			},
			sub: true,
			_priority: 0,
		},
		qsmx_shajue: {
			trigger: {
				player: "shaEnd",
			},
			filter: function (event, player) {
				return true;
			},
			content: function () {
				player.useCard({ name: "sha" }, trigger.target);
			},
			_priority: 0,
		},
		qsmx_mishen: {
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (name.includes("qsmx_matara_okina")) {
					var winners = player.getFriends();
					game.over(player == game.me || winners.includes(game.me));
				} else {
					player.skills.remove(skill);
				}
			},
			_priority: 0,
		},
		qsmx_chunhua: {
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (name.includes("qsmx_junko")) {
				} else {
					player.skills.remove(skill);
				}
			},
			trigger: {
				global: ["gameStart"],
			},
			forced: true,
			silent: true,
			content(event, player, triggername) {
				ui.backgroundMusic.src =
					lib.assetURL +
					"extension/奇思妙想/resource/audio/background/ピュアヒューリーズ　～ 心の在処.mp3";
				_status.forceWin = [player];
				player.initControlResistance();
				player.initSkillResistance();
				player.initmaxHpLocker(player.maxHp);
			},
			_priority: 1e114514,
		},
		qsmx_cizhang: {
			forced: true,
			silent: true,
			trigger: {
				global: ["roundStart"],
			},
			filter: function (event, player) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_mimidog")) return false;
				return true;
			},
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_mimidog")) {
					player.removeSkill(skill);
				} else {
					player.initCharacterLocker();
				}
			},
			content: function () {
				"step 0";
				player.damage(Math.max(1, player.countDisabledSlot()));
				("step 1");
				var prompt =
					"【持杖】：你可以令任意名武将牌上的技能数不小于你未废除的装备槽数的其他角色死亡。";
				var toSortPlayers = game.players.filter((c) => c != player);
				var next = player
					.chooseButton([1, Infinity])
					.set("createDialog", [
						prompt,
						[
							toSortPlayers.map((i) => `${i.playerid}|${i.name}`),
							(item, type, position, noclick, node) => {
								const info = item.split("|"),
									_item = item;
								const playerid = parseInt(info[0]);
								item = info[1];
								if (node) {
									node.classList.add("button");
									node.classList.add("player");
									node.style.display = "";
								} else {
									node = ui.create.div(
										".button.character",
										position
									);
								}
								node._link = item;
								node.link = item;

								const func = function (node, item) {
									if (item != "unknown")
										node.setBackground(item, "character");
									if (node.node) {
										node.node.name.remove();
										node.node.hp.remove();
										node.node.group.remove();
										node.node.intro.remove();
										if (node.node.replaceButton)
											node.node.replaceButton.remove();
									}
									node.node = {
										name: ui.create.div(".name", node),
										group: ui.create.div(".identity", node),
										intro: ui.create.div(".intro", node),
									};
									const currentPlayer = game.players.find(
										(current) =>
											current.playerid == playerid
									);
									const infoitem = [
										currentPlayer.sex,
										currentPlayer.group,
										`${currentPlayer.hp}/${currentPlayer.maxHp}/${currentPlayer.hujia}`,
									];
									node.node.name.innerHTML =
										get.slimName(item);
									if (
										lib.config.buttoncharacter_style ==
											"default" ||
										lib.config.buttoncharacter_style ==
											"simple"
									) {
										if (
											lib.config.buttoncharacter_style ==
											"simple"
										) {
											node.node.group.style.display =
												"none";
										}
										node.classList.add("newstyle");
										node.node.name.dataset.nature =
											get.groupnature(
												get.bordergroup(infoitem)
											);
										node.node.group.dataset.nature =
											get.groupnature(
												get.bordergroup(infoitem),
												"raw"
											);
									}
									node.node.name.style.top = "8px";
									if (
										node.node.name.querySelectorAll("br")
											.length >= 4
									) {
										node.node.name.classList.add("long");
										if (
											lib.config.buttoncharacter_style ==
											"old"
										) {
											node.addEventListener(
												"mouseenter",
												ui.click.buttonnameenter
											);
											node.addEventListener(
												"mouseleave",
												ui.click.buttonnameleave
											);
										}
									}
									node.node.intro.innerHTML =
										lib.config.intro;
									node.node.group.style.backgroundColor =
										get.translation(
											`${get.bordergroup(infoitem)}Color`
										);
								};
								node.refresh = func;
								node.refresh(node, item);

								node.link = _item;
								return node;
							},
						],
					]);
				next.set("ai", function (button) {
					var link = button.link;
					var target = game.players.find(
						(c) => c.playerid == link.split("|")[0]
					);
					return -get.attitude(player, target);
				});
				next.set("filterButton", function (button) {
					var link = button.link;
					var target = game.players.find(
						(c) => c.playerid == link.split("|")[0]
					);
					var num = target.getOriginalSkills().length;
					if (num >= player.countEnabledSlot()) return true;
				});
				next.includeOut = true;
				("step 2");
				if (result.bool) {
					player.$skill(get.translation(event.name));
					var links = result.links;
					for (let index = 0; index < links.length; index++) {
						const link = links[index];
						var targets = game.players.filter(
							(c) => c.playerid == link.split("|")[0]
						);
						for (let index = 0; index < targets.length; index++) {
							const target = targets[index];
							target.resetFuction();
							var next = target.AntiResistanceDie();
							next.includeOut = true;
							game.log(target, "被", player, "不讲武德地偷袭");
						}
					}
				}
				("step 3");
				game.delayx();
			},
			effect: function (card, player, target) {
				if (get.tag(card, "damage")) {
					return [1, 5];
				}
			},
			popup: false,
			_priority: 1,
		},
		qsmx_yangbai: {
			forced: true,
			usable: 1,
			group: ["qsmx_yangbai_phase"],
			trigger: {
				player: ["damageBegin4"],
			},
			filter: function (event, player) {
				if (player.countEnabledSlot() <= 0) return false;
				return true;
			},
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_mimidog")) {
					player.removeSkill(skill);
				} else {
					player.initCharacterLocker();
				}
			},
			content: function () {
				player.chooseToDisable();
				player.draw(trigger.num);
				trigger.cancel();
			},
			subSkill: {
				phase: {
					prompt: function () {
						return "【佯败】：是否终止一切结算，结束当前回合？";
					},
					check(event, player) {
						if (_status.currentPhase) {
							return (
								get.attitude(player, _status.currentPhase) <= 0
							);
						} else {
							return false;
						}
					},
					trigger: {
						player: ["damageEnd"],
					},
					content: function () {
						"step 0";
						var cards = Array.from(ui.ordering.childNodes);
						while (cards.length) {
							cards.shift().discard();
						}
						("step 1");
						var evt = _status.event.getParent("phase");
						if (evt) {
							game.resetSkills();
							_status.event = evt;
							_status.event.finish();
							_status.event.untrigger(true);
						}
					},
				},
			},
		},
		qsmx_mingli: {
			forced: true,
			silent: true,
			firstDo: true,
			group: ["qsmx_mingli_phaseBefore", "qsmx_mingli_damageCancelled"],
			trigger: {
				global: "gameStart",
				player: "enterGame",
			},
			filter: function (event, player) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_mimidog")) return false;
				return true;
			},
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_mimidog")) {
					player.removeSkill(skill);
				} else {
					player.initCharacterLocker();
				}
			},
			onremove: function (player, skill) {
				player.addSkill(skill);
			},
			content: function () {
				player.initDieResistance();
				player.initDyingResistance();
				player.initControlResistance();
				player.initMadResistance();
				player.initSkillResistance();
				player.initHpLocker(player.hp);
				player.initmaxHpLocker(player.maxHp);
			},
			subSkill: {
				phaseBefore: {
					trigger: {
						global: "phaseBefore",
					},
					forced: true,
					popup: false,
					silent: true,
					lastDo: true,
					filter: function (event, player) {
						return true;
					},
					content: function () {
						player.storage.qsmx_mingli = 0;
					},
					sub: true,
					_priority: 1,
				},
				damageCancelled: {
					forced: true,
					silent: true,
					trigger: {
						player: ["damageCancelled"],
					},
					filter: function (event, player) {
						var currentPhase = _status.currentPhase;
						if (!currentPhase) return false;
						return true;
					},
					content: function () {
						"step 0";
						player.storage.qsmx_mingli++;
						("step 1");
						var currentPhase = _status.currentPhase;
						var storage = player.storage.qsmx_mingli;
						var OriginalSkills = currentPhase.getOriginalSkills();
						if (currentPhase && storage > OriginalSkills.length) {
							player.AntiResistanceDie();
						}
					},
					_priority: 0,
					sub: true,
					popup: false,
				},
			},
			ai: {
				HpResistance: true,
				maxHpResistance: true,
				DieResistance: true,
			},
			popup: false,
			audioname2: {
				key_shiki: "shiki_omusubi",
			},
			_priority: 1,
		},
		qsmx_yangkuang: {
			mark: true,
			marktext: "☯",
			zhuanhuanji: true,
			init: function (player, skill) {
				player.storage[skill] = true;
			},
			intro: {
				content: function (storage, player) {
					var str = "转换技，";
					if (storage)
						str += "你可以将一张红色牌当做【决斗】对自己使用";
					else str += "你可以将一张黑色牌当【过河拆桥】对自己使用";
					return str;
				},
			},
			group: ["qsmx_yangkuang_yang", "qsmx_yangkuang_yin"],
			subSkill: {
				yang: {
					locked: false,
					audio: 2,
					enable: "phaseUse",
					discard: false,
					filter: function (event, player) {
						if (player.storage.qsmx_yangkuang == false)
							return false;
						return player.countCards("hes", { color: "red" }) > 0;
					},
					viewAs: {
						name: "juedou",
					},
					position: "hes",
					filterCard: function (card, player, event) {
						return get.color(card) == "red";
					},
					selectTarget: -1,
					filterTarget: function (card, player, target) {
						return player == target;
					},
					onuse: function (links, player) {
						player.changeZhuanhuanji("qsmx_yangkuang");
					},
					check: function (card) {
						var player = _status.event.player;
						return 9 - get.value(card);
					},
					ai: {
						result: {
							target: function (card, target) {
								if (
									target.countSkill("qsmx_yangkuang_yang") >=
									1
								) {
									return 0;
								} else {
									return 1;
								}
							},
							ignoreStatus: true,
						},
						order: 12,
						basic: {
							order: 1,
							useful: 1,
							value: 8,
						},
						tag: {
							damage: 1,
						},
					},
					_priority: 0,
				},
				yin: {
					locked: false,
					audio: 2,
					enable: "phaseUse",
					discard: false,
					filter: function (event, player) {
						if (player.storage.qsmx_yangkuang == true) return false;
						return player.countCards("hes", { color: "red" }) > 0;
					},
					viewAs: {
						name: "guohe",
					},
					position: "hes",
					filterCard: function (card, player, event) {
						return get.color(card) == "black";
					},
					selectTarget: -1,
					filterTarget: function (card, player, target) {
						return player == target;
					},
					check: function (card) {
						var player = _status.event.player;
						return 9 - get.value(card);
					},
					onuse: function (links, player) {
						player.changeZhuanhuanji("qsmx_yangkuang");
					},
					ai: {
						result: {
							target: 1,
							ignoreStatus: true,
						},
						order: 12,
						basic: {
							order: 1,
							useful: 1,
							value: 8,
						},
						tag: {
							damage: 1,
						},
					},
					_priority: 0,
				},
			},
		},
		qsmx_diejia: {
			forced: true,
			trigger: {
				player: ["damageEnd"],
			},
			filter: function (event, player) {
				return true;
			},
			getIndex(event, player, triggername) {
				return event.num;
			},
			content() {
				player.changeHujia(1);
			},
			_priority: 0,
		},
		qsmx_liegong: {
			audio: "ext:奇思妙想/resource/audio/skill/:2",
			enable: "chooseToUse",
			chargeSkill: true,
			filterCard: true,
			selectCard: 0,
			filter: function (event, player) {
				return true;
			},
			viewAs: {
				name: "sha",
				storage: {
					qsmx_liegong: true,
				},
			},
			onuse: function (links, player) {
				var num = player.getAttackRange();
				var cards = get.bottomCards(num);
				links.cards = cards;
			},
			group: [
				"qsmx_liegong_charge",
				"qsmx_liegong_effect",
				"qsmx_liegong_excluded",
			],
			subSkill: {
				text: {},
				charge: {
					trigger: {
						player: "phaseEnd",
					},
					forced: true,
					filter(event, player) {
						if (player.getHistory("skipped").includes("phaseUse"))
							return true;
						const history = player
							.getHistory("useCard")
							.concat(player.getHistory("respond"));
						for (let i = 0; i < history.length; i++) {
							if (
								history[i].card.name == "sha" &&
								history[i].isPhaseUsing()
							)
								return false;
						}
						return true;
					},
					async content(event, trigger, player) {
						player.addMark("charge", 1, false);
					},
					_priority: 0,
					ai: {
						effect: {
							target(card, player, target) {
								if (
									get.name(card) == "sha" &&
									player.getAttackRange() < 5
								)
									return 0.2;
							},
						},
					},
				},
				effect: {
					mod: {
						attackRange: (player, num) =>
							num + player.countMark("charge"),
					},
				},
				excluded: {
					forced: true,
					charlotte: true,
					trigger: {
						player: "useCard",
					},
					filter: function (event, player) {
						if (!event.card.storage.qsmx_liegong) return false;
						var suits = [];
						var cards = event.cards;
						for (let index = 0; index < cards.length; index++) {
							const card = cards[index];
							if (suits.includes(get.suit(card))) {
								return true;
							} else {
								suits.push(get.suit(card));
							}
						}
					},
					content: function () {
						"step 0";
						var next = game.createEvent("qsmx_liegong_text", false);
						next.player = player;
						next.targets = trigger.targets;
						next.setContent(function () {
							"step 0";
							player.$skill(get.translation(event.name));
							for (
								let index = 0;
								index < targets.length;
								index++
							) {
								const target = targets[index];
								target.resetFuction();
								var next = target.AntiResistanceDie();
								next.includeOut = true;
								game.log(
									"曾不可一世的",
									target,
									"被",
									player,
									"射杀"
								);
							}
							("step 1");
							game.delayx();
						});
						player.clearMark("charge");
						("step 1");
						trigger.targets.length = 0;
						trigger.all_excluded = true;
					},
				},
			},
			ai: {
				respondSha: true,
				yingbian: function (card, player, targets, viewer) {
					if (get.attitude(viewer, player) <= 0) return 0;
					var base = 0,
						hit = false;
					if (get.cardtag(card, "yingbian_hit")) {
						hit = true;
						if (
							targets.some((target) => {
								return (
									target.mayHaveShan(
										viewer,
										"use",
										target.getCards("h", (i) => {
											return i.hasGaintag("sha_notshan");
										})
									) &&
									get.attitude(viewer, target) < 0 &&
									get.damageEffect(
										target,
										player,
										viewer,
										get.natureList(card)
									) > 0
								);
							})
						)
							base += 5;
					}
					if (get.cardtag(card, "yingbian_add")) {
						if (
							game.hasPlayer(function (current) {
								return (
									!targets.includes(current) &&
									lib.filter.targetEnabled2(
										card,
										player,
										current
									) &&
									get.effect(current, card, player, player) >
										0
								);
							})
						)
							base += 5;
					}
					if (get.cardtag(card, "yingbian_damage")) {
						if (
							targets.some((target) => {
								return (
									get.attitude(player, target) < 0 &&
									(hit ||
										!target.mayHaveShan(
											viewer,
											"use",
											target.getCards("h", (i) => {
												return i.hasGaintag(
													"sha_notshan"
												);
											})
										) ||
										player.hasSkillTag(
											"directHit_ai",
											true,
											{
												target: target,
												card: card,
											},
											true
										)) &&
									!target.hasSkillTag("filterDamage", null, {
										player: player,
										card: card,
										jiu: true,
									})
								);
							})
						)
							base += 5;
					}
					return base;
				},
				canLink: function (player, target, card) {
					if (
						!target.isLinked() &&
						!player.hasSkill("wutiesuolian_skill")
					)
						return false;
					if (
						player.hasSkill("jueqing") ||
						player.hasSkill("gangzhi") ||
						target.hasSkill("gangzhi")
					)
						return false;
					return true;
				},
				basic: {
					useful: [5, 3, 1],
					value: [5, 3, 1],
				},
				order: function (item, player) {
					if (player.hasSkillTag("presha", true, null, true))
						return 10;
					if (
						typeof item === "object" &&
						game.hasNature(item, "linked")
					) {
						if (
							game.hasPlayer(function (current) {
								return (
									current != player &&
									lib.card.sha.ai.canLink(
										player,
										current,
										item
									) &&
									player.canUse(item, current, null, true) &&
									get.effect(current, item, player, player) >
										0
								);
							}) &&
							game.countPlayer(function (current) {
								return (
									current.isLinked() &&
									get.damageEffect(
										current,
										player,
										player,
										get.nature(item)
									) > 0
								);
							}) > 1
						)
							return 3.1;
						return 3;
					}
					return 3.05;
				},
				result: {
					target: function (player, target, card, isLink) {
						let eff = -1.5,
							odds = 1.35,
							num = 1;
						if (
							player.identity == "nei" &&
							target.identity == "zhu" &&
							game.countPlayer(true, true) > 2
						) {
							return -6.5;
						}
						if (isLink) {
							let cache = _status.event.getTempCache(
								"sha_result",
								"eff"
							);
							if (
								typeof cache !== "object" ||
								cache.card !== get.translation(card)
							)
								return eff;
							if (cache.odds < 1.35 && cache.bool)
								return 1.35 * cache.eff;
							return cache.odds * cache.eff;
						}
						if (
							player.hasSkill("jiu") ||
							player.hasSkillTag("damageBonus", true, {
								target: target,
								card: card,
							})
						) {
							if (
								target.hasSkillTag("filterDamage", null, {
									player: player,
									card: card,
									jiu: true,
								})
							)
								eff = -0.5;
							else {
								num = 2;
								if (get.attitude(player, target) > 0) eff = -7;
								else eff = -4;
							}
						}
						if (
							!player.hasSkillTag(
								"directHit_ai",
								true,
								{
									target: target,
									card: card,
								},
								true
							)
						)
							odds -=
								0.7 *
								target.mayHaveShan(
									player,
									"use",
									target.getCards("h", (i) => {
										return i.hasGaintag("sha_notshan");
									}),
									"odds"
								);
						_status.event.putTempCache("sha_result", "eff", {
							bool:
								target.hp > num &&
								get.attitude(player, target) > 0,
							card: get.translation(card),
							eff: eff,
							odds: odds,
						});
						return odds * eff;
					},
				},
				tag: {
					respond: 1,
					respondShan: 1,
					damage: function (card) {
						if (game.hasNature(card, "poison")) return;
						return 1;
					},
					natureDamage: function (card) {
						if (game.hasNature(card, "linked")) return 1;
					},
					fireDamage: function (card, nature) {
						if (game.hasNature(card, "fire")) return 1;
					},
					thunderDamage: function (card, nature) {
						if (game.hasNature(card, "thunder")) return 1;
					},
					poisonDamage: function (card, nature) {
						if (game.hasNature(card, "poison")) return 1;
					},
				},
				threaten: 114514,
			},
			_priority: 0,
		},
		qsmx_fengyin: {
			init: function (player, skill) {
				player.addSkillBlocker(skill);
			},
			onremove: function (player, skill) {
				player.removeSkillBlocker(skill);
			},
			charlotte: true,
			skillBlocker: function (skill, player) {
				return (
					lib.qsmx.ResistanceInfo(skill) ||
					lib.qsmx.EncryptSkill(skill)
				);
			},
			mark: true,
			intro: {
				content: function (storage, player, skill) {
					var list = player
						.getSkills(null, false, false)
						.filter(function (i) {
							return lib.skill.qsmx_fengyin.skillBlocker(
								i,
								player
							);
						});
					if (list.length)
						return "失效技能：" + get.translation(list);
					return "无失效技能";
				},
			},
			_priority: 0,
		},
		qsmx_liancai: {
			mod: {
				aiOrder(player, card, num) {
					if (
						num <= 0 ||
						get.itemtype(card) !== "card" ||
						get.type(card) !== "equip"
					)
						return num;
					let eq = player.getEquip(get.subtype(card));
					if (
						eq &&
						get.equipValue(card) - get.equipValue(eq) <
							Math.max(1.2, 6 - player.hp)
					)
						return 0;
				},
			},
			locked: false,
			enable: "phaseUse",
			position: "h",
			filterCard: true,
			discard: false,
			selectCard: 2,
			prompt: "将2张手牌当做“财”置入你的武将牌上并摸1张牌",
			check(card) {
				return true;
			},
			async content(event, trigger, player) {
				player.loseToSpecial(event.cards, "qsmx_liancai", player);
				player.draw();
			},
			ai: {
				order: 9,
				result: {
					player: 2,
				},
				threaten: 1.5,
			},
			_priority: 0,
		},
		qsmx_luoshen: {
			frequent: true,
			audio: "ext:奇思妙想/resource/audio/skill/:2",
			intro: {
				mark: function (dialog, storage, player) {
					var cards = player.getCards("s", (card) =>
						card.hasGaintag("qsmx_luoshen")
					);
					if (!cards || !cards.length) return;
					dialog.addAuto(cards);
				},
				markcount: function (storage, player) {
					return player.countCards("s", (card) =>
						card.hasGaintag("qsmx_luoshen")
					);
				},
			},
			trigger: {
				player: ["gainEnd"],
			},
			filter: function (event, player) {
				var cards = event.cards;
				if (!cards) return;
				return cards.some((c) => get.color(c, player) == "black");
			},
			content() {
				"step 0";
				var next = player.judge(function (card) {
					if (get.color(card) == "black") return 1.5;
					return -1.5;
				});
				("step 1");
				if (result.card) {
					event.cardx = result.card;
					player.gain(event.cardx);
				}
				("step 2");
				player.loseToSpecial([event.cardx], "qsmx_luoshen", player);
				player.markSkill("qsmx_luoshen");
			},
			group: ["qsmx_luoshen_unmark"],
			subSkill: {
				unmark: {
					trigger: {
						player: "loseAfter",
					},
					filter: function (event, player) {
						if (!event.ss || !event.ss.length) return false;
						return !player.countCards("s", (card) =>
							card.hasGaintag("qsmx_luoshen")
						);
					},
					charlotte: true,
					forced: true,
					silent: true,
					content: function () {
						player.unmarkSkill("qsmx_luoshen");
					},
					sub: true,
					popup: false,
					_priority: 1,
				},
			},
			_priority: 0,
		},
		qsmx_qingguo: {
			locked: false,
			mod: {
				aiValue(player, card, num) {
					if (get.name(card) != "shan" && get.color(card) != "black")
						return;
					const cards = player.getCards(
						"hs",
						(card) =>
							get.name(card) == "shan" ||
							get.color(card) == "black"
					);
					cards.sort((a, b) => {
						return (
							(get.name(b) == "shan" ? 1 : 2) -
							(get.name(a) == "shan" ? 1 : 2)
						);
					});
					const geti = () => {
						if (cards.includes(card)) cards.indexOf(card);
						return cards.length;
					};
					if (get.name(card) == "shan")
						return (
							Math.min(num, [6, 4, 3][Math.min(geti(), 2)]) * 0.6
						);
					return Math.max(num, [6.5, 4, 3][Math.min(geti(), 2)]);
				},
				aiUseful() {
					return lib.skill.qsmx_qingguo.mod.aiValue.apply(
						this,
						arguments
					);
				},
			},
			audio: "ext:奇思妙想/resource/audio/skill/:2",
			enable: ["chooseToRespond", "chooseToUse"],
			filterCard: function (card) {
				return get.color(card) == "black";
			},
			position: "hes",
			viewAs: {
				name: "shan",
			},
			viewAsFilter: function (player) {
				if (!player.countCards("hes", { color: "black" })) return false;
			},
			prompt: "将一张黑色牌当闪打出",
			check: function () {
				return 1;
			},
			ai: {
				order: 2,
				respondShan: true,
				skillTagFilter: function (player) {
					if (!player.countCards("hes", { color: "black" }))
						return false;
				},
				effect: {
					target: function (card, player, target, current) {
						if (get.tag(card, "respondShan") && current < 0)
							return 0.6;
					},
				},
				basic: {
					useful: (card, i) => {
						let player = _status.event.player,
							basic = [7, 5.1, 2],
							num = basic[Math.min(2, i)];
						if (player.hp > 2 && player.hasSkillTag("maixie"))
							num *= 0.57;
						if (
							player.hasSkillTag("freeShan", false, null, true) ||
							player.getEquip("rewrite_renwang")
						)
							num *= 0.8;
						return num;
					},
					value: [7, 5.1, 2],
				},
				result: {
					player: 1,
				},
			},
			group: ["qsmx_qingguo_useCard", "qsmx_qingguo_excluded"],
			subSkill: {
				useCard: {
					trigger: {
						player: ["useCard", "respond"],
					},
					forced: true,
					silent: true,
					filter: function (event, player) {
						return event.card.name == "shan";
					},
					content: function () {
						player.draw();
					},
				},
				excluded: {
					trigger: {
						global: "useCard",
					},
					forced: true,
					locked: false,
					filter: function (event, player) {
						if (event.player == player) return false;
						if (!event.targets.includes(player)) return false;
						return true;
					},
					content: function () {
						"step 0";
						var next = player.chooseToRespond(
							"打出一张【闪】令此牌对你无效",
							"hes",
							function (card) {
								var player = _status.event.player;
								var mod2 = game.checkMod(
									card,
									player,
									"unchanged",
									"cardEnabled2",
									player
								);
								if (mod2 != "unchanged") return mod2;
								var mod = game.checkMod(
									card,
									player,
									"unchanged",
									"cardRespondable",
									player
								);
								if (mod != "unchanged") return mod;
								return true;
							}
						);
						next.set("ai", function (card) {
							return -get.attitude(player, event.player) <= 0;
						});
						next.set("filterCard", function (card) {
							return card.name == "shan";
						});
						("step 1");
						if (result.bool) {
							trigger.excluded.add(player);
						}
					},
					ai: {
						effect: {
							target: function (card, player, target) {
								if (player.hasShan()) return "zerotarget";
							},
						},
					},
					_priority: 5,
				},
			},
			_priority: 0,
		},
		qsmx_shidi: {
			forced: true,
			silent: true,
			firstDo: true,
			group: ["qsmx_shidi_damageEnd", "qsmx_shidi_excluded"],
			trigger: {
				global: "gameStart",
				player: "enterGame",
			},
			filter: function (event, player) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_huangzhong")) return false;
				return true;
			},
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_huangzhong")) {
					player.removeSkill(skill);
				} else {
					player.initCharacterLocker();
				}
			},
			onremove: function (player, skill) {
				player.addSkill(skill);
			},
			content: function () {
				player.initDieResistance();
				player.initDyingResistance();
				player.initControlResistance();
				player.initMadResistance();
				player.initSkillResistance();
				player.initHpLocker(player.hp);
				player.initmaxHpLocker(player.maxHp);
			},
			subSkill: {
				damageEnd: {
					trigger: {
						player: "damageEnd",
					},
					forced: true,
					popup: false,
					silent: true,
					lastDo: true,
					filter: function (event, player) {
						if (!event.source) return false;
						if (!event.cards) return false;
						var source = event.source;
						var cards = event.cards;
						var AttackRange = source.getAttackRange();
						if (cards.length == AttackRange - 1) return true;
					},
					content: function () {
						game.log(player, "被", trigger.source, "狙杀");
						player.AntiResistanceDie();
					},
					sub: true,
					_priority: 1,
				},
				excluded: {
					trigger: {
						global: "useCard",
					},
					forced: true,
					filter: function (event, player) {
						if (event.player == player) return false;
						if (!event.targets.includes(player)) return false;
						return !get.is.ordinaryCard(event.card);
					},
					content: function () {
						trigger.excluded.add(player);
					},
					ai: {
						effect: {
							target: function (card, player, target) {
								if (get.is.ordinaryCard(card))
									return "zerotarget";
							},
						},
					},
					_priority: 5,
				},
			},
			ai: {
				HpResistance: true,
				maxHpResistance: true,
				DieResistance: true,
			},
			popup: false,
			audioname2: {
				key_shiki: "shiki_omusubi",
			},
			_priority: 1,
		},
		qsmx_fushe: {
			trigger: {
				global: "roundStart",
			},
			direct: true,
			group: ["qsmx_fushe_cancel"],
			marktext: "伏",
			intro: {
				markcount: function (storage) {
					return storage.length;
				},
				mark: function (dialog, content, player) {
					const storage = player.getStorage("qsmx_fushe");
					if (player.isUnderControl(true) && storage.length) {
						dialog.addText("当前记录牌名：");
						dialog.addSmall([storage, "vcard"]);
					}
				},
			},
			content: function () {
				"step 0";
				player.storage.qsmx_fushe.length = 0;
				("step 1");
				var list = [];
				for (var i = 0; i < lib.inpile.length; i++) {
					var name = lib.inpile[i];
					var type = get.type(name);
					list.push([type, "", name]);
				}
				var next = player.chooseButton(
					["伏射", [list, "vcard"]],
					[1, 3]
				);
				next.set("ai", function (button) {
					switch (button.link[2]) {
						case "wuxie":
							return 5 + Math.random();
						case "sha":
							return 5 + Math.random();
						case "tao":
							return 4 + Math.random();
						case "jiu":
							return 3 + Math.random();
						case "lebu":
							return 3 + Math.random();
						case "shan":
							return 4.5 + Math.random();
						case "wuzhong":
							return 4 + Math.random();
						case "shunshou":
							return 2.7 + Math.random();
						case "nanman":
							return 2 + Math.random();
						case "wanjian":
							return 1.6 + Math.random();
						default:
							return 1.5 + Math.random();
					}
				});
				("step 2");
				if (result.bool) {
					var links = result.links;
					for (let index = 0; index < links.length; index++) {
						const link = links[index];
						player.storage.qsmx_fushe.add(link[2]);
					}
					player.markSkill("qsmx_fushe");
				} else {
					player.unmarkSkill("qsmx_fushe");
				}
			},
			subSkill: {
				cancel: {
					trigger: {
						global: "useCard",
					},
					filter: function (event, player) {
						return (
							event.player != player &&
							player.storage.qsmx_fushe.includes(
								event.card.name
							) &&
							player.hasSha()
						);
					},
					prompt2: function (event, player) {
						return (
							"移除" +
							get.translation(event.card.name) +
							"的记录，令" +
							get.translation(event.card) +
							"无效"
						);
					},
					content: function () {
						"step 0";
						player.storage.qsmx_fushe.remove(trigger.card.name);
						if (player.storage.qsmx_fushe) {
							player.markSkill("qsmx_fushe");
						} else {
							player.unmarkSkill("qsmx_fushe");
						}
						trigger.targets.length = 0;
						trigger.all_excluded = true;
						("step 1");
						var next = player.chooseToUse(function (
							card,
							player,
							event
						) {
							if (get.name(card) != "sha") return false;
							return lib.filter.filterCard.apply(this, arguments);
						},
						"伏射：对" + get.translation(trigger.player) + "使用一张杀");
						next.set("targetRequired", true);
						next.set("complexSelect", true);
						next.set(
							"filterTarget",
							function (card, player, target) {
								if (
									target != _status.event.sourcex &&
									!ui.selected.targets.includes(
										_status.event.sourcex
									)
								)
									return false;
								return true;
							}
						);
						next.set("sourcex", trigger.player);
					},
				},
			},
			init: function (player, skill) {
				player.storage[skill] = [];
			},
		},
		qsmx_wusheng: {
			audio: "wusheng",
			enable: ["chooseToUse", "chooseToRespond"],
			filterCard: true,
			position: "hes",
			filter: function (event, player) {
				if (!player.countCards("hes")) return false;
				return true;
			},
			prompt: "将一张牌当杀使用或打出",
			viewAs: {
				name: "sha",
			},
			group: ["qsmx_wusheng_useCard"],
			subSkill: {
				useCard: {
					trigger: {
						player: "useCard",
					},
					mod: {
						targetInRange: function (card, player) {
							if (
								ui.selected.cards.some(
									(c) => get.suit(c) == "diamond"
								) &&
								card.name == "sha"
							)
								return true;
						},
						selectTarget(card, player, range) {
							if (
								ui.selected.cards.some(
									(c) => get.suit(c) == "club"
								) &&
								range[1] != -1 &&
								card.name == "sha"
							)
								range[1]++;
						},
					},
					forced: true,
					silent: true,
					filter: function (event, player) {
						return event.card.name == "sha";
					},
					content: function () {
						var cards = trigger.cards;
						if (cards.some((c) => get.color(c) == "red")) {
							trigger.baseDamage++;
						}
						if (cards.some((c) => get.color(c) == "black")) {
							trigger.effectCount++;
						}
						if (cards.some((c) => get.suit(c) == "heart")) {
							trigger.directHit.addArray(trigger.targets);
						}
						if (cards.some((c) => get.suit(c) == "spade")) {
							for (
								let index = 0;
								index < trigger.targets.length;
								index++
							) {
								const target = trigger.targets[index];
								target.addTempSkill("fengyin");
							}
						}
					},
				},
			},
			ai: {
				respondSha: true,
				yingbian: function (card, player, targets, viewer) {
					if (get.attitude(viewer, player) <= 0) return 0;
					var base = 0,
						hit = false;
					if (get.cardtag(card, "yingbian_hit")) {
						hit = true;
						if (
							targets.some((target) => {
								return (
									target.mayHaveShan(
										viewer,
										"use",
										target.getCards("h", (i) => {
											return i.hasGaintag("sha_notshan");
										})
									) &&
									get.attitude(viewer, target) < 0 &&
									get.damageEffect(
										target,
										player,
										viewer,
										get.natureList(card)
									) > 0
								);
							})
						)
							base += 5;
					}
					if (get.cardtag(card, "yingbian_add")) {
						if (
							game.hasPlayer(function (current) {
								return (
									!targets.includes(current) &&
									lib.filter.targetEnabled2(
										card,
										player,
										current
									) &&
									get.effect(current, card, player, player) >
										0
								);
							})
						)
							base += 5;
					}
					if (get.cardtag(card, "yingbian_damage")) {
						if (
							targets.some((target) => {
								return (
									get.attitude(player, target) < 0 &&
									(hit ||
										!target.mayHaveShan(
											viewer,
											"use",
											target.getCards("h", (i) => {
												return i.hasGaintag(
													"sha_notshan"
												);
											})
										) ||
										player.hasSkillTag(
											"directHit_ai",
											true,
											{
												target: target,
												card: card,
											},
											true
										)) &&
									!target.hasSkillTag("filterDamage", null, {
										player: player,
										card: card,
										jiu: true,
									})
								);
							})
						)
							base += 5;
					}
					return base;
				},
				canLink: function (player, target, card) {
					if (
						!target.isLinked() &&
						!player.hasSkill("wutiesuolian_skill")
					)
						return false;
					if (
						player.hasSkill("jueqing") ||
						player.hasSkill("gangzhi") ||
						target.hasSkill("gangzhi")
					)
						return false;
					return true;
				},
				basic: {
					useful: [5, 3, 1],
					value: [5, 3, 1],
				},
				order: function (item, player) {
					if (player.hasSkillTag("presha", true, null, true))
						return 10;
					if (
						typeof item === "object" &&
						game.hasNature(item, "linked")
					) {
						if (
							game.hasPlayer(function (current) {
								return (
									current != player &&
									lib.card.sha.ai.canLink(
										player,
										current,
										item
									) &&
									player.canUse(item, current, null, true) &&
									get.effect(current, item, player, player) >
										0
								);
							}) &&
							game.countPlayer(function (current) {
								return (
									current.isLinked() &&
									get.damageEffect(
										current,
										player,
										player,
										get.nature(item)
									) > 0
								);
							}) > 1
						)
							return 3.1;
						return 3;
					}
					return 3.05;
				},
				result: {
					target: function (player, target, card, isLink) {
						let eff = -1.5,
							odds = 1.35,
							num = 1;
						if (isLink) {
							let cache = _status.event.getTempCache(
								"sha_result",
								"eff"
							);
							if (
								typeof cache !== "object" ||
								cache.card !== get.translation(card)
							)
								return eff;
							if (cache.odds < 1.35 && cache.bool)
								return 1.35 * cache.eff;
							return cache.odds * cache.eff;
						}
						if (
							player.hasSkill("jiu") ||
							player.hasSkillTag("damageBonus", true, {
								target: target,
								card: card,
							})
						) {
							if (
								target.hasSkillTag("filterDamage", null, {
									player: player,
									card: card,
									jiu: true,
								})
							)
								eff = -0.5;
							else {
								num = 2;
								if (get.attitude(player, target) > 0) eff = -7;
								else eff = -4;
							}
						}
						if (
							!player.hasSkillTag(
								"directHit_ai",
								true,
								{
									target: target,
									card: card,
								},
								true
							)
						)
							odds -=
								0.7 *
								target.mayHaveShan(
									player,
									"use",
									target.getCards("h", (i) => {
										return i.hasGaintag("sha_notshan");
									}),
									"odds"
								);
						_status.event.putTempCache("sha_result", "eff", {
							bool:
								target.hp > num &&
								get.attitude(player, target) > 0,
							card: get.translation(card),
							eff: eff,
							odds: odds,
						});
						return odds * eff;
					},
				},
				tag: {
					respond: 1,
					respondShan: 1,
					damage: function (card) {
						if (game.hasNature(card, "poison")) return;
						return 1;
					},
					natureDamage: function (card) {
						if (game.hasNature(card, "linked")) return 1;
					},
					fireDamage: function (card, nature) {
						if (game.hasNature(card, "fire")) return 1;
					},
					thunderDamage: function (card, nature) {
						if (game.hasNature(card, "thunder")) return 1;
					},
					poisonDamage: function (card, nature) {
						if (game.hasNature(card, "poison")) return 1;
					},
				},
				threaten: 114514,
			},
			_priority: 0,
		},
		qsmx_yijue: {
			audio: "yijue",
			trigger: {
				source: "damageBegin2",
			},
			filter: function (event, player) {
				return player != event.player && event.num >= event.player.hp;
			},
			check: function (event, player) {
				return (
					get.damageEffect(event.player, player, player) < 0 ||
					event.player.isDisabledJudge()
				);
			},
			content: function () {
				"step 0";
				trigger.cancel();
				("step 1");
				var target = trigger.player;
				if (!target.isDisabledJudge()) {
					target.disableJudge();
					player.gain(target.getCards("hej"));
				} else {
					var next = trigger.player.AntiResistanceDie();
					next.source = player;
					event.finish();
				}
			},
		},
		qsmx_winwin: {
			charlotte: true,
			init: function (player, skill) {
				_status.forceWin.add(player);
			},
		},
		qsmx_jianxiong: {
			audio: 1,
			trigger: {
				player: "damageEnd",
			},
			frequent: true,
			content: function () {
				"step 0";
				var skills = Object.keys(lib.skill);
				var parent = trigger.getParent();
				if (
					skills.includes(parent.name) &&
					trigger.source &&
					trigger.source != player
				) {
					//trigger.source.removeSkills(parent.name);
					player.addSkills(parent.name);
				}
				if (
					get.itemtype(trigger.cards) == "cards" &&
					get.position(trigger.cards[0], true) == "o"
				) {
					player.gain(trigger.cards, "gain2");
					if (parent.skill) {
						//trigger.source.removeSkills(parent.skill);
						player.addSkills(parent.skill);
					}
				}
				player.draw(player.countMark("qsmx_jianxiong") + 1, "nodelay");
				("step 1");
				if (player.countMark("qsmx_jianxiong") < 6)
					player.addMark("qsmx_jianxiong", 1, false);
			},
			marktext: "雄",
			intro: {
				markcount(storage, player) {
					return player.countMark("qsmx_jianxiong") + 1;
				},
				content(storage, player) {
					return (
						"摸牌数为" + (player.countMark("qsmx_jianxiong") + 1)
					);
				},
			},
			ai: {
				maixie: true,
				maixie_hp: true,
				effect: {
					target: function (card, player, target) {
						if (player.hasSkillTag("jueqing", false, target))
							return [1, -1];
						if (get.tag(card, "damage") && player != target)
							return [1, 0.6];
					},
				},
			},
			_priority: 0,
		},
		qsmx_yibing: {
			trigger: {
				player: "gainEnd",
			},
			direct: true,
			filter: function (event, player) {
				return !player.isPhaseUsing();
			},
			content: function () {
				"step 0";
				event.lastUsed = player.getLastUsed();
				("step 1");
				player.chooseToUse();
				("step 2");
				if (result.bool) {
					player.logSkill("qsmx_yibing");
					var lastUsed = event.lastUsed;
					if (
						lastUsed &&
						get.type(lastUsed.card) != get.type(result.card)
					) {
						player.damage("nosource", "unreal");
					}
				}
			},
		},
		qsmx_fangzhu: {
			audio: 2,
			trigger: {
				player: "damageEnd",
			},
			direct: true,
			preHidden: true,
			group: ["qsmx_fangzhu_cancel"],
			getIndex(event, player, triggername) {
				return event.num;
			},
			content: function () {
				"step 0";
				var draw = player.getDamagedHp();
				player
					.chooseTarget(
						get.prompt("fangzhu"),
						"令一名其他角色强制翻面" +
							(draw > 0
								? "并摸" + get.cnNumber(draw) + "张牌"
								: ""),
						function (card, player, target) {
							return player != target;
						}
					)
					.setHiddenSkill("qsmx_fangzhu")
					.set("ai", (target) => {
						//if(target.hasSkillTag('noturn')) return 0;
						var player = _status.event.player;
						var current = _status.currentPhase;
						var dis = current
							? get.distance(current, target, "absolute")
							: 1;
						var draw = player.getDamagedHp();
						var att = get.attitude(player, target);
						if (att == 0)
							return target.hasJudge("lebu")
								? Math.random() / 3
								: Math.sqrt(get.threaten(target)) / 5 +
										Math.random() / 2;
						if (att > 0) {
							if (target.isTurnedOver()) return att + draw;
							if (draw < 4) return -1;
							if (
								current &&
								target.getSeatNum() > current.getSeatNum()
							)
								return att + draw / 3;
							return (
								(10 *
									Math.sqrt(
										Math.max(0.01, get.threaten(target))
									)) /
									(3.5 - draw) +
								dis / (2 * game.countPlayer())
							);
						} else {
							if (target.isTurnedOver()) return att - draw;
							if (draw >= 5) return -1;
							if (
								current &&
								target.getSeatNum() <= current.getSeatNum()
							)
								return -att + draw / 3;
							return (
								(4.25 - draw) *
									10 *
									Math.sqrt(
										Math.max(0.01, get.threaten(target))
									) +
								(2 * game.countPlayer()) / dis
							);
						}
					});
				("step 1");
				if (result.bool) {
					player.logSkill("qsmx_fangzhu", result.targets);
					var draw = player.getDamagedHp();
					if (draw > 0) {
						result.targets[0].draw(draw);
					}
					result.targets[0].classList.toggle("turnedover");
				}
				("step 2");
				if (result) {
					var cards = result;
					for (let index = 0; index < cards.length; index++) {
						const card = cards[index];
						card.addGaintag("qsmx_fangzhu");
					}
				}
			},
			subSkill: {
				cancel: {
					forced: true,
					trigger: {
						global: ["turnOverBegin"],
					},
					filter: function (event, player) {
						var handCards = event.player.getCards("h");
						for (let index = 0; index < handCards.length; index++) {
							const card = handCards[index];
							if (card.hasGaintag("qsmx_fangzhu")) return true;
						}
					},
					content: function () {
						trigger.cancel();
						var next = player.discardPlayerCard(trigger.player);
						/*next.filterButton = function (button) {
							var card = button.link;
							if (card.hasGaintag("qsmx_fangzhu")) return true;
						};*/
					},
				},
			},
			ai: {
				maixie: true,
				maixie_hp: true,
				effect: {
					target: function (card, player, target) {
						if (get.tag(card, "damage")) {
							if (player.hasSkillTag("jueqing", false, target))
								return [1, -2];
							if (target.hp <= 1) return;
							if (!target.hasFriend()) return;
							var hastarget = false;
							var turnfriend = false;
							var players = game.filterPlayer();
							for (var i = 0; i < players.length; i++) {
								if (
									get.attitude(target, players[i]) < 0 &&
									!players[i].isTurnedOver()
								) {
									hastarget = true;
								}
								if (
									get.attitude(target, players[i]) > 0 &&
									players[i].isTurnedOver()
								) {
									hastarget = true;
									turnfriend = true;
								}
							}
							if (get.attitude(player, target) > 0 && !hastarget)
								return;
							if (turnfriend || target.hp == target.maxHp)
								return [0.5, 1];
							if (target.hp > 1) return [1, 0.5];
						}
					},
				},
			},
			_priority: 0,
		},
		qsmx_xingshang: {
			audio: "xingshang",
			trigger: {
				global: "dieAfter",
			},
			preHidden: true,
			direct: true,
			filter: function (event, player) {
				return event.player != player;
			},
			content: function () {
				"step 0";
				var list = [];
				var skills = trigger.player
					.getSkills(true, false)
					.filter((skill) => {
						if (skill == "jiu") return false;
						if (player.hasSkill(skill)) return false;
						if (!lib.translate[skill + "_info"]) return false;
						if (lib.translate[skill + "_info"] == "") return false;
						var info = get.info(skill);
						if (!info) return false;
						return true;
					});
				if (!skills.length) {
					event.finish();
					return;
				} else {
					for (var skill of skills) {
						list.push([
							skill,
							'<div class="popup text" style="width:calc(100% - 10px);display:inline-block"><div class="skill">【' +
								get.translation(skill) +
								"】</div><div>" +
								lib.translate[skill + "_info"] +
								"</div></div>",
						]);
					}
					var next = player.chooseButton([
						"行殇：请选择获得任意个技能",
						[list, "textbutton"],
					]);
					next.set("forced", false);
					next.set("selectButton", [1, skills.length]);
					next.set("ai", function (button) {
						return Math.random();
					});
					next.set("skills", skills);
				}
				("step 1");
				if (result.bool) {
					var skills = result.links;
					player.logSkill("qsmx_xingshang", trigger.player);
					player.addAdditionalSkills(null, skills.slice(0), true);
				}
				player.gainMaxHp();
				player.recover();
			},
			_priority: 0,
		},
		qsmx_reverse: {
			forced: true,
			charlotte: true,
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (!name.includes("qsmx_zhengxie")) {
					player.removeSkill(skill);
				} else {
					_status.GameResultReverse = true;
					player.initCharacterLocker();
				}
			},
			onremove: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (name.includes("qsmx_zhengxie")) {
					player.addSkill(skill);
				}
			},
			group: [
				"qsmx_reverse_dying",
				"qsmx_reverse_changeHp",
				"qsmx_reverse_gainMaxHp",
				"qsmx_reverse_loseMaxHp",
			],
			subSkill: {
				damage: {
					trigger: {
						player: ["damageBefore"],
						source: ["damageBefore"],
					},
					forced: true,
					charlotte: true,
					filter: function (event, player) {
						if (!event.source) return false;
						return !event.reverse;
					},
					content: function () {
						//缓存
						event.source = trigger.source;
						event.player = trigger.player;
						//反转
						trigger.source = event.player;
						trigger.player = event.source;
						//标记
						trigger.reverse = true;
						//清除缓存
						delete event.source;
						delete event.player;
					},
				},
				changeHp: {
					forced: true,
					charlotte: true,
					trigger: {
						player: ["changeHpBefore"],
					},
					filter: function (event, player) {
						return true;
					},
					content: function () {
						var temp = trigger.num;
						trigger.num = -temp;
					},
				},
				dying: {
					silent: true,
					charlotte: true,
					trigger: {
						player: ["changeHpAfter"],
					},
					filter: function (event, player) {
						return player.hp <= 0;
					},
					content: function () {
						player.dying();
					},
				},
				gainMaxHp: {
					forced: true,
					charlotte: true,
					trigger: {
						player: ["gainMaxHpBefore"],
					},
					filter: function (event, player) {
						return true;
					},
					content: function () {
						trigger.setContent("loseMaxHp");
					},
				},
				loseMaxHp: {
					forced: true,
					charlotte: true,
					trigger: {
						player: ["loseMaxHpBefore"],
					},
					filter: function (event, player) {
						return true;
					},
					content: function () {
						trigger.setContent("gainMaxHp");
					},
				},
			},
		},
		qsmx_tianxie: {
			charlotte: true,
			forced: true,
			unique: true,
			onremove: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (name.includes("qsmx_zhengxie")) {
					player.addSkill(skill);
				}
			},
			trigger: {
				player: ["changeHpEnd", "gainMaxHpEnd", "loseMaxHpEnd"],
			},
			group: ["qsmx_tianxie_MaxHp"],
			filter: function (event, player) {
				return player.hp == player.maxHp;
			},
			content: function () {
				player.gainMaxHp();
			},
			subSkill: {
				MaxHp: {
					charlotte: true,
					forced: true,
					unique: true,
					trigger: {
						player: ["gainMaxHpEnd", "loseMaxHpEnd"],
					},
					content: function () {
						if (trigger.name == "gainMaxHp") {
							player.loseHp();
						} else {
							player.recover();
						}
					},
				},
			},
		},
		qsmx_zhiheng: {
			audio: "rezhiheng",
			trigger: {
				player: ["useCard", "respond"],
			},
			frequent: true,
			filter: function (event, player) {
				return player.countCards("he") > 0;
			},
			content: function () {
				"step 0";
				event.count = Math.min(player.countCards("he"), player.maxHp);
				player.draw(event.count + 1);
				("step 1");
				var next = player.chooseToDiscard(event.count, true);
				next.set("ai", function (card) {
					return -player.getUseValue(card);
				});
			},
		},
		qsmx_huituo: {
			audio: 2,
			audioname: ["re_caorui"],
			trigger: {
				player: "damageEnd",
			},
			getIndex(event, player, triggername) {
				return event.num;
			},
			direct: true,
			content: function () {
				"step 0";
				var forced = event.forced === undefined ? false : event.forced;
				var info = get.skillInfoTranslation("huituo", player);
				var str = `###${
					forced ? "恢拓：请选择一名角色" : get.prompt("huituo")
				}###令一名角色判定。若结果为红色，其回复1点体力并摸2张牌；若结果为黑色，其获得1点护甲并摸1张牌`;
				player
					.chooseTarget(str, event.forced)
					.set("ai", function (target) {
						var player = _status.event.player;
						if (get.attitude(player, target) > 0) {
							return (
								get.recoverEffect(target, player, player) + 1
							);
						}
						return 0;
					});
				("step 1");
				if (result.bool) {
					player.logSkill("huituo", result.targets);
					var target = result.targets[0];
					event.target = target;
					target.judge(function (card) {
						if (target.hp == target.maxHp) {
							if (get.color(card) == "red") return -1;
						}
						if (get.color(card) == "red") return 1;
						return 0;
					});
				} else {
					event.finish();
				}
				("step 2");
				if (result.color) {
					if (result.color == "red") {
						if (event.target.hp < event.target.maxHp)
							event.target.recover();
						event.target.draw();
					} else {
						event.target.changeHujia();
					}
				}
			},
			ai: {
				maixie: true,
				maixie_hp: true,
			},
			_priority: 0,
		},
		qsmx_mingjian: {
			audio: "mingjian",
			trigger: {
				player: "phaseUseBefore",
			},
			filter: function (event, player) {
				return player.countCards("h");
			},
			direct: true,
			content: function () {
				"step 0";
				player
					.chooseTarget(
						get.prompt("oldmingjian"),
						"跳过出牌阶段并将所有手牌交给一名其他角色，你结束此回合，然后其于此回合后获得一个额外的出牌阶段",
						lib.filter.notMe
					)
					.set("ai", (target) => {
						var player = _status.event.player,
							att = get.attitude(player, target);
						if (target.hasSkillTag("nogain")) return 0.01 * att;
						if (
							player.countCards("h") ==
							player.countCards("h", "du")
						)
							return -att;
						if (target.hasJudge("lebu")) att *= 1.25;
						if (get.attitude(player, target) > 3) {
							var basis = get.threaten(target) * att;
							if (
								player == get.zhu(player) &&
								player.hp <= 2 &&
								player.countCards("h", "shan") &&
								!game.hasPlayer(function (current) {
									return (
										get.attitude(current, player) > 3 &&
										current.countCards("h", "tao") > 0
									);
								})
							)
								return 0;
							if (
								target.countCards("h") +
									player.countCards("h") >
								target.hp + 2
							)
								return basis * 0.8;
							return basis;
						}
						return 0;
					});
				("step 1");
				if (result.bool) {
					var target = result.targets[0];
					event.target = target;
					player.logSkill("oldmingjian", target);
					player.give(player.getCards("h"), target);
					trigger.cancel();
				} else event.finish();
				("step 2");
				var evt = trigger.getParent("phase");
				if (evt) {
					game.log(player, "结束了回合");
					evt.finish();
				}
				var next = target.insertPhase();
				next._noTurnOver = true;
				next.phaseList = ["phaseUse"];
				//next.setContent(lib.skill.oldmingjian.phase);
			},
			phase: function () {
				"step 0";
				player.phaseUse();
				("step 1");
				game.broadcastAll(function () {
					if (ui.tempnowuxie) {
						ui.tempnowuxie.close();
						delete ui.tempnowuxie;
					}
				});
			},
			_priority: 0,
		},
		qsmx_manqin: {
			audio: 2,
			enable: "phaseUse",
			position: "hs",
			viewAs: {
				name: "nanman",
			},
			filterCard: function (card, player) {
				if (ui.selected.cards.length) {
					return get.suit(card) != get.suit(ui.selected.cards[0]);
				}
				var cards = player.getCards("hs");
				for (var i = 0; i < cards.length; i++) {
					if (card != cards[i]) {
						if (get.suit(card) !== get.suit(cards[i])) return true;
					}
				}
				return false;
			},
			selectCard: 2,
			complexCard: true,
			check: function (card) {
				var player = _status.event.player;
				var targets = game.filterPlayer(function (current) {
					return player.canUse("nanman", current);
				});
				var num = 0;
				for (var i = 0; i < targets.length; i++) {
					var eff = get.sgn(
						get.effect(
							targets[i],
							{ name: "nanman" },
							player,
							player
						)
					);
					if (targets[i].hp == 1) {
						eff *= 1.5;
					}
					num += eff;
				}
				if (!player.needsToDiscard(-1)) {
					if (targets.length >= 7) {
						if (num < 2) return 0;
					} else if (targets.length >= 5) {
						if (num < 1.5) return 0;
					}
				}
				return 6 - get.value(card);
			},
			ai: {
				wuxie(target, card, player, viewer, status) {
					let att = get.attitude(viewer, target),
						eff = get.effect(target, card, player, target);
					if (Math.abs(att) < 1 || status * eff * att >= 0) return 0;
					let evt = _status.event.getParent("useCard"),
						pri = 1,
						bonus = player.hasSkillTag("damageBonus", true, {
							target: target,
							card: card,
						}),
						damage = 1,
						isZhu = function (tar) {
							return (
								tar.isZhu ||
								tar === game.boss ||
								tar === game.trueZhu ||
								tar === game.falseZhu
							);
						},
						canSha = function (tar, blur) {
							let known = tar.getKnownCards(viewer);
							if (!blur)
								return known.some((card) => {
									let name = get.name(card, tar);
									return (
										(name === "sha" ||
											name === "hufu" ||
											name === "yuchanqian") &&
										lib.filter.cardRespondable(card, tar)
									);
								});
							if (
								tar.countCards(
									"hs",
									(i) => !known.includes(i)
								) >
								4.67 - (2 * tar.hp) / tar.maxHp
							)
								return true;
							if (
								!tar.hasSkillTag(
									"respondSha",
									true,
									"respond",
									true
								)
							)
								return false;
							if (tar.hp <= damage) return false;
							if (tar.hp <= damage + 1) return isZhu(tar);
							return true;
						},
						self = false;
					if (canSha(target)) return 0;
					if (
						bonus &&
						!viewer.hasSkillTag("filterDamage", null, {
							player: player,
							card: card,
						})
					)
						damage = 2;
					if (
						(viewer.hp <= damage ||
							(viewer.hp <= damage + 1 && isZhu(viewer))) &&
						!canSha(viewer)
					) {
						if (viewer === target) return status;
						let fv = true;
						if (evt && evt.targets)
							for (let i of evt.targets) {
								if (fv) {
									if (target === i) fv = false;
									continue;
								}
								if (viewer == i) {
									if (isZhu(viewer)) return 0;
									self = true;
									break;
								}
							}
					}
					let maySha = canSha(target, true);
					if (
						bonus &&
						!target.hasSkillTag("filterDamage", null, {
							player: player,
							card: card,
						})
					)
						damage = 2;
					else damage = 1;
					if (isZhu(target)) {
						if (eff < 0) {
							if (
								target.hp <= damage + 1 ||
								(!maySha && target.hp <= damage + 2)
							)
								return 1;
							if (maySha && target.hp > damage + 2) return 0;
							else if (maySha || target.hp > damage + 2) pri = 3;
							else pri = 4;
						} else if (target.hp > damage + 1) pri = 2;
						else return 0;
					} else if (self) return 0;
					else if (eff < 0) {
						if (!maySha && target.hp <= damage) pri = 5;
						else if (maySha) return 0;
						else if (target.hp > damage + 1) pri = 2;
						else if (target.hp === damage + 1) pri = 3;
						else pri = 4;
					} else if (target.hp <= damage) return 0;
					let find = false;
					if (evt && evt.targets)
						for (let i = 0; i < evt.targets.length; i++) {
							if (!find) {
								if (evt.targets[i] === target) find = true;
								continue;
							}
							let att1 = get.attitude(viewer, evt.targets[i]),
								eff1 = get.effect(
									evt.targets[i],
									card,
									player,
									evt.targets[i]
								),
								temp = 1;
							if (
								Math.abs(att1) < 1 ||
								att1 * eff1 >= 0 ||
								canSha(evt.targets[i])
							)
								continue;
							maySha = canSha(evt.targets[i], true);
							if (
								bonus &&
								!evt.targets[i].hasSkillTag(
									"filterDamage",
									null,
									{
										player: player,
										card: card,
									}
								)
							)
								damage = 2;
							else damage = 1;
							if (isZhu(evt.targets[i])) {
								if (eff1 < 0) {
									if (
										evt.targets[i].hp <= damage + 1 ||
										(!maySha &&
											evt.targets[i].hp <= damage + 2)
									)
										return 0;
									if (
										maySha &&
										evt.targets[i].hp > damage + 2
									)
										continue;
									if (
										maySha ||
										evt.targets[i].hp > damage + 2
									)
										temp = 3;
									else temp = 4;
								} else if (evt.targets[i].hp > damage + 1)
									temp = 2;
								else continue;
							} else if (eff1 < 0) {
								if (!maySha && evt.targets[i].hp <= damage)
									temp = 5;
								else if (maySha) continue;
								else if (evt.targets[i].hp > damage + 1)
									temp = 2;
								else if (evt.targets[i].hp === damage + 1)
									temp = 3;
								else temp = 4;
							} else if (evt.targets[i].hp > damage + 1) temp = 2;
							if (temp > pri) return 0;
						}
					return 1;
				},
				basic: {
					order: 9,
					useful: [5, 1],
					value: 5,
				},
				result: {
					player(player, target) {
						if (
							player._nanman_temp ||
							player.hasSkillTag("jueqing", false, target)
						)
							return 0;
						player._nanman_temp = true;
						let eff = get.effect(
							target,
							new lib.element.VCard({ name: "nanman" }),
							player,
							target
						);
						delete player._nanman_temp;
						if (eff >= 0) return 0;
						if (
							target.hp > 2 ||
							(target.hp > 1 &&
								!target.isZhu &&
								target != game.boss &&
								target != game.trueZhu &&
								target != game.falseZhu)
						)
							return 0;
						if (
							target.hp > 1 &&
							target.hasSkillTag(
								"respondSha",
								true,
								"respond",
								true
							)
						)
							return 0;
						let known = target.getKnownCards(player);
						if (
							known.some((card) => {
								let name = get.name(card, target);
								if (
									name === "sha" ||
									name === "hufu" ||
									name === "yuchanqian"
								)
									return lib.filter.cardRespondable(
										card,
										target
									);
								if (name === "wuxie")
									return lib.filter.cardEnabled(
										card,
										target,
										"forceEnable"
									);
							})
						)
							return 0;
						if (
							target.hp > 1 ||
							target.countCards("hs", (i) => !known.includes(i)) >
								4.67 - (2 * target.hp) / target.maxHp
						)
							return 0;
						let res = 0,
							att = get.sgnAttitude(player, target);
						res -=
							att *
							(0.8 * target.countCards("hs") +
								0.6 * target.countCards("e") +
								3.6);
						if (
							get.mode() === "identity" &&
							target.identity === "fan"
						)
							res += 2.4;
						if (
							(get.mode() === "guozhan" &&
								player.identity !== "ye" &&
								player.identity === target.identity) ||
							(get.mode() === "identity" &&
								player.identity === "zhu" &&
								(target.identity === "zhong" ||
									target.identity === "mingzhong"))
						)
							res -= 0.8 * player.countCards("he");
						return res;
					},
					target(player, target) {
						let zhu =
							(get.mode() === "identity" && target.isZhu) ||
							target.identity === "zhu";
						if (
							!lib.filter.cardRespondable({ name: "sha" }, target)
						) {
							if (zhu) {
								if (target.hp < 2) return -99;
								if (target.hp === 2) return -3.6;
							}
							return -2;
						}
						let known = target.getKnownCards(player);
						if (
							known.some((card) => {
								let name = get.name(card, target);
								if (
									name === "sha" ||
									name === "hufu" ||
									name === "yuchanqian"
								)
									return lib.filter.cardRespondable(
										card,
										target
									);
								if (name === "wuxie")
									return lib.filter.cardEnabled(
										card,
										target,
										"forceEnable"
									);
							})
						)
							return -1.2;
						let nh = target.countCards(
							"hs",
							(i) => !known.includes(i)
						);
						if (zhu && target.hp <= 1) {
							if (nh === 0) return -99;
							if (nh === 1) return -60;
							if (nh === 2) return -36;
							if (nh === 3) return -12;
							if (nh === 4) return -8;
							return -5;
						}
						if (
							target.hasSkillTag(
								"respondSha",
								true,
								"respond",
								true
							)
						)
							return -1.35;
						if (!nh) return -2;
						if (nh === 1) return -1.8;
						return -1.5;
					},
				},
				tag: {
					respond: 1,
					respondSha: 1,
					damage: 1,
					multitarget: 1,
					multineg: 1,
				},
			},
			_priority: 0,
		},
		qsmx_zaiqi: {
			audio: "zaiqi",
			trigger: {
				player: ["dying", "phaseZhunbeiBegin"],
			},
			filter: function (event, player) {
				return player.hp < player.maxHp;
			},
			frequent: true,
			content: function () {
				"step 0";
				event.cards = get.cards(player.getDamagedHp());
				game.cardsGotoOrdering(event.cards);
				player.showCards(event.cards);
				("step 1");
				var num = 0;
				for (var i = 0; i < event.cards.length; i++) {
					if (get.suit(event.cards[i]) == "heart") {
						num++;
						event.cards.splice(i--, 1);
					}
				}
				if (num) {
					player.recover(num);
				}
				("step 2");
				if (event.cards.length) {
					player.gain(event.cards, "gain2");
				}
			},
			ai: {
				threaten: function (player, target) {
					if (target.hp == 1) return 2;
					if (target.hp == 2) return 1.5;
					return 1;
				},
			},
			_priority: 0,
		},
		qsmx_jishi: {
			group: ["qsmx_jishi_recover", "qsmx_jishi_lose"],
			marktext: "药",
			intro: {
				name2: "药",
				content: "mark",
			},
			trigger: {
				global: "phaseBefore",
				player: "enterGame",
			},
			filter: function (event, player) {
				return event.name != "phase" || game.phaseNumber == 0;
			},
			forced: true,
			locked: false,
			content: function () {
				player.addMark(
					"qsmx_jishi",
					Math.min(3, 3 - player.countMark("qsmx_jishi"))
				);
			},
			ai: {
				threaten: 10,
			},
			subSkill: {
				recover: {
					enable: "chooseToUse",
					filter: function (event, player) {
						return (
							player.hasMark("qsmx_jishi") &&
							event.type == "dying"
						);
					},
					logTarget: "player",
					check: function (event, player) {
						var parent = event.getParent("chooseToUse");
						var dying = parent.dying;
						return get.recoverEffect(dying, player, player) > 0;
					},
					content: function () {
						player.removeMark("qsmx_jishi", 1);
						var parent = event.getParent("chooseToUse");
						var dying = parent.dying;
						dying.recover(1 - dying.hp);
					},
					ai: {
						save: true,
						skillTagFilter(player) {
							return player.hasMark("qsmx_jishi");
						},
					},
					sub: true,
					_priority: 0,
				},
				lose: {
					trigger: {
						player: "loseAfter",
						global: [
							"equipAfter",
							"addJudgeAfter",
							"gainAfter",
							"loseAsyncAfter",
							"addToExpansionAfter",
						],
					},
					filter: function (event, player) {
						var bool = false;
						if (event.name == "gain" && player == event.player)
							return false;
						var evt = event.getl(player);
						if (!evt || !evt.cards2 || !evt.cards2.length)
							return false;
						for (var i of evt.cards2) {
							if (
								get.color(i, player) == "red" &&
								i.original == "h"
							)
								bool = true;
						}
						if (!bool) return false;
						return player != _status.currentPhase;
					},
					forced: true,
					locked: false,
					content: function () {
						var num = 0,
							evt = trigger.getl(player);
						for (var i of evt.cards2) {
							if (
								get.color(i, player) == "red" &&
								i.original == "h" &&
								num < 3 - player.countMark("qsmx_jishi")
							)
								num++;
						}
						player.addMark("qsmx_jishi", num);
					},
					sub: true,
					_priority: 0,
				},
			},
			_priority: 0,
		},
		qsmx_jingyu: {
			trigger: {
				global: ["recoverAfter"],
			},
			frequent: true,
			filter: function (event, player) {
				return event.player != player;
			},
			async content(event, trigger, player) {
				player.draw(trigger.num);
			},
		},
		qsmx_tairan: {
			init: function (player, skill) {
				player.initCharacterLocker();
				player.initControlResistance();
				player.initmaxHpLocker(player.maxHp, true);
				player.initSkillResistance();
				player.initControlResistance();
				player.dieAfter = function () {
					var event = _status.event;
					if (
						!(
							event.getParent("qsmx_tairan").name == "qsmx_tairan"
						) &&
						player == event.player &&
						event.name == "die"
					) {
						event.finish();
						event._triggered = null;
						var tempHp = player.hp;
						lib.element.player.revive.apply(player, [null, false]);
						lib.element.player.changeHp.apply(player, [
							tempHp - 1,
							false,
						]);
					} else {
						lib.element.player.dieAfter.apply(player);
					}
				};
			},
			forced: true,
			charlotte: true,
			trigger: {
				player: "phaseEnd",
			},
			filter: function (event, player) {
				return player.hp <= 0;
			},
			async content(event, trigger, player) {
				player.dying();
			},
			_priority: 0,
		},
		qsmx_yimie: {
			audio: "yimie",
			trigger: {
				player: "useCard",
			},
			filter: function (event, player) {
				return get.tag(event.card, "damage");
			},
			check: function (event, player) {
				return player.hp > 1;
			},
			async content(event, trigger, player) {
				await player.loseHp();
				var targets = trigger.targets;
				trigger.excluded.addArray(targets);
				for (let target of targets) {
					let next = target.damage(player, "annihailate");
					next.annihailate = true;
					await next;
				}
			},
			ai: {
				threaten: 42,
			},
		},
		qsmx_ruilve: {
			unique: true,
			audio: 2,
			global: "qsmx_ruilve2",
			zhuSkill: true,
			_priority: 0,
		},
		qsmx_ruilve2: {
			enable: "phaseUse",
			discard: false,
			lose: false,
			delay: false,
			line: true,
			log: false,
			prepare: function (cards, player, targets) {
				targets[0].logSkill("ruilve");
			},
			prompt: function () {
				var player = _status.event.player;
				var list = game.filterPlayer(function (target) {
					return (
						target != player && target.hasZhuSkill("ruilve", player)
					);
				});
				var str = "将一张带有伤害标签的牌交给" + get.translation(list);
				if (list.length > 1) str += "中的一人";
				return str;
			},
			filter: function (event, player) {
				if (player.group != "jin") return false;
				if (
					player.countCards("h", lib.skill.qsmx_ruilve2.filterCard) ==
					0
				)
					return false;
				return game.hasPlayer(function (target) {
					return (
						target != player &&
						target.hasZhuSkill("qsmx_ruilve", player)
					);
				});
			},
			filterCard: function (card) {
				if (!get.tag(card, "damage")) return false;
				return true;
			},
			visible: true,
			filterTarget: function (card, player, target) {
				return (
					target != player &&
					target.hasZhuSkill("qsmx_ruilve", player)
				);
			},
			content: function () {
				"step 0";
				player.give(cards, target);
				("step 1");
				var next = target.chooseToUse();
				next.set("filterCard", function (card) {
					if (!get.tag(card, "damage")) return false;
					return true;
				});
			},
			ai: {
				expose: 0.3,
				order: 1,
				result: {
					target: 5,
				},
			},
			_priority: 0,
		},
		qsmx_tuxi: {
			trigger: {
				global: "gainBegin",
			},
			subSkill: {
				blocker: {
					mark: true,
					onremove: true,
					marktext: "袭",
					init: function (player, skill) {
						player.storage[skill] = [];
					},
					intro: {
						name: "突袭",
						mark: function (dialog, storage, player) {
							if (!storage || !storage.length)
								return "当前没有被突袭角色";
							dialog.addSmall([storage, "player"]);
						},
					},
				},
			},
			filter: function (event, player) {
				return (
					event.player != player &&
					!player
						.getStorage("qsmx_tuxi_blocker")
						.includes(event.player)
				);
			},
			async content(event, trigger, player) {
				trigger.cancel();
				player.addTempSkill("qsmx_tuxi_blocker");
				await player.gain(trigger.cards);
				player.markAuto("qsmx_tuxi_blocker", trigger.player);
			},
		},
		qsmx_sp_tuxi: {
			trigger: {
				global: ["pileChanged"],
			},
			frequent: true,
			filter: function (event, player) {
				if (_status.currentPhase == player) return false;
				return event.position == "o" && event.addedCards.length > 0;
			},
			content: function () {
				var cards = trigger.addedCards;
				player.gain(cards);
			},
		},
		qsmx_taoyin: {
			audio: "taoyin",
			trigger: {
				player: "showCharacterAfter",
			},
			hiddenSkill: true,
			logTarget: function () {
				return _status.currentPhase;
			},
			filter: function (event, player) {
				var target = _status.currentPhase;
				return target && target != player && target.isAlive();
			},
			check: function (event, player) {
				return get.attitude(player, _status.currentPhase) < 0;
			},
			content: function () {
				var currentPhase = _status.currentPhase;
				player.useCard({ name: "sha" }, [currentPhase]);
			},
			ai: {
				expose: 0.2,
			},
			_priority: 0,
		},
		huanyuyanmiezhu: {
			equipSkill: true,
			firstDo: true,
			forced: true,
			trigger: {
				source: "damageBefore",
			},
			filter: function (event, player) {
				return !event.annihailate;
			},
			async content(event, trigger, player) {
				trigger.set("annihailate", true);
			},
		},
		qsmx_shengong: {
			enable: ["phaseUse"],
			position: "hes",
			lose: false,
			discard: false,
			filterCard: true,
			selectCard: 1,
			content: function () {
				"step 0";
				var subtype = [
					"equip1",
					"equip2",
					"equip3",
					"equip4",
					"equip5",
					"cancel2",
				];
				var next = player.chooseControl(subtype);
				next.set("ai", function () {
					return Math.random();
				});
				("step 1");
				if (result.control != "cancel2") {
					var object = lib.cardPack;
					var omniCards = [];
					for (const key in object) {
						if (Object.hasOwnProperty.call(object, key)) {
							const element = object[key];
							omniCards.addArray(element);
						}
					}
					var equips = omniCards.filter(
						(c) => get.type(c) == "equip"
					);
					equips = equips.filter(
						(c) => get.subtype(c) == result.control
					);
					player.discard(cards);
					player.discoverCard(equips, 24);
				}
			},
		},
		qsmx_tianjiang: {
			enable: ["phaseUse"],
			position: "hs",
			lose: false,
			discard: false,
			filter: function (event, player) {
				return player.countCards("hs", { type: "equip" });
			},
			filterCard: function (card) {
				return get.type(card) == "equip";
			},
			filterTarget: true,
			selectCard: 1,
			content: function () {
				"step 0";
				event.cardx = cards[0];
				event.subtype = get.subtype(cards[0]);
				game.log(event.subtype);
				if (target.countEmptySlot(event.subtype) == 0) {
					player.chooseBool(
						"是否令" +
							get.translation(target.name) +
							"获得一个扩展" +
							get.translation(event.subtype) +
							"栏？"
					);
				} else {
					event.goto(2);
				}
				("step 1");
				if (result.bool) {
					target.expandEquip(event.subtype);
				}
				("step 2");
				player.equip(event.cardx);
			},
		},
		qsmx_resistance: {
			init: function (player, skill) {
				player.addSkillBlocker(skill);
			},
			/*onremove: function (player, skill) {
                player.removeSkillBlocker(skill);
            },*/
			skillBlocker: function (skill, player) {
				//排除有技能描述的技能
				if (lib.translate[skill + "_info"]) return false;
				//识别令武将进入混乱状态的技能
				if (skill == "mad") {
					player.removeSkill(skill);
				}
				//识别会令技能失效的技能
				if (lib.skill[skill].skillBlocker) {
					player.removeSkill(skill);
				}
				//识别会禁止使用或打出牌的技能
				if (lib.skill[skill].mod) {
					if (lib.skill[skill].mod.cardEnabled2) {
						player.removeSkill(skill);
					}
					if (lib.skill[skill].mod.cardEnabled) {
						player.removeSkill(skill);
					}
				}
				//识别令防具技能或护甲失效的技能
				if (lib.skill[skill].ai) {
					if (lib.skill[skill].ai.unequip2) {
						player.removeSkill(skill);
					}
					if (lib.skill[skill].ai.nohujia) {
						player.removeSkill(skill);
					}
				}
				return false;
			},
			_priority: 0,
		},
		qsmx_yizhao: {
			trigger: {
				global: "pileChanged",
			},
			filter: function (event, player) {
				if (!_status.currentPhase) return false;
				if (event.position == "c") {
					return event.getParent().name != "draw";
				}
			},
			frequent: function (event, player) {
				return true;
			},
			subSkill: {
				discard: {
					trigger: {
						global: [
							"loseAfter",
							"cardsDiscardAfter",
							"loseAsyncAfter",
						],
					},
					forced: true,
					filter(event, player) {
						if (event.name.indexOf("lose") == 0) {
							if (
								event.getlx === false ||
								event.position != ui.discardPile
							)
								return false;
						} else {
							var evt = event.getParent();
							if (
								evt.relatedEvent &&
								evt.relatedEvent.name == "useCard"
							)
								return false;
						}
						for (var i of event.cards) {
							var owner = false;
							if (event.hs && event.hs.includes(i))
								owner = event.player;
							return player.hasCard((card) => {
								return player.hasUseTarget(card, true, true);
							});
						}
						return false;
					},
					content() {
						player.chooseToUse("【异兆】：是否使用一张牌？");
					},
					_priority: 0,
				},
			},
			group: "qsmx_yizhao_discard",
			content: function () {
				player.draw();
			},
		},
		qsmx_linghua: {
			trigger: {
				player: ["gainAfter", "loseAfter"],
			},
			filter: function (event, player) {
				return (
					_status.currentPhase != player &&
					_status.currentPhase?.isIn()
				);
			},
			getIndex: function (event) {
				return event.cards.length;
			},
			frequent: function (event, player) {
				if (event.name == "gain")
					return get.attitude(player, _status.currentPhase) <= 0;
			},
			check: function (event, player) {
				if (event.name == "gain") {
					return get.attitude(player, _status.currentPhase) <= 0;
				} else {
					return get.damageEffect(
						_status.currentPhase,
						player,
						player,
						"thunder"
					);
				}
			},
			prompt2: function (event, player) {
				if (event.name == "gain") {
					return (
						"对" +
						get.translation(_status.currentPhase.name) +
						"造成一点雷电伤害"
					);
				} else {
					return (
						"将" +
						get.translation(_status.currentPhase.name) +
						"区域内一张牌置于牌堆顶"
					);
				}
			},
			content: function () {
				"step 0";
				if (trigger.name == "gain") {
					_status.currentPhase.damage(player, "thunder");
				} else {
					player.choosePlayerCard(_status.currentPhase, "hej");
				}
				("step 1");
				if (result.bool) {
					var currentPhase = _status.currentPhase;
					currentPhase.lose(result.cards, ui.cardPile, "insert");
				}
			},
		},
		qsmx_xukong: {
			trigger: {
				player: "damageBefore",
			},
			forced: true,
			content: function () {
				"step 0";
				trigger.cancel();
				player.loseHp();
				("step 1");
				player.judge(function (card) {
					if (player.hp == player.maxHp) {
						if (get.color(card) == "red") return -1;
					}
					return 1;
				});
				("step 2");
				if (result.color) {
					if (result.color == "red") {
						player.recover();
					} else {
						player.gain(get.bottomCards());
					}
				}
			},
		},
		qsmx_quanshi: {
			onremove: true,
			mark: true,
			intro: {
				mark: function (dialog, content, player) {
					var cardPile = Array.from(ui.cardPile.childNodes);
					if (player != game.me)
						return get.translation(player) + "观看牌堆中...";
					if (get.itemtype(cardPile.slice(0, 1)) != "cards")
						return "牌堆顶无牌";
					dialog.add(cardPile.slice(0, 1));
				},
			},
			_priority: 0,
		},
		qsmx_tudiao: {
			group: [
				"qsmx_tudiao_recover",
				"qsmx_tudiao_judge",
				"qsmx_tudiao_gain",
				"qsmx_tudiao_useCard",
				"qsmx_tudiao_discard",
				"qsmx_tudiao_turnOver",
				"qsmx_tudiao_damageSource",
			],
			onremove: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (name.includes("qsmx_zhangxianzhong")) {
					player.addSkill(skill);
				}
			},
			frequent: true,
			subSkill: {
				prompt: {
					prompt: function (event, player) {
						if (event.name.includes("damage")) {
							return (
								"是否视为对" +
								get.translation(event.source.name) +
								"使用一张【杀】（无视合法性）。"
							);
						} else {
							return (
								"是否视为对" +
								get.translation(event.player.name) +
								"使用一张【杀】（无视合法性）。"
							);
						}
					},
					frequent: function (event, player) {
						if (lib.config.autoskilllist.includes("qsmx_tudiao"))
							return false;
						if (event.name.includes("damage")) {
							return get.attitude(player, event.source) <= 0;
						} else {
							return get.attitude(player, event.player) <= 0;
						}
					},
					check: function (event, player) {
						if (event.name.includes("damage")) {
							return get.attitude(player, event.source) <= 0;
						} else {
							return get.attitude(player, event.player) <= 0;
						}
					},
					content: function () {
						if (trigger.name == "damage") {
							event.related = player.useCard(
								{ name: "sha", isCard: true },
								trigger.source,
								false
							);
						} else {
							event.related = player.useCard(
								{ name: "sha", isCard: true },
								trigger.player,
								false
							);
						}
						//game.log("Cause By:", trigger.name);
					},
					ai: {},
				},
				recover: {
					inherit: "qsmx_tudiao_prompt",
					trigger: {
						global: "recoverAfter",
					},
					filter: function (event, player) {
						if (!event.player?.isIn()) return false;
						if (player == event.player) return false;
						var evt = event.getParent("dying");
						if (evt && evt.name == "dying") return false;
						return true;
					},
				},
				judge: {
					inherit: "qsmx_tudiao_prompt",
					trigger: {
						global: "judgeAfter",
					},
					filter: function (event, player) {
						if (!event.player?.isIn()) return false;
						if (player == event.player) return false;
						var evt = event.getParent("phaseJudge");
						if (evt && evt.name == "phaseJudge") return false;
						return true;
					},
				},
				gain: {
					inherit: "qsmx_tudiao_prompt",
					trigger: {
						global: "gainAfter",
					},
					filter: function (event, player) {
						if (!event.player?.isIn()) return false;
						if (player == event.player) return false;
						var evt = event.getParent("phaseDraw");
						if (evt && evt.name == "phaseDraw") return false;
						return true;
					},
				},
				useCard: {
					inherit: "qsmx_tudiao_prompt",
					trigger: {
						global: ["useCardAfter"],
					},
					filter: function (event, player) {
						if (!event.player?.isIn()) return false;
						if (player == event.player) return false;
						if (event.player.isPhaseUsing()) return false;
						return true;
					},
				},
				discard: {
					inherit: "qsmx_tudiao_prompt",
					trigger: {
						global: ["loseAfter", "loseAsyncAfter"],
					},
					filter: function (event, player) {
						if (!event.player?.isIn()) return false;
						if (player == event.player) return false;
						if (event.type != "discard" || !event.cards2)
							return false;
						var evt = event.getParent("phaseDiscard");
						if (evt && evt.name == "phaseDiscard") return false;
						return true;
					},
				},
				turnOver: {
					inherit: "qsmx_tudiao_prompt",
					trigger: {
						global: "turnOverAfter",
					},
					filter: function (event, player) {
						if (!event.player?.isIn()) return false;
						if (player == event.player) return false;
						var evt = event.getParent("phaseJieshu");
						if (evt && evt.name == "phaseJieshu") return false;
						return true;
					},
				},
				damageSource: {
					inherit: "qsmx_tudiao_prompt",
					trigger: {
						global: ["damageSource"],
					},
					filter: function (event, player) {
						if (player == event.source) return false;
						if (event.source == _status.currentPhase) return false;
						return true;
					},
				},
			},
		},
		qsmx_qisha: {
			forced: true,
			trigger: {
				player: "useCard",
			},
			onremove: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (name.includes("qsmx_zhangxianzhong")) {
					player.addSkill(skill);
				}
			},
			filter: function (event, player) {
				var num = player.getAllHistory("useCard", function (event) {
					return event.card.name == "sha";
				}).length;
				return num % 7 == 0 && event.card.name == "sha";
			},
			content() {
				var targets = trigger.targets;
				for (let target of targets) {
					let next = target.damage(player, "annihailate");
					next.annihailate = true;
				}
			},
		},
		qsmx_xianzhong: {
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (name.includes("qsmx_zhangxianzhong")) {
					player.addSkill("qsmx_resistance");
					player.initCharacterLocker();
					player.initControlResistance();
					player.initmaxHpLocker(player.maxHp, true);
					player.initControlResistance();
					player.dieAfter = function () {
						var event = _status.event;
						if (
							!(game.shuffleNumber >= 7) &&
							player == event.player &&
							event.name == "die"
						) {
							event.finish();
							event._triggered = null;
							lib.element.player.revive.apply(player, [
								null,
								false,
							]);
							lib.element.player.changeHp.apply(player, [
								player.maxHp,
								false,
							]);
						} else {
							lib.element.player.dieAfter.apply(player);
						}
					};
				} else {
					player.removeSkill(skill);
				}
			},
			onremove: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (name.includes("qsmx_zhangxianzhong")) {
					player.addSkill(skill);
				}
			},
		},
		qsmx_paoxiao: {
			audio: "paoxiao",
			trigger: {
				player: "useCard",
			},
			forced: true,
			filter: function (event, player) {
				return event.card.name == "sha";
			},
			content: function () {
				trigger.effectCount += player.countUsed("sha");
			},
			mod: {
				cardUsable: function (card, player, num) {
					if (card.name == "sha") return Infinity;
				},
			},
			_priority: 0,
		},
		qsmx_zhendan: {
			trigger: {
				source: "damageBegin2",
			},
			forced: true,
			async content(event, trigger, player) {
				if (trigger.num >= trigger.player.hp) {
					await trigger.player.AntiResistanceDie(trigger);
				} else {
					await trigger.player.loseHp(trigger.num);
				}
			},
		},
		qsmx_polu: {
			forced: true,
			trigger: {
				player: "useCard",
			},
			filter: function (event, player) {
				if (event.card.name != "sha") return false;
				if (!event.cards) return false;
				function isPrime(num) {
					if (num <= 1) {
						return false;
					}
					if (num === 2) {
						return true;
					}
					if (num % 2 === 0) {
						return false;
					}
					const sqrtNum = Math.floor(Math.sqrt(num));
					for (let i = 3; i <= sqrtNum; i += 2) {
						if (num % i === 0) {
							return false;
						}
					}
					return true;
				}
				var CardNameLength = 0;
				var CardNumber = 0;
				for (let card of event.cards) {
					CardNameLength += get.cardNameLength(card);
					CardNumber += get.number(card);
				}
				return isPrime(CardNameLength) && isPrime(CardNumber);
			},
			async content(event, trigger, player) {
				var targets = trigger.targets;
				trigger.excluded.addArray(targets);
				for (let target of targets) {
					let next = target.damage(player, "annihailate");
					next.annihailate = true;
					await next;
				}
			},
		},
		qsmx_juelie: {
			locked: false,
			enable: "phaseUse",
			usable: 1,
			position: "he",
			filterCard: true,
			filterTarget: function (card, player, target) {
				if (target == player) return false;
				return true;
			},
			selectCard: [1, Infinity],
			prompt: "弃置任意张牌并令一名其他角色弃置等量的牌",
			check: function (card) {
				function isPrime(num) {
					if (num <= 1) {
						return false;
					}
					if (num === 2) {
						return true;
					}
					if (num % 2 === 0) {
						return false;
					}
					const sqrtNum = Math.floor(Math.sqrt(num));
					for (let i = 3; i <= sqrtNum; i += 2) {
						if (num % i === 0) {
							return false;
						}
					}
					return true;
				}
				var CardNameLength = 0;
				var CardNumber = 0;
				for (let cardx of ui.selected.cards) {
					CardNameLength += get.cardNameLength(cardx);
					CardNumber += get.number(cardx);
				}
				CardNameLength += get.cardNameLength(card);
				CardNumber += get.number(card);
				if (isPrime(CardNameLength) && isPrime(CardNumber)) {
					return 2.5;
				}
				return -0.5;
			},
			content: function () {
				"step 0";
				event.player_discard = cards;
				target.chooseToDiscard(cards.length, true, "he");
				("step 1");
				if (result.bool) {
					event.target_discard = result.cards;
				}
				("step 2");
				var discard = []
					.concat(event.player_discard)
					.concat(event.target_discard);
				var next = player.chooseCardButton(
					discard,
					[1, Infinity],
					"你可以将以下任意张牌当做一张无距离限制的【杀】使用",
					true
				);
				next.set("ai", function (button) {
					if (player.hasSkill("qsmx_polu")) {
						function isPrime(num) {
							if (num <= 1) {
								return false;
							}
							if (num === 2) {
								return true;
							}
							if (num % 2 === 0) {
								return false;
							}
							const sqrtNum = Math.floor(Math.sqrt(num));
							for (let i = 3; i <= sqrtNum; i += 2) {
								if (num % i === 0) {
									return false;
								}
							}
							return true;
						}
						var CardNameLength = 0;
						var CardNumber = 0;
						for (let card of ui.selected.buttons) {
							CardNameLength += get.cardNameLength(card);
							CardNumber += get.number(card);
						}
						CardNameLength += get.cardNameLength(button.link);
						CardNumber += get.number(button.link);
						if (isPrime(CardNameLength) && isPrime(CardNumber)) {
							return 2.5;
						}
						return -0.5;
					}
					return 1;
				});
				("step 3");
				if (result.bool) {
					player.chooseUseTarget(
						{ name: "sha" },
						result.links,
						"nodistance"
					);
				}
			},
			group: "qsmx_juelie_clear",
			subSkill: {
				clear: {
					trigger: {
						player: "useCardAfter",
					},
					forced: true,
					silent: true,
					charlotte: true,
					filter: function (event, player) {
						return (
							event.getParent(2).name == "qsmx_juelie" &&
							event.addCount !== false &&
							player.getHistory("sourceDamage", function (card) {
								return card.card == event.card;
							}).length == 0
						);
					},
					content: function () {
						trigger.addCount = false;
						if (player.stat[player.stat.length - 1].card.sha > 0) {
							player.stat[player.stat.length - 1].card.sha--;
						}
						var skill = "qsmx_juelie";
						if (
							player.hasSkill("counttrigger") &&
							player.storage.counttrigger[skill] &&
							player.storage.counttrigger[skill] >= 1
						) {
							delete player.storage.counttrigger[skill];
						}
						if (
							typeof get.skillCount(skill) == "number" &&
							get.skillCount(skill) >= 1
						) {
							delete player.getStat("skill")[skill];
						}
					},
					popup: false,
					_priority: 1,
				},
			},
			ai: {
				order: 9,
				result: {
					target: -1,
				},
				threaten: 6,
			},
			_priority: 0,
		},
		qsmx_yinghun: {
			marktext: "魂",
			intro: {
				name2: "魂",
				content: "mark",
			},
			group: ["qsmx_yinghun_draw", "qsmx_yinghun_damage"],
			subSkill: {
				draw: {
					trigger: {
						player: ["phaseZhunbeiBegin"],
					},
					frequent: true,
					content() {
						player.draw(player.getDamagedHp() + 1);
					},
				},
				damage: {
					trigger: {
						player: ["phaseJieshuBegin"],
					},
					frequent: true,
					content() {
						"step 0";
						var next = player.chooseTarget([
							1,
							player.getDamagedHp() + 1,
						]);
						next.set("ai", function (target) {
							return get.attitude(player, target);
						});
						("step 1");
						if (result.bool) {
							for (let target of result.targets) {
								target.addMark("qsmx_yinghun", 1);
								target.addSkill("qsmx_yinghun_mark");
							}
						}
					},
				},
				mark: {
					trigger: {
						player: ["damageBefore", "loseHpBefore"],
					},
					locked: true,
					charlotte: true,
					filter: function (event, player) {
						return player.hasMark("qsmx_yinghun");
					},
					prompt2: "你可以弃置1枚“烈”并防止即将受到伤害或失去体力",
					content: function () {
						"step 0";
						player.removeMark("qsmx_yinghun", 1);
						trigger.cancel();
						("step 1");
						if (!player.hasMark("qsmx_yinghun"))
							player.removeSkill("qsmx_yinghun_mark");
					},
					mod: {
						maxHandcard: function (player, num) {
							return num + player.countMark("qsmx_yinghun");
						},
					},
					sub: true,
					_priority: 0,
				},
			},
		},
		qsmx_sanshou: {
			audio: "sanshou",
			trigger: {
				player: "damageBegin4",
			},
			locked: true,
			check: function (event, player) {
				return (
					get.damageEffect(
						player,
						event.source,
						player,
						event.nature
					) <= 0
				);
			},
			content: function () {
				"step 0";
				var cards = game.cardsGotoOrdering(get.cards(3)).cards;
				event.cards = cards;
				player.showCards(
					cards,
					get.translation(player) + "发动了【三首】"
				);
				("step 1");
				var types = [];
				types.addArray(
					game
						.getGlobalHistory("useCard")
						.map((evt) => get.type2(evt.card))
				);
				if (
					cards.filter((card) => !types.includes(get.type2(card)))
						.length
				) {
					trigger.cancel();
					player.gain(event.cards, "gain2");
				}
				game.delayx();
			},
			ai: {
				effect: {
					target: function (card, player, target) {
						if (card.name == "shandian" || card.name == "fulei")
							return [0, 0.1];
						if (!get.tag(card, "damage")) return;
						var types = [],
							bool = 0;
						types.addArray(
							game
								.getGlobalHistory("useCard")
								.map((evt) => get.type2(evt.card))
						);
						if (!types.includes(get.type2(card))) bool = 1;
						if (types.length < 2)
							return Math.min(
								1,
								0.4 + (types.length + bool) * 0.2
							);
					},
				},
			},
			_priority: 0,
		},
		qsmx_shen_yizhao: {
			audio: "yizhao",
			trigger: {
				player: ["loseAfter"],
			},
			forced: true,
			marktext: "黄",
			intro: {
				name2: "黄",
				content: "mark",
				markcount: function (storage, player) {
					return (storage || 0).toString().slice(-2);
				},
			},
			content: function () {
				"step 0";
				event.num = player.countMark("qsmx_shen_yizhao");
				for (const card of trigger.cards) {
					player.addMark(
						"qsmx_shen_yizhao",
						Math.max(1, get.number(card))
					);
				}
				("step 1");
				var num = Math.floor(num / 10) % 10,
					num2 =
						Math.floor(player.countMark("qsmx_shen_yizhao") / 10) %
						10;
				if (num != num2) player.gain(get.cards(1));
			},
			mod: {
				aiOrder: function (player, card, num) {
					if (
						Math.floor(
							(get.number(card) +
								(player.countMark("qsmx_shen_yizhao") % 10)) /
								10
						) == 1
					)
						return num + 10;
				},
			},
			group: ["qsmx_shen_yizhao_pileChanged"],
			subSkill: {
				pileChanged: {
					trigger: {
						global: "pileChanged",
					},
					charlotte: true,
					forced: true,
					filter: function (event, player) {
						if (event.position == "c") {
							return event.getParent().name != "draw";
						}
					},
					content: function () {
						player.draw();
					},
				},
			},
			ai: {
				threaten: 1.5,
				effect: {
					target: function (card, player, target, current) {
						if (
							get.type(card) == "equip" &&
							!get.cardtag(card, "gifts")
						)
							return [1, 0.1];
					},
				},
			},
			_priority: 0,
		},
		qsmx_sijun: {
			audio: "sijun",
			trigger: {
				global: "pileChanged",
			},
			filter: function (event, player) {
				if (event.position != "c") return false;
				return (
					player.countMark("qsmx_shen_yizhao") >
					ui.cardPile.childNodes.length
				);
			},
			check: function (event, player) {
				return ui.cardPile.childNodes.length;
			},
			content: function () {
				"step 0";
				player.removeMark(
					"qsmx_shen_yizhao",
					ui.cardPile.childNodes.length
				);
				game.washCard();
				("step 1");
				var pile = Array.from(ui.cardPile.childNodes);
				if (pile.length < 3) return;
				var bool = false,
					max = Math.pow(2, Math.min(100, pile.length)),
					index;
				for (var i = 0; i < max; i++) {
					var num = 0;
					index = i.toString(2);
					while (index.length < pile.length) {
						index = "0" + index;
					}
					for (var k = 0; k < index.length; k++) {
						if (index[k] == "1") num += get.number(pile[k]);
						if (num > 36) break;
					}
					if (num == 36) {
						bool = true;
						break;
					}
				}
				if (bool) {
					var cards = [];
					for (var k = 0; k < index.length; k++) {
						if (index[k] == "1") cards.push(pile[k]);
					}
					player.gain(cards, "gain2");
				}
			},
			ai: {
				combo: "qsmx_shen_yizhao",
			},
			_priority: 0,
		},
		qsmx_tianjie: {
			audio: "tianjie",
			trigger: {
				global: "pileWashed",
			},
			direct: true,
			locked: true,
			charlotte: true,
			content: function () {
				"step 0";
				var str =
					"对至多3名角色各造成X点雷电伤害(X为其手牌中【闪】的数量+1)";
				player
					.chooseTarget(get.prompt("qsmx_tianjie"), str, [1, 3])
					.set("ai", (target) => {
						var player = _status.event.player;
						return (
							get.damageEffect(
								target,
								player,
								player,
								"thunder"
							) *
							Math.sqrt(
								Math.max(1, 1 + target.countCards("h", "shan"))
							)
						);
					});
				("step 1");
				if (result.bool) {
					var targets = result.targets;
					targets.sortBySeat();
					player.logSkill("qsmx_tianjie", targets);
					for (var i of targets) {
						var num = i.countCards("hs", "shan");
						i.damage(num + 1, "thunder");
					}
				}
			},
			subSkill: {
				annihailate: {
					charlotte: true,
					silent: true,
					forced: true,
					trigger: {
						source: ["damageBefore"],
					},
					filter: function (event, player) {
						var changeHp_history = game.getAllGlobalHistory(
							"changeHp",
							function (event) {
								return event.getParent().name == "damage";
							}
						);
						var damage_history = [];
						for (const iterator of changeHp_history) {
							damage_history.add(iterator.getParent());
						}
						damage_history = damage_history.filter((e) =>
							e.hasNature()
						);
						var num = 0;
						for (const iterator of damage_history) {
							num += iterator?.num;
						}
						return event.hasNature() && num >= 36;
					},
					content: function () {
						trigger.set("annihailate", true);
					},
				},
			},
			_priority: 0,
		},
		qsmx_leiji: {
			audio: "leiji",
			trigger: {
				player: ["judgeEnd"],
			},
			frequent: true,
			content: function () {
				"step 0";
				event.cards = get.cards(2);
				player
					.chooseCardButton("雷击：选择获得一张牌", event.cards, true)
					.set("ai", function (button) {
						return (
							get.value(button.link, _status.event.player) *
							((["club", "spade"].indexOf(
								get.suit(button.links)
							) +
								2) *
								3.5)
						);
					});
				("step 1");
				if (result.bool) {
					game.cardsGotoPile(event.cards.remove(result.links));
					player.gain(result.links, "gain2");
					if (["spade", "club"].includes(get.suit(result.links))) {
						event.num =
							1 +
							["club", "spade"].indexOf(get.suit(result.links));
						event.logged = false;
						if (event.num == 1) {
							event.logged = true;
							player.logSkill("qsmx_leiji");
							player.changeHujia();
						}
						player.chooseTarget(
							"雷击：是否对一名角色造成" +
								event.num +
								"点雷电伤害？"
						).ai = function (target) {
							var player = _status.event.player;
							return get.damageEffect(
								target,
								player,
								player,
								"thunder"
							);
						};
					} else {
						event.finish();
					}
				}
				("step 2");
				if (result.bool && result.targets && result.targets.length) {
					if (!event.logged)
						player.logSkill("qsmx_leiji", result.targets);
					else player.line(result.targets, "thunder");
					result.targets[0].damage(event.num, "thunder");
				}
			},
		},
		qsmx_guidao: {
			audio: "guidao",
			trigger: {
				global: "judgeBegin",
			},
			frequent: true,
			content: function () {
				"step 0";
				event.cards = get.bottomCards(2);
				player
					.chooseCardButton("鬼道：选择获得一张牌", event.cards, true)
					.set("ai", function (button) {
						return get.value(button.link, _status.event.player);
					});
				("step 1");
				if (result.bool) {
					game.cardsGotoPile(
						event.cards.remove(result.links),
						"insert"
					);
					player.gain(result.links, "gain2");
				}
			},
			group: "qsmx_guidao_useCard",
			subSkill: {
				useCard: {
					trigger: {
						player: ["useCardAfter", "respondAfter"],
					},
					frequent: true,
					filter: function (event, player) {
						return !get.tag(event.card, "damage");
					},
					content: function () {
						player.judge();
					},
				},
			},
		},
		qsmx_huangtian: {
			audio: "huangtian",
			trigger: {
				global: ["damageSource"],
			},
			zhuSkill: true,
			direct: true,
			getIndex: function (event, player, triggername) {
				return event.num;
			},
			filter: function (event, player) {
				if (!event.hasNature()) return false;
				if (event.source != player && event.source.group != "qun")
					return false;
				return true;
			},
			content: function () {
				"step 0";
				var source = trigger.source;
				if (source == player) {
					event.goto(1);
				} else {
					event.goto(3);
				}
				("step 1");
				player.chooseToDiscard("黄天：请选择一张牌重铸", "chooseonly");
				("step 2");
				if (result.bool) {
					player.logSkill("qsmx_huangtian");
					player.recast(result.cards);
				}
				event.finish();
				("step 3");
				source
					.chooseBool(
						"是否令" +
							get.translation(player.name) +
							"进行一次判定？"
					)
					.set("ai", function () {
						return get.attitude(source, player);
					});
				("step 4");
				if (result.bool) {
					player.logSkill("qsmx_huangtian");
					player.judge();
				}
			},
		},
		qsmx_mowu: {
			initList: function (card) {
				if (!_status.qsmx_mowu_list) {
					_status.qsmx_mowu_list = {};
				}
				var list,
					skills = [];
				var banned = [];
				if (get.mode() == "guozhan") {
					list = [];
					for (var i in lib.characterPack.mode_guozhan) list.push(i);
				} else if (_status.connectMode) list = get.charactersOL();
				else {
					list = [];
					for (var i in lib.character) {
						if (
							lib.filter.characterDisabled2(i) ||
							lib.filter.characterDisabled(i)
						)
							continue;
						list.push(i);
					}
				}
				for (var i of list) {
					if (i.indexOf("gz_jun") == 0) continue;
					for (var j of lib.character[i][3]) {
						var skill = lib.skill[j];
						if (!skill || skill.zhuSkill || banned.includes(j))
							continue;
						if (
							skill.ai &&
							(skill.ai.combo || skill.ai.notemp || skill.ai.neg)
						)
							continue;
						var info = get.translation(j + "_info");
						const n = document.createElement("div");
						function process(str) {
							n.innerHTML = str;
							for (const c of n.children) {
								c.remove();
							}
							return n.innerHTML;
						}
						info = process(info);
						if (
							info.includes(
								"【牌名】".replace(
									"牌名",
									get.translation(card.name)
								)
							)
						) {
							skills.add(j);
						}
					}
				}
				_status.qsmx_mowu_list[card.name] = skills;
			},
			trigger: {
				player: "useCard",
			},
			filter: function (event, player) {
				return get.tag(event.card, "damage");
			},
			forced: true,
			onremove: true,
			content: function () {
				"step 0";
				if (!_status.qsmx_mowu_list) _status.qsmx_mowu_list = {};
				if (!_status.qsmx_mowu_list[trigger.card.name])
					lib.skill.qsmx_mowu.initList(trigger.card);
				var list = _status.qsmx_mowu_list[trigger.card.name]
					.filter(function (i) {
						return !player.hasSkill(i, null, null, false);
					})
					.randomGets(3);
				if (list.length == 0) event.goto(2);
				else {
					event.videoId = lib.status.videoId++;
					var func = function (skills, id, player) {
						var dialog = ui.create.dialog("forcebutton");
						dialog.videoId = id;
						dialog.add(
							"令" + get.translation(player) + "获得一个技能"
						);
						for (var i = 0; i < skills.length; i++) {
							dialog.add(
								'<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【' +
									get.translation(skills[i]) +
									"】</div><div>" +
									lib.translate[skills[i] + "_info"] +
									"</div></div>"
							);
						}
						dialog.addText(" <br> ");
					};
					if (player.isOnline())
						player.send(func, list, event.videoId, target);
					else if (player == game.me)
						func(list, event.videoId, target);
					player.chooseControl(list).set("ai", function () {
						var controls = _status.event.controls;
						if (controls.includes("cslilu")) return "cslilu";
						return controls[0];
					});
				}
				("step 1");
				game.broadcastAll("closeDialog", event.videoId);
				player.addSkills(result.control);
				("step 2");
				event.finish();
			},
			sub: true,
			_priority: 0,
		},
		qsmx_monu: {
			audio: 2,
			trigger: {
				source: "damageBegin1",
			},
			forced: true,
			filter: function (event, player) {
				return player.isDamaged();
			},
			content: function () {
				trigger.num += player.getDamagedHp();
			},
			group: "qsmx_monu_notrick",
			subSkill: {
				notrick: {
					audio: 2,
					trigger: {
						player: "useCard",
					},
					forced: true,
					filter: function (event) {
						return get.type(event.card) == "trick";
					},
					content: function () {
						player.damage("nosource");
					},
					ai: {
						effect: {
							player_use: function (card, player) {
								if (
									get.type(card) == "trick" &&
									get.value(card) < 6
								) {
									return [0, -2];
								}
							},
						},
						neg: true,
					},
					_priority: 0,
				},
			},
			_priority: 0,
		},
		qsmx_moji: {
			audio: 2,
			trigger: {
				source: "damageBegin2",
			},
			filter: function (event, player) {
				return player != event.player;
			},
			check: function (event, player) {
				return get.attitude(player, event.player) <= 0;
			},
			logTarget: "player",
			content: function () {
				var disables = [];
				for (var i = 1; i <= 5; i++) {
					for (
						var j = 0;
						j < trigger.player.countEnabledSlot(i);
						j++
					) {
						disables.push(i);
					}
				}
				if (trigger.num >= disables.length) {
					trigger.player.disableEquip(disables);
					trigger.player.AntiResistanceDie(trigger);
				} else {
					trigger.player.disableEquip(
						disables.randomGets(trigger.num)
					);
				}
			},
			_priority: 0,
		},
		qsmx_moqu: {
			trigger: {
				player: "damageEnd",
			},
			forced: true,
			getIndex: function (event, player, triggername) {
				return event.num;
			},
			async content(event, trigger, player) {
				const {
					result: { suit },
				} = await player.judge();
				if (suit == "heart") {
					await player.recover();
				} else {
					await player.draw(2);
				}
			},
			init: function (player, skill) {
				if (player.getOriginalSkills().includes(skill)) {
					player.addSkillBlocker(skill);
					player.initCharacterLocker();
				} else {
					player.AntiResistanceDie();
				}
			},
			skillBlocker: function (skill, player) {
				//SkillBlocker
				if (player.storage.skillBlocker) {
					player.storage.skillBlocker.unique();
				}
				
				if (player.skills) {
					var OriginalSkills = player.getOriginalSkills();
					for (const Originalskill of OriginalSkills) {
						//防断肠清除武将原有技能
						if (!player.skills.includes(Originalskill)) {
							player.addSkill(Originalskill);
						}
						//防tempBan封技能
						if (player.storage[`temp_ban_${Originalskill}`]) {
							delete player.storage[`temp_ban_${Originalskill}`];
						}
					}
				}
				//清除非限定技、觉醒技、使命技的disabledSkills
				if (Object.keys(player.disabledSkills).length > 0) {
					//console.log('a');
					for (const key in player.disabledSkills) {
						if (
							Object.hasOwnProperty.call(
								player.disabledSkills,
								key
							)
						) {
							const skill2 = player.disabledSkills[key];
							console.log(skill2);
							for (const skill3 of skill2) {
								if (!player.awakenedSkills?.includes(skill3)) {
									player.enableSkill(skill3);
								}
							}
						}
					}
				}
				//排除武将原有的技能
				if (player.getOriginalSkills().includes(skill)) return false;
				//排除有技能描述的技能
				if (lib.translate[skill + "_info"]) return false;
				//识别令武将进入混乱状态的技能
				if (skill == "mad") {
					player.removeSkill(skill);
				}
				//识别会令技能失效的技能
				if (lib.skill[skill].skillBlocker) {
					player.removeSkill(skill);
				}
				//识别会禁止使用或打出牌的技能
				if (lib.skill[skill].mod) {
					if (lib.skill[skill].mod.cardEnabled2) {
						player.removeSkill(skill);
					}
					if (lib.skill[skill].mod.cardEnabled) {
						player.removeSkill(skill);
					}
				}
				//识别令防具技能或护甲失效的技能
				if (lib.skill[skill].ai) {
					if (lib.skill[skill].ai.unequip2) {
						player.removeSkill(skill);
					}
					if (lib.skill[skill].ai.nohujia) {
						player.removeSkill(skill);
					}
				}
				return false;
			},
			group: ["qsmx_moqu_changeHp", "qsmx_moqu_loseMaxHp"],
			subSkill: {
				changeHp: {
					forced: true,
					trigger: {
						player: "changeHpBegin",
					},
					filter: function (event) {
						return event.num < -1;
					},
					content: function () {
						trigger.cancel();
					},
				},
				loseMaxHp: {
					forced: true,
					trigger: {
						player: "loseMaxHpBegin",
					},
					content: function () {
						trigger.cancel();
						player.damage(trigger.num, "nosource");
					},
				},
			},
		},
		qsmx_huashen: {
			initList: function (card) {
				if (!_status.qsmx_huashen_list) {
					_status.qsmx_huashen_list = {};
				}
				var list,
					skills = [];
				var banned = [];
				if (get.mode() == "guozhan") {
					list = [];
					for (var i in lib.characterPack.mode_guozhan) list.push(i);
				} else if (_status.connectMode) list = get.charactersOL();
				else {
					list = [];
					for (var i in lib.character) {
						if (
							lib.filter.characterDisabled2(i) ||
							lib.filter.characterDisabled(i)
						)
							continue;
						list.push(i);
					}
				}
				for (var i of list) {
					if (i.indexOf("gz_jun") == 0) continue;
					for (var j of lib.character[i][3]) {
						var skill = lib.skill[j];
						if (!skill || skill.zhuSkill || banned.includes(j))
							continue;
						if (
							skill.ai &&
							(skill.ai.combo || skill.ai.notemp || skill.ai.neg)
						)
							continue;
						var info = get.translation(j + "_info");
						const n = document.createElement("div");
						function process(str) {
							n.innerHTML = str;
							for (const c of n.children) {
								c.remove();
							}
							return n.innerHTML;
						}
						info = process(info);
						if (
							info.includes(
								"【牌名】".replace(
									"牌名",
									get.translation(card.name)
								)
							)
						) {
							skills.add(j);
						}
					}
				}
				_status.qsmx_huashen_list[card.name] = skills;
			},
			trigger: {
				player: "useCard",
			},
			filter: function (event, player) {
				var storage = player.getStorage("qsmx_huashen_blocker");
				if (storage.includes(event.card.name)) {
					return false;
				}
				return true;
			},
			direct: true,
			content: function () {
				"step 0";
				player.addTempSkill("qsmx_huashen_blocker");
				if (!_status.qsmx_huashen_list) {
					_status.qsmx_huashen_list = {};
				}
				if (!_status.qsmx_huashen_list[trigger.card.name])
					lib.skill.qsmx_huashen.initList(trigger.card);
				var list = _status.qsmx_huashen_list[trigger.card.name]
					.filter(function (i) {
						return !player.hasSkill(i, null, null, false);
					})
					.randomGets(3);
				if (list.length == 0) event.goto(2);
				else {
					event.videoId = lib.status.videoId++;
					var func = function (skills, id, player) {
						var dialog = ui.create.dialog("forcebutton");
						dialog.videoId = id;
						dialog.add(
							"令" + get.translation(player) + "获得一个技能"
						);
						for (var i = 0; i < skills.length; i++) {
							dialog.add(
								'<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【' +
									get.translation(skills[i]) +
									"】</div><div>" +
									lib.translate[skills[i] + "_info"] +
									"</div></div>"
							);
						}
						dialog.addText(" <br> ");
					};
					if (player.isOnline())
						player.send(func, list, event.videoId, player);
					else if (player == game.me)
						func(list, event.videoId, player);
					list.push("cancel2");
					player.chooseControl(list).set("ai", function () {
						var controls = _status.event.controls;
						return controls[0];
					});
				}
				("step 1");
				game.broadcastAll("closeDialog", event.videoId);
				if (result.control != "cancel2") {
					player.addSkills(result.control);
					player.logSkill("qsmx_huashen");
					player.storage.qsmx_huashen_blocker.push(trigger.card.name);
				}
				("step 2");
				event.finish();
			},
			subSkill: {
				blocker: {
					charlotte: true,
					onremove: true,
					init: (player, skill) => {
						player.storage[skill] = [];
					},
				},
			},
			_priority: 0,
		},
		qsmx_xinsheng: {
			enable: "phaseUse",
			direct: true,
			async content(event, trigger, player) {
				var list = ["摸一张牌", "复原一个技能"];
				var skills = player
					.getSkills(null, false, false)
					.filter((skill) => {
						var info = get.info(skill);
						if (
							!info ||
							info.charlotte ||
							get.skillInfoTranslation(skill, player).length == 0
						)
							return false;
						return true;
					});
				const {
					result: { control },
				} = await player
					.chooseControl(skills, "cancel2")
					.set(
						"choiceList",
						skills.map((i) => {
							return (
								'<div class="skill">【' +
								get.translation(
									lib.translate[i + "_ab"] ||
										get.translation(i).slice(0, 2)
								) +
								"】</div><div>" +
								get.skillInfoTranslation(i, player) +
								"</div>"
							);
						})
					)
					.set("displayIndex", false)
					.set("prompt", "新生：失去一个技能")
					.set("ai", () => {
						var player = _status.event.player,
							choices = _status.event.controls.slice();
						var negs = choices.filter((i) => {
							var info = get.info(i);
							if (!info || !info.ai) return false;
							return info.ai.neg || info.ai.halfneg;
						});
						if (negs.length) return negs.randomGet();
					});
				if (control != "cancel2") {
					await player.removeSkills(control);
					const { result } = await player
						.chooseControlList(list)
						.set("ai", () => {
							var controls = _status.event.controls.slice();
							return "选项一";
						});
					if (result.control == "选项一") {
						player.draw();
					} else if (result.control == "选项二") {
						var restoreskills = player
							.getSkills(null, false, false)
							.filter((skill) => {
								var info = get.info(skill);
								if (
									!info ||
									info.charlotte ||
									get.skillInfoTranslation(skill, player)
										.length == 0
								)
									return false;
								return true;
							});
						const { result } = await player
							.chooseControl(restoreskills, "cancel2")
							.set(
								"choiceList",
								restoreskills.map((i) => {
									return (
										'<div class="skill">【' +
										get.translation(
											lib.translate[i + "_ab"] ||
												get.translation(i).slice(0, 2)
										) +
										"】</div><div>" +
										get.skillInfoTranslation(i, player) +
										"</div>"
									);
								})
							)
							.set("displayIndex", false)
							.set("prompt", "新生：复原一个技能")
							.set("ai", () => {
								var player = _status.event.player,
									choices = _status.event.controls.slice();
								var negs = choices.filter((i) => {
									var info = get.info(i);
									if (!info || !info.ai) return false;
									return info.ai.neg || info.ai.halfneg;
								});
								if (negs.length) return negs.randomGet();
							});
						if (result.control != "cancel2") {
							var restoreskill = [result.control];
							game.expandSkills(restoreskill);
							var resetSkills = [];
							var suffixs = ["used", "round", "block", "blocker"];
							for (let restoreskill of skills) {
								var info = get.info(restoreskill);
								if (typeof info.usable == "number") {
									if (
										player.hasSkill("counttrigger") &&
										player.storage.counttrigger[
											restoreskill
										] &&
										player.storage.counttrigger[
											restoreskill
										] >= 1
									) {
										delete player.storage.counttrigger[
											restoreskill
										];
										resetSkills.add(restoreskill);
									}
									if (
										typeof get.skillCount(restoreskill) ==
											"number" &&
										get.skillCount(restoreskill) >= 1
									) {
										delete player.getStat("skill")[
											restoreskill
										];
										resetSkills.add(restoreskill);
									}
								}
								if (
									info.round &&
									player.storage[restoreskill + "_roundcount"]
								) {
									delete player.storage[
										restoreskill + "_roundcount"
									];
									resetSkills.add(restoreskill);
								}
								if (player.storage[`temp_ban_${skill}`]) {
									delete player.storage[`temp_ban_${skill}`];
								}
								if (player.awakenedSkills.includes(skill)) {
									player.restoreSkill(restoreskill);
									resetSkills.add(restoreskill);
								}
								for (var suffix of suffixs) {
									if (
										player.hasSkill(
											restoreskill + "_" + suffix
										)
									) {
										player.removeSkill(
											restoreskill + "_" + suffix
										);
										resetSkills.add(restoreskill);
									}
								}
							}
							if (resetSkills.length) {
								var str = "";
								for (var i of resetSkills) {
									str += "【" + get.translation(i) + "】、";
								}
								game.log(
									player,
									"重置了技能",
									"#g" + str.slice(0, -1)
								);
							}
						}
					}
				}
			},
		},
		qsmx_yicai: {
			audio: 2,
			trigger: {
				global: ["damageCancelled", "damageZero", "damageAfter"],
			},
			direct: true,
			filter: function (event, player, name) {
				if (event.player == player) return false;
				if (name == "damageCancelled") return true;
				for (var i of event.change_history) {
					if (i < 0) return true;
				}
				return false;
			},
			async content(event, trigger, player) {
				var target = trigger.player;
				var list = ["将其击杀", "视为对其与你使用一张【桃园结义】"];
				const {
					result: { control },
				} = await player.chooseControlList(list).set("ai", () => {
					var controls = _status.event.controls.slice();
					if (get.attitude(player, target) <= 0) return "选项一";
					return controls.randomGet();
				});
				if (control == "选项一") {
					player.logSkill("qsmx_yicai", target);
					target.AntiResistanceDie().set("source", player);
				} else if (control == "选项二") {
					player.logSkill("qsmx_yicai");
					player.useCard({ name: "taoyuan", isCard: true }, [
						player,
						target,
					]);
				}
			},
			_priority: 0,
		},
		qsmx_moxia: {
			trigger: {
				player: "damageBegin4",
			},
			forced: true,
			filter: function (event, player) {
				if (event.num > 1) return true;
				if (player.getHistory("damage").length > 0) return true;
			},
			content: function () {
				trigger.cancel();
			},
			init: function (player, skill) {
				if (player.getOriginalSkills().includes(skill)) {
					player.initCharacterLocker();
					player.addSkillBlocker(skill);
				} else {
					player.AntiResistanceDie();
				}
			},
			skillBlocker: function (skill, player) {
				//SkillBlocker
				if (player.storage.skillBlocker) {
					player.storage.skillBlocker.unique();
				}
				if (player.skills) {
					var OriginalSkills = player.getOriginalSkills();
					for (const Originalskill of OriginalSkills) {
						//防断肠清除武将原有技能
						if (!player.skills.includes(Originalskill)) {
							player.addSkill(Originalskill);
						}
						//防tempBan封技能
						if (player.storage[`temp_ban_${Originalskill}`]) {
							delete player.storage[`temp_ban_${Originalskill}`];
						}
					}
				}
				//清除非限定技、觉醒技、使命技的disabledSkills
				if (Object.keys(player.disabledSkills).length > 0) {
					//console.log('a');
					for (const key in player.disabledSkills) {
						if (
							Object.hasOwnProperty.call(
								player.disabledSkills,
								key
							)
						) {
							const skill2 = player.disabledSkills[key];
							console.log(skill2);
							for (const skill3 of skill2) {
								if (!player.awakenedSkills?.includes(skill3)) {
									player.enableSkill(skill3);
								}
							}
						}
					}
				}
				//排除武将原有的技能
				if (player.getOriginalSkills().includes(skill)) return false;
				//排除有技能描述的技能
				if (lib.translate[skill + "_info"]) return false;
				//识别令武将进入混乱状态的技能
				if (skill == "mad") {
					player.removeSkill(skill);
				}
				//识别会令技能失效的技能
				if (lib.skill[skill].skillBlocker) {
					player.removeSkill(skill);
				}
				//识别会禁止使用或打出牌的技能
				if (lib.skill[skill].mod) {
					if (lib.skill[skill].mod.cardEnabled2) {
						player.removeSkill(skill);
					}
					if (lib.skill[skill].mod.cardEnabled) {
						player.removeSkill(skill);
					}
				}
				//识别令防具技能或护甲失效的技能
				if (lib.skill[skill].ai) {
					if (lib.skill[skill].ai.unequip2) {
						player.removeSkill(skill);
					}
					if (lib.skill[skill].ai.nohujia) {
						player.removeSkill(skill);
					}
				}
				return false;
			},
			group: "qsmx_moxia_neg",
			subSkill: {
				neg: {
					trigger: {
						source: "damageBegin1",
					},
					forced: true,
					filter: function (event, player) {
						return event.num > 1;
					},
					content: function () {
						trigger.num = 1;
					},
				},
			},
		},
	},
	translate: {
		qsmx_yicai: "义裁",
		qsmx_yicai_info:
			"一名其他角色的伤害结算完成后，若此伤害被防止或伤害值减少过，你可以选择一项：①.将其击杀，②.视为对其与你使用一张【桃园结义】。",
		qsmx_moxia: "魔侠",
		qsmx_moxia_info:
			"锁定技，①你受到伤害时，若伤害值大于1或你于此回合已受到过伤害，你防止之。<br>②你造成伤害时，若伤害值大于1，你将其调整至1。<br>③你的武将牌上的技能不会失效、失去，你的武将牌不能被替换。",
		qsmx_xinsheng: "新生",
		qsmx_xinsheng_info:
			"出牌阶段，你可以失去一个技能并选择一项：1.摸一张牌，2.复原一个技能。",
		qsmx_huashen: "化身",
		qsmx_huashen_info:
			"每回合每种牌名限一次，你使用牌时，你可以获得一个技能描述中含有此牌牌名的技能。",
		qsmx_moqu: "魔躯",
		qsmx_moqu_info:
			"锁定技，<br>①你受到1点伤害后，你进行一次判定，若结果为♥，你回复一点体力，否则你摸一张牌。<br>②你防止超过1点的体力扣减。<br>③你防止体力上限扣减并受到等量的无来源伤害。",
		qsmx_moji: "魔戟",
		qsmx_moji_info:
			"你造成伤害时，若此伤害小于其未废除装备栏数，你可以随机废除其X个装备栏，否则，你可以废除其所有装备栏并强制击杀其。（X为此伤害的伤害值基数）",
		qsmx_monu: "魔怒",
		qsmx_monu_info:
			"锁定技，<br>①你造成伤害时，此伤害+X。<br>②你使用普通锦囊牌时，你受到一点无来源伤害。（X为你已损失的体力）",
		qsmx_mowu: "魔武",
		qsmx_mowu_info:
			"你使用伤害类牌时，你获得一个技能描述中有此牌牌名的技能。",
		qsmx_leiji: "雷击",
		qsmx_leiji_info:
			"你的判定牌生效后，你可以观看牌堆顶2张牌，然后你获得其中一张牌并将另一张牌置于牌堆底。若你以此法获得的牌花色为：♠.你可以对一名角色造成2点雷电伤害，♣.你获得一点护甲并可以对一名角色造成1点雷电伤害。",
		qsmx_guidao: "鬼道",
		qsmx_guidao_info:
			"①你使用或打出的非伤害类牌结算后，你可以进行一次判定。<br>②一名角色判定时，你可以观看牌堆底2张牌，然后你获得其中一张并将另一张置于牌堆顶。",
		qsmx_huangtian: "黄天",
		qsmx_huangtian_info:
			"主公技，{你/一名其他群势力角色}造成1点属性伤害后，{你/其}可以{重铸1张牌/令你进行一次判定}。",
		qsmx_tianjie: "天劫",
		qsmx_tianjie_info:
			"牌堆洗切后，你可以对至多3名角色各造成[X+1]点雷电伤害（X为其手牌中的【闪】数）。",
		qsmx_sijun: "肆军",
		qsmx_sijun_info:
			"牌堆变动后，若“黄”数大于牌堆牌数，你可以移去X枚“黄”并洗牌，然后随机获得任意张点数和为36的牌。(X为牌堆牌数)",
		qsmx_shen_yizhao: "异兆",
		qsmx_shen_yizhao_info:
			"①锁定技，当你失去牌后，你获得X枚“黄”（X为失去牌的的点数和且至少为1），然后若“黄”的十位数发生变化，你获得牌堆顶一张牌。<br>②状态技，牌堆不因摸牌发生变动后，你摸一张牌。",
		qsmx_sanshou: "三首",
		qsmx_sanshou_info:
			"锁定技，你受到伤害时，你可以亮出牌堆顶3张牌，若其中有本回合未使用过的类型，你防止此伤害并获得亮出牌。",
		qsmx_sp_tuxi: "突袭",
		qsmx_sp_tuxi_info:
			"你的回合外，当处理区进入牌后，你可以获得处理区中的所有牌。",
		qsmx_yinghun: "英魂",
		qsmx_yinghun_info:
			"①{准备阶段/结束阶段}，你可以{摸[X+1]张牌/令至多[X+1]名角色获得一枚“魂”}。（X为你失去的体力，至少为1）<br>②状态技，一名有“魂”的角色即将受到伤害或流失体力时，其可以弃置一枚“魂”防止之；拥有“魂”的角色手牌上限+Y（Y为“魂”的数量）",
		qsmx_juelie: "绝烈",
		qsmx_juelie_info:
			"出牌阶段限一次，你可以弃置任意张牌并令一名其他角色弃置等量的牌，然后你可以将以此法弃置的任意张牌当做一张无距离限制的【杀】使用，若此【杀】没有造成伤害，此【杀】不计入次数且此技能视为未发动过。",
		qsmx_polu: "破虏",
		qsmx_polu_info:
			"锁定技，你使用【杀】时，若此【杀】的点数和与牌名字数和均为质数，你令此【杀】无效并对此【杀】的所有目标造成一点湮灭伤害。",
		qsmx_zhendan: "震胆",
		qsmx_zhendan_info:
			"锁定技，你造成伤害时，你令目标流失等同于伤害的体力（若此伤害为致命伤害，你改为将其击杀）。",
		qsmx_paoxiao: "咆哮",
		qsmx_paoxiao_info:
			"锁定技，①你使用【杀】无次数限制②你使用的【杀】额外结算X次（X为你一回合内使用的【杀】数）。",
		qsmx_quanshi: "全视",
		qsmx_quanshi_info: "锁定技，牌堆顶一张牌始终对你可见。",
		qsmx_xianzhong: "献忠",
		qsmx_xianzhong_info:
			"汝之名为张献忠；<br>因屠戮而传世之人；<br>汝之上限恒为柒；<br>魅惑无用于汝；<br>本初之技无遗失之可能；<br>早已为癫狂之人，汝再无更癫狂之可能；<br>牌堆洗切柒次前，汝将立于世间，不畏万法所侵。",
		qsmx_qisha: "七杀",
		qsmx_qisha_info:
			"锁定技，你使用【杀】时，若你本局游戏使用的【杀】数和为7的倍数，你对此【杀】的所有目标造成一点湮灭伤害。",
		qsmx_tudiao: "屠道",
		qsmx_tudiao_info:
			"其他角色于濒死状态外回复体力后，你可视为对其使用一张【杀】；<br>其他角色于判定阶段外执行判定后，你可视为对其使用一张【杀】；<br>其他角色于摸牌阶段外获得卡牌后，你可视为对其使用一张【杀】；<br>其他角色于出牌阶段外使用卡牌后，你可视为对其使用一张【杀】；<br>其他角色于弃牌阶段外弃置卡牌后，你可视为对其使用一张【杀】；<br>其他角色于结束阶段外翻转将牌后，你可视为对其使用一张【杀】；<br>其他角色于行动回合外造成伤害后，你可视为对其使用一张【杀】；",
		qsmx_xukong: "虚空",
		qsmx_xukong_info:
			"锁定技，你防止你即将受到的伤害并流失一点体力，然后你进行一次判定，若结果为{红色/黑色}，你{回复一点体力/获得牌堆底一张牌}。",
		qsmx_yizhao: "异兆",
		qsmx_yizhao_info:
			"{牌堆/弃牌堆}不因{摸牌/使用牌}变动后，你可以{摸一张牌/使用一张牌}。",
		qsmx_linghua: "灵化",
		qsmx_linghua_info:
			"你在回合外{获得/失去}1张牌后，你可以{对当前回合角色造成一点雷电伤害/将当前回合角色区域内一张牌置于牌堆顶}。",
		qsmx_tianjiang: "天匠",
		qsmx_tianjiang_info:
			"出牌阶段，你可以将于手牌的一张装备牌装备到一名角色上，若其没有空余装备栏，则你可以先令其获得一个对应的扩展装备栏。",
		qsmx_shengong: "神工",
		qsmx_shengong_info:
			"出牌阶段，你可以弃置一张牌并声明一张副类型，然后从24张装备牌中发现一张装备牌。",
		qsmx_tuxi: "突袭",
		qsmx_tuxi_info:
			"每回合每名角色限一次，一名其他角色获得牌时，你可以改为你获得之。",
		_annihailate_damage: "湮灭",
		huanyuyanmiezhu: "寰宇湮灭珠",
		huanyuyanmiezhu_info:
			"锁定技，你即将造成的伤害视为湮灭伤害。<br>·此牌进入你的装备区时，若你的空余装备栏不大于0，你获得一个扩展宝物栏。<br>·此牌离开你的装备区时，你装备之。",
		qsmx_taoyin: "韬隐",
		qsmx_taoyin_info:
			"隐匿技，当你登场后，若当前回合角色存在且不为你，你可以视为对当前回合角色使用一张【杀】。",
		qsmx_ruilve: "睿略",
		qsmx_ruilve2: "睿略",
		qsmx_ruilve_info:
			"主公技，其他晋势力角色的出牌阶段，其可以将一张带有伤害标签的牌交给你，然后你可以使用一张带有伤害标签的牌。",
		qsmx_tairan: "泰然",
		qsmx_tairan_info:
			"锁定技，①你取消不由〖泰然②〗导致的濒死结算造成的死亡②回合结束时，若你的体力不大于0，你进入濒死状态。③你的武将牌不会被替换，你免疫控制，你的体力上限不会扣减，你的技能不会失去/失效。",
		qsmx_yimie: "夷灭",
		qsmx_yimie_info:
			"你使用伤害类牌时，你可以流失一点体力令此牌无效并对此牌的所有目标造成一点湮灭伤害。",
		qsmx_jishi: "济世",
		qsmx_jishi_info:
			"游戏开始时，你获得三枚“药”标记。一名角色进入濒死状态时，你可以移除一个“药”标记令其体力回复至1。你的回合外失去红色手牌时，你获得等量的“药”标记。",
		qsmx_jingyu: "静域",
		qsmx_jingyu_info:
			"一名其他角色回复体力后，你可以摸取等同于其体力回复值的牌。",
		qsmx_manqin: "蛮侵",
		qsmx_manqin_info:
			"出牌阶段，你可以将两张花色不同的手牌当做【南蛮入侵】使用。",
		qsmx_zaiqi: "再起",
		qsmx_zaiqi_info:
			"你进入濒死状态时，或准备阶段开始时，若你已受伤，你可以亮出牌堆顶X张牌（X为你已损失的体力值），并回复X点体力（X为其中♥牌的数量）。然后你将这些♥牌置入弃牌堆，并获得其余的牌。",
		qsmx_mingjian: "明鉴",
		qsmx_mingjian_info:
			"你可以跳过出牌阶段并将所有手牌交给一名其他角色。若如此做，你结束当前回合，然后其获得一个仅有出牌阶段的额外回合。",
		qsmx_huituo: "恢拓",
		qsmx_huituo_info:
			"你受到1点伤害后，你可以令一名角色进行一次判定，若结果为红色，其回复1点体力并摸1张牌；若结果为黑色，其获得1点护甲。",
		qsmx_zhiheng: "制衡",
		qsmx_zhiheng_info:
			"你使用或打出牌时，你可以摸[X+1]张牌，然后弃置X张牌。（X为你手牌数与装备区牌数之和，至多为你的体力上限）",
		qsmx_tianxie: "天邪",
		qsmx_tianxie_info:
			"状态技，你的体力变动后，若你体力与体力上限相同，你增加一点体力上限；你增加/扣减体力上限后，你流失/回复一点体力。",
		qsmx_reverse: "反转",
		qsmx_reverse_info:
			"专属技，<br>②你的体力变动前，你将体力变动值改为其相反数。<br>③游戏将要结束时，你反转游戏胜负。",
		qsmx_xingshang: "行殇",
		qsmx_xingshang_info:
			"一名角色死亡后，你可以获得其武将牌上的任意个技能，然后增加一点体力上限并回复一点体力。",
		qsmx_fangzhu: "放逐",
		qsmx_fangzhu_info:
			"你受到1点伤害后，你可以令一名其他角色摸X张牌标记为“放逐”并强制翻面；一名有“放逐”牌的角色翻面时，你弃置其一张牌取消之。（X为你损失的体力值）",
		qsmx_yibing: "义兵",
		qsmx_yibing_info: "测试中",
		qsmx_jianxiong: "奸雄",
		qsmx_jianxiong_info:
			"你受到伤害后，你可以获得造成伤害的牌、造成伤害的技能、转化造成伤害的牌的技能，然后你摸一张牌并令此技能的摸牌数+1（至多为7）。",
		qsmx_winwin: "赢麻",
		qsmx_winwin_info:
			"状态技，游戏将要结束时，你改为以你独自胜利结束本局游戏。",
		qsmx_winwin_append:
			'<div style="width:100%;text-align:left;font-size:13px;font-style:italic">“你赢赢赢，最后是输光光。”</div>',
		qsmx_qingguo: "倾国",
		qsmx_qingguo_info:
			"①你可以将一张黑色牌当做【闪】使用或打出。<br>②你使用或打出【闪】时，你摸一张牌。<br>③一名其他角色使用牌时，若牌的目标包含你，你可以打出一张【闪】令此牌对你无效。",
		qsmx_yijue: "义绝",
		qsmx_yijue_info:
			"你造成致命伤害时，你可以防止此伤害，获得其区域内的所有牌并废除其判定区。（若其所有装备栏已被废除，则改为你将其击杀）",
		qsmx_wusheng: "武圣",
		qsmx_wusheng_info:
			"你可以将一张牌当做【杀】使用或打出，你使用的【杀】对应实体牌中有：<br>·红色牌：此【杀】伤害+1。<br>·黑色牌：此【杀】额外结算次数+1。<br>·♥牌：此【杀】不可响应。<br>·♠牌：此【杀】所有目标的非锁定技失效直到回合结束。<br>·♦牌：此【杀】无距离限制。<br>·♣牌：此【杀】可额外选择一名目标。",
		qsmx_fushe: "伏射",
		qsmx_fushe_info:
			"①一轮游戏开始时，你清除〖伏射①〗记录的牌名，然后你可以记录3种牌名（对其他角色不可见）②其他角色你使用〖伏射①〗记录的牌名的牌时，你可以移去〖伏射①〗此牌名的记录令此牌无效并对其使用一张【杀】（不进行目标合法性检测）",
		qsmx_shidi: "势敌",
		qsmx_shidi_info:
			"专属技，你取消武将牌替换、技能清除/失效、濒死结算，你的体力和体力上限恒定为4；一名其他角色使用非实牌时，若此牌的目标包括你，你令此牌对你无效；你受到伤害后，若伤害对应实体牌数为[X-1]，你死亡，你取消不以此法的死亡。(X为伤害来源的攻击范围)",
		qsmx_luoshen: "洛神",
		qsmx_luoshen_info:
			"你获得牌后，若其中有黑色牌，你可以进行一次判定，然后你获得判定牌并将其置于你的武将牌上，称为“洛神”；你可以如手牌般使用或打出“洛神”。",
		qsmx_liancai: "敛财",
		qsmx_liancai_info:
			"出牌阶段，你可以将2张手牌当做“财”置入你的武将牌上并摸1张牌；你可以如手牌般使用或打出“财”。（X为你以此法弃置的牌数）",
		qsmx_powang: "破妄",
		qsmx_powang_info:
			"锁定技，游戏开始时，你令场上其他角色※抗性标签疑似有点太多和※含有加密代码的技能失效。",
		qsmx_fengyin: "封印",
		qsmx_fengyin_info: "",
		qsmx_liegong: "烈弓",
		qsmx_liegong_info:
			"蓄力技（0/4），你可以将牌堆底X张牌当做【杀】使用，若其中有相同花色的牌，你消耗所有蓄力值令此【杀】无效并令此【杀】所有目标强制死亡；回合结束时，若你于本回合的出牌阶段内没有使用过或打出过【杀】，你获得一点蓄力值；你的攻击范围+Y。（X为你的攻击距离，Y为你的蓄力值）",
		qsmx_diejia: "叠甲",
		qsmx_diejia_info: "你受到伤害后，你获得两点护甲值。",
		qsmx_yangkuang: "阳狂",
		qsmx_yangkuang_info:
			"转换技，<br>阳：你可以将一张红色牌当做【决斗】对自己使用，<br>阴：你可以将一张黑色牌当【过河拆桥】对自己使用。",
		qsmx_cizhang: "持杖",
		qsmx_cizhang_info:
			"专属技，游戏开始时，你将※抗性标签疑似有点太多和※含有加密代码的技能无效化；一轮游戏开始时，你对自己造成X点伤害，然后你可以令任意名武将牌上的技能数不小于Y的其他角色强制死亡。（X为你已废止的装备槽数且至少为一，Y为你为未废止的装备槽数）",
		qsmx_cizhang_append:
			'<div style="width:100%;text-align:left;font-size:13px;font-style:italic">“吾持治妄之杖，消淫邪之术，护众免灾于天外邪魔。”</div>',
		qsmx_mingli: "命理",
		qsmx_mingli_info:
			"专属技，你取消武将牌替换、技能清除/失效、濒死结算，你的体力和体力上限恒定为6；你受到的伤害防止后，若为你当前回合防止的第X次伤害，你死亡，你取消不以此法的死亡。(X为伤害来源武将牌原有的技能数)",
		qsmx_mingli_append:
			'<div style="width:100%;text-align:left;font-size:13px;font-style:italic">“习技多者，难胜吾也；若无习一技者与吾战，吾难胜也。”</div>',
		qsmx_yangbai: "佯败",
		qsmx_yangbai_info:
			"专属技，每回合限一次，你受到伤害时，你废除一个装备槽，摸X张牌并防止此伤害。你受到伤害后，你可以终止一切结算，结束当前回合。（X为此伤害的伤害值基数）",
		qsmx_yangbai_append:
			'<div style="width:100%;text-align:left;font-size:13px;font-style:italic">“行邪魔之术者，多骄恣之辈。而吾略施佯败之计，便可制之。”</div>',
		qsmx_chunhua: "纯化",
		qsmx_chunhua_info: "祈祷吧，尽管没有任何用处。",
		qsmx_shajue: "杀绝",
		qsmx_shajue_info: "你造成伤害后，你可以视为对目标使用一张普通【杀】。",
		qsmx_qichong: "七重",
		qsmx_qichong_info:
			'专属技，你取消技能清除/失效、武将牌替换、濒死结算、体力变动、体力上限变动；洗牌后，若洗牌次数不小于七，你和你的阵营获得本局游戏的胜利；你受到的伤害结算后，若<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mo stretchy="false">(</mo><mi>X</mi><mo>−</mo><mi>Y</mi><mo stretchy="false">)</mo><mo>+</mo><mo stretchy="false">(</mo><mfrac><mi>Z</mi><mrow><mi>W</mi><mo>×</mo><mi>V</mi></mrow></mfrac><msup><mo stretchy="false">)</mo><mrow><mi>U</mi><mo>−</mo><mi>T</mi></mrow></msup><mo>=</mo><mn>42</mn></math>，你死亡，你取消不以此法的死亡。（X、Y、Z、W、V、U、T分别为造成伤害的牌对应实体牌花色数、颜色数、类型数、点数和、牌名字数和、牌名数、属性数）',
		qmsx_duanwu: "锻武",
		qsmx_difu: "地府",
		qsmx_difu_info:
			"专属技，敌方角色出牌阶段开始时，若其手牌大于体力，你令其将手牌弃至体力值。",
		qsmx_xingpan: "刑判",
		qsmx_xingpan_info:
			"专属技，你的判定结果最后确定时，若结果花色未被〖刑判〗记录，你记录此牌的花色，否则，你令一名其他角色强制死亡并清除〖刑判〗的记录，然后你翻面；你的判定事件被终止后，你令一名其他角色强制死亡并清除〖刑判〗的记录，然后你翻面。",
		qsmx_jibao: "集宝",
		qsmx_jibao_info:
			"锁定技，当装备牌被你获得或进入弃牌堆后，将之置于你的武将牌上，然后你摸一张牌。你视为拥有这些装备牌的技能。",
		qsmx_gongzheng: "公正",
		qsmx_gongzheng_info:
			"锁定技。场上角色使用/打出牌时，若其不为非虚拟非转换不含有“recover”标签的牌，此牌无效。",
		qsmx_buqu: "不屈",
		qsmx_buqu_info: "锁定技。",
		qsmx_jiuzhu: "救主",
		qsmx_jiuzhu_info: "你可以将与其他角色即将受到的伤害转移至你。",
		qsmx_boming: "搏命",
		qsmx_boming_info:
			"锁定技。你受到伤害时，若伤害来源不为你，你可以对伤害来源造成一点伤害。",
		qsmx_xunbao: "寻宝",
		qsmx_xunbao_info: "回合开始阶段，你从牌库里/牌库外随机获得一张装备牌。",
		qsmx_draw: "摸牌",
		qsmx_draw_info: "游戏开始时，你摸40张牌。",
		qsmx_shefu: "设伏",
		qsmx_shefu_info: "一名其他角色使用技能时，你可令其无效。",
		qsmx_shunjia: "孙家",
		qsmx_shunjia_info:
			"锁定技。你进入濒死状态时，你随机检索一张未以此法获得过的姓“孙”的武将牌替换你的武将牌，然后你恢复体力至上限、获得〖孙家〗并摸X张牌；若检索无结果，你死亡。（X为体力上限）",
		qsmx_mingpan: "明叛",
		qsmx_mingpan_info: "锁定技，每当你回复1点体力后，你摸三张牌。",
		qsmx_miehuan: "灭患",
		qsmx_miehuan_info:
			"当你造成伤害后，你可以摸一张牌。若如此做，终止一切结算。",
		qsmx_maxhp: "锻体",
		qsmx_maxhp_info: "锁定技。当你每失去1点体力后，你增加一点体力上限。",
		qsmx_void: "虚空",
		qsmx_void_info: "锁定技，你防止一切即将造成的伤害，然后流失一点体力。",
		qsmx_pingjian: "评鉴",
		qsmx_pingjian_info:
			"你可以于满足你“访客”上的一个无技能标签或仅有锁定技标签的技能条件的时机发动此技能，然后你选择移去一张“访客”。若移去的是本次发动技能的“访客”，则你于此技能结算结束时摸一张牌。",
		qsmx_yingmen: "盈门",
		qsmx_yingmen_info:
			"锁定技，①游戏开始时，你从武将牌堆中挑选四张武将牌置于你的武将牌上，称为“访客”。②回合开始时，若你的“访客”数小于4，你从武将牌堆中选择[4-X]张武将牌将置于你的武将牌上，称为“访客”。（X为你的“访客”数）",
		qsmx_huiwan: "会玩",
		qsmx_huiwan_info:
			"锁定技，你摸牌时，若你从牌堆顶/牌堆底摸牌，你从牌堆中挑选等量的牌置于牌堆顶/牌堆底。",
		qsmx_yishua: "印刷",
		qsmx_yishua_info:
			"出牌阶段，你可以弃置一张【纸】，声明一个点数、花色和牌名，然后你从游戏外获得一张与你声明的点数、花色、牌名相同的牌。",
		qsmx_craft: "合成",
		qsmx_craft_info: "出牌阶段，你可以将两张装备牌合成为一张装备牌。",
		qsmx_dingjun: "定军",
		qsmx_dingjun_info:
			"出牌阶段限一次，你可以将任意张花色不同的牌置入你的武将牌，称之为“军”，直到结束阶段，其他角色无法使用或打出与“军”花色相同的牌；结束阶段，你获得所有“军”。",
		qsmx_guangxin: "观星",
		qsmx_guangxin_info: "",
		qsmx_mingqu: "冥躯",
		qsmx_mingqu_info:
			"专属技，此技能不会被无效化；你的手牌上限始终为体力上限；你取消濒死结算、武将牌替换、技能清除/禁用、体力上限变动；你的体力变动后，你将体力调整至1（不嵌套触发）；你受到伤害值基数为X的属性伤害后，若造成伤害的牌的颜色未被〖冥躯〗记录，你记录之；一名角色回合结束后，若〖冥躯〗记录的颜色大于等于三种，你死亡，否则你清除〖冥躯〗的记录，你取消不以此法的死亡。（X为当前回合角色手牌中的点数数）",
		qsmx_guiwang: "鬼王",
		qsmx_guiwang_info:
			"专属技，你的武将牌状态变化后，你进行一次判定，若结果为黑色，你摸三张牌，否则摸一张牌；你的回合结束后或你失去牌后，若你没有手牌，你翻面。",
		qsmx_tiemian: "铁面",
		qsmx_tiemian_info:
			"锁定技。当你成为【杀】的目标后，你进行判定。若结果为黑色，则取消此目标。",
		qsmx_jijun: "集军",
		qsmx_jijun_info:
			"出牌阶段限一次，你可以将任意张花色不同的牌置入你的武将牌，称之为“军”；结束阶段，你获得所有“军”。",
		qsmx_tieqi: "铁骑",
		qsmx_tieqi_info: "当你使用牌指定一名角色为目标后，你还原其函数。",
		qsmx_dinghhuo: "绽火",
		qsmx_dinghhuo_info:
			"你可以将普通锦囊牌当【火烧连营】，延时锦囊牌当【火山】，基本牌当【火杀】使用；你造成/受到属性伤害时，此伤害+1/-1。",
		qsmx_qianxun: "谦逊",
		qsmx_qianxun_info:
			"锁定技，你不能成为【顺手牵羊】和【乐不思蜀】的目标。",
		qmsx_lianying: "连营",
		qmsx_lianying_info:
			"出牌阶段，你可以将任意张牌交给一名未横置的角色令其横置；当你失去最后的手牌时，你可以摸一张牌。",
		qsmx_hunyou: "魂佑",
		qsmx_hunyou_info:
			"专属技，你取消武将牌替换、体力上限变动、技能禁用/清除。你的濒死结算完成后，若你的体力不大于0，你死亡，你取消不以此法的死亡。你进入濒死状态时，若你因非虚拟非转化牌造成的伤害而进入濒死状态，你将体力调整为0，否则你将体力调整为1，最后你视为获得【潜行】和【免疫】直到回合结束；你首次进入濒死状态时，你获得〖英姿〗和〖红颜〗。",
		qsmx_jiang: "激昂",
		qsmx_jiang_info:
			"你使用红色牌无次数限制、不可被响应且红色牌不计入手牌上限；每当你失去一张红色牌后，你可以摸一张牌并视为使用一张【酒】。",
		qsmx_taoni: "讨逆",
		qsmx_taoni_info:
			"锁定技，你的判定结果确认时，若结果为红色【杀】或【决斗】，你终止此判定；一名角色的判定事件终止后，你令一名其他角色强制死亡。",
		qsmx_kamisha: "神煞",
		qsmx_kamisha_info: "锁定技，你所有的牌属性均视为神属性。",
		qsmx_shishen: "弑神",
		qsmx_shishen_info:
			"专属技，一轮游戏开始时，你视为对自己造成一点伤害；一名判定结果确认时，你展示牌堆顶、牌堆底一张牌，若展示牌与判定牌的描述中均有“伤害”字段，你终止此判定事件，否则你获得展示牌；一名角色的判定事件终止后，你令一名其他角色强制死亡。",
		spear_of_longinus: "朗基努斯",
		spear_of_longinus_info: "",
		qsmx_longinusSkill: "朗枪",
		qsmx_longinusSkill_info:
			"锁定技。①游戏开始时，你将【朗基努斯】置入装备区。②你手牌区内的武器牌均视为【杀】，且你不是武器牌的合法目标。③当你即将失去【朗基努斯】或即将废除武器栏时，取消之。④你不能将装备区内的【朗基努斯】当做其他牌使用或打出。",
		qsmx_zhouqu: "咒躯",
		qsmx_zhouqu_info:
			"专属技，你取消技能清除/失效、武将牌替换、濒死结算、体力变动、体力上限变动；你受到伤害后，你进行一次判定，若结果为黑色，你流失一点体力；你的武将牌状态变动后，你令武将牌状态与你相同的角色依次流失一点体力，你亮出牌堆顶一张牌，若亮出牌点数为[X-1]，你死亡，你取消不以此法的死亡。（X为武将牌状态与你相同的角色数）",
		qsmx_chaos: "混乱",
		qsmx_chaos_info:
			"锁定技。其他角色回合开始前，你随机重新排序其阶段执行顺序；",
		qsmx_zaozhi: "造纸",
		qsmx_zaozhi_info:
			"出牌阶段限一次，你可以弃置任意张牌从游戏外获得等量的【纸】；【纸】不计入你的手牌上限。",
		qsmx_cycle: "循环",
		qsmx_cycle_info: "",
		qsmx_test: "测试",
		qsmx_test_info: "测试用技能",
		qsmx_shiyuan: "噬元",
		qsmx_shiyuan_info:
			"专属技，一名角色失去牌后，你获得X枚“⑦”标记，然后，若你拥有的“⑦”标记数不小于牌堆剩余牌数，你移去等量于牌堆剩余牌数的“⑦”标记并洗牌。（X为失去牌的点数和）",
		qsmx_shenwei: "神威",
		qsmx_shenwei_info:
			"专属技，敌方角色出牌阶段开始时，若其手牌数大于体力，你随机将其[X-Y]张手牌置入弃牌堆。（X、Y分别为其手牌数、体力）",
		qsmx_weimu: "帷幕",
		qsmx_weimu_info:
			'专属技，你不能成为延时锦囊牌的目标；你取消技能清除/失效、武将牌替换、濒死结算、体力上限变动；你防止你回合内受到的伤害，然后摸2X张牌（依然可以触发时机为"damageEnd"的卖血技）；你受到牌的伤害后，若此伤害没有伤害来源，你死亡，你取消不以此法的死亡。（X为伤害值）',
		qsmx_yanmie: "湮灭",
		qsmx_yanmie_info:
			"专属技，一名角色获得牌/失去牌/体力扣减后，你获得X枚“湮灭”标记<br>②当你的“湮灭”标记增加时，记增加前的“湮灭”标记数为A，若增加后的“湮灭”标记数大于离A最近的42的倍数B（B>A），你可以移除[7Y]枚“湮灭”，令Y名角色强制死亡。（X为其获得牌数/失去牌数/体力扣减数）",
		qmsx_zhengli: "证理",
		qmsx_zhengli_info:
			"你的回合开始时，你可以弃置任意张牌并摸等量的牌，若[(X-Y)+(Z/(W*V))^(U-T)]=42，你和你的阵营获得本局游戏的胜利。（X、Y、Z、W、V、U、T分别为弃置牌中的花色数、颜色数、类型数、点数和、牌名字数和、牌名数、属性数）",
		qsmx_zhuilie: "追猎",
		qsmx_zhuilie_info:
			"出牌阶段，你可以弃置一张武器牌或坐骑牌，或流失一点体力，对一名其他角色造成X点伤害。（X为你与其的距离）",
		qsmx_anjian: "暗箭",
		qsmx_anjian_info: "锁定技，你即将造成的伤害均视为无来源伤害。",
		qsmx_mishen: "秘神",
		qsmx_mishen_info:
			"<ins>你不是一名可选武将</ins>；你登场时，以你的阵营胜利结束本局游戏。",
	},
};
