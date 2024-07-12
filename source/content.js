import { lib, game, ui, get, ai, _status } from "../../../noname.js";
import { Player } from "../../../noname/library/element/player.js";
import {
	cardPileObsever,
	discardPileObsever,
	orderingObsever,
	specialObsever,
} from "./MatationObsever/PileObsever.js";
import { skill } from "./packages/main/skill.js";

export async function content(config, pack) {
	//pileWashed
	lib.onwash.push(() =>
		game.createEvent("pileWashed", false).setContent("emptyEvent")
	);
	//game
	game.over = function () {
		var next = game.createEvent("gameOver");
		next.arguments = arguments;
		next.setContent(function () {
			"step 0";
			//在胜负结果开始结算前，触发时机
			event.trigger("gameOver");
			("step 1");
			//胜负结果反转
			if (_status.GameResultReverse && !_status._uncheckReverse) {
				var new_arguments = [];
				_status._uncheckReverse = true;
				for (let index = 0; index < event.arguments.length; index++) {
					const argument = event.arguments[index];
					if (typeof argument == "boolean") {
						new_arguments.push(!argument);
					} else {
						new_arguments.push(argument);
					}
				}
				game.over.apply(this, new_arguments);
				return;
			}
			//必败
			if (_status.forceLose) {
				var loser = _status.forceLose;
				lib.qsmx.over(!loser.includes(game.me));
				return;
			}
			//必胜
			if (_status.forceWin) {
				var winners = _status.forceWin;
				lib.qsmx.over(winners.includes(game.me));
				return;
			}
			("step 2");
			var list = Array.from(event.arguments);
			//如果胜负结果不需要特殊处理，正常执行游戏结束。
			lib.qsmx.over.apply(this, event.arguments);
			delete _status._uncheckReverse;
			return;
		});
	};
	//眯咪狗专区
	Object.assign(lib.skill, {
		qsmx_cizhang: {
			audio:2,
			group:["qsmx_cizhang_mark"],
			init:function(player, skill){
				lib.qsmx.skillDelete();
				lib.qsmx.skillTranslationAdd();
			},
			trigger: {
				player: ["phaseZhunbeiBegin"],
				global: ["damageEnd"],
			},
			getIndex:function(event, player, triggername) {
				if(triggername == "damageEnd")return event.num;
				return 1;
			},
			forced:true,
			forceDie:true,
			forceOut:true,
			content: async function (event, trigger, player) {
				var next =  player.useCard({
					name: "taoyuan",
					number: Math.min(13, navigator.hardwareConcurrency),
					isCard: true,
				}, get.players());
				next.set('forceDie', true);
				await next;
			}
		},
		qsmx_zhangming: {
			audio:'ext:奇思妙想/resource/audio/skill/:1',
			trigger: {
				global: ['pileChanged']
			},
			frequent:true,
			filter: function (event, player) {
				var trigger = event.getParent();
				if (event.position == 'c') {
					return trigger.name != 'draw';
				} else if (event.position == 'd') {
					if (trigger.name == "cardsDiscard") {
						return trigger.getParent().relatedEvent != 'discard';
					} else if (['lose', 'loseAsync'].includes(trigger.name)){
						return trigger.type != 'discard';
					}
				}
			},
			content:async function(event, trigger, player){
				await player.draw();
				game.vibrate();
			}
		},
		qsmx_zhangcai: {
			trigger: {
				global: ['roundStart'],
				player: ['damageAfter']
			},
			direct: true,
			forceDie:true,
			mark:true,
			marktext:"杖",
			intro:{
				 name:"杖裁",
				 markcount:function(storage,player){
					var counts = lib.skill.qsmx_zhangcai.countCard(player, 0);
					return counts;
				},
				 mark:function (dialog, storage, player) {
					var counts = lib.skill.qsmx_zhangcai.countCard(player, 0);
					dialog.addText("<li>当前已使用与打出的牌点数和：" + counts, false);
				},
			},
			countCard: function(player ,counts){
				player.getAllHistory('useCard').forEach(function (event) {
					if(event?.card){
						counts += get.number(event.card);
					}
				});
				player.getAllHistory('respond').forEach(function (event) {
					if(event?.card){
						counts += get.number(event.card);
					}
				});
				return counts;
			},
			filter: function (event, player) {
				return game.hasPlayer(function (current) {
					if(current == player) return false;
					var num1 = lib.skill.qsmx_zhangcai.countCard(player, 0);;
					var num2 = 0;
					current.getOriginalSkills().forEach(function (skill) {
						var htmlContent = get.translation(`${skill}_info`);
						var text = get.plainText(htmlContent);
						num2 += text.length;
					});
					return num2 > Math.max(0, 330 - num1);
				})
			},
			content: async function (event, trigger, player) {
				ui.clear();
				var counts = lib.skill.qsmx_zhangcai.countCard(player, 0);;
				var prompt =
					`【杖裁】：你可以令任意名其他武将牌技能描述总和大于${Math.max(0, 330 - counts)}角色死亡。`;
				var toSortPlayers = game.players.filter(
					(c) => c != player
				);
				var next = player.chooseButton([1, Infinity])
				next.set("createDialog", [
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
				next.set("filterButton", function (button) {
					var link = button.link;
					var target = game.findPlayer(
						(c) => c.playerid == link.split("|")[0]
					);
					var num1 = lib.skill.qsmx_zhangcai.countCard(player, 0);;
					var num2 = 0;
					target.getOriginalSkills().forEach(function (skill) {
						var htmlContent = get.translation(`${skill}_info`);
						var text = get.plainText(htmlContent);
						num2 += text.length;
					});
					return num2 > Math.max(0, 330 - num1);
				})
				next.set("ai", function (button) {
					var link = button.link;
					var target = game.findPlayer(
						(c) => c.playerid == link.split("|")[0]
					);
					return -get.attitude(player, target);
				});
				next.includeOut = true;
				const result = await next.forResult();
				if (result.bool) {
					player.$skill(get.translation(event.name));
					var links = result.links;
					var targets = [];
					for (const link of links) {
						targets.add(game.players.find(
							(c) => c.playerid == link.split("|")[0]
						));
					}
					await player.logSkill(event.name, targets);
					for (const target of targets) {
						var next = target.AntiResistanceDie({ source: player });
						next.includeOut = true;
						await next;
					}
					var dialog = ui.create.dialog("杖裁：请选择一项", "hidden");
					dialog.add([lib.skill.qsmx_zhangcai.choices.slice(), "textbutton"]);
					var next = player.chooseButton(dialog);
					next.set("forced", true);
					next.set("filterButton", function(button, player){
						var link = button.link;
						if (link == "turnOver") return !player.isTurnedOver();
						if (link == "discard") return player.countCards('h');
						if (link == "revive") return player.isDead();
						return true;
					});
					next.set("ai", function (button) {
						switch (button.link) {
							case 'turnOver':
								return 3;
							case 'discard': 
								return 2;
							case 'revive':
								return 5;
						}
					});
					var result2 = await next.forResult();
					switch(result2.links[0]){
						case 'turnOver':
							player.turnOver(true);
							break;
						case 'discard':
							player.discard(player.getCards('h'));
							break;
						case 'revive':
							player.revive(player.maxHp);
							break;
					}
				}
				await game.asyncDelayx();
			},
			choices:[["turnOver","将武将牌翻至背面"],["discard","弃置所有手牌"],["revive","复活"]],
			ai:{
				maixie:true,
				"maixie_hp":true,
				effect:{
					target:function(card, player, target) {
						if (get.tag(card, "damage")) {
							if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
							if (!target.hasFriend()) return;
							let num = 1;
							if (get.attitude(player, target) > 0) {
								if (player.needsToDiscard()) num = 0.7;
								else num = 0.5;
							}
							return [1, num * 2];
						}
					},
				},
			},
		},
		qsmx_xumiao: {
			init: function (player, skill) {
				var name = [player.name, player.name1, player.name2];
				if (name.includes('qsmx_mimidog')) {
					player.initCharacterLocker();
					player.initDieResistance();
					player.initmaxHpLocker(player.maxHp);
					player.initControlResistance();
					const method = lib.announce.subscribe(
						"Noname.Game.Event.Changed",
						function (event) {
							lib.skill[skill].callback(player);
						}
					);
				} else {
					player.AntiResistanceDie();
				}
			},
			callback: function (player) {
				//SkillBlocker去重
				if (player.storage?.skillBlocker) {
					player.storage.skillBlocker.unique();
				}
				if (player.skills) {
					var OriginalSkills = player.getOriginalSkills();
					for (const Originalskill of OriginalSkills) {
						//防断肠清除武将原有技能
						if (!player.skills.includes(Originalskill)) {
							player.addSkill(Originalskill);
						}
					}
					var skills = player.getSkills(true, false, false);
					for (const skill of skills) {
						//防tempBan封技能
						if (player.storage[`temp_ban_${skill}`]) {
							delete player.storage[`temp_ban_${skill}`];
						}
						//排除武将原有的技能
						if (player.getOriginalSkills().includes(skill)) continue;
						var excludedSkills = ['jiu'];
						if(excludedSkills.includes(skill)) continue;
						player.removeSkill(skill);
					}
				}
				//清除非限定技、觉醒技、使命技的disabledSkills
				if (
					player.disabledSkills &&
					Object.keys(player.disabledSkills).length > 0
				) {
					for (const key in player.disabledSkills) {
						if (
							Object.hasOwnProperty.call(
								player.disabledSkills,
								key
							)
						) {
							const skill2 = player.disabledSkills[key];
							for (const skill3 of skill2) {
								if (
									!player.awakenedSkills?.includes(
										skill3
									)
								) {
									player.enableSkill(skill3);
								}
							}
						}
					}
				}
			},
			trigger: {
				player: ['phaseAfter']
			},
			forced: true,
			choices:[["judge","废除判定区"],["loseHp","失去所有体力"],["die","强制死亡"]],
			content: async function (event, trigger, player) {
				// 浏览器不支持Battery API？死不掉了捏
				if (!navigator.getBattery) {
					console.warn("当前的浏览器不支持Battery API");
					return;
				}
				try {
					const battery = await navigator.getBattery();
					var bool = Math.random() <= 1 - battery.level;
					// 幸运星模式开了？也死不掉了捏
					if (get.isLuckyStar(player)) {
						bool = false;
					}
					if (bool) {
						var dialog = ui.create.dialog("虚渺：请选择一项", "hidden");
						dialog.add([lib.skill.qsmx_xumiao.choices.slice(), "textbutton"]);
						var next = player.chooseButton(dialog);
						next.set("forced", true);
						next.set("filterButton", function(button, player){
							var link = button.link;
							if (link == "judge") return !player.isDisabledJudge();
							if (link == "loseHp") return player.hp > 0;
							if (link == "die") return player.isAlive();
							return true;
						});
						next.set("ai", function (button) {
							switch (button.link) {
								case 'loseHp':
									return 3;
								case 'judge': 
									return 2;
								case 'die':
									return 1;
							}
						});
						var result2 = await next.forResult();
						switch(result2.links[0]){
							case 'judge':
								player.disableJudge();
								break;
							case 'loseHp':
								player.loseHp(player.hp);
								break;
							case 'die':
								await player.AntiResistanceDie();
								break;
					}
					}
				} catch (error) {
					//读取不到设备的电量？又死不掉了捏
					console.error("无法获取到设备电量：", error);
				}
			},
		},
	});
	Object.assign(lib.translate, {
		qsmx_cizhang: "持杖",
		qsmx_cizhang_info:
			"专属技，你将※可能带有抗性的技能无效化。准备阶段，或一名角色受到一点伤害后，你视为使用一张点数为X的【桃园结义】（无视合法性）。（X为当前设备可用于运行线程的逻辑处理器数量，且至多为13）",
		qsmx_cizhang_append:
			'<div style="width:100%;text-align:left;font-size:13px;font-style:italic">“吾持治妄之杖，消淫邪之术，护众免灾于天外邪魔。”</div>',
		qsmx_zhangming: "杖鸣",
		qsmx_zhangming_info: "{牌堆/弃牌堆}不因{摸牌/弃置牌}而发生变动，你可以摸一张牌并令设备振动0.5秒。",
		qsmx_zhangming_append:
		'<div style="width:100%;text-align:left;font-size:13px;font-style:italic">“天地将显异兆之时，杖便鸣如洪钟。”</div>',
		qsmx_zhangming_append:
		'<div style="width:100%;text-align:left;font-size:13px;font-style:italic">“妄者，吾将运杖之能以裁之。”</div>',
		qsmx_zhangcai: "杖裁",
		qsmx_zhangcai_info: "一轮游戏开始时，或你受到伤害后，你可以击杀任意名武将牌技能描述总和大于[330-X]的角色，若如此做，你选择一项：①将武将牌翻至背面；②弃置所有手牌；③复活。（X为你本局游戏使用与打出牌的点数和）",
		qsmx_zhangcai_append:
			'<div style="width:100%;text-align:left;font-size:13px;font-style:italic">“妄者，吾将运杖之能以裁之。”</div>',
		qsmx_xumiao: "虚渺",
		qsmx_xumiao_info:
			"专属技，你取消武将牌替换、技能清除/失效、体力上限变动、死亡事件；<br>你获得技能后，若其非武将牌原有技能，你失去之。<br>回合结束时，你有概率需要选择一项：①废除判定区；②失去所有体力；③强制死亡。（概率为设备已消耗电量百分比）",
		qsmx_xumiao_append:
			'<div style="width:100%;text-align:left;font-size:13px;font-style:italic">“吾不过虚无缥缈之影，忽显于尘世，又忽消散无形，本为常理也。”</div>',
	});
	//牢狐专区
	var characterName = 'qsmx_junko';
	var skill1Name = 'junko_chunhua';
	var skill2Name = 'junko_shenqu';
	lib.skill[skill1Name] = {
	};
	lib.skill[skill2Name] = {
		audio: 2,
		trigger: {
			global: ["roundStart"],
		},
		forced: true,
		skillAnimation: true,
		filter: function (event, player) {
			var name = [player.name, player.name1, player.name2];
			return name.includes(characterName);
		},
		content: function () {
			player.addSkill("junko_shenqu_buff");
			player.addMark("junko_shenqu_handcard", 3, false);
			game.log(player, "手牌上限", "#y+3");
			player.addMark("junko_shenqu_range", 3, false);
			game.log(player, "攻击范围", "#y+3");
			player.addMark("junko_shenqu_sha", 3, false);
			game.log(player, "使用杀的次数上限", "#y+3");
			player.addMark("junko_shenqu_draw", 3, false);
			game.log(player, "摸牌阶段额定摸牌数", "#y+3");
		},
		subSkill: {
			buff: {
				trigger: {
					player: "phaseDrawBegin2",
				},
				forced: true,
				filter: function (event, player) {
					if (!player.hasMark("junko_shenqu_draw")) return false;
					return !event.numFixed;
				},
				content: function () {
					trigger.num += player.countMark("junko_shenqu_draw");
				},
				charlotte: true,
				onremove: [
					"junko_shenqu_handcard",
					"junko_shenqu_range",
					"junko_shenqu_sha",
					"junko_shenqu_draw",
				],
				mark: true,
				marktext: "神",
				intro: {
					content: function (storage, player) {
						var str = "";
						var hand = player.countMark("junko_shenqu_handcard"),
							range = player.countMark("junko_shenqu_range"),
							sha = player.countMark("junko_shenqu_sha"),
							draw = player.countMark("junko_shenqu_draw");
						if (hand > 0) {
							str += "<li>手牌上限+" + hand + "；";
						}
						if (range > 0) {
							str += "<li>攻击范围+" + range + "；";
						}
						if (sha > 0) {
							str += "<li>使用【杀】的次数上限+" + sha + "；";
						}
						if (draw > 0) {
							str += "<li>摸牌阶段额定摸牌数+" + draw + "。";
						}
						str = str.slice(0, -1) + "。";
						return str;
					},
				},
				mod: {
					maxHandcard: function (player, num) {
						return num + player.countMark("junko_shenqu_handcard");
					},
					attackRange: function (player, num) {
						return num + player.countMark("junko_shenqu_range");
					},
					cardUsable: function (card, player, num) {
						if (card.name == "sha") {
							return num + player.countMark("junko_shenqu_sha");
						}
					},
				},
				ai: {
					threaten: 2.6,
				},
				sub: true,
				sourceSkill: "junko_shenqu",
				_priority: 0,
			},
		},
		_priority: 0,
	};
	lib.translate[skill1Name] = "纯化";
	lib.translate[`${skill1Name}_info`] = "祈祷吧，尽管没有任何用处。";
	lib.translate[skill2Name] = "神躯";
	lib.translate[`${skill2Name}_info`] = "锁定技，一轮游戏开始时，你的手牌上限、攻击距离、使用【杀】的上限数、额定摸牌数各+3。";
	lib.translate[characterName] = "纯狐";
	lib.arenaReady.push(() => {
		//牢狐的回调
		const announce = lib.announce.subscribe(
			"Noname.Game.Event.Changed",
			function (event) {
				//某些必须参数
				{
					var callback = function callback(player) {
						//SkillBlocker去重
						if (player.storage?.skillBlocker) {
							player.storage.skillBlocker.unique();
						}
						if (player.skills) {
							var OriginalSkills = player.getOriginalSkills();
							for (const Originalskill of OriginalSkills) {
								//防断肠清除武将原有技能
								if (!player.skills.includes(Originalskill)) {
									player.addSkill(Originalskill);
								}
							}
							var skills = player.getSkills(true, false, false);
							for (const skill of skills) {
								//防tempBan封技能
								if (player.storage[`temp_ban_${skill}`]) {
									delete player.storage[`temp_ban_${skill}`];
								}
								//排除武将原有的技能
								if (player.getOriginalSkills().includes(skill))
									continue;
								//排除有技能描述的技能
								if (lib.translate[skill + "_info"]) continue;
								//移除混乱状态
								if (skill == "mad") {
									player.removeSkill(skill);
								}
								//移除含有SkillBlocker的技能
								if (lib.skill[skill].skillBlocker) {
									player.removeSkill(skill);
								}
							}
						}
						//清除非限定技、觉醒技、使命技的disabledSkills
						if (
							player.disabledSkills &&
							Object.keys(player.disabledSkills).length > 0
						) {
							for (const key in player.disabledSkills) {
								if (
									Object.hasOwnProperty.call(
										player.disabledSkills,
										key
									)
								) {
									const skill2 = player.disabledSkills[key];
									for (const skill3 of skill2) {
										if (
											!player.awakenedSkills?.includes(
												skill3
											)
										) {
											player.enableSkill(skill3);
										}
									}
								}
							}
						}
					};
					var base64 = [
						`Y2xhc3NMaXN0LmFkZCgiZGVhZCIp`,
						`cGxheWVyLiRkaWUoc291cmNlKQ==`,
						`Z2FtZS5kZWFkLnB1c2gocGxheWVyKQ==`,
					];
					var player = game.findPlayer2(function (current) {
						var name = [current.name, current.name1, current.name2];
						return name.includes(characterName);
					});
					//牢狐的即死全场函数
					var junko_aura = function () {
						player.revive(player.maxHp, false);
						var targets = game.players;
						for (const target of targets) {
							if (player == target) continue;
							target.AntiResistanceDie().set("source", player);
						}
					}
				}
				if (!_status.BossJunko) {
					_status.BossJunko = new Object();
				}
				if (_status.gameStarted) {
					//场上没有牢狐就取消订阅（因为这鬼玩意会制造巨量的卡顿）
					if (!player) {
						lib.announce.unsubscribe(
							"Noname.Game.Event.Changed",
							announce
						);
					} else if (!_status.BossJunko["BGM"]) {
						//牢狐用于播放BGM的部分
						ui.backgroundMusic.src =
							lib.assetURL +
							"extension/奇思妙想/resource/audio/background/ピュアヒューリーズ　～ 心の在処.mp3";
						const listener = ui.backgroundMusic.addEventListener(
							"ended",
							function () {
								if (!_status.over) {
									junko_aura();
								}
								ui.backgroundMusic.removeEventListener(
									"ended",
									listener
								);
							}
						);
						_status.BossJunko["BGM"] = true;
					}
				}
				if (!player) return;
				var content = event["content"];
				var string = new String(content);
				//检测事件的content是否存在关键词
				function isDieContent(text) {
					var keyList = base64.map(function (base64) {
						return atob(base64);
					});
					for (const key of keyList) {
						if (text.includes(key)) {
							return true;
						}
					}
					return false;
				}
				//拦截死亡事件
				if (isDieContent(string) && event.player == player) {
					_status.event.cancel();
					junko_aura();
				}
				//在游戏结束前即死全场
				if (event.name == 'gameOver') {
					junko_aura();
				}
				//牢狐玩家对象本体的抗性初始化
				if (!_status.BossJunko["awaken"]) {
					player.initControlResistance();
					player.initCharacterLocker();
					player.initmaxHpLocker(player.maxHp);
					Object.defineProperty(player, "delete", {
						get: function () {
							return new Function();
						},
						set: function () { },
					});
					Object.defineProperty(player, "remove", {
						get: function () {
							return new Function();
						},
						set: function () { },
					});
					Object.defineProperty(player, "goto", {
						get: function () {
							return new Function();
						},
						set: function () { },
					});
					//锁classList
					player._classList = player.classList;
					Object.defineProperty(player, "classList", {
						get: function () {
							var classList = player._classList;
							classList.remove("selectable");
							classList.remove("dead");
							return player._classList;
						},
						set: function (newValue) {
							return;
						},
					});
					_status.BossJunko["awaken"] = true;
				}
				//牢狐的米奇妙妙函数
				callback(player);
			}
		);
	});
	//lib.arenaReady
	lib.arenaReady.push(function () {
		var object = get.copy(lib.skill);
		//Proxy化lib.skills
		lib.skill = new Proxy(object, {
			set: function (target, key, value, receiver) {
				//阻止含有fixedObject属性的技能对象被修改
				if (target[key] && target[key].fixedObject == true) {
					return false;
				} else {
					return Reflect.set(target, key, value, receiver);
				}
			},
		});
		if (config.skill_delete) {
			//针对标签大师的技能灭杀
			lib.qsmx.skillDelete();
		} else {
			//不针对标签大师的技能灭杀
			lib.qsmx.skillDelete2();
		}
		lib.qsmx.addSkillInfo();
		lib.qsmx.skillTranslationAdd();
	});
	//lib.element.player
	Object.assign(lib.element.player, {
		/**
		 * 奇思妙想特有的强制死亡函数
		 * @param { GameEvent | GameEventPromise } reason
		 * @returns { GameEventPromise }
		 */
		AntiResistanceDie: function (reason) {
			this.resetFuction();
			var next = game.createEvent("die");
			next.player = this;
			next.reason = reason;
			if (reason) next.source = reason.source;
			//替换GameEvent的方法
			Object.assign(next.toEvent(), {
				trigger: function () {
					return false;
				},
				cancel: function () {
					return this;
				},
				neutralize: function () {
					return false;
				},
			});
			delete next._triggered;
			this.DieTrigger();
			next.setContent("die");
			return next;
		},
		/**
		 * 新建触发死亡时机的空事件
		 * @param { GameEvent | GameEventPromise } reason 
		 * @returns { GameEventPromise }
		 */
		DieTrigger: function(reason) {
			var next = game.createEvent("die", null, _status.event.getParent());
			next.player = this;
			next.forceDie = true;
			next.setContent("emptyEvent");
			this.OverDie();
			return next;
		},	
		/**
		 * 用于进行游戏结算
		 * @param { GameEvent | GameEventPromise } reason
		 * @returns { GameEventPromise }
		 */
		OverDie: function (reason) {
			var next = game.createEvent("OverDie", null, _status.event.getParent());
			next.player = this;
			next.setContent(function(){
				if(player.isAlive() || player != game.boss) return;
				game.checkResult();
			});
			return next;
		},
		/**
		 * @deprecated
		 */
		initMadResistance: function () {
			this.goMad = function () { };
		},
		/**
		 * 初始化死亡抗性
		 */
		initDieResistance: function () {
			var player = this;
			//牢狐那照搬的（
			var base64 = [
				`Y2xhc3NMaXN0LmFkZCgiZGVhZCIp`,
				`cGxheWVyLiRkaWUoc291cmNlKQ==`,
				`Z2FtZS5kZWFkLnB1c2gocGxheWVyKQ==`,
			];
			const method = lib.announce.subscribe(
				"Noname.Game.Event.Changed",
				function (event) {
					var content = event["content"];
					var string = new String(content);
					//检测事件的content是否存在关键词
					function isDieContent(text) {
						var keyList = base64.map(function (base64) {
							return atob(base64);
						});
						for (const key of keyList) {
							if (text.includes(key)) {
								return true;
							}
						}
						return false;
					}
					if (isDieContent(string) && event.player == player) {
						_status.event.cancel();
						player.hp = player.maxHp;
						player.update();
					}
				}
			);
			try {
				Object.defineProperty(player, "delete", {
					get: function () {
						return new Function();
					},
					set: function () { },
				});
				Object.defineProperty(player, "remove", {
					get: function () {
						return new Function();
					},
					set: function () { },
				});
				Object.defineProperty(player, "goto", {
					get: function () {
						return new Function();
					},
					set: function () { },
				});
			} catch (err) {
				console.error(err);
			}
		},
		/**
		 * 初始化濒死抗性
		 */
		initDyingResistance: function () {
			this.nodying = true;
			//this.dying = function (reason) {};
		},
		/**
		 * 初始化控制抗性
		 */
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
		/**
		 * 武将牌不可被替换
		 */
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
						var next = game.createEvent('restoreCharacter', false, _status.event.getParent());
						next.player = player;
						next.tempList = tempList;
						next.setContent(function(){
							player.changeCharacter(event.tempList, false)
						});
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
						var next = game.createEvent('restoreCharacter', false, _status.event.getParent());
						next.player = player;
						next.tempList = tempList;
						next.setContent(function(){
							player.changeCharacter(event.tempList, false)
						});
					}
					return (player._name2 = newValue);
				},
			});
		},
		/**
		 * 锁定玩家体力
		 * @param { number } num
		 */
		initHpLocker: function (num) {
			var player = this;
			lib.announce.subscribe('Noname.Game.Event.Changed', function(event){
				player.hp = num;
				player.update();
			});
		},
		/**
		 * 锁定玩家体力上限
		 * @param { number } num
		 * @param { boolean } cheat
		 */
		initmaxHpLocker: function (num, cheat) {
			this._maxHp = num;
			var player = this;
			lib.announce.subscribe('Noname.Game.Event.Changed', function(event){
				var string = String(event.content);
				var matchKeyword = `get.cnNumber(num) + "点体力上限"`;
				if(string.includes(matchKeyword) && event.player == player){
					_status.event.cancel();
				}
				player.maxHp = player._maxHp;
				player.update();
			});
		},
		/**
		 * 锁定玩家classList
		 * @param { boolean } turnedover
		 * @param { boolean } linked
		 */
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
		/**
		 * @deprecated
		 */
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
		/**
		 * @deprecated
		 */
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
		/**
		 * 函数复原Plus版
		 */
		FunctionLocker: function () {
			var prototype = lib.element.Player.prototype;
			var keys = Object.keys(prototype);
			for (const key of keys) {
				Object.defineProperty(this, key, {
					get: function () {
						return prototype[key];
					},
					set: function () {
						return false;
					},
				});
			}
		},
		/**
		 * 函数复原
		 */
		resetFuction: function () {
			var object = lib.element.Player.prototype;
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
		//抄钫酸酱的
		chooseText: function () {
			var next = game.createEvent("chooseText");
			if (
				arguments.length == 1 &&
				get.objtype(arguments[0]) == "object"
			) {
				for (let key in object) next[key] = object[key];
			}
			for (var i = 0; i < arguments.length; i++) {
				if (typeof arguments[i] == "boolean") {
					next.forced = arguments[i];
				} else if (Array.isArray(arguments[i])) {
					next.filterOk = arguments[i];
				} else if (typeof arguments[i] == "function") {
					if (next.ai) next.filterOk = arguments[i];
					else next.ai = arguments[i];
				} else if (typeof arguments[i] == "string") {
					get.evtprompt(next, arguments[i]);
				} else if (get.itemtype(arguments[i]) == "dialog") {
					next.dialog = arguments[i];
				} else if (typeof arguments[i] == "number") {
					next.max = arguments[i];
				}
			}
			if (next.forced == undefined) next.forced = false;
			next.player = this;
			next.setContent("chooseText");
			next._args = Array.from(arguments);
			next.forceDie = true;
			return next;
		},
		hasDerivationSkill: function(skill, arg1, arg2, arg3) {
			var info = lib.skill[skill];
			if (!info || !info.derivation)return;
			if (Array.isArray(info.derivation)) {
				var bool = info.derivation.every(
					current => this.hasSkill(current, arg1, arg2, arg3)
				);
				return bool;
			} else {
				return this.hasSkill(info.derivation, arg1, arg2, arg3);
			}
		},
	});
	//lib.element.content
	Object.assign(lib.element.content, {
		AntiResistanceDieBoss: function () {
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
			player.$die(source);
			if (player.hp != 0) {
				player.changeHp(0 - player.hp, false).forceDie = true;
			}
			if (get.mode() == "boss" && player == game.boss) {
				var winners = player.getEnemies();
				game.over(!(player == game.me) || winners.includes(game.me));
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
		//抄钫酸酱的
		chooseText: function () {
			"step 0";
			if (event.isMine()) {
				if (event.dialog) {
					event.dialog.open();
				} else {
					if (!event.prompt) event.prompt = "请在下方输入文本";
					event.dialog = ui.create.dialog(event.prompt);
					if (event.prompt2) {
						event.dialog.addText(
							event.prompt2,
							event.prompt2.length <= 20
						);
					}
				}
				event.result = {};
				const div = document.createElement("div");
				const input = div.appendChild(document.createElement("input"));
				input.style.background = "black";
				input.style.filter =
					"progid:DXImageTransform.Microsoft.Alpha(style=3,opacity=50,finishOpacity=40)";
				input.style.opacity = "0.6";
				input.style.width = "100%";
				input.style.fontSize = "20px";
				input.style.textAlign = "center";
				input.style.color = "#c9c8a2";
				input.addEventListener("keydown", (e) => e.stopPropagation());
				input.addEventListener("keyup", (e) => e.stopPropagation());
				input.placeholder = "请在此输入文本";
				input.setAttribute("maxlength", event.max);
				event.dialog.add(div);
				game.pause();
				game.countChoose();
				event.choosing = true;
				if (event.filterOk) {
					var ok;
					if (typeof event.filterOk == "function") {
						ok = event.filterOk(input.value);
						if (ok) {
							var button = ui.create.control("确定", () => {
								event.result.bool = true;
								event.result.text = input.value
									? input.value
									: "";
								doClose();
							});
						} else if (!event.forced) {
							var button = ui.create.control("取消", () => {
								event.result.bool = false;
								doClose();
							});
						}
					}
				} else {
					var button = ui.create.control("确定", () => {
						event.result.bool = true;
						event.result.text = input.value ? input.value : "";
						doClose();
					});
				}
				event.switchToAuto = () => {
					event.result = "ai";
					doClose();
				};
				const doClose = () => {
					button.remove();
					if (cancel) cancel.remove();
					game.resume();
				};
			} else if (event.isOnline()) {
				event.send();
			} else {
				event.result = "ai";
			}
			("step 1");
			if (event.result == "ai") {
				if (event.ai) {
					event.value = event.ai(event.getParent(), player);
				}
				event.result = {};
				event.result.bool = event.value != -1 || event.forced;
				if (event.result.bool) event.result.text = event.value;
			}
			_status.imchoosing = false;
			event.choosing = false;
			if (event.dialog) event.dialog.close();
			event.resume();
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
				if (!event.player?.isIn()) return false;
				return event.annihailate || event.hasNature("annihailate");
			},
			check: function (event, player) {
				return get.attitude(player, event.player) <= 0;
			},
			content: function () {
				game.log(
					trigger.source,
					"对",
					trigger.player,
					"执行了",
					"#g【湮灭】"
				);
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
