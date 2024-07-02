import { lib, game, ui, get, ai, _status } from "../../../noname.js";
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
			SVG: {
				fontCache: "global", // 共享字体缓存可以优化SVG渲染后的缩放
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
			qsmx_shen: ["qsmx_shen_zhangjiao", "qsmx_shen_zhangliao"],
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
			excludeSkills: ["global", "globalmap"],
			ResistanceSkills: [],
			defineProperty: function () {
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
				if (
					lib.qsmx.hasEncryptedCode(object) ||
					lib.qsmx.isTooMuchSkillTag(object) ||
					lib.qsmx.isDefined(object) ||
					lib.qsmx.hasObjectCode(object)
				) {
					return true;
				}
			},
			/**
			 * 检测对象的特定属性是否被定义
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
			 * 检测对象中是否含有加密代码
			 * @param { object } object
			 * @returns { boolean }
			 */
			hasEncryptedCode: function (object) {
				var EncryptedCodeKeyword = ["var _0x", "_0x"];
				var code = String(lib.init.stringifySkill(object));
				for (
					let index = 0;
					index < EncryptedCodeKeyword.length;
					index++
				) {
					const keyword = EncryptedCodeKeyword[index];
					if (code.includes(keyword)) {
						return true;
					}
				}
				return false;
			},
			/**
			 * 检测对象中是否调用Object方法
			 * @param { object } object 
			 * @returns { boolean }
			 */
			hasObjectCode: function (object) {
				var ObjectCodeKeyword = ["Object.seal", "Object.preventExtensions", "Object.defineProperties", "Object.defineProperty", "Object.freeze"];
				var code = String(lib.init.stringifySkill(object));
				for (
					let index = 0;
					index < ObjectCodeKeyword.length;
					index++
				) {
					const keyword = ObjectCodeKeyword[index];
					if (code.includes(keyword)) {
						return true;
					}
				}
				return false;
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
				var list = Reflect.ownKeys(lib.skill);
				list.forEach(function (key) {
					const skill = lib.skill[key];
					//排除例外
					if (!skill || lib.qsmx.excludeSkills.includes(key)) {
						return;
					}
					//正式开始处理
					if (lib.qsmx.isResitanceSkill(skill)) {
						var nullObject = {};
						nullObject["deleted"] = true;
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
						nullObject['init'] = function () {};
						nullObject['init2'] = function () {};
						nullObject["filter"] = function () {};
						nullObject["content"] = function () {};
						nullObject["hookTrigger"] = {};
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
					lib.skill[key] = skill.originSkill;
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
			getCharacterSkillStringLength(character){
				var Originalskills = lib.character[character][3];
				var num = 0
				for (const skill of Originalskills) {
					var string = get.plainText(get.translation(`${skill}_info`));
					num += string.length;
				}
				return num;
			}
		},
	});
	//全时机检测伪实现（笑）
	lib.qsmx.event = get.copy(_status.event, true);
	try {
		Object.defineProperty(_status, "event", {
			get: function () {
				return lib.qsmx.event;
			},
			set: function (event) {
				lib.qsmx.event = event;
				//在赋值之后进行消息推送
				lib.announce.publish("Noname.Game.Event.Changed", _status.event);
			},
		});
	} catch (err) {
		console.error(err)
	}
}
