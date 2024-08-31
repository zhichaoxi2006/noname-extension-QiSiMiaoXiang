import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";
import { basic } from "../../basic.js";
import { character } from "./character.js";
export const card = {
	card: {
		longinus: {
			derivation: "qsmx_longinus",
			image: `${basic.extensionDirectoryPath.replace(
				"extension/",
				"ext:"
			)}resource/image/card/longinus.png`,
			type: "equip",
			subtype: "equip1",
			distance: {
				attackFrom: -3,
			},
			destroy: true,
			skills: ["spear_of_longinus"],
			ai: {
				basic: {
					equipValue: 7.5,
					order: (card, player) => {
						const equipValue =
							get.equipValue(card, player) / 20;
						return player && player.hasSkillTag("reverseEquip")
							? 8.5 - equipValue
							: 8 + equipValue;
					},
					useful: 2,
					value: (card, player, index, method) => {
						if (
							!player.getCards("e").includes(card) &&
							!player.canEquip(card, true)
						)
							return 0.01;
						const info = get.info(card),
							current = player.getEquip(info.subtype),
							value =
								current &&
								card != current &&
								get.value(current, player);
						let equipValue =
							info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == "function") {
							if (method == "raw")
								return equipValue(card, player);
							if (method == "raw2")
								return equipValue(card, player) - value;
							return Math.max(
								0.1,
								equipValue(card, player) - value
							);
						}
						if (typeof equipValue != "number") equipValue = 0;
						if (method == "raw") return equipValue;
						if (method == "raw2") return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) =>
						get.equipResult(player, target, card.name),
				},
			},
			fullskin: true,
			enable: true,
			selectTarget: -1,
			filterTarget: (card, player, target) =>
				player == target && target.canEquip(card, true),
			modTarget: true,
			allowMultiple: false,
			content: function () {
				if (cards.length && get.position(cards[0], true) == "o")
					target.equip(cards[0]);
			},
			toself: true,
		},
		qsmx_paper: {
			image: `${basic.extensionDirectoryPath.replace(
				"extension/",
				"ext:"
			)}resource/image/card/qsmx_paper.png`,
			fullskin: true,
		},
		qsmx_addition: {
			image: `${basic.extensionDirectoryPath.replace(
				"extension/",
				"ext:"
			)}resource/image/card/addition.png`,
			fullskin: true,
			type: "operator"
		},
		qsmx_subtraction: {
			image: `${basic.extensionDirectoryPath.replace(
				"extension/",
				"ext:"
			)}resource/image/card/subtraction.png`,
			fullskin: true,
			type: "operator"
		},
		qsmx_mult: {
			image: `${basic.extensionDirectoryPath.replace(
				"extension/",
				"ext:"
			)}resource/image/card/mult.png`,
			fullskin: true,
			type: "operator"
		},
		qsmx_division: {
			image: `${basic.extensionDirectoryPath.replace(
				"extension/",
				"ext:"
			)}resource/image/card/division.png`,
			fullskin: true,
			type: "operator"
		},
		huanyuyanmiezhu: {
			image: `${basic.extensionDirectoryPath.replace(
				"extension/",
				"ext:"
			)}resource/image/card/huanyuyanmiezhu.png`,
			fullskin: true,
			type: "equip",
			subtype: "equip42",
			skills: ["huanyuyanmiezhu_skill"],
			unique: true,
			ai: {
				equipValue: 7,
				basic: {
					order: (card, player) => {
						const equipValue =
							get.equipValue(card, player) / 20;
						return player && player.hasSkillTag("reverseEquip")
							? 8.5 - equipValue
							: 8 + equipValue;
					},
					useful: 2,
					equipValue: 1,
					value: (card, player, index, method) => {
						if (
							!player.getCards("e").includes(card) &&
							!player.canEquip(card, true)
						)
							return 0.01;
						const info = get.info(card),
							current = player.getEquip(info.subtype),
							value =
								current &&
								card != current &&
								get.value(current, player);
						let equipValue =
							info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == "function") {
							if (method == "raw")
								return equipValue(card, player);
							if (method == "raw2")
								return equipValue(card, player) - value;
							return Math.max(
								0.1,
								equipValue(card, player) - value
							);
						}
						if (typeof equipValue != "number") equipValue = 0;
						if (method == "raw") return equipValue;
						if (method == "raw2") return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) =>
						get.equipResult(player, target, card.name),
				},
			},
			enable: true,
			selectTarget: -1,
			filterTarget: (card, player, target) =>
				player == target && target.canEquip(card, true),
			modTarget: true,
			allowMultiple: false,
			content: function () {
				if (cards.length && get.position(cards[0], true) == "o")
					target.equip(cards[0]);
			},
			toself: true,
		},
		retrospective_clock: {
			image: `${basic.extensionDirectoryPath.replace(
				"extension/",
				"ext:"
			)}resource/image/card/retrospective_clock.gif`,
			fullimage: true,
			type: "equip",
			subtype: "equip42",
			skills: ["retrospective_clock_skill"],
			unique: true,
			ai: {
				equipValue: 7,
				basic: {
					order: (card, player) => {
						const equipValue =
							get.equipValue(card, player) / 20;
						return player && player.hasSkillTag("reverseEquip")
							? 8.5 - equipValue
							: 8 + equipValue;
					},
					useful: 2,
					equipValue: 1,
					value: (card, player, index, method) => {
						if (
							!player.getCards("e").includes(card) &&
							!player.canEquip(card, true)
						)
							return 0.01;
						const info = get.info(card),
							current = player.getEquip(info.subtype),
							value =
								current &&
								card != current &&
								get.value(current, player);
						let equipValue =
							info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == "function") {
							if (method == "raw")
								return equipValue(card, player);
							if (method == "raw2")
								return equipValue(card, player) - value;
							return Math.max(
								0.1,
								equipValue(card, player) - value
							);
						}
						if (typeof equipValue != "number") equipValue = 0;
						if (method == "raw") return equipValue;
						if (method == "raw2") return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) =>
						get.equipResult(player, target, card.name),
				},
			},
			enable: true,
			selectTarget: -1,
			filterTarget: (card, player, target) =>
				player == target && target.canEquip(card, true),
			modTarget: true,
			allowMultiple: false,
			content: function () {
				if (cards.length && get.position(cards[0], true) == "o")
					target.equip(cards[0]);
			},
			toself: true,
		},
	},
	skill:{
		huanyuyanmiezhu_skill: {
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
		retrospective_clock_skill: {
			equipSkill: true,
			trigger: {
				player: "phaseBegin",
			},
			async content(event, trigger, player) {
				player.hp = player.maxHp;
				player.update();
				const removeSkills = player.getSkills(null, false, false).filter(i => {
					const info = get.info(i);
					return !info || !info.charlotte;
				});
				if (removeSkills.length) player.removeSkill(removeSkills);
				const gainSkills = player.getStockSkills(true, true).filter(i => {
					const info = get.info(i);
					if (info && info.zhuSkill && !player.isZhu2()) return false;
					return !info || !info.charlotte;
				});
				if (gainSkills.length) {
					//抽象
					//混沌初开——牢戏
					Object.keys(player.storage)
						.filter(i => gainSkills.some(skill => i.startsWith(skill)))
						.forEach(storage => delete target.storage[storage]);
					player.addSkill(gainSkills);
					const suffixs = ["used", "round", "block", "blocker"];
					for (const skill of gainSkills) {
						const info = get.info(skill);
						if (typeof info.usable == "number") {
							if (player.hasSkill("counttrigger") && player.storage.counttrigger[skill] && target.storage.counttrigger[skill] >= 1) {
								delete player.storage.counttrigger[skill];
							}
							if (typeof get.skillCount(skill) == "number" && get.skillCount(skill) >= 1) {
								delete player.getStat("skill")[skill];
							}
						}
						if (info.round && player.storage[skill + "_roundcount"]) {
							delete player.storage[skill + "_roundcount"];
						}
						if (player.storage[`temp_ban_${skill}`]) {
							delete player.storage[`temp_ban_${skill}`];
						}
						if (player.awakenedSkills.includes(skill)) {
							player.restoreSkill(skill);
						}
						for (const suffix of suffixs) {
							if (player.hasSkill(skill + "_" + suffix)) {
								player.removeSkill(skill + "_" + suffix);
							}
						}
					}
				}
			},
		},
	},
	translate: {
		qsmx_addition: "加号",
		qsmx_subtraction: "减号",
		qsmx_mult: "乘号",
		qsmx_division: "除号",
		operator: "运算符",
		equip42: "禁忌之物",
		huanyuyanmiezhu: "寰宇湮灭珠",
		huanyuyanmiezhu_info:
			"锁定技，你即将造成的伤害视为湮灭伤害。",
		huanyuyanmiezhu_skill: "寰宇湮灭",
		retrospective_clock: "回溯时钟",
		retrospective_clock_info: "回合开始时，你可以将体力调整至体力上限并将拥有的技能重置至游戏开始的状态。",
		retrospective_clock_skill: "回溯",
		longinus: "朗基努斯",
		longinus_info:
			"①你使用【杀】无次数限制；<br>②你使用牌指定其他角色时，若其为唯一目标，其不能使用或打出牌直到回合结束，然后，你进行一次判定，若判定牌带有弃置标签：其弃置所有牌、带有获得标签：你获得其所有牌、为延时性锦囊：其废除判定区并执行一次判定牌牌名的效果、为装备：废除判定牌对应副类型的装备栏。",
		qsmx_paper: "纸",
		qsmx_paper_info: "",
	},
	list: [],
}
