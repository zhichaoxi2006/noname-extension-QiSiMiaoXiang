import { lib, game, ui, get, ai, _status } from '../../../../../noname.js'
import { basic } from '../../basic.js'
export async function card() {
    let pack = {
        card: {
            longinus: {
                image: `${basic.extensionDirectoryPath.replace('extension/', 'ext:')}resource/image/card/longinus.png`,
                type: "equip",
                subtype: "equip1",
                distance: {
                    attackFrom: -3,
                },
                destroy: true,
                skills: ["spear_of_longinus"],
                modeimage: "boss",
                ai: {
                    basic: {
                        equipValue: 7.5,
                        order: (card, player) => {
                            const equipValue = get.equipValue(card, player) / 20;
                            return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
                        },
                        useful: 2,
                        value: (card, player, index, method) => {
                            if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
                            const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
                            let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
                            if (typeof equipValue == 'function') {
                                if (method == 'raw') return equipValue(card, player);
                                if (method == 'raw2') return equipValue(card, player) - value;
                                return Math.max(0.1, equipValue(card, player) - value);
                            }
                            if (typeof equipValue != 'number') equipValue = 0;
                            if (method == 'raw') return equipValue;
                            if (method == 'raw2') return equipValue - value;
                            return Math.max(0.1, equipValue - value);
                        },
                    },
                    result: {
                        target: (player, target, card) => get.equipResult(player, target, card.name),
                    },
                },
                fullskin: true,
                enable: true,
                selectTarget: -1,
                filterTarget: (card, player, target) => player == target && target.canEquip(card, true),
                modTarget: true,
                allowMultiple: false,
                content: function () {
                    if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
                },
                toself: true,
            },
            "qsmx_paper": {
                image: `${basic.extensionDirectoryPath.replace('extension/', 'ext:')}resource/image/card/qsmx_paper.png`,
                fullskin: true,
            },
        },
        translate: {
            longinus: "朗基努斯",
            "longinus_info": "你使用【杀】无次数限制；你使用牌指定唯一目标时，若其为神势力：你进行一次判定，其不能使用或打出牌且废除判定区与装备区直到回合结束；若其不为神势力：你将其势力改为神势力。",
            "qsmx_paper": "纸",
            "qsmx_paper_info": "",
        },
        list: [],
    };

    return pack;
}