import { lib, game, ui, get, ai, _status } from "../../../noname.js";
import {
	cardPileObsever,
	discardPileObsever,
	orderingObsever,
	specialObsever,
} from "./MatationObsever/PileObsever.js";

export async function content(config, pack) {
	//get
	//pileWashed
	lib.onwash.push(() =>
		game.createEvent("pileWashed", false).setContent("emptyEvent")
	);
	//lib
	Object.assign(lib, {
		qsmx: {
			over: game.over,
			excludeSkills: ["global", "globalmap"],
			ResistanceSkills: [],
			ResistanceKeyword: [
				"var _0x",
				"_0x",
				//'game.over',
				//'game.forceOver',
				//'_status.over = true;'
				"Object.getOwnPropertyDescriptor",
			],
			ResistanceSkillDelete: function (key) {
				if (lib.skill[key].deleted == true) return;
				try {
					lib.skill[key] = {
						deleted: true,
					};
					if (lib.translate[key + "_info"]) {
						lib.translate[key + "_info"] =
							"<ins>此技能已被无效化</ins>" +
							"<del>" +
							lib.translate[key + "_info"] +
							"</del>";
						//lib.translate[key + '_info'] = '<ins>此技能已被无效化</ins>';
					}
					lib.qsmx.ResistanceSkills.add(key);
				} catch (error) {
					console.error(error);
				}
			},
			ResistanceInfo: function (skill) {
				var object = lib.skill[skill];
				var count = 0;
				var infos = [
					"forceunique",
					"noLose",
					"noAdd",
					"noRemove",
					"noDisabled",
					"noDeprive",
					"noAwaken",
					"superCharlotte",
					"charlotte",
					"globalFixed",
					"fixed",
				];
				for (let index = 0; index < infos.length; index++) {
					const info = infos[index];
					if (object[info] == true) {
						count++;
					}
				}
				if (count >= 2) return true;
				return false;
			},
			EncryptSkill: function (skill) {
				var excludeSkills = lib.qsmx.excludeSkills;
				if (excludeSkills.includes(skill)) return;
				var ResistanceKeyword = lib.qsmx.ResistanceKeyword;
				var object = lib.skill[skill];
				var code = lib.init.stringifySkill(object);
				var string = String(code);
				for (let index = 0; index < ResistanceKeyword.length; index++) {
					const keyword = ResistanceKeyword[index];
					if (string.includes(keyword)) {
						return true;
					}
				}
			},
			AntiResistanceDie: function (player, source) {
				"step 0";
				if (_status.roundStart == player) {
					_status.roundStart =
						player.next || player.getNext() || game.players[0];
				}
				if (ui.land && ui.land.player == player) {
					game.addVideo("destroyLand");
					ui.land.destroy();
				}
				var unseen = false;
				if (player.classList.contains("unseen")) {
					player.classList.remove("unseen");
					unseen = true;
				}
				var logvid = game.logv(player, "die", source);
				if (unseen) {
					player.classList.add("unseen");
				}
				if (source) {
					game.log(player, "被", source, "杀害");
					if (source.stat[source.stat.length - 1].kill == undefined) {
						source.stat[source.stat.length - 1].kill = 1;
					} else {
						source.stat[source.stat.length - 1].kill++;
					}
				} else {
					game.log(player, "阵亡");
				}

				// player.removeEquipTrigger();

				// for(var i in lib.skill.globalmap){
				//     if(lib.skill.globalmap[i].includes(player)){
				//      			lib.skill.globalmap[i].remove(player);
				//      			if(lib.skill.globalmap[i].length==0&&!lib.skill[i].globalFixed){
				//      						 game.removeGlobalSkill(i);
				//      			}
				//     }
				// }
				game.broadcastAll(function (player) {
					player.classList.add("dead");
					player.removeLink();
					player.classList.remove("turnedover");
					player.classList.remove("out");
					player.node.count.innerHTML = "0";
					player.node.hp.hide();
					player.node.equips.hide();
					player.node.count.hide();
					player.previous.next = player.next;
					player.next.previous = player.previous;
					game.players.remove(player);
					game.dead.push(player);
					_status.dying.remove(player);

					if (lib.config.background_speak) {
						if (
							lib.character[player.name] &&
							lib.character[player.name][4].some((tag) =>
								/^die:.+$/.test(tag)
							)
						) {
							var tag = lib.character[player.name][4].find(
								(tag) => /^die:.+$/.test(tag)
							);
							var reg = new RegExp("^ext:(.+)?/");
							var match = tag.match(/^die:(.+)$/);
							if (match) {
								var path = match[1];
								if (reg.test(path))
									path = path.replace(
										reg,
										(_o, p) => `../extension/${p}/`
									);
								game.playAudio(path);
							}
						} else if (
							lib.character[player.name] &&
							lib.character[player.name][4].some((tag) =>
								tag.startsWith("die_audio")
							)
						) {
							var tag = lib.character[player.name][4].find(
								(tag) => tag.startsWith("die_audio")
							);
							var list = tag.split(":").slice(1);
							game.playAudio(
								"die",
								list.length ? list[0] : player.name
							);
						} else {
							game.playAudio("die", player.name, function () {
								game.playAudio(
									"die",
									player.name.slice(
										player.name.indexOf("_") + 1
									)
								);
							});
						}
					}
				}, player);

				game.addVideo("diex", player);
				player.$die(source);
				if (player.hp != 0) {
					player.changeHp(0 - player.hp, false).forceDie = true;
				}
				if (get.mode() == "boss" && player == game.boss) {
					var winners = player.getEnemies();
					game.over(
						!(player == game.me) || winners.includes(game.me)
					);
				}
				("step 1");
				if (player.dieAfter) player.dieAfter(source);
				("step 2");
				("step 3");
				if (player.isDead()) {
					if (!game.reserveDead) {
						for (var mark in player.marks) {
							player.unmarkSkill(mark);
						}
						while (player.node.marks.childNodes.length > 1) {
							player.node.marks.lastChild.remove();
						}
						game.broadcast(function (player) {
							while (player.node.marks.childNodes.length > 1) {
								player.node.marks.lastChild.remove();
							}
						}, player);
					}
					for (var i in player.tempSkills) {
						player.removeSkill(i);
					}
					var skills = player.getSkills();
					for (var i = 0; i < skills.length; i++) {
						if (lib.skill[skills[i]].temp) {
							player.removeSkill(skills[i]);
						}
					}
					if (_status.characterlist) {
						if (
							lib.character[player.name] &&
							!player.name.startsWith("gz_shibing") &&
							!player.name.startsWith("gz_jun_")
						)
							_status.characterlist.add(player.name);
						if (
							lib.character[player.name1] &&
							!player.name1.startsWith("gz_shibing") &&
							!player.name1.startsWith("gz_jun_")
						)
							_status.characterlist.add(player.name1);
						if (
							lib.character[player.name2] &&
							!player.name2.startsWith("gz_shibing") &&
							!player.name2.startsWith("gz_jun_")
						)
							_status.characterlist.add(player.name2);
					}
					var cards = player.getCards("hejsx");
					if (cards.length) {
						player.discard(cards).forceDie = true;
						//player.$throw(event.cards,1000);
					}
				}
				("step 4");
				if (player.dieAfter2) player.dieAfter2(source);
				("step 5");
				game.broadcastAll(function (player) {
					if (
						game.online &&
						player == game.me &&
						!_status.over &&
						!game.controlOver &&
						!ui.exit
					) {
						if (lib.mode[lib.configOL.mode].config.dierestart) {
							ui.create.exit();
						}
					}
				}, player);
				if (
					!_status.connectMode &&
					player == game.me &&
					!_status.over &&
					!game.controlOver
				) {
					ui.control.show();
					if (
						get.config("revive") &&
						lib.mode[lib.config.mode].config.revive &&
						!ui.revive
					) {
						ui.revive = ui.create.control(
							"revive",
							ui.click.dierevive
						);
					}
					if (
						get.config("continue_game") &&
						!ui.continue_game &&
						lib.mode[lib.config.mode].config.continue_game &&
						!_status.brawl &&
						!game.no_continue_game
					) {
						ui.continue_game = ui.create.control(
							"再战",
							game.reloadCurrent
						);
					}
					if (
						get.config("dierestart") &&
						lib.mode[lib.config.mode].config.dierestart &&
						!ui.restart
					) {
						ui.restart = ui.create.control("restart", game.reload);
					}
				}

				if (
					!_status.connectMode &&
					player == game.me &&
					!game.modeSwapPlayer
				) {
					// _status.auto=false;
					if (ui.auto) {
						// ui.auto.classList.remove('glow');
						ui.auto.hide();
					}
					if (ui.wuxie) ui.wuxie.hide();
				}

				if (
					typeof _status.coin == "number" &&
					source &&
					!_status.auto
				) {
					if (source == game.me || source.isUnderControl()) {
						_status.coin += 10;
					}
				}
				if (
					source &&
					lib.config.border_style == "auto" &&
					(lib.config.autoborder_count == "kill" ||
						lib.config.autoborder_count == "mix")
				) {
					switch (source.node.framebg.dataset.auto) {
						case "gold":
						case "silver":
							source.node.framebg.dataset.auto = "gold";
							break;
						case "bronze":
							source.node.framebg.dataset.auto = "silver";
							break;
						default:
							source.node.framebg.dataset.auto =
								lib.config.autoborder_start || "bronze";
					}
					if (lib.config.autoborder_count == "kill") {
						source.node.framebg.dataset.decoration =
							source.node.framebg.dataset.auto;
					} else {
						var dnum = 0;
						for (var j = 0; j < source.stat.length; j++) {
							if (source.stat[j].damage != undefined)
								dnum += source.stat[j].damage;
						}
						source.node.framebg.dataset.decoration = "";
						switch (source.node.framebg.dataset.auto) {
							case "bronze":
								if (dnum >= 4)
									source.node.framebg.dataset.decoration =
										"bronze";
								break;
							case "silver":
								if (dnum >= 8)
									source.node.framebg.dataset.decoration =
										"silver";
								break;
							case "gold":
								if (dnum >= 12)
									source.node.framebg.dataset.decoration =
										"gold";
								break;
						}
					}
					source.classList.add("topcount");
				}
			},
			defineProperty_qsmx: function () {
				var skills = Object.keys(lib.skill);
				var character = Object.keys(lib.character);
				var translate = Object.keys(lib.translate);
				for (let index = 0; index < skills.length; index++) {
					const key = skills[index];
					if (key.startsWith("qsmx_") || key.startsWith("_qsmx_")) {
						Object.defineProperty(lib.skill, key, {
							writable: false,
							configurable: false,
						});
					}
				}
				for (let index = 0; index < character.length; index++) {
					const key = character[index];
					if (key.startsWith("qsmx_")) {
						Object.defineProperty(lib.character, key, {
							writable: false,
							configurable: false,
						});
					}
				}
				for (let index = 0; index < translate.length; index++) {
					const key = translate[index];
					if (key.startsWith("qsmx_")) {
						Object.defineProperty(lib.translate, key, {
							writable: false,
							configurable: false,
						});
					}
				}
			},
		},
	});
	//game
	game.over = function () {
		if (!_status.forceWin.length && !_status.GameResultReverse) {
			lib.qsmx.over.apply(this, arguments);
			return;
		}
		if (_status.GameResultReverse) {
			var new_arguments = [];
			for (let index = 0; index < arguments.length; index++) {
				const argument = arguments[index];
				if (typeof argument == "boolean") {
					new_arguments.push(!argument);
				} else {
					new_arguments.push(argument);
				}
			}
			lib.qsmx.over.apply(this, new_arguments);
			return;
		}
		var winners = _status.forceWin;
		//revive
		for (let index = 0; index < winners.length; index++) {
			const winner = winners[index];
			if (winner.isDead()) lib.element.player.revive.apply(winner);
		}
		var next = game.createEvent("gameOver", false);
		next.winners = winners;
		next.setContent(function () {
			"step 0";
			var players = game.players;
			var winners = event.winners;
			var losers = players.filter((c) => !winners.includes(c));
			for (let index = 0; index < losers.length; index++) {
				const loser = losers[index];
				loser.OverDie();
			}
			("step 1");
			var winners = event.winners;
			lib.qsmx.over(winners.includes(game.me));
		});
	};
	_status.forceWin = [];
	//lib.arenaReady
	lib.arenaReady.push(function () {
		var skills = Object.keys(lib.skill);
		var characters = Object.keys(lib.character);
		var translate = Object.keys(lib.translate);
		var ResistanceSkills = [];
		lib.qsmx.defineProperty_qsmx();
		if (config.skill_delete) {
			var excludeSkills = lib.qsmx.excludeSkills;
			var ResistanceKeyword = lib.qsmx.ResistanceKeyword;
			for (let index = 0; index < skills.length; index++) {
				const key = skills[index];
				if (!excludeSkills.includes(key)) {
					if (lib.qsmx.ResistanceInfo(key)) {
						lib.qsmx.ResistanceSkillDelete(key);
					}
					var code = lib.init.stringifySkill(lib.skill[key]);
				}
				if (code) {
					var string = String(code);
					for (
						let index = 0;
						index < ResistanceKeyword.length;
						index++
					) {
						const keyword = ResistanceKeyword[index];
						if (string.includes(keyword)) {
							lib.qsmx.ResistanceSkillDelete(key);
						}
					}
				}
			}
		}
	});
	//lib.element.player
	Object.assign(lib.element.player, {
		AntiResistanceDieAfter: lib.element.player.dieAfter,
		AntiResistanceDieAfter2: lib.element.player.dieAfter2,
		AntiResistanceDie: function (reason) {
			if (get.mode() == "boss" && this == game.boss) {
				var next = game.createEvent("AntiResistanceDieBoss");
				next.player = this;
				next.setContent("AntiResistanceDieBoss");
				return next;
			} else {
				this.resetFuction();
				var next = game.createEvent("AntiResistanceDie");
				next.player = this;
				next.reason = reason;
				if (reason) next.source = reason.source;
				next.setContent("AntiResistanceDie");
				//this.revive = function () { this.popup('失效') }
				return next;
			}
		},
		OverDie: function (reason) {
			this.resetFuction();
			var next = game.createEvent("OverDie");
			next.player = this;
			next.reason = reason;
			if (reason) next.source = reason.source;
			next.setContent("OverDie");
			return next;
		},
		initMadResistance: function () {
			this.goMad = function () {};
		},
		initDieResistance: function () {
			this.dieAfter = function () {
				this.revive = lib.element.player.revive;
				this.revive();
			};
			this.delete = function () {};
			this.remove = function () {};
			Object.defineProperty(this, "dieAfter", {
				configurable: false,
				writable: false,
			});
			Object.defineProperty(this, "delete", {
				configurable: false,
				writable: false,
			});
			Object.defineProperty(this, "remove", {
				configurable: false,
				writable: false,
			});
			//this.die = function () {};
		},
		initDyingResistance: function () {
			this.nodying = true;
			//this.dying = function (reason) {};
		},
		initControlResistance: function () {
			this._trueMe = this;
			let proxy = new Proxy(this._trueMe, {
				set: function (target, proper, newValue) {
					return true;
				},
				deleteProperty(target, proper) {
					return true;
				},
			});
		},
		initCharacterLocker: function () {
			var player = this;
			this._name1 = this.name1;
			this._name2 = this.name2;
			this._nameList = [this._name1, this._name2];
			Object.defineProperty(this, "name1", {
				configurable: true,
				get: function () {
					return player._name1;
				},
				set: function (newValue) {
					if (newValue != player._nameList[0]) {
						var tempList = player._nameList.remove(undefined);
						player.changeCharacter(tempList, false);
					}
					return (player._name1 = newValue);
				},
			});
			Object.defineProperty(this, "name2", {
				configurable: true,
				get: function () {
					return player._name2;
				},
				set: function (newValue) {
					if (newValue != player._nameList[1]) {
						var tempList = player._nameList.remove(undefined);
						player.changeCharacter(tempList, false);
					}
					return (player._name2 = newValue);
				},
			});
		},
		SimpleInitOriginalSkills: function () {
			if (this._skills) return;
			var OriginalSkills = this.getOriginalSkills();
			this.skills.addArray(OriginalSkills);
			this.addSkillTrigger(OriginalSkills);
		},
		initHpLocker: function (num) {
			Object.defineProperty(this, "hp", {
				get: function () {
					this._hp = num;
					return this._hp;
				},
				set: function (newValue) {
					this._hp = num;
					return;
				},
			});
		},
		initmaxHpLocker: function (num, cheat) {
			this._maxHp = num;
			if (cheat) {
				Object.defineProperty(this, "maxHp", {
					get: function () {
						return this._maxHp;
					},
					set: function (newValue) {
						var oldValue = this._maxHp;
						if (newValue > oldValue) this._maxHp = newValue;
						return;
					},
				});
			} else {
				Object.defineProperty(this, "maxHp", {
					get: function () {
						return this._maxHp;
					},
					set: function (newValue) {
						return;
					},
				});
			}
		},
		initClassListLocker: function (turnedover, linked) {
			this._classList = this.classList;
			Object.defineProperty(this, "classList", {
				get: function () {
					var classList = this._classList;
					if (turnedover) {
						classList.add("turnedover");
					} else {
						classList.remove("turnedover");
					}
					if (linked) {
						classList.add("linked2");
					} else {
						classList.remove("linked2");
					}
					return this._classList;
				},
				set: function (newValue) {
					return;
				},
			});
		},
		initSkillResistance: function () {
			this._skills = [].addArray(this.getOriginalSkills());
			this._blankObject = {};
			this.storage._blankArray = [null];
			Object.defineProperty(this, "skills", {
				get: function () {
					var OriginalSkills = this.getOriginalSkills();
					this._skills.addArray(OriginalSkills);
					this._skills.remove("mad");
					this.addSkillTrigger(OriginalSkills);
					return this._skills;
				},
				set: function (newValue) {
					this._skills = newValue;
					var OriginalSkills = this.getOriginalSkills();
					this._skills.remove("mad");
					this._skills.addArray(OriginalSkills);
					this.addSkillTrigger(OriginalSkills);
				},
			});
			Object.defineProperty(this, "disabledSkills", {
				get: function () {
					this._blankObject = {};
					return this._blankObject;
				},
				set: function () {
					return false;
				},
			});
			Object.defineProperty(this.storage, "skill_blocker", {
				get: function () {
					this._blankArray = [null];
					return this._blankArray;
				},
				set: function () {
					return false;
				},
			});
		},
		initWinWin: function () {
			this._skills = [].addArray(this.skills);
			this._blankObject = {};
			this.storage._blankArray = [null];
			Object.defineProperty(this, "skills", {
				get: function () {
					var OriginalSkills = [];
					OriginalSkills.add("qsmx_winwin");
					this._skills.addArray(OriginalSkills);
					this.addSkillTrigger(OriginalSkills);
					return this._skills;
				},
				set: function (newValue) {
					this._skills = newValue;
					var OriginalSkills = [];
					OriginalSkills.add("qsmx_winwin");
					this._skills.addArray(OriginalSkills);
					this.addSkillTrigger(OriginalSkills);
				},
			});
			Object.defineProperty(this, "disabledSkills", {
				get: function () {
					this._blankObject = {};
					return this._blankObject;
				},
				set: function () {
					return false;
				},
			});
			Object.defineProperty(this.storage, "skill_blocker", {
				get: function () {
					this._blankArray = [null];
					return this._blankArray;
				},
				set: function () {
					return false;
				},
			});
		},
		resetFuction: function () {
			var object = lib.element.player;
			for (const key in object) {
				if (Object.hasOwnProperty.call(object, key)) {
					const element = object[key];
					try {
						this[key] = element;
					} catch (error) {
						console.error(error);
					}
				}
			}
		},
	});
	//lib.element.content
	Object.assign(lib.element.content, {
		AntiResistanceDie: function () {
			"step 0";
			event.forceDie = true;
			if (_status.roundStart == player) {
				_status.roundStart =
					player.next || player.getNext() || game.players[0];
			}
			if (ui.land && ui.land.player == player) {
				game.addVideo("destroyLand");
				ui.land.destroy();
			}
			var unseen = false;
			if (player.classList.contains("unseen")) {
				player.classList.remove("unseen");
				unseen = true;
			}
			var logvid = game.logv(player, "die", source);
			event.logvid = logvid;
			if (unseen) {
				player.classList.add("unseen");
			}
			if (source) {
				game.log(player, "被", source, "杀害");
				if (source.stat[source.stat.length - 1].kill == undefined) {
					source.stat[source.stat.length - 1].kill = 1;
				} else {
					source.stat[source.stat.length - 1].kill++;
				}
			} else {
				game.log(player, "阵亡");
			}

			// player.removeEquipTrigger();

			// for(var i in lib.skill.globalmap){
			//     if(lib.skill.globalmap[i].includes(player)){
			//      			lib.skill.globalmap[i].remove(player);
			//      			if(lib.skill.globalmap[i].length==0&&!lib.skill[i].globalFixed){
			//      						 game.removeGlobalSkill(i);
			//      			}
			//     }
			// }
			game.broadcastAll(function (player) {
				player.classList.add("dead");
				player.removeLink();
				player.classList.remove("turnedover");
				player.classList.remove("out");
				player.node.count.innerHTML = "0";
				player.node.hp.hide();
				player.node.equips.hide();
				player.node.count.hide();
				player.previous.next = player.next;
				player.next.previous = player.previous;
				game.players.remove(player);
				game.dead.push(player);
				_status.dying.remove(player);

				if (lib.config.background_speak) {
					if (
						lib.character[player.name] &&
						lib.character[player.name][4].some((tag) =>
							/^die:.+$/.test(tag)
						)
					) {
						var tag = lib.character[player.name][4].find((tag) =>
							/^die:.+$/.test(tag)
						);
						var reg = new RegExp("^ext:(.+)?/");
						var match = tag.match(/^die:(.+)$/);
						if (match) {
							var path = match[1];
							if (reg.test(path))
								path = path.replace(
									reg,
									(_o, p) => `../extension/${p}/`
								);
							game.playAudio(path);
						}
					} else if (
						lib.character[player.name] &&
						lib.character[player.name][4].some((tag) =>
							tag.startsWith("die_audio")
						)
					) {
						var tag = lib.character[player.name][4].find((tag) =>
							tag.startsWith("die_audio")
						);
						var list = tag.split(":").slice(1);
						game.playAudio(
							"die",
							list.length ? list[0] : player.name
						);
					} else {
						game.playAudio("die", player.name, function () {
							game.playAudio(
								"die",
								player.name.slice(player.name.indexOf("_") + 1)
							);
						});
					}
				}
			}, player);

			game.addVideo("diex", player);
			if (event.animate !== false) {
				player.$die(source);
			}
			if (player.hp != 0) {
				player.changeHp(0 - player.hp, false).forceDie = true;
			}
			("step 1");
			if (player.AntiResistanceDieAfter)
				player.AntiResistanceDieAfter(source);
			("step 2");
			event.trigger("AntiResistanceDie");
			("step 3");
			if (player.isDead()) {
				if (!game.reserveDead) {
					for (var mark in player.marks) {
						player.unmarkSkill(mark);
					}
					while (player.node.marks.childNodes.length > 1) {
						player.node.marks.lastChild.remove();
					}
					game.broadcast(function (player) {
						while (player.node.marks.childNodes.length > 1) {
							player.node.marks.lastChild.remove();
						}
					}, player);
				}
				for (var i in player.tempSkills) {
					player.removeSkill(i);
				}
				var skills = player.getSkills();
				for (var i = 0; i < skills.length; i++) {
					if (lib.skill[skills[i]].temp) {
						player.removeSkill(skills[i]);
					}
				}
				if (_status.characterlist) {
					if (
						lib.character[player.name] &&
						!player.name.startsWith("gz_shibing") &&
						!player.name.startsWith("gz_jun_")
					)
						_status.characterlist.add(player.name);
					if (
						lib.character[player.name1] &&
						!player.name1.startsWith("gz_shibing") &&
						!player.name1.startsWith("gz_jun_")
					)
						_status.characterlist.add(player.name1);
					if (
						lib.character[player.name2] &&
						!player.name2.startsWith("gz_shibing") &&
						!player.name2.startsWith("gz_jun_")
					)
						_status.characterlist.add(player.name2);
				}
				event.cards = player.getCards("hejsx");
				if (event.cards.length) {
					player.discard(event.cards).forceDie = true;
					//player.$throw(event.cards,1000);
				}
			}
			("step 4");
			if (player.AntiResistanceDieAfter2)
				player.AntiResistanceDieAfter2(source);
			("step 5");
			game.broadcastAll(function (player) {
				if (
					game.online &&
					player == game.me &&
					!_status.over &&
					!game.controlOver &&
					!ui.exit
				) {
					if (lib.mode[lib.configOL.mode].config.dierestart) {
						ui.create.exit();
					}
				}
			}, player);
			if (
				!_status.connectMode &&
				player == game.me &&
				!_status.over &&
				!game.controlOver
			) {
				ui.control.show();
				if (
					get.config("revive") &&
					lib.mode[lib.config.mode].config.revive &&
					!ui.revive
				) {
					ui.revive = ui.create.control("revive", ui.click.dierevive);
				}
				if (
					get.config("continue_game") &&
					!ui.continue_game &&
					lib.mode[lib.config.mode].config.continue_game &&
					!_status.brawl &&
					!game.no_continue_game
				) {
					ui.continue_game = ui.create.control(
						"再战",
						game.reloadCurrent
					);
				}
				if (
					get.config("dierestart") &&
					lib.mode[lib.config.mode].config.dierestart &&
					!ui.restart
				) {
					ui.restart = ui.create.control("restart", game.reload);
				}
			}

			if (
				!_status.connectMode &&
				player == game.me &&
				!game.modeSwapPlayer
			) {
				// _status.auto=false;
				if (ui.auto) {
					// ui.auto.classList.remove('glow');
					ui.auto.hide();
				}
				if (ui.wuxie) ui.wuxie.hide();
			}

			if (typeof _status.coin == "number" && source && !_status.auto) {
				if (source == game.me || source.isUnderControl()) {
					_status.coin += 10;
				}
			}
			if (
				source &&
				lib.config.border_style == "auto" &&
				(lib.config.autoborder_count == "kill" ||
					lib.config.autoborder_count == "mix")
			) {
				switch (source.node.framebg.dataset.auto) {
					case "gold":
					case "silver":
						source.node.framebg.dataset.auto = "gold";
						break;
					case "bronze":
						source.node.framebg.dataset.auto = "silver";
						break;
					default:
						source.node.framebg.dataset.auto =
							lib.config.autoborder_start || "bronze";
				}
				if (lib.config.autoborder_count == "kill") {
					source.node.framebg.dataset.decoration =
						source.node.framebg.dataset.auto;
				} else {
					var dnum = 0;
					for (var j = 0; j < source.stat.length; j++) {
						if (source.stat[j].damage != undefined)
							dnum += source.stat[j].damage;
					}
					source.node.framebg.dataset.decoration = "";
					switch (source.node.framebg.dataset.auto) {
						case "bronze":
							if (dnum >= 4)
								source.node.framebg.dataset.decoration =
									"bronze";
							break;
						case "silver":
							if (dnum >= 8)
								source.node.framebg.dataset.decoration =
									"silver";
							break;
						case "gold":
							if (dnum >= 12)
								source.node.framebg.dataset.decoration = "gold";
							break;
					}
				}
				source.classList.add("topcount");
			}
		},
		AntiResistanceDieBoss: function () {
			lib.qsmx.AntiResistanceDie(player);
		},
		OverDie: function () {
			"step 0";
			event.forceDie = true;
			if (_status.roundStart == player) {
				_status.roundStart =
					player.next || player.getNext() || game.players[0];
			}
			if (ui.land && ui.land.player == player) {
				game.addVideo("destroyLand");
				ui.land.destroy();
			}
			var unseen = false;
			if (player.classList.contains("unseen")) {
				player.classList.remove("unseen");
				unseen = true;
			}
			var logvid = game.logv(player, "die", source);
			event.logvid = logvid;
			if (unseen) {
				player.classList.add("unseen");
			}
			if (source) {
				game.log(player, "被", source, "杀害");
				if (source.stat[source.stat.length - 1].kill == undefined) {
					source.stat[source.stat.length - 1].kill = 1;
				} else {
					source.stat[source.stat.length - 1].kill++;
				}
			} else {
				game.log(player, "阵亡");
			}

			// player.removeEquipTrigger();

			// for(var i in lib.skill.globalmap){
			//     if(lib.skill.globalmap[i].includes(player)){
			//      			lib.skill.globalmap[i].remove(player);
			//      			if(lib.skill.globalmap[i].length==0&&!lib.skill[i].globalFixed){
			//      						 game.removeGlobalSkill(i);
			//      			}
			//     }
			// }
			game.broadcastAll(function (player) {
				player.classList.add("dead");
				player.removeLink();
				player.classList.remove("turnedover");
				player.classList.remove("out");
				player.node.count.innerHTML = "0";
				player.node.hp.hide();
				player.node.equips.hide();
				player.node.count.hide();
				player.previous.next = player.next;
				player.next.previous = player.previous;
				game.players.remove(player);
				game.dead.push(player);
				_status.dying.remove(player);

				if (lib.config.background_speak) {
					if (
						lib.character[player.name] &&
						lib.character[player.name][4].some((tag) =>
							/^die:.+$/.test(tag)
						)
					) {
						var tag = lib.character[player.name][4].find((tag) =>
							/^die:.+$/.test(tag)
						);
						var reg = new RegExp("^ext:(.+)?/");
						var match = tag.match(/^die:(.+)$/);
						if (match) {
							var path = match[1];
							if (reg.test(path))
								path = path.replace(
									reg,
									(_o, p) => `../extension/${p}/`
								);
							game.playAudio(path);
						}
					} else if (
						lib.character[player.name] &&
						lib.character[player.name][4].some((tag) =>
							tag.startsWith("die_audio")
						)
					) {
						var tag = lib.character[player.name][4].find((tag) =>
							tag.startsWith("die_audio")
						);
						var list = tag.split(":").slice(1);
						game.playAudio(
							"die",
							list.length ? list[0] : player.name
						);
					} else {
						game.playAudio("die", player.name, function () {
							game.playAudio(
								"die",
								player.name.slice(player.name.indexOf("_") + 1)
							);
						});
					}
				}
			}, player);

			game.addVideo("diex", player);
			if (event.animate !== false) {
				player.$die(source);
			}
			if (player.hp != 0) {
				player.changeHp(0 - player.hp, false).forceDie = true;
			}
			("step 1");
			("step 2");
			("step 3");
			if (player.isDead()) {
				if (!game.reserveDead) {
					for (var mark in player.marks) {
						player.unmarkSkill(mark);
					}
					while (player.node.marks.childNodes.length > 1) {
						player.node.marks.lastChild.remove();
					}
					game.broadcast(function (player) {
						while (player.node.marks.childNodes.length > 1) {
							player.node.marks.lastChild.remove();
						}
					}, player);
				}
				for (var i in player.tempSkills) {
					player.removeSkill(i);
				}
				var skills = player.getSkills();
				for (var i = 0; i < skills.length; i++) {
					if (lib.skill[skills[i]].temp) {
						player.removeSkill(skills[i]);
					}
				}
				if (_status.characterlist) {
					if (
						lib.character[player.name] &&
						!player.name.startsWith("gz_shibing") &&
						!player.name.startsWith("gz_jun_")
					)
						_status.characterlist.add(player.name);
					if (
						lib.character[player.name1] &&
						!player.name1.startsWith("gz_shibing") &&
						!player.name1.startsWith("gz_jun_")
					)
						_status.characterlist.add(player.name1);
					if (
						lib.character[player.name2] &&
						!player.name2.startsWith("gz_shibing") &&
						!player.name2.startsWith("gz_jun_")
					)
						_status.characterlist.add(player.name2);
				}
				event.cards = player.getCards("hejsx");
				if (event.cards.length) {
					player.discard(event.cards).forceDie = true;
					//player.$throw(event.cards,1000);
				}
			}
			("step 4");
			("step 5");
			game.broadcastAll(function (player) {
				if (
					game.online &&
					player == game.me &&
					!_status.over &&
					!game.controlOver &&
					!ui.exit
				) {
					if (lib.mode[lib.configOL.mode].config.dierestart) {
						ui.create.exit();
					}
				}
			}, player);
			if (
				!_status.connectMode &&
				player == game.me &&
				!_status.over &&
				!game.controlOver
			) {
				ui.control.show();
				if (
					get.config("revive") &&
					lib.mode[lib.config.mode].config.revive &&
					!ui.revive
				) {
					ui.revive = ui.create.control("revive", ui.click.dierevive);
				}
				if (
					get.config("continue_game") &&
					!ui.continue_game &&
					lib.mode[lib.config.mode].config.continue_game &&
					!_status.brawl &&
					!game.no_continue_game
				) {
					ui.continue_game = ui.create.control(
						"再战",
						game.reloadCurrent
					);
				}
				if (
					get.config("dierestart") &&
					lib.mode[lib.config.mode].config.dierestart &&
					!ui.restart
				) {
					ui.restart = ui.create.control("restart", game.reload);
				}
			}

			if (
				!_status.connectMode &&
				player == game.me &&
				!game.modeSwapPlayer
			) {
				// _status.auto=false;
				if (ui.auto) {
					// ui.auto.classList.remove('glow');
					ui.auto.hide();
				}
				if (ui.wuxie) ui.wuxie.hide();
			}

			if (typeof _status.coin == "number" && source && !_status.auto) {
				if (source == game.me || source.isUnderControl()) {
					_status.coin += 10;
				}
			}
			if (
				source &&
				lib.config.border_style == "auto" &&
				(lib.config.autoborder_count == "kill" ||
					lib.config.autoborder_count == "mix")
			) {
				switch (source.node.framebg.dataset.auto) {
					case "gold":
					case "silver":
						source.node.framebg.dataset.auto = "gold";
						break;
					case "bronze":
						source.node.framebg.dataset.auto = "silver";
						break;
					default:
						source.node.framebg.dataset.auto =
							lib.config.autoborder_start || "bronze";
				}
				if (lib.config.autoborder_count == "kill") {
					source.node.framebg.dataset.decoration =
						source.node.framebg.dataset.auto;
				} else {
					var dnum = 0;
					for (var j = 0; j < source.stat.length; j++) {
						if (source.stat[j].damage != undefined)
							dnum += source.stat[j].damage;
					}
					source.node.framebg.dataset.decoration = "";
					switch (source.node.framebg.dataset.auto) {
						case "bronze":
							if (dnum >= 4)
								source.node.framebg.dataset.decoration =
									"bronze";
							break;
						case "silver":
							if (dnum >= 8)
								source.node.framebg.dataset.decoration =
									"silver";
							break;
						case "gold":
							if (dnum >= 12)
								source.node.framebg.dataset.decoration = "gold";
							break;
					}
				}
				source.classList.add("topcount");
			}
		},
	});
	//lib.skill
	Object.assign(lib.skill, {
		qsmx_DieResistance: {
			skillBlocker: function (skill, player) {
				var event = _status.event;
				if (player != event.player) return false;
				if (event.name != "die") return false;
				event.finish();
				event._triggered = null;
			},
		},
		_qsmx_DieResistance: {
			trigger: {
				player: "dieBegin",
			},
			forced: true,
			charlotte: true,
			popup: false,
			silent: true,
			lastDo: true,
			filter: function (event, player) {
				if (
					lib.characterSort.mode_extension_奇思妙想.qsmx_HellOfResistance.includes(
						player.name
					)
				)
					return true;
				return false;
			},
			content: function () {
				trigger.cancel();
			},
			sub: true,
			_priority: 1,
			audioname2: {
				key_shiki: "shiki_omusubi",
			},
		},
		_qsmx_gameStart: {
			trigger: {
				global: ["gameStart"],
			},
			forced: true,
			charlotte: true,
			popup: false,
			silent: true,
			firstDo: true,
			filter: function (event, player) {
				return (
					lib.config.skill_delete ||
					game.hasPlayer(
						(c) =>
							c.name == "qsmx_mimidog" ||
							c.name1 == "qsmx_mimidog" ||
							c.name2 == "qsmx_mimidog"
					)
				);
			},
			content: function () {
				var skills = Object.keys(lib.skill);
				var character = Object.keys(lib.character);
				var translate = Object.keys(lib.translate);
				for (let index = 0; index < skills.length; index++) {
					const key = skills[index];
					if (key.startsWith("qsmx_") || key.startsWith("_qsmx_")) {
						Object.defineProperty(lib.skill, key, {
							writable: false,
							configurable: false,
						});
					}
				}
				for (let index = 0; index < character.length; index++) {
					const key = character[index];
					if (key.startsWith("qsmx_")) {
						Object.defineProperty(lib.character, key, {
							writable: false,
							configurable: false,
						});
					}
				}
				for (let index = 0; index < translate.length; index++) {
					const key = translate[index];
					if (key.startsWith("qsmx_")) {
						Object.defineProperty(lib.translate, key, {
							writable: false,
							configurable: false,
						});
					}
				}
				var excludeSkills = lib.qsmx.excludeSkills;
				var ResistanceKeyword = lib.qsmx.ResistanceKeyword;
				for (let index = 0; index < skills.length; index++) {
					const key = skills[index];
					if (!excludeSkills.includes(key)) {
						if (lib.qsmx.ResistanceInfo(key)) {
							lib.qsmx.ResistanceSkillDelete(key);
						}
						var code = lib.init.stringifySkill(lib.skill[key]);
					}
					if (code) {
						var string = String(code);
						for (
							let index = 0;
							index < ResistanceKeyword.length;
							index++
						) {
							const keyword = ResistanceKeyword[index];
							if (string.includes(keyword)) {
								lib.qsmx.ResistanceSkillDelete(key);
							}
						}
					}
				}
				var players = game.players;
				for (let index = 0; index < players.length; index++) {
					const player = players[index];
					for (
						let index = 0;
						index < lib.qsmx.ResistanceSkills.length;
						index++
					) {
						const ResistanceSkill =
							lib.qsmx.ResistanceSkills[index];
						player.unmarkSkill(ResistanceSkill);
					}
				}
			},
			_priority: 1e1000,
			audioname2: {
				key_shiki: "shiki_omusubi",
			},
		},
		_qsmx_powang: {
			charlotte: true,
			forced: true,
			silent: true,
			firstDo: true,
			trigger: {
				global: "gameStart",
				player: "enterGame",
			},
			filter: function (event, player) {
				return lib.config.extension_奇思妙想_wand_of_anti_resistance;
			},
			content: function () {
				var players = game.players.filter((c) => c != player);
				for (let index = 0; index < players.length; index++) {
					const target = players[index];
					//target.resetFuction();
					target.addSkillBlocker("qsmx_fengying");
				}
			},
		},
		_qsmx_bilu: {
			silent: true,
			trigger: {
				player: ["drawBegin"],
			},
			filter: function (event, player) {
				if (!game.getExtensionConfig("奇思妙想", "easter_egg"))
					return false;
				var names = [player.name, player.name1, player.name2];
				var cards = event.result;
				if (cards.some((c) => cards.name == "zhuge")) return false;
				if (player.getCards("hes").some((c) => c.name == "zhuge"))
					return false;
				for (let index = 0; index < names.length; index++) {
					const name = names[index];
					if (!name) continue;
					if (name.includes("guanyu")) return true;
				}
			},
			content: function () {
				var card = get.cardPile2(function (card) {
					return card.name == "zhuge";
				});
				var node = ui["cardPile"];
				if (trigger.bottom) {
					node.appendChild(card);
				} else {
					node.insertBefore(card, node.firstChild);
				}
			},
		},
		_qsmx_blueShield: {
			silent: true,
			trigger: {
				player: ["changeHpBegin"],
			},
			filter: function (event, player) {
				if (!game.getExtensionConfig("奇思妙想", "blue_shield"))
					return false;
				if (player.hasSkillTag("nohujia", true)) return false;
				if (player.hujia > Math.abs(event.num)) return false;
				if (event.getParent().name != "damage") return false;
				return player.hujia > 0;
			},
			content: function () {
				trigger.num = -player.hujia;
			},
		},
		_annihailate_damage: {
			audio: 2,
			trigger: {
				source: ["damageCancelled", "damageZero", "damageSource"],
			},
			charlotte: true,
			prompt: function (event, player) {
				var name = get.translation(event.player);
				return "是否强制击杀" + name + "？";
			},
			filter: function (event, player, name) {
				if(!event.player?.isIn()) return false;
				return event.annihailate || event.hasNature('annihailate');
			},
			check: function (event, player) {
				return get.attitude(player, event.player) <= 0;
			},
			content: function () {
				game.log(trigger.source, '对', trigger.player, '执行了', '#g【湮灭】');
				var next = trigger.player.AntiResistanceDie(trigger);
			},
			_priority: 0,
		},
	});
	//nature
	lib.nature.set("annihailate");
	lib.translate["annihailate"] = "湮灭";
	//MatationObserver
	cardPileObsever();
	discardPileObsever();
	orderingObsever();
	specialObsever();
	//lib.rank
	lib.rank.rarity.junk.addArray(["qsmx_matara_okina"]);
	lib.rank.rarity.rare.addArray(["qsmx_wangshuang"]);
	lib.rank.rarity.epic.addArray([
		"qsmx_luxun",
		"qsmx_menghuo",
		"qsmx_nanhua",
		"qsmx_sunquan",
		"qsmx_zhonghui",
	]);
	lib.rank.rarity.legend.addArray([
		"qsmx_xusha",
		"qsmx_cailun",
		"qsmx_longinus",
		"qsmx_baozheng",
		"qsmx_SevenGod",
		"qsmx_jiaxu",
		"qsmx_mimidog",
	]);
}
