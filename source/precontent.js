import { lib, game, ui, get, ai, _status, Game } from "../../../noname.js";
import { getRepoTags, request, getRepoFilesList } from "./update.js";
export async function precontent(config, pack) {
	//MathJax
	window.MathJax = {
		tex: {
			inlineMath: [
				["$", "$"],
				["\\(", "\\)"],
			],
		},
		svg: {
			fontCache: "global",
		},
		options: {
			renderActions: {
				// 设置SVG输出并启用缩放
				findScript: [
					1,
					function (doc) {
						for (const node of document.querySelectorAll("math")) {
							if (
								!node.getAttribute("mode") ||
								node.getAttribute("mode") === "display"
							) {
								// 对于display模式的公式，可以考虑添加类以方便CSS控制
								node.classList.add("mjx-svg-display");
							} else {
								node.classList.add("mjx-svg-inline");
							}
						}
					},
					"",
				],
			},
		},
	};
	(function () {
		var script = document.createElement("script");
		script.src =
			"https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
		script.async = true;
		document.head.appendChild(script);
	})();
	//namePrifix
	if (lib.namePrefix) {
		lib.namePrefix.set("妙", {
			color: "#dcdcdc",
			nature: "black",
		});
		lib.namePrefix.set("会玩", {
			color: "#dcdcdc",
			nature: "black",
		});
		lib.namePrefix.set("SP妙", {
			getSpan: (prefix, name) =>
				`${get.prefixSpan("SP")}${get.prefixSpan("妙")}`,
		});
		lib.namePrefix.set("妙神", {
			getSpan: (prefix, name) =>
				`${get.prefixSpan("妙")}${get.prefixSpan("神")}`,
		});
		const prefix = {
			qsmx: [
				"qsmx_zhaoyun",
				"qsmx_simayi",
				"qsmx_liubei",
				"qsmx_machao",
				"qsmx_zhangliang",
				"qsmx_zuoci",
				"qsmx_lvbu",
				"qsmx_zhangjiao",
				"qsmx_zhangfei",
				"qsmx_puyuan",
				"qsmx_zhangliao",
				"qsmx_simashi",
				"qsmx_huatuo",
				"qsmx_menghuo",
				"qsmx_caorui",
				"qsmx_baozheng",
				"qsmx_sunce",
				"qsmx_jiaxu",
				"qsmx_luxun",
				"qsmx_xusha",
				"qsmx_zhonghui",
				"qsmx_sunquan",
				"qsmx_wangshuang",
				"qsmx_nanhualaoxian",
				"qsmx_cenhun",
				"qsmx_huangzhong",
				"qsmx_zhenji",
				"qsmx_guanyu",
				"qsmx_caocao",
				"qsmx_caopi",
				"qsmx_sunjian",
			],
			qsmx_hw: ["qsmx_hw_sunquan", "qsmx_hw_zhonghui"],
			qsmx_sp: ["qsmx_sp_zhangliao"],
			qsmx_shen: ["qsmx_shen_zhangjiao", "qsmx_shen_zhangliao", "qsmx_shen_zhangfei", "qsmx_shen_xunyu"],
		};
		for (var i of prefix["qsmx_sp"]) lib.translate[i + "_prefix"] = "SP妙";
		for (var i of prefix["qsmx_shen"])
			lib.translate[i + "_prefix"] = "妙神";
		for (var i of prefix["qsmx"]) lib.translate[i + "_prefix"] = "妙";
		for (var i of prefix["qsmx_hw"]) lib.translate[i + "_prefix"] = "会玩";
	}
	//奇思妙想的lib
	Object.assign(lib, {
		qsmx: {
			over: game.over,
			excludeSkills: ["global", "globalmap", "autoswap"],
			ResistanceSkills: [],
			/**
			 * 让人看起来像是死了
			 * @param { Player } player 
			 */
			changeToDie: function (player) {
				var dead = player.isDead();
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
				}, player);
				game.addVideo("diex", player);
				if (!dead) {
					player.$die();
				}
				if (player.hp != 0) {
					player.hp = 0;
					player.update();
				}
			},
			addSkillInfo: function () {
				var skills = Object.keys(lib.skill);
				for (let index = 0; index < skills.length; index++) {
					const key = skills[index];
					if (key.startsWith("qsmx_") || key.startsWith("_qsmx_")) {
						lib.skill[key].fixedObject = true;
					}
				}
			},
			/**
			 * 检测一个技能是否符合抗性技能的条件
			 * @param { object } object
			 * @returns { boolean }
			 */
			isResitanceSkill: function (object) {
				var list = lib.qsmx.hasSomeCode(object);
				if(list[2])return false;
				return (
					lib.qsmx.isTooMuchSkillTrigger(object) ||
					lib.qsmx.isTooMuchSkillTag(object) ||
					lib.qsmx.isDefined(object) ||
					list[0] ||
					list[1]
				)
			},
			/**
			 * @param { object } object
			 * @returns { boolean }
			 */
			isTooMuchSkillTag: function (object) {
				var count = 0;
				var infos = [
					"noLose",
					"noAdd",
					"noRemove",
					"noDisabled",
					"noDeprive",
					"noAwaken",
					"superCharlotte",
					"globalFixed",
					"fixed",
					"forceunique",
				];
				if (object["sole"]) return true;
				for (let index = 0; index < infos.length; index++) {
					const info = infos[index];
					if (object[info] == true) {
						count++;
					}
				}
				if (count >= 2) return true;
				return false;
			},
			/**
			 * 
			 * @param { Skill } info 
			 * @returns { Boolean }
			 */
			isTooMuchSkillTrigger: function(info){
				var list = [];
				if (info.trigger) {
					for (const key of Object.keys(info.trigger)) {
						if (typeof info.trigger[key] == "string") {
							list.add(info.trigger[key]);
						} else {
							list.addArray(info.trigger[key]);
						}
					}
					return list.length > 12;
				}
				return false;
			},
			/**
			 * 检测字符串中是否含有加密代码
			 * @param { string } str
			 * @returns { boolean }
			 */
			hasEncryptedCode: function (str) {
				var EncryptedCodeKeyword = ["var _0x", "_0x"];
				var code = str;
				for (const keyword of EncryptedCodeKeyword) {
					if (code.includes(keyword)) {
						return true;
					}
				}
				return false;
			},
			/**
			 * 检测字符串中是否调用Object方法
			 * @param { string } str 
			 * @returns { boolean }
			 */
			hasObjectCode: function (str) {
				var ObjectCodeKeyword = ["Object.seal", "Object.preventExtensions", "Object.defineProperties", "Object.defineProperty", "Object.freeze"];
				var code = str;
				for (const keyword of ObjectCodeKeyword) {
					if (code.includes(keyword)) {
						return true;
					}
				}
				return false;
			},
			hasChangeBossCode: function(str) {
				var ChangeBossCodeKeyword = ["game.changeBoss"];
				var code = str;
				for (const keyword of ChangeBossCodeKeyword) {
					if (code.includes(keyword)) {
						return true;
					}
				}
				return false;
			},
			hasSomeCode: function (object) {
				//不要问为什么这里要try...catch...，问就是邪门写法的技能
				try {
					var code = lib.init.stringifySkill(object);
				} catch (error) {
					return [null, null, null];
				}
				return [lib.qsmx.hasEncryptedCode(code), lib.qsmx.hasObjectCode(code), lib.qsmx.hasChangeBossCode(code)];
			},
			/**
			 * 检测对象中是否存在描述器
			 * @param { object } object
			 * @returns { boolean }
			 */
			isDefined: function (object) {
				function isDefined(opd) {
					if (opd != undefined) {
						if (
							opd.get ||
							opd.set ||
							opd.writable != true ||
							opd.configurable != true
						) {
							return true;
						}
					}
					return false;
				}
				var empty = {};
				empty["object"] = object;
				return isDefined(
					Object.getOwnPropertyDescriptor(empty, "object")
				);
			},
			/**
			 * 清理带抗性的技能
			 */
			skillDelete: async function () {
				if (_status.skillDelete) return;
				console.time('技能灭杀');
				var list = Reflect.ownKeys(lib.skill);
				list.forEach(function (key) {
					const skill = lib.skill[key];
					//排除例外
					if (!skill || 
						lib.qsmx.excludeSkills.includes(key)
					) {
						return;
					}
					//正式开始处理
					try {
						var bool = lib.qsmx.isResitanceSkill(skill);
					} catch (error) {
						var bool  = true;
					}
					if (bool) {
						var nullObject = {};
						nullObject["deleted"] = true;
						nullObject["fixedObject"] = true;
						nullObject["originSkill"] = skill;
						//必要的妥协
						Reflect.ownKeys(skill).forEach(function(key){
							if(typeof skill[key] == "function"){
								nullObject[key] = function () {};
							} else if (typeof skill[key] == "object") {
								nullObject[key] = skill[key];
							} else if (typeof skill[key] == "string") {
								nullObject[key] = skill[key];
							} else if (typeof skill[key] == "boolean") {
								nullObject[key] = skill[key];
							}
						});
						if(skill['trigger'])nullObject['trigger'] = skill['trigger'];
						if(skill['subSkill'])nullObject['subSkill'] = skill['subSkill'];
						if(skill['global'])nullObject['global'] = skill['global'];
						//必须赋空的
						if(skill['init'])nullObject['init'] = function () {};
						if(skill['init2'])nullObject['init2'] = function () {};
						if(skill['filter'])nullObject["filter"] = function () {};
						if(skill['content'])nullObject["content"] = function () {};
						if(skill['group'])nullObject["group"] = [];
						if(skill['hookTrigger'])nullObject["hookTrigger"] = {};
						if (
							(!key.startsWith("_") || lib.translate[`${key}_info`]) &&
							!lib.qsmx.ResistanceSkills.includes(key)
						) {
							lib.skill[key] = nullObject;
							lib.qsmx.ResistanceSkills.add(key);
						}
					}
				});
				_status.skillDelete = true;
				console.timeEnd('技能灭杀');
			},
			/**
			 * 清理带抗性的技能(D)
			 */
			skillDelete2: async function () {
				if (_status.skillDelete) return;
				console.time('技能灭杀');
				var list = Reflect.ownKeys(lib.skill);
				list.forEach(function (key) {
					const skill = lib.skill[key];
					//排除例外
					if (!skill || 
						lib.qsmx.excludeSkills.includes(key)
					) {
						return;
					}
					//正式开始处理
					var list = lib.qsmx.hasSomeCode(skill);
					try {
						var bool = list[0] || list[1] || lib.qsmx.isDefined(skill);
					} catch (error) {
						var bool  = true;
					}
					if (bool) {
						var nullObject = {};
						nullObject["deleted"] = true;
						nullObject["fixedObject"] = true;
						nullObject["originSkill"] = skill;
						//必要的妥协
						Object.keys(skill).forEach(function(key){
							if(typeof skill[key] == "function"){
                                nullObject[key] = function () {};
                            } else if (typeof skill[key] == "object") {
                                nullObject[key] = skill[key];
                            } else if (typeof skill[key] == "string") {
                                nullObject[key] = skill[key];
                            } else if (typeof skill[key] == "boolean") {
                                nullObject[key] = skill[key];
                            }
                        });
						if(skill['trigger'])nullObject['trigger'] = skill['trigger'];
						if(skill['subSkill'])nullObject['subSkill'] = skill['subSkill'];
						if(skill['global'])nullObject['global'] = skill['global'];
						//必须赋空的
						if(skill['init'])nullObject['init'] = function () {};
						if(skill['init2'])nullObject['init2'] = function () {};
						if(skill['filter'])nullObject["filter"] = function () {};
						if(skill['content'])nullObject["content"] = function () {};
						if(skill['group'])nullObject["group"] = [];
						if(skill['hookTrigger'])nullObject["hookTrigger"] = {};
						if (
							(!key.startsWith("_") || lib.translate[`${key}_info`]) &&
							!lib.qsmx.ResistanceSkills.includes(key)
						) {
							lib.skill[key] = nullObject;
							lib.qsmx.ResistanceSkills.add(key);
						}
					}
				});
				console.timeEnd('技能灭杀');
			},
			/**
			 * 复原被skillDelete清理的技能对象
			 */
			skillRestore: async function () {
				var list = Reflect.ownKeys(lib.skill);
				list.forEach(function (key) {
					const skill = lib.skill[key];
					if (!skill || !skill.originSkill) {
						return;
					}
					var obj = {};
					Object.assign(obj, skill.originSkill)
					obj['resistanceSkill'] = true;
					lib.skill[key] = obj;
				});
			},
			/**
			 * 修改被skillDelete清理的技能的技能描述
			 */
			skillTranslationAdd: async function () {
				var list = Reflect.ownKeys(lib.skill);
				list.forEach(function (key) {
					const skill = lib.skill[key];
					if (!skill || !skill.originSkill) {
						return;
					}
					try {
						if (!lib.translate[
							`${key}_info`
						] || lib.translate[
							`${key}_info`
						].startsWith(`<ins>检测到此技能可能存在抗性，此技能已被无效化。</ins><br>`))return;
						lib.translate[
							`${key}_info`
						] = `<ins>检测到此技能存在抗性，此技能已被无效化。</ins><br>${
							lib.translate[key + "_info"]
						}`;
					} catch (error) {
						console.error(error);
					}
				});
			},
			/**
			 * 生成任意长度的随机字符串
			 * @param {number} [length=10] 字符串长度
			 * @returns { string }
			 */
			generateRandomString(length = 10) {
				const characters =
					"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
				let result = "";
				const charactersLength = characters.length;
				for (let i = 0; i < length; i++) {
					result += characters.charAt(
						Math.floor(Math.random() * charactersLength)
					);
				}
				return result;
			},
			getCharacterSkillStringLength(character, derivate){
				var Originalskills = lib.character[character].skills;
				var num = 0;
				if (derivate) {
					for (const skill of Originalskills) {
						var info = lib.skill[skill];
						if(!info) continue;
						var derivation = info.derivation;
						if (derivation) {
							if (Array.isArray(derivation)) {
								Originalskills.addArray(lib.skill[skill].derivation);
							} else {
								Originalskills.add(lib.skill[skill].derivation);
							}
						}
					}
				}
				for (const skill of Originalskills) {
					var string = get.plainText(get.translation(`${skill}_info`));
					num += string.length;
				}
				return num;
			},
			getTestArray(num = 250){
				var list = [];
				var character = Reflect.ownKeys(lib.character);
				for (const key of character) {
					//if(key.startsWith('qsmx'))continue;
					if (lib.qsmx.getCharacterSkillStringLength(key, true) >= num) {
						list.push(get.plainText(get.translation(key)));
					}
				}
				return list;
			},
			resitanceCallback: function (player) {
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
		},
	});
	//全时机检测伪实现（笑）
	try {
		if (_status.eventManager) {
			//针对1103v2事件重构的修改
			class eventStackArray extends Array{};
			Object.defineProperty(eventStackArray.prototype, "push", {
				configurable:true,
				enumerable:false,
				value:function(){
					lib.announce.publish("Noname.Game.Event.Changed", _status.event);
					return Array.prototype.push.apply(this, arguments);
				}
			});
			Object.setPrototypeOf(_status.eventManager.eventStack, eventStackArray.prototype);
		} else {
			//祖宗之法
			lib.qsmx.currentEvent = get.copy(_status.event, true);
			Object.defineProperty(_status, "event", {
				get: function () {
					return lib.qsmx.currentEvent;
				},
				set: function (event) {
					lib.qsmx.currentEvent = event;
					//在赋值之后进行消息推送
					lib.announce.publish("Noname.Game.Event.Changed", event);
				},
				configurable:true,
				enumerable:true,
			});
		}
	} catch (err) {
		throw new Error(err);
	}
}
