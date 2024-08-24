import { lib, game, ui, get, ai, _status } from "../../../noname.js";
import compiler from "../../../noname/library/element/GameEvent/compilers/ContentCompiler.js";
import { character } from "./packages/main/character.js";
import { card } from "./packages/main/card.js";
import {
	cardPileObsever,
	discardPileObsever,
	orderingObsever,
	specialObsever,
} from "./MatationObsever/PileObsever.js";

export async function content(config, pack) {
	//pileWashed
	lib.onwash.push(() =>
		game.createEvent("pileWashed", false).setContent("emptyEvent")
	);
	//修改游戏结束函数并备份
	game.over = function () {
		var next = game.createEvent("gameOver");
		next.arguments = arguments;
		next.setContent(function () {
			"step 0";
			if (_status.keepGameContinue) {
				event.finish();
			}
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
	lib.qsmx.backupOver = game.over;
	//眯咪狗专区
	Object.assign(lib.skill, {
		qsmx_cizhang: {
			prehidden:true,
			group:["qsmx_cizhang_mark"],
			init:function(player, skill){
				lib.qsmx.skillDelete();
				lib.announce.subscribe("Noname.Game.Event.GameStart", function(){
					delete _status.skillDelete;
					lib.qsmx.skillDelete();
				});
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
			prehidden:true,
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
					player.initDieResistance(true);
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
					for (const key of Object.keys(player.disabledSkills)) {
						if (Array.isArray(player.awakenedSkills) && player.awakenedSkills.includes(key)) {
							continue;
						}
						player.enableSkill(key);
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
	lib.translate[characterName] = "纯狐";
	{
		//纯化
		{
			lib.skill['junko_chunhua'] = {
				trigger:{
					player: "phaseBeforeEnd"
				},
				mod:{
					cardUsable:function (card, player, num) {
						return Infinity;
					},
					targetInRange:function (card, player) {
						return true;
					},
				},
				forced:true,
				charlotte:true,
				content:async function (event, trigger, player) {
					var targets = get.players().filter(current=>current!=player);
					for (const target of targets) {
						target.addTempSkill('fengyin');
					}
				}
			};
			lib.translate["junko_chunhua"] = "纯化";
			lib.translate["junko_chunhua_info"] = "状态技，<br>①你的回合开始时，你令其他角色的非锁定技失效直到回合结束；<br>②你使用牌无距离、次数限制。";		
		};
		//神行
		{
			lib.skill["junko_shenxing"] = {
				trigger: {
					global: "phaseBegin",
				},
				charlotte:true,
				forced:true,
				round:1,
				content:async function (event, trigger, player) {
					await player.draw(5 * game.roundNumber);
					var cards = Array.from(ui.ordering.childNodes);
					while (cards.length) {
						cards.shift().discard();
					}
					var evt = _status.event.getParent("phase");
					if (evt) { 
						game.resetSkills();
						_status.event = evt;
						_status.event.finish();
						_status.event.untrigger(true);
					}
					player.insertPhase(event.name).set('_noTurnOver', true);
				},
			};
			lib.translate["junko_shenxing"] = "神行";
			lib.translate["junko_shenxing_info"] = "状态技，一名角色的回合开始时，你摸[5*X]张牌，然后你结束当前回合并进行一个不进行翻面检定的额外回合。(X为游戏轮数)";
		};
		//神击
		{
			lib.translate["junko_shenji"] = "神击";
			if (game.getExtensionConfig("奇思妙想", "difficulty_of_boss") > 0) {
				lib.skill["junko_shenji"] = {
					trigger: {
						player: "useCard",
					},
					charlotte:true,
					forced:true,
					content:async function (event, trigger, player) {
						trigger.directHit.addArray(get.players());
					},
					group:"junko_shenji_maxHp",
					subSkill: {
						maxHp: {
							trigger:{
								global: "phaseAfter"
							},
							charlotte:true,
							forced:true,
							filter:function(event, player){
								return player.getHistory('sourceDamage').length > 0;
							},
							content:async function (event, trigger, player) {
								await player.gainMaxHp(player.maxHp);
							}
						}
					}
				};
				lib.translate["junko_shenji_info"] = "状态技，<br>①你使用的牌无法被响应；<br>②一名角色回合结束时，若你此回合造成过伤害，你增加X点体力上限（X为你的体力上限）";
			} else {
				lib.skill["junko_shenji"] = {};
				lib.translate["junko_shenji_info"] = "此难度下不可用";
			}
		};
		//神怒
		{
			lib.translate["junko_shenqu"] = "神躯";
			if (game.getExtensionConfig("奇思妙想", "difficulty_of_boss") > 1) {
				lib.skill["junko_shenqu"] = {
					trigger: {
						player:["useCardAfter","respondAfter"],
					},
					charlotte:true,
					forced:true,
					content:async function (event, trigger, player) {
						await player.draw();
						await player.recover();
					},
				};
				lib.translate["junko_shenqu_info"] = "状态技，当你使用或打出牌结算结束后，你摸一张牌并回复1点体力。";
			} else {
				lib.skill["junko_shenqu"] = {};
				lib.translate["junko_shenqu_info"] = "此难度下不可用";
			}
		};
	};
	lib.arenaReady.push(() => {
		//牢狐的回调
		const announce = lib.announce.subscribe(
			"Noname.Game.Event.Changed",
			function (event) {
				//某些必须参数
				{
					if (!_status.BossJunko) {
						_status.BossJunko = new Object();
					}
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
							for (const key of Object.keys(player.disabledSkills)) {
								if (Array.isArray(player.awakenedSkills) && player.awakenedSkills.includes(key)) {
									continue;
								}
								player.enableSkill(key);
							}
						}
					};
					var base64 = [
						`Y2xhc3NMaXN0LmFkZCgiZGVhZCIp`,
						`cGxheWVyLiRkaWUoc291cmNlKQ==`,
						`Z2FtZS5kZWFkLnB1c2gocGxheWVyKQ==`,
					];
					if (_status.BossJunko["player"]) {
						var player = _status.BossJunko["player"];
					} else {
						var player = game.findPlayer2(function (current) {
							var name = [current.name, current.name1, current.name2];
							return name.includes(characterName);
						});
						_status.BossJunko["player"] = player;
					}
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
				if (_status.gameStarted) {
					//场上没有牢狐就打断
					if (!player) {
						return;
					} else if (!_status.BossJunko["BGM"]) {
						//牢狐用于播放BGM的部分
						ui.backgroundMusic.src = `${lib.assetURL}extension/奇思妙想/resource/audio/background/ピュアヒューリーズ　～ 心の在処.mp3`;
						if (game.getExtensionConfig('奇思妙想', 'difficulty_of_boss') == 3){
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
							lib.qsmx.skillDelete();
						}
						//置空Game#removePlayer
						Object.assign(game, {
							removePlayer: function(player){
								return player;
							}
						})
						_status.BossJunko["BGM"] = true;
					}
				}
				if (!player) return;
				if(!_status["BossJunko"]["skillDelete"]){
					lib.qsmx.skillDelete();
					_status["BossJunko"]["skillDelete"] = true;
				}
				if (game.getExtensionConfig('奇思妙想', 'difficulty_of_boss') == 3) {
					//针对1103v2事件重构的适配
					try {
						var content = compiler.regularize(event["content"].original);
					} catch (error) {
						var content = event["content"];
					}
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
					if ((isDieContent(string) || event.name == "die" ) && event.player == player) {
						_status.event.cancel();
						junko_aura();
					}
					//在游戏结束前即死全场
					if (event.name == 'gameOver') {
						junko_aura();
					}
				}
				//牢狐玩家对象本体的抗性初始化
				if (!_status.BossJunko["awaken"]) {
					player.initControlResistance();
					player.initCharacterLocker();
					player.initmaxHpLocker(player.maxHp);
					var parentNode = ui.arena;
					if (get.mode() == "chess") {
						parentNode = ui.chess;
					}
					//监听玩家父节点的MutationObserver（防删除dom用）
					const obsever = new MutationObserver(function(mutationsRecord){
						for (const element of mutationsRecord) {
							const bool = Array.from(element.removedNodes).includes(player);
							if (bool) {
								let players = get.players(null, true, true);
								HTMLDivElement.prototype.appendChild.call(element.target, player);
								delete player.removed;
								game[player.isAlive() ? "players" : "dead"]["add"](player);
								if (!players.includes(player)) {
									ui.arena.setNumber(players.length + 1);
								}
								game.arrangePlayers();
							}
						}
					});
					obsever.observe(parentNode, {
						childList:true,
					});
					if (game.getExtensionConfig('奇思妙想', 'difficulty_of_boss') == 3){
						var classList = player.classList;
						let obj = {
							add:classList.add,
							remove:classList.remove,
						}
						//覆盖DOMtokenList函数时间到
						Object.assign(player.classList, {
							add: function(){
								let newArguments = Array.from(arguments);
								let map = {
									player:true,
									dead:false, 
									removing:false, 
									selectable:false, 
									hidden:false,
									out:false,
								};
								for (const key of Object.keys(map)) {
									const bool = map[key];
									newArguments[bool ? "add" : "remove"](key);
								}
								obj.add.apply(this, newArguments);
							},
							remove: function(){
								let newArguments = Array.from(arguments);
								let map = {
									player:true,
									dead:false, 
									removing:false, 
									selectable:false, 
									hidden:false,
									out:false,
								};
								for (const key of Object.keys(map)) {
									const bool = map[key];
									newArguments[bool ? "remove" : "add"](key);
								}
								obj.remove.apply(this, newArguments);
							},
							toggle: function(token, force){
								if (this.contains(token)) {
									if(force === true) return force;
									this.remove(token);
									return false;
								} else {
									if(force === false) return force;
									this.add(token);
									return true;
								}
							},
						});
						//MutationObserver监听时间到
						const obsever = new MutationObserver(function(){
							let map = {
								player:true,
								dead:false, 
								removing:false, 
								selectable:false, 
								hidden:false,
								out:false,
							};
							for (const key of Object.keys(map)) {
								const bool = map[key];
								classList.toggle(key, bool);
							}
							//简单的数组操作
							game.players.add(player);
							game.dead.remove(player);
						});
						obsever.observe(player, {
							attributes:true,
						});
						//拿来监听死亡后武将牌翻转的MutationObserver
						const observer2 = new MutationObserver(function(){
							lib.element.player.removeAttribute.call(player, "style");
							player.node.avatar.style.transform = "";
							player.node.avatar2.style.transform = "";
							lib.element.player.update.call(player);
						});
						observer2.observe(player.node.avatar, {
							attributes:true,
						})
					}
					_status.BossJunko["awaken"] = true;
				}
				//复原players和dead的Array方法
				for (const key of Reflect.ownKeys(Array.prototype)) {
					if (typeof Array.prototype[key] == "function") {
						delete game["players"][key];
						delete game["dead"][key];
					}
				}
				//牢狐的米奇妙妙函数
				callback(player);
			}
		);
	});
	//173专区
	lib.arenaReady.push(() => {
		//173的回调
		const announce = lib.announce.subscribe(
			"Noname.Game.Event.Changed",
			function (event) {
				//某些必须参数
				{
					if (!_status.BossSculpture) {
						_status.BossSculpture = new Object();
					}
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
									metanormalcy_befall();
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
							for (const key of Object.keys(player.disabledSkills)) {
								if (Array.isArray(player.awakenedSkills) && player.awakenedSkills.includes(key)) {
									continue;
								}
								player.enableSkill(key);
							}
						}
					};
					var base64 = [
						`Y2xhc3NMaXN0LmFkZCgiZGVhZCIp`,
						`cGxheWVyLiRkaWUoc291cmNlKQ==`,
						`Z2FtZS5kZWFkLnB1c2gocGxheWVyKQ==`,
					];
					if (_status.BossSculpture["player"]) {
						var player = _status.BossSculpture["player"];
					} else {
						var player = game.findPlayer2(function (current) {
							var name = [current.name, current.name1, current.name2];
							return name.includes("qsmx_sculpture");
						});
						_status.BossSculpture["player"] = player;
					}
					//超常态来喽(
					function sleep(ms) {
						return new Promise(resolve => setTimeout(resolve, ms));
					}
					var metanormalcy_befall  = async function(){
						localStorage.setItem("Boss_Sculpture_Stat", "crushed");
						var targets = get.players(null, true, true).filter(current=>{
							return current != _status.BossSculpture["player"];
						});
						game.log("雕塑破碎了……");
						ui.clear();
						game.pause();
						await sleep(1000)
						game.phaseNumber = Infinity;
						game.roundNumber = Infinity;
						game.shuffleNumber = Infinity;
						await sleep(1000)
						
						await sleep(1000);
						for await (const target of targets) {
							lib.qsmx.changeToDie(target);
							await sleep(1000);
							HTMLDivElement.prototype.delete.apply(target);
						}
						await sleep(5000);
						game.reload();
					};
				}
				if (_status.gameStarted) {
					//场上没有173就打断
					if (!player) {
						return;
					} else {
						if (!_status.BossSculpture["keepGameContinue"]) {
							_status.keepGameContinue = true;
							_status.BossSculpture["keepGameContinue"] = true;
						}
					}
				}
				if (!player) return;
				//针对1103v2事件重构的适配
				try {
					var content = compiler.regularize(event["content"].original);
				} catch (error) {
					var content = event["content"];
				}
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
				if ((isDieContent(string) || event.name == "die" ) && event.player == player) {
					_status.event.cancel();
					lib.element.player.removeAttribute.call(player, "style");
					player.node.avatar.style.transform = "";
					player.node.avatar2.style.transform = "";
					lib.element.player.update.call(player);
					metanormalcy_befall();
				}
				//简单的数组操作
				game.players.add(player);
				game.dead.remove(player);
				//173玩家对象本体的抗性初始化
				if (!_status.BossSculpture["awaken"]) {
					player.initControlResistance();
					player.initCharacterLocker();
					player.initmaxHpLocker(player.maxHp);
					var parentNode = ui.arena;
					if (get.mode() == "chess") {
						parentNode = ui.chess;
					}
					//监听玩家父节点的MutationObserver（防删除dom用）
					const obsever = new MutationObserver(function(mutationsRecord){
						for (const element of mutationsRecord) {
							const bool = Array.from(element.removedNodes).includes(player);
							if (bool) {
								let players = get.players(null, true, true);
								HTMLDivElement.prototype.appendChild.call(element.target, player);
								delete player.removed;
								game[player.isAlive() ? "players" : "dead"]["add"](player);
								if (!players.includes(player)) {
									ui.arena.setNumber(players.length + 1);
								}
								game.arrangePlayers();
								metanormalcy_befall();
							}
						}
					});
					obsever.observe(parentNode, {
						childList:true,
					});
					var classList = player.classList;
					let obj = {
						add:classList.add,
						remove:classList.remove,
					}
					//覆盖DOMtokenList函数时间到
					Object.assign(player.classList, {
						add: function(){
							let newArguments = Array.from(arguments);
							let map = {
								player:true,
								dead:false, 
								removing:false, 
								hidden:false,
								out:false,
							};
							for (const key of Object.keys(map)) {
								const bool = map[key];
								newArguments[bool ? "add" : "remove"](key);
							}
							obj.add.apply(this, newArguments);
						},
						remove: function(){
							let newArguments = Array.from(arguments);
							let map = {
								player:true,
								dead:false, 
								removing:false, 
								selectable:false, 
								hidden:false,
								out:false,
							};
							for (const key of Object.keys(map)) {
								const bool = map[key];
								newArguments[bool ? "remove" : "add"](key);
							}
							obj.remove.apply(this, newArguments);
						},
						toggle: function(token, force){
							if (this.contains(token)) {
								if(force === true) return force;
								this.remove(token);
								return false;
							} else {
								if(force === false) return force;
								this.add(token);
								return true;
							}
						},
					});
					//监听玩家div节点class变化的MutationObserver
					const obsever2 = new MutationObserver(function(){
						let map = {
							player:true,
							dead:false, 
							removing:false, 
							hidden:false,
							out:false,
						};
						for (const key of Object.keys(map)) {
							const bool = map[key];
							classList.toggle(key, bool);
						}
						//简单的数组操作
						game.players.add(player);
						game.dead.remove(player);
					});
					obsever2.observe(player, {
						attributes:true,
					});
					//拿来监听死亡后武将牌翻转的MutationObserver
					const observer3 = new MutationObserver(function(){
						lib.element.player.removeAttribute.call(player, "style");
						player.node.avatar.style.transform = "";
						player.node.avatar2.style.transform = "";
						lib.element.player.update.call(player);
					});
					observer3.observe(player.node.avatar, {
						attributes:true,
					})
					_status.BossSculpture["awaken"] = true;
				}
				//复原players和dead的Array方法
				for (const key of Reflect.ownKeys(Array.prototype)) {
					if (typeof Array.prototype[key] == "function") {
						delete game["players"][key];
						delete game["dead"][key];
					}
				}
				//胜负判定
				if (
					get.players().length <= 1
				) {
					delete _status.keepGameContinue;
					var winners = player.getFriends();
					game.over(player == game.me || winners.includes(game.me));
				}
				//173的米奇妙妙函数
				callback(player);
			}
		);
		//关于真相
		if (localStorage.getItem("Boss_Sculpture_Stat") == "crushed") {
			lib["character"]["qsmx_sculpture"]["skills"]["push"]("qsmx_sculpture_faq");
		}
	});
	//lib.arenaReady
	lib.arenaReady.push(async function () {
		var object = get.copy(lib.skill);
		//Proxy化lib.skills
		lib.skill = new Proxy(object, {
			set: function (target, key, value, receiver) {
				//阻止含有fixedObject属性的技能对象被修改
				if (typeof target[key] == "object" && target[key].fixedObject == true) {
					return true;
				} else {
					return Reflect.set(target, key, value, receiver);
				}
			},
		});
		//抽象玩意（
		let skillDelete_num = config.skill_delete;
		if(!config.skill_delete){
			skillDelete_num = 0;
		}
		[function(){}, lib.qsmx.skillDelete2, lib.qsmx.skillDelete][skillDelete_num]();
		lib.qsmx.addSkillInfo();
		//复原game.over函数所用回调
		const announce = lib.announce.subscribe(
			"Noname.Game.Event.Changed",
			function (event) {
				game.over = lib.qsmx.backupOver;
			}
		);
		//想你了，牢狐
		if (!game.getExtensionConfig("奇思妙想", "boss_to_normal")) {
			if (lib.character["qsmx_junko"]) {
				lib.character["qsmx_junko"][4].addArray(["bossallow","boss"]);
			}
		}
	});
	//lib.element.player
	Object.assign(lib.element.player, {
		/**
		 * 奇思妙想特有的强制死亡函数
		 * @param { GameEvent | GameEventPromise } [reason]
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
		 * @param { GameEvent | GameEventPromise } [reason] 
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
		 * @param { GameEvent | GameEventPromise } [reason]
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
		initDieResistance: function (noHpChange) {
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
					//针对1103v2事件重构的适配
					try {
						var content = compiler.regularize(event["content"].original);
					} catch (error) {
						var content = event["content"];
					}
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
						event.cancel();
						if (!noHpChange) {
							player.hp = player.maxHp;
							player.update();
						}
					}
				}
			);
			this.initDeleteResistance();
		},
		/**
		 * 初始化dom节点删除抗性
		 */
		initDeleteResistance:function(){
			var player = this;
			var classList = player.classList;
			var parentNode = ui.arena;
			if (get.mode() == "chess") {
				parentNode = ui.chess;
			}
			//监听玩家父节点的MutationObserver（防删除dom用）
			const obsever = new MutationObserver(function(mutationsRecord){
				for (const element of mutationsRecord) {
					const bool = Array.from(element.removedNodes).includes(player);
					if (bool) {
						let players = get.players(null, true, true);
						HTMLDivElement.prototype.appendChild.call(element.target, player);
						delete player.removed;
						game[player.isAlive() ? "players" : "dead"]["add"](player);
						if (!players.includes(player)) {
							ui.arena.setNumber(players.length + 1);
						}
						game.arrangePlayers();
					}
				}
			});
			obsever.observe(parentNode, {
				childList:true,
			});
			//监听玩家的classList的MutationObserver
			const obsever2 = new MutationObserver(function(records){
				let map = {
					removing:false, 
				};
				for (const key of Object.keys(map)) {
					const bool = map[key];
					DOMTokenList.prototype.toggle.call(classList, key, bool);
				}
			});
			obsever2.observe(player, {
				attributes:true,
			});
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
			lib.announce.subscribe("Noname.Game.Event.Changed",function(){
				if (player.name1 != player._name1) {
					player.reinit(player.name1, player._name1);
				}
				if (player.name2 != player._name2) {
					player.reinit(player.name2, player._name2);
				}
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
		initClassListLocker: function () {
			this._classList = this.classList;
			Object.defineProperty(this, "classList", {
				get: function () {
					var classList = this._classList;
					if (classList.contains("selected")) {
						console.log(classList);
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
		_qsmx_duansha: {
			trigger:{
				player:"drawBegin",
			},
			lastDo:true,
			forced:true,
			filter:function(event, player){
				return false;
				var cards = Array.from(ui.cardPile.childNodes);
				if (cards.filter(card=>card.name != "sha").length < event.num) {
					return false;
				}
				if (event.bottom) {
					cards = cards.slice(-1, -event.num);
				} else {
					cards = cards.slice(0, event.num - 1);
				}
				return cards.some(card=>card.name == "sha");
			},
			content:async function(event, trigger, player){
				player.popup("断杀");
				var cards = Array.from(ui.cardPile.childNodes)
					.filter(card => card.name != "sha")
					.randomGets(trigger.num);
				var node = ui["cardPile"];
				if (trigger.bottom) {
					for (const card of cards) {
						node.appendChild(card);
					}
				} else {
					for (const card of cards) {
						node.insertBefore(card, node.firstChild);
					}
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
	lib.nature.set("annihailate", 200);
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
	//get
	/**
	 * 返回一名武将是否是三国杀官方的武将
	 * @param { string } character 
	 * @returns { boolean }
	 */
	get.is.sgsCharacter = function(character){
		if (!_status.sgsCharacterList) {
			_status.sgsCharacterList = [];
			var sgsCharacterPackList = lib.config.all.sgscharacters;
			for (const key of sgsCharacterPackList) {
				//对于垃圾桶内的武将的特殊处理
				if (key == "diy") {
					_status.sgsCharacterList.addArray(lib.characterSort.diy.diy_trashbin);
				} else {
					if (!lib.characterPack[key]) {
						continue;
					}
					_status.sgsCharacterList.addArray(Object.keys(lib.characterPack[key]));
				}
			}
		}
		return _status.sgsCharacterList.includes(character);
	};
	//动态翻译
	Object.assign(lib.dynamicTranslate, {
		qsmx_zhengtong: function(){
			if (lib.skill["qsmx_zhengtong"]["zhuSkill"]) {
				return `主公技，` + lib.translate["qsmx_zhengtong_info"];
			} else {
				return lib.translate["qsmx_zhengtong_info"];
			}
		},
	});
	//对于哆来咪的加强
	lib.arenaReady.push(()=>{
		if (!_status.dunshi_list) lib.skill.dunshi.initList();
		var derivation = _status.dunshi_list.slice();
		lib.skill.dunshi.derivation = derivation;
	});
	//难绷玩意
	let func = function(){
		let OriginalFuction = lib.element.Player.prototype.build;
		class PlayerDOMTokenList extends DOMTokenList{
			add(){
				let classList = this;
				lib.announce.publish("Noname.Player.Class.Changed", {
					classList:classList,
					type: "add",
				});
				let result = DOMTokenList.prototype.add.apply(this, arguments);
				return result;
			}
			remove(){
				let classList = this;
				lib.announce.publish("Noname.Player.Class.Changed", {
					classList:classList,
					type: "remove",
				});
				let result = DOMTokenList.prototype.remove.apply(this, arguments);
				return result;
			}
			/**
			 * @type { Player }
			 */
			parentElement;
		};
		lib.element.Player.prototype.build = function(){
			let player = this;
			Object.setPrototypeOf(this.classList, PlayerDOMTokenList.prototype);
			Object.defineProperty(this.classList, "parentElement", {
				configurable:true,
				enumerable:false,
				value:player,
			});
			let result =  OriginalFuction.apply(this, arguments);
			return result;
		}
	};
	let list = func.toString().split("\n");
	let string = "";
	for (const key of list.slice(1, -1)) {
		string = string.concat(`${key}\n`);
	}
	setImmediate(new Function(string));
}
