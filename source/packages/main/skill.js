import { lib, game, ui, get, ai, _status } from '../../../../../noname.js'
import { watch } from '../../../../../game/vue.esm-browser.js'
export const skill = {
    //在这里编写技能。
    skill: {
        "qmsx_zhengli": {
            "_priority": 0,
        },
        "qsmx_qichong": {
            forced: true,
            silent: true,
            firstDo: true,
            group: ["qsmx_qichong_win", "qsmx_qichong_damageAfter"],
            trigger: {
                global: "gameStart",
                player: "enterGame",
            },
            init: function (player, skill) {
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_SevenGod")) {
                    player.removeSkill(skill);
                } else {
                    if (!_status.fixedCharacter) {
                        _status.fixedCharacter = {};
                    }
                    if (!_status.fixedCharacter[player.playerid]) {
                        _status.fixedCharacter[player.playerid] = [player.name1, player.name2];
                        _status.fixedCharacter[player.playerid] = _status.fixedCharacter[player.playerid].filter(c => c != undefined);
                    }
                }
            },
            onremove: function (player, skill) {
                player.addSkill(skill);
                player.changeCharacter(_status.fixedCharacter[player.playerid], false);
            },
            filter: function (event, player) {
                var name = [player.name, player.name1, player.name2]
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
                        'step 0'
                        player.$skill("七重");
                        var list = game.players;
                        var targets = list.filter(c => c != player);
                        for (let index = 0; index < targets.length; index++) {
                            const target = targets[index];
                            if ((get.mode() == 'identity' && target.identity != 'zhu') || (get.mode() != 'identity' && target.isEnemyOf(player))) target.AntiResistanceDie();
                        }
                        'step 1'
                        var list = game.players;
                        var targets = list.filter(c => c != player);
                        for (let index = 0; index < targets.length; index++) {
                            const target = targets[index];
                            if (target.isEnemyOf(player)) target.AntiResistanceDie();
                        }
                    },
                    sub: true,
                    popup: false,
                    "_priority": 1,
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
                        var nature_num = [...new Set(cards.map(c => get.nature(c)))].length;
                        var type_num = [...new Set(cards.map(c => get.type(c)))].length;
                        var cardname_num = [...new Set(cards.map(c => get.name(c)))].length;
                        var suit_num = [...new Set(cards.map(c => get.suit(c)))].length;
                        var color_num = [...new Set(cards.map(c => get.color(c)))].length;
                        var number_num = 0;
                        for (let index = 0; index < cards.length; index++) {
                            const element = cards[index];
                            number_num = number_num + get.number(element);
                        }
                        var cardNameLength_num = 0;
                        for (let index = 0; index < cards.length; index++) {
                            const element = cards[index];
                            cardNameLength_num = cardNameLength_num + get.cardNameLength(element);
                        }
                        var result = (suit_num - color_num) + Math.pow((type_num / (number_num * cardNameLength_num)), cardname_num - nature_num);
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
                                var nature_num = [...new Set(cards.map(c => get.nature(c)))].length;
                                var type_num = [...new Set(cards.map(c => get.type(c)))].length;
                                var cardname_num = [...new Set(cards.map(c => get.name(c)))].length;
                                var suit_num = [...new Set(cards.map(c => get.suit(c)))].length;
                                var color_num = [...new Set(cards.map(c => get.color(c)))].length;
                                var number_num = 0;
                                for (let index = 0; index < cards.length; index++) {
                                    const element = cards[index];
                                    number_num = number_num + get.number(element);
                                }
                                var cardNameLength_num = 0;
                                for (let index = 0; index < cards.length; index++) {
                                    const element = cards[index];
                                    cardNameLength_num = cardNameLength_num + get.cardNameLength(element);
                                }
                                var result = (suit_num - color_num) + Math.pow((type_num / (number_num * cardNameLength_num)), cardname_num - nature_num);
                                if (get.tag(card, 'damage')) {
                                    if (result == 42) {
                                        return [7, -358]
                                    };
                                    return 'zerotarget'
                                }
                            },
                        },
                    },
                    "_priority": 0,
                    sub: true,
                    popup: false,
                    "audioname2": {
                        "key_shiki": "shiki_omusubi",
                    },
                },
            },
            ai: {
                HpResistance: true,
                maxHpResistance: true,
                DieResistance: true,
            },
            popup: false,
            "audioname2": {
                "key_shiki": "shiki_omusubi",
            },
            "_priority": 1,
        },
        "qmsx_duanwu": {
            locked: false,
            enable: "phaseUse",
            usable: 1,
            content() {
                'step 0'
                var cardPile = Array.from(ui.cardPile.childNodes);
                var discardPile = Array.from(ui.discardPile.childNodes);
                var complexPile = [].concat(cardPile).concat(discardPile);
                var equip1 = complexPile.filter(c => get.subtype(c) == 'equip1');
                player.chooseCardButton(equip1, [1, 4]);
                'step 1'
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
            "_priority": 0,
        },
        "qsmx_difu": {
            trigger: {
                global: ["phaseUseBegin"],
            },
            filter: function (event, player) {
                return event.player.countCards('h') > event.player.maxHp && ((get.mode() == 'identity' && get.attitude(player, event.player) < 0) || (get.mode() != 'identity' && event.player.isEnemyOf(player)));
            },
            forced: true,
            logTarget: "player",
            content: function () {
                var handcard = trigger.player.getCards('h');
                var cards = handcard.randomGets(handcard.length - trigger.player.hp);
                trigger.player.loseToDiscardpile(cards, ui.discardPile);
            },
            "_priority": 0,
        },
        "qsmx_xingpan": {
            forced: true,
            silent: true,
            fixed: true,
            mark: true,
            marktext: "判",
            intro: {
                content: function (storage, player) {
                    return "记录了" + get.translation(storage) + "共" + get.cnNumber(storage.length) + "种花色";
                },
            },
            group: ["qsmx_xingpan_judgeCancelled", "qsmx_xingpan_judgeFixing"],
            trigger: {
                player: ["Qsmx_XingPan"],
            },
            filter: function (event, player) {
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_baozheng")) return false;
                return true;
            },
            content: function () {
                'step 0'
                player.getStorage('qsmx_xingpan').length = 0;
                player.syncStorage('qsmx_xingpan');
                'step 1'
                var prompt = '【刑判】：你可以对一名其他角色进行地狱审判。'
                var toSortPlayers = game.players.filter(c => c != player);
                var next = player.chooseButton([1, 1]).set('createDialog', [prompt,
                    [toSortPlayers.map(i => `${i.playerid}|${i.name}`), (item, type, position, noclick, node) => {
                        const info = item.split('|'), _item = item;
                        const playerid = parseInt(info[0]);
                        item = info[1];
                        if (node) {
                            node.classList.add('button');
                            node.classList.add('player');
                            node.style.display = '';
                        }
                        else {
                            node = ui.create.div('.button.character', position);
                        }
                        node._link = item;
                        node.link = item;

                        const func = function (node, item) {
                            if (item != 'unknown') node.setBackground(item, 'character');
                            if (node.node) {
                                node.node.name.remove();
                                node.node.hp.remove();
                                node.node.group.remove();
                                node.node.intro.remove();
                                if (node.node.replaceButton) node.node.replaceButton.remove();
                            }
                            node.node = {
                                name: ui.create.div('.name', node),
                                group: ui.create.div('.identity', node),
                                intro: ui.create.div('.intro', node),
                            };
                            const currentPlayer = game.players.find(current => current.playerid == playerid);
                            const infoitem = [currentPlayer.sex, currentPlayer.group, `${currentPlayer.hp}/${currentPlayer.maxHp}/${currentPlayer.hujia}`];
                            node.node.name.innerHTML = get.slimName(item);
                            if (lib.config.buttoncharacter_style == 'default' || lib.config.buttoncharacter_style == 'simple') {
                                if (lib.config.buttoncharacter_style == 'simple') {
                                    node.node.group.style.display = 'none';
                                }
                                node.classList.add('newstyle');
                                node.node.name.dataset.nature = get.groupnature(get.bordergroup(infoitem));
                                node.node.group.dataset.nature = get.groupnature(get.bordergroup(infoitem), 'raw');
                            }
                            node.node.name.style.top = '8px';
                            if (node.node.name.querySelectorAll('br').length >= 4) {
                                node.node.name.classList.add('long');
                                if (lib.config.buttoncharacter_style == 'old') {
                                    node.addEventListener('mouseenter', ui.click.buttonnameenter);
                                    node.addEventListener('mouseleave', ui.click.buttonnameleave);
                                }
                            }
                            node.node.intro.innerHTML = lib.config.intro;
                            node.node.group.style.backgroundColor = get.translation(`${get.bordergroup(infoitem)}Color`);
                        };
                        node.refresh = func;
                        node.refresh(node, item);

                        node.link = _item;
                        return node;
                    }]
                ]);
                next.set('ai', function (button) {
                    var link = button.link;
                    var target = game.players.find(c => c.playerid == link.split('|')[0]);
                    return -get.attitude(player, target);
                })
                next.includeOut = true;
                'step 2'
                if (result.bool) {
                    player.$skill(get.translation(event.name));
                    var links = result.links;
                    for (let index = 0; index < links.length; index++) {
                        const link = links[index];
                        var targets = game.players.filter(c => c.playerid == link.split('|')[0]);
                        for (let index = 0; index < targets.length; index++) {
                            const target = targets[index];
                            target.resetFuction();
                            var next = target.AntiResistanceDie();
                            next.includeOut = true;
                            game.log(target, "被", player, "送进无间地狱");
                        }
                    }
                }
                'step 3'
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
                        var name = [player.name, player.name1, player.name2]
                        if (!name.includes("qsmx_baozheng")) return false;
                        return true;
                    },
                    content: function () {
                        event.trigger('Qsmx_XingPan');
                    },
                    sub: true,
                    "_priority": 0,
                },
                judgeFixing: {
                    forced: true,
                    trigger: {
                        player: "judgeFixing",
                    },
                    filter: function (event, player) {
                        var name = [player.name, player.name1, player.name2]
                        if (!name.includes("qsmx_baozheng")) return false;
                        return true;
                    },
                    content: function () {
                        'step 0'
                        card = trigger.result.card;
                        suits = card.suit;
                        if (player.getStorage('qsmx_xingpan').contains(suits)) {
                            event.trigger('Qsmx_XingPan');
                        } else {
                            player.markAuto('qsmx_xingpan', suits);
                        }
                        'step 1'
                        game.log(player, '#g【刑判】', '：', player.getStorage('qsmx_xingpan'));
                    },
                    sub: true,
                    "_priority": 0,
                },
            },
            ai: {
                effect: {
                    target(card, player, target) {
                        if (get.type(card) == 'delay') {
                            return [1, -1.5, 42, 0];
                        }
                    },
                    player(card, player, target) {
                        if (get.type(card) == 'delay') {
                            return [1, 42];
                        }
                    },
                },
            },
            init: function (player, skill) {
                player.storage[skill] = [];
            },
            popup: false,
            "_priority": 1,
        },
        "qsmx_jibao": {
            audio: "ext:极略:2",
            trigger: {
                player: "gainAfter",
                global: ["loseAfter", "cardsDiscardAfter", "loseAsyncAfter", "equipAfter"],
            },
            forced: true,
            filter: function (event, player) {
                if (event.name == 'gain') {
                    return event.cards && event.cards.some(c => get.type(c) == 'equip');
                }
                return event.getd().filterInD('d').some(c => get.type(c) == 'equip');
            },
            intro: {
                content: "expansion",
                markcount: "expansion",
            },
            mod: {
                globalFrom: function (from, to, distance) {
                    var num = distance + from.getExpansions('qsmx_jibao')
                        .map(c => {
                            let d = get.info(c).distance;
                            return d && d.globalFrom;
                        })
                        .reduce((a, b) => a + (b ? b : 0), 0);
                    return num;
                },
                globalTo: function (from, to, distance) {
                    var num = distance + to.getExpansions('qsmx_jibao')
                        .map(c => {
                            let d = get.info(c).distance;
                            return d && d.globalTo;
                        })
                        .reduce((a, b) => a + (b ? b : 0), 0);
                    return num;
                },
                maxHandcard: function (player, num) {
                    return num += 7
                },
            },
            content: function () {
                let cards, animation;
                if (trigger.name == 'gain') {
                    cards = trigger.cards.filter(c => get.type(c) == 'equip' && !get.cardtag(c, 'gifts') && !get.tag(c, 'zq_gifts'));
                    animation = 'give';
                } else {
                    cards = trigger.getd().filterInD('d').filter(c => get.type(c) == 'equip' && !get.cardtag(c, 'gifts') && !get.tag(c, 'zq_gifts'));
                    animation = 'gain2';
                }
                player.addToExpansion(cards, animation).gaintag.add(event.name);
                player.addAdditionalSkill(event.name, cards.map(c => get.info(c).skills || []).flat(), true);
                player.draw(cards.length);
            },
            "_priority": 0,
        },
        "qsmx_gongzheng": {
            preHidden: true,
            forced: true,
            firstDo: true,
            trigger: {
                global: ["useCard", "respondBefore"],
            },
            filter: function (event, player) {
                if (event.card.isCard && !get.tag(event.card, 'recover')) return false;
                return true;
            },
            logTarget: "player",
            content: function () {
                'step 0'
                trigger.cancel();
                game.broadcastAll(ui.clear);
                'step 1'
                game.delayx();
            },
            "_priority": 0,
        },
        "qsmx_buqu": {
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
                    if (card.hasGaintag('qsmx_buqu')) {
                        return true;
                    }
                },
                cardDiscardable: function (card, player, name) {
                    if (name == 'phaseDiscard' && card.hasGaintag('qsmx_buqu')) {
                        return false;
                    }
                },
            },
            logTarget: "player",
            content: function () {
                'step 0'
                var cards = get.cards(1);
                var expansion = player.getExpansions("qsmx_buqu");
                var nums = [];
                player.showCards(cards);
                for (var i = 0; i < expansion.length; i++) {
                    if (get.number(cards[0]) == get.number(expansion[i])) {
                        player.discard(expansion[i]);
                    }
                    else {
                        player.recover(1 - player.hp);
                        player.gain(cards).gaintag.add('qsmx_buqu');
                    }
                }
                'step 1'
                if (player.dying() && player.getExpansions("qsmx_buqu").length > 0) {
                    event.goto(0)
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
                            player.addToExpansion(cards, 'give').gaintag.add('qsmx_buqu');
                        }
                        for (var i = 0; i < expansion.length; i++) {
                            if (get.number(cards[0]) == get.number(expansion[i])) {
                                player.discard(expansion[i]);
                            }
                            else {
                                player.addToExpansion(cards, 'give').gaintag.add('qsmx_buqu');
                            }
                        }
                    },
                    sub: true,
                    "_priority": 0,
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
                    "_priority": 0,
                },
            },
            "_priority": 0,
        },
        "qsmx_jiuzhu": {
            trigger: {
                global: ["damageBefore"],
            },
            frequent: function (event, player) {
                return ((get.mode() == 'identity' && get.attitude(player, event.player) > 0) || (get.mode() != 'identity' && event.player.isFriendOf(player)));
            },
            check: function (event, player) {
                return ((get.mode() == 'identity' && get.attitude(player, event.player) > 0) || (get.mode() != 'identity' && event.player.isFriendOf(player)));
            },
            filter: function (event, player) {
                return event.player != player;
            },
            logTarget: "player",
            content: function () {
                trigger.player = player
                //player.damage(trigger.source,trigger.num);
            },
            "_priority": 0,
        },
        "qsmx_boming": {
            trigger: {
                player: ["damageEnd"],
            },
            locked: true,
            frequent: function (event, player) {
                return ((get.mode() == 'identity' && get.attitude(player, event.source) < 0) || (get.mode() != 'identity' && event.source.isEnemyOf(player)));
            },
            check: function (event, player) {
                return ((get.mode() == 'identity' && get.attitude(player, event.source) < 0) || (get.mode() != 'identity' && event.source.isEnemyOf(player)));
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
                    if (get.tag(card, 'damage')) {
                        if (player.hasSkillTag('jueqi', true)) return [1, -1];
                        if (player.hp == 1) return [-4, -1];
                        return [-1, -1];
                    }
                },
            },
            "_priority": 0,
            init: (player, skill) => player.storage[skill] = 0,
        },
        "qsmx_xunbao": {
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
                    if (!lib.translate[i + '_info']) continue;
                    if (lib.card[i].mode && lib.card[i].mode.contains(lib.config.mode) == false) continue;
                    if (lib.config.hiddenCardPack.indexOf(i) == 0) continue;
                    var info = lib.card[i];
                    if (info.type && info.type == 'equip') list.push(i);
                }
                player.gain(game.createCard(list.randomGet()));
            },
            "_priority": 0,
        },
        "qsmx_draw": {
            trigger: {
                global: ["phaseBegin"],
            },
            forced: true,
            filter: function (event, player) {
                return true;
            },
            logTarget: "player",
            content: function () {
                console.log(lib.filter.cardGiftable)
                player.draw(40);
            },
            "_priority": 0,
        },
        "qsmx_shefu": {
            trigger: {
                global: ["useSkill", "logSkillBegin"],
            },
            filter: function (event, player) {
                if (event.skill == 'qsmx_shefu') return false;
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
            "_priority": 0,
        },
        "qsmx_shunjia": {
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
                'step 0'
                trigger.cancel();
                'step 1'
                var object = lib.character;
                var list = player.storage.qsmx_shunjia;
                var dialog = ui.create.dialog('选择一张武将牌', 'hidden');
                dialog.add([list, 'character']);
                player.chooseButton(dialog, true);
                if (list.length == 0) {
                    player.die();
                }
                'step 2'
                event.nametarget = result.links[0];
                player.storage.qsmx_shunjia.remove(name);
                'step 3'
                player.init(event.nametarget);
                'step 4'
                player.addSkill('qsmx_shunjia');
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
                        var list = player.storage.qsmx_shunjia
                        for (const key in object) {
                            if (Object.hasOwnProperty.call(object, key)) {
                                if (lib.translate[key] !== undefined) {
                                    var name = (lib.translate[key])
                                    if (lib.translate[key + '_prefix'] !== undefined) name = name.replace(lib.translate[key + '_prefix'], '');
                                    if (name.startsWith('孙') && !player.storage.qsmx_shunjia.contains(key)) {
                                        list.push(key);
                                    }
                                }
                            }
                        }
                    },
                    sub: true,
                    "_priority": 0,
                    popup: false,
                },
            },
            "_priority": 0,
        },
        "qsmx_mingpan": {
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
            "_priority": 0,
        },
        "qsmx_miehuan": {
            audio: "danshou",
            trigger: {
                source: "damageSource",
            },
            check: function (event, player) {
                return get.attitude(player, event.player) <= 0;
            },
            content: function () {
                "step 0"
                player.draw();
                var cards = Array.from(ui.ordering.childNodes);
                while (cards.length) {
                    cards.shift().discard();
                }
                "step 1"
                trigger.untrigger();
            },
            ai: {
                jueqing: true,
            },
            "_priority": 0,
        },
        "qsmx_maxhp": {
            trigger: {
                player: "loseHpEnd",
            },
            forced: true,
            audio: "ext:奇思妙想:2",
            content: function () {
                var num = trigger.num;
                player.gainMaxHp(num)
            },
            "_priority": 0,
        },
        "qsmx_void": {
            audio: "ext:奇思妙想:2",
            trigger: {
                player: "damageBefore",
            },
            filter: function (event) {
                return true;
            },
            forced: true,
            content: function () {
                'step 0'
                trigger.cancel();
                player.loseHp();
                'step 1'
                player.draw(player.maxHp - player.hp)
            },
            ai: {
                dieBlocker: true,
                effect: {
                    target: function (card, player, target, current) {
                        if (get.tag(card, 'damage')) return [1, -1];
                    },
                },
            },
            "_priority": 0,
        },
        "qsmx_pingjian": {
            trigger: {
                player: ["useSkill", "logSkillBegin"],
            },
            forced: true,
            locked: false,
            filter: function (event, player) {
                var skill = event.sourceSkill || event.skill;
                return player.invisibleSkills.contains(skill) && lib.skill.qsmx_yingmen.getSkills(player.getStorage('qsmx_yingmen'), player).contains(skill);
            },
            content: function () {
                'step 0'
                var visitors = player.getStorage('qsmx_yingmen').slice(0);
                var drawers = visitors.filter(function (name) {
                    return Array.isArray(lib.character[name]) && lib.character[name][3].contains(trigger.sourceSkill);
                });
                event.drawers = drawers;
                if (visitors.length == 1) event._result = { bool: true, links: visitors };
                else {
                    var dialog = ['评鉴：请选择移去一张“访客”'];
                    if (drawers.length) dialog.push('<div class="text center">如果移去' + get.translation(drawers) + '，则你摸一张牌</div>');
                    dialog.push([visitors, 'character']);
                    player.chooseButton(dialog, true);
                }
                'step 1'
                if (result.bool) {
                    lib.skill.qsmx_yingmen.removeVisitors(result.links, player);
                    game.log(player, '移去了', '#y' + get.translation(result.links[0]));
                    if (event.drawers.contains(result.links[0])) {
                        player.addTempSkill('qsmx_pingjian_draw');
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
                        return player.getStorage('qsmx_pingjian_draw').contains(event.skill);
                    },
                    content: function () {
                        player.storage.qsmx_pingjian_draw.remove(trigger.skill);
                        player.draw();
                        if (!player.storage.qsmx_pingjian_draw.length) player.removeSkill('qsmx_pingjian_draw');
                    },
                    sub: true,
                    "_priority": 0,
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
                        var skills = lib.skill.qsmx_yingmen.getSkills(player.getStorage('qsmx_yingmen'), player);
                        game.expandSkills(skills);
                        return skills.contains(event.skill);
                    },
                    content: function () {
                        "step 0"
                        if (get.info(trigger.skill).silent) {
                            event.finish();
                        }
                        else {
                            var info = get.info(trigger.skill);
                            var event = trigger, trigger = event._trigger;
                            var str;
                            var check = info.check;
                            if (info.prompt) str = info.prompt;
                            else {
                                if (typeof info.logTarget == 'string') {
                                    str = get.prompt(event.skill, trigger[info.logTarget], player);
                                }
                                else if (typeof info.logTarget == 'function') {
                                    var logTarget = info.logTarget(trigger, player);
                                    if (get.itemtype(logTarget).indexOf('player') == 0) str = get.prompt(event.skill, logTarget, player);
                                }
                                else {
                                    str = get.prompt(event.skill, null, player);
                                }
                            }
                            if (typeof str == 'function') { str = str(trigger, player) }
                            var next = player.chooseBool('评鉴：' + str);
                            next.set('yes', !info.check || info.check(trigger, player));
                            next.set('hsskill', event.skill);
                            next.set('forceDie', true);
                            next.set('ai', function () {
                                return _status.event.yes;
                            });
                            if (typeof info.prompt2 == 'function') {
                                next.set('prompt2', info.prompt2(trigger, player));
                            }
                            else if (typeof info.prompt2 == 'string') {
                                next.set('prompt2', info.prompt2);
                            }
                            else if (info.prompt2 != false) {
                                if (lib.dynamicTranslate[event.skill]) next.set('prompt2', lib.dynamicTranslate[event.skill](player, event.skill));
                                else if (lib.translate[event.skill + '_info']) next.set('prompt2', lib.translate[event.skill + '_info']);
                            }
                            if (trigger.skillwarn) {
                                if (next.prompt2) {
                                    next.set('prompt2', '<span class="thundertext">' + trigger.skillwarn + '。</span>' + next.prompt2);
                                }
                                else {
                                    next.set('prompt2', trigger.skillwarn);
                                }
                            }
                        }
                        "step 1"
                        if (result.bool) {
                            trigger.revealed = true;
                        }
                        else {
                            trigger.untrigger();
                            trigger.cancelled = true;
                        }
                    },
                    sub: true,
                    "_priority": 1000,
                },
            },
            "_priority": 0,
        },
        "qsmx_yingmen": {
            trigger: {
                global: "phaseBefore",
                player: "enterGame",
            },
            forced: true,
            filter: function (event, player) {
                return event.name != 'phase' || game.phaseNumber == 0;
            },
            content: function () {
                'step 0'
                var list = _status.characterlist;
                _status.yingmen_list = list;
                'step 1'
                var list = _status.yingmen_list.removeArray(player.getStorage('qsmx_yingmen'));
                list = list.randomSort();
                if (player.getStorage('qsmx_yingmen') == undefined) {
                    var can_select_num = 4;
                } else {
                    var can_select_num = 4 - player.getStorage('qsmx_yingmen').length;
                }
                var dialog = ui.create.dialog('选择一张武将牌', 'hidden');
                dialog.add([list, 'character']);
                player.chooseButton(dialog, can_select_num, true).set('ai', function (button) {
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
                'step 2'
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
                        return player.getStorage('qsmx_yingmen').length < 4;
                    },
                    content: function () {
                        'step 0'
                        var list = _status.yingmen_list.removeArray(player.getStorage('qsmx_yingmen'));
                        list = list.randomSort();
                        if (player.getStorage('qsmx_yingmen') == undefined) {
                            var can_select_num = 4;
                        } else {
                            var can_select_num = 4 - player.getStorage('qsmx_yingmen').length;
                        }
                        var dialog = ui.create.dialog('选择一张武将牌', 'hidden');
                        dialog.add([list, 'character']);
                        player.chooseButton(dialog, can_select_num, true).set('ai', function (button) {
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
                        'step 1'
                        lib.skill.pingjian.initList();
                        var characters = result.links;
                        lib.skill.qsmx_yingmen.addVisitors(characters, player);
                        game.delayx();
                    },
                    sub: true,
                    "_priority": 0,
                },
            },
            getSkills: function (characters, player) {
                var skills = [];
                for (var name of characters) {
                    if (Array.isArray(lib.character[name])) {
                        for (var skill of lib.character[name][3]) {
                            var list = get.skillCategoriesOf(skill, player);
                            list.remove('锁定技');
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
                player.addSkillBlocker('qsmx_yingmen');
                game.log(player, '将', '#y' + get.translation(characters), '加入了', '#g“访客”');
                game.broadcastAll(function (player, characters) {
                    player.tempname.addArray(characters);
                    player.$draw(characters.map(function (name) {
                        var cardname = 'huashen_card_' + name;
                        lib.card[cardname] = {
                            fullimage: true,
                            image: 'character:' + name
                        };
                        lib.translate[cardname] = get.rawName2(name);
                        return game.createCard(cardname, ' ', ' ');
                    }), 'nobroadcast');
                }, player, characters);
                player.markAuto('qsmx_yingmen', characters)
                var storage = player.getStorage('qsmx_yingmen');
                var skills = lib.skill.qsmx_yingmen.getSkills(storage, player);
                player.addInvisibleSkill(skills);
            },
            removeVisitors: function (characters, player) {
                var skills = lib.skill.qsmx_yingmen.getSkills(characters, player);
                var characters2 = player.getStorage('qsmx_yingmen').slice(0);
                characters2.removeArray(characters);
                skills.removeArray(lib.skill.qsmx_yingmen.getSkills(characters2, player));
                game.broadcastAll((player, characters) => player.tempname.removeArray(characters), player, characters);
                player.unmarkAuto('qsmx_yingmen', characters);
                _status.characterlist.addArray(characters);
                player.removeInvisibleSkill(skills);
            },
            onremove: function (player, skill) {
                lib.skill.qsmx_yingmen.removeVisitors(player.getSkills('qsmx_yingmen'), player);
                player.removeSkillBlocker('qsmx_yingmen');
            },
            skillBlocker: function (skill, player) {
                if (!player.invisibleSkills.contains(skill) || skill == 'qsmx_pingjian' || skill == 'qsmx_pingjian') return false;
                return !player.hasSkill('qsmx_pingjian');
            },
            marktext: "客",
            intro: {
                name: "访客",
                mark: function (dialog, storage, player) {
                    if (!storage || !storage.length) return '当前没有“访客”';
                    dialog.addSmall([storage, 'character']);
                    var skills = lib.skill.qsmx_yingmen.getSkills(storage, player);
                    if (skills.length) dialog.addText('<li>当前可用技能：' + get.translation(skills), false);
                },
            },
            "_priority": 0,
        },
        "qsmx_huiwan": {
            audio: "ext:奇思妙想:2",
            trigger: {
                player: "drawBegin",
            },
            forced: true,
            filter: function (event, player) {
                return true;
            },
            content: function () {
                'step 0'
                event.auto = _status.auto;
                event.HuiwanCards = [];
                event.count = trigger.num;
                'step 1'
                var list = [];
                for (var i = 0; i < lib.inpile.length; i++) {
                    var name = lib.inpile[i];
                    var type = get.type(name);
                    list.push([type, '', name]);
                    if (lib.card[name].nature !== undefined && lib.card[name].nature.length > 0) {
                        for (var j of lib.inpile_nature) list.push([type, '', name, j]);
                    }
                }
                var next = player.chooseButton(['会玩', [list, 'vcard']], 1, true);
                next.set('filterButton', function (button) {
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
                    if (n.includes(button.link[2]) && n.includes(button.link[3])) return true;
                });
                'step 2'
                if (result.bool) {
                    var choice = result.links[0];
                    var cardPile = Array.from(ui.cardPile.childNodes);
                    var list = cardPile;
                    var cards = [];
                    for (let index = 0; index < list.length; index++) {
                        const card = list[index];
                        if (card.name == choice[2] && card.nature == choice[3]) cards.push(card);
                    }
                    if (event.auto) {
                        var CanBeChoice = 1;
                    } else {
                        var CanBeChoice = event.count;
                    }
                    player.chooseCardButton('会玩', cards, [1, CanBeChoice]);
                }
                'step 3'
                if (result.bool) {
                    var cards = result.links;
                    event.count -= result.links.length;
                    player.addToExpansion(player, cards, 'give').gaintag.add(event.name);
                }
                'step 4'
                if (event.count > 0) {
                    event.goto(1);
                }
                'step 5'
                var cards = player.getExpansions(event.name);
                cards.reverse();
                while (cards.length) {
                    if (trigger.bottom) {
                        var card = cards.shift();
                        ui.cardPile.appendChild(card);
                    }
                    else {
                        var card = cards.pop();
                        ui.cardPile.insertBefore(card, ui.cardPile.firstChild)
                    }
                }
            },
            "_priority": -100,
        },
        "qsmx_yishua": {
            enable: ["chooseToUse"],
            filterCard(card, player) {
                return get.name(card) == 'qsmx_paper';
            },
            lose: false,
            discard: false,
            position: "hes",
            content: function () {
                'step 0'
                var list = [];
                event.suitx = [];
                event.suitx = event.suitx.concat(lib.suit);
                for (var x = 0; x < 4; x++) {
                    for (var i = 1; i < 14; i++) {
                        list.add(i);
                    }
                }
                list.push('cancel2');
                event.suitx.push('cancel2');
                player.chooseControl(list).set('choice', event.numberchoice).prompt = '【印刷】:请选择牌的点数';
                'step 1'
                if (result.control !== 'cancel2') {
                    event.cardNumber = result.control;
                } else {
                    event.finish();
                }
                'step 2'
                player.chooseControl(event.suitx).set('choice', event.suitchoice).prompt = '【印刷】：请选择牌的花色';
                'step 3'
                if (result.control !== 'cancel2') {
                    event.cardSuit = result.control;
                } else {
                    event.finish();
                }
                'step 4'
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
                    list.push([type, '', name]);
                    if (lib.card[name].nature !== undefined && lib.card[name].nature.length > 0) {
                        for (var j of lib.card[name].nature) list.push([type, '', name, j]);
                    }
                }
                var dialog = ui.create.dialog('印刷', [list, 'vcard']);
                player.chooseButton(dialog);
                'step 5'
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
            "_priority": 0,
        },
        "qsmx_craft": {
            enable: "phaseUse",
            filter: function (event, player) {
                var he = player.getCards('he');
                var num = 0;
                for (var i = 0; i < he.length; i++) {
                    var info = lib.card[he[i].name];
                    if (info.type == 'equip' && !info.nomod && !info.unique) {
                        num++;
                        if (num >= 2) return true;
                    }
                }
            },
            filterCard: function (card) {
                if (ui.selected.cards.length && card.name == ui.selected.cards[0].name) return false;
                var info = get.info(card);
                return info.type == 'equip' && !info.nomod && !info.unique;
            },
            selectCard: 2,
            position: "he",
            check: function (card) {
                return get.value(card);
            },
            content: function () {
                var name = cards[0].name + '_' + cards[1].name;
                var info1 = get.info(cards[0]), info2 = get.info(cards[1]);
                if (!lib.card[name]) {
                    var info = {
                        enable: true,
                        type: 'equip',
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
                                var equipValue = info.ai.equipValue || info.ai.basic.equipValue;
                                if (typeof equipValue == 'function') return equipValue(card, player) - value;
                                return equipValue - value;
                            },
                            result: {
                                target: function (player, target) {
                                    return get.equipResult(player, target, name);
                                }
                            }
                        }
                    }
                    for (var i in info1.distance) {
                        info.distance[i] = info1.distance[i];
                    }
                    for (var i in info2.distance) {
                        if (typeof info.distance[i] == 'number') {
                            info.distance[i] += info2.distance[i];
                        }
                        else {
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
                        }
                        else {
                            info.onEquip.push(info1.onEquip);
                        }
                    }
                    if (info2.onEquip) {
                        if (Array.isArray(info2.onEquip)) {
                            info.onEquip = info.onEquip.concat(info2.onEquip);
                        }
                        else {
                            info.onEquip.push(info2.onEquip);
                        }
                    }
                    if (info1.onLose) {
                        if (Array.isArray(info1.onLose)) {
                            info.onLose = info.onLose.concat(info1.onLose);
                        }
                        else {
                            info.onLose.push(info1.onLose);
                        }
                    }
                    if (info2.onLose) {
                        if (Array.isArray(info2.onLose)) {
                            info.onLose = info.onLose.concat(info2.onLose);
                        }
                        else {
                            info.onLose.push(info2.onLose);
                        }
                    }
                    if (info.onEquip.length == 0) delete info.onEquip;
                    if (info.onLose.length == 0) delete info.onLose;
                    lib.card[name] = info;
                    lib.translate[name] = get.translation(cards[0].name, 'skill') + get.translation(cards[1].name, 'skill');
                    var str = lib.translate[cards[0].name + '_info'];
                    if (str[str.length - 1] == '.' || str[str.length - 1] == '。') {
                        str = str.slice(0, str.length - 1);
                    }
                    lib.translate[name + '_info'] = str + '；' + lib.translate[cards[1].name + '_info'];
                    try {
                        game.addVideo('newcard', null, {
                            name: name,
                            translate: lib.translate[name],
                            info: lib.translate[name + '_info'],
                            card: cards[0].name,
                            legend: true,
                        });
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
                player.gain(game.createCard({ name: name, suit: cards[0].suit, number: cards[0].number }), 'gain2');
            },
            ai: {
                order: 9.5,
                result: {
                    player: 1,
                },
            },
            "_priority": 0,
        },
        "qsmx_dingjun": {
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
                'step 0'
                player.addToExpansion(player, cards, 'give').gaintag.add(event.name);
                player.addTempSkill('qsmx_dingjun_temp');
                var targets = game.filterPlayer(current => current != player);
                var suits = cards.map(c => get.suit(c, player));
                for (var target of targets) {
                    target.addTempSkill('qsmx_dingjun_ban');
                    target.markAuto('qsmx_dingjun_ban', suits);
                }
            },
            subSkill: {
                temp: {
                    onremove: function (player, skill) {
                        var cards = player.getExpansions('qsmx_dingjun');
                        if (cards.length) player.gain(cards);
                    },
                    sub: true,
                    "_priority": 0,
                },
                ban: {
                    onremove: true,
                    charlotte: true,
                    mod: {
                        cardEnabled: function (card, player) {
                            if (player.getStorage('qsmx_dingjun_ban').contains(get.suit(card))) return false;
                        },
                        cardRespondable: function (card, player) {
                            if (player.getStorage('qsmx_dingjun_ban').contains(get.suit(card))) return false;
                        },
                        cardSavable: function (card, player) {
                            if (player.getStorage('qsmx_dingjun_ban').contains(get.suit(card))) return false;
                        },
                    },
                    mark: true,
                    marktext: "军",
                    intro: {
                        content: "本回合内不能使用或打出$的牌",
                    },
                    sub: true,
                    "_priority": 0,
                },
            },
            ai: {
                order: 13,
                result: {
                    player: 1,
                },
            },
            "_priority": 0,
        },
        "qsmx_guangxin": {
            trigger: {
                global: ["drawBegin", "judgeBegin"],
            },
            direct: true,
            filter: function () {
                return ui.cardPile.childNodes.length > 0;
            },
            content: function () {
                'step 0'
                player.chooseButton(['印卡：请选择要置于牌堆' + (trigger.bottom ? '底' : '顶') + '的牌（先选择的在上）', Array.from(ui.cardPile.childNodes)], [1, trigger.num || 1]);
                'step 1'
                if (result.bool) {
                    while (result.links.length) {
                        if (trigger.bottom) {
                            var card = result.links.shift();
                            ui.cardPile.removeChild(card);
                            ui.cardPile.appendChild(card);
                        }
                        else {
                            var card = result.links.pop();
                            ui.cardPile.removeChild(card);
                            ui.cardPile.insertBefore(card, ui.cardPile.firstChild)
                        }
                    }
                }
            },
            ai: {
                isLuckyStar: true,
            },
            "_priority": 0,
        },
        "qsmx_mingqu": {
            forced: true,
            silent: true,
            firstDo: true,
            mark: true,
            marktext: "冥",
            intro: {
                content: function (storage, player) {
                    return "记录了" + get.translation(storage) + "共" + get.cnNumber(storage.length) + "种颜色";
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
                    if (!_status.fixedCharacter) {
                        _status.fixedCharacter = {};
                    }
                    if (!_status.fixedCharacter[player.playerid]) {
                        _status.fixedCharacter[player.playerid] = [player.name1, player.name2];
                        _status.fixedCharacter[player.playerid] = _status.fixedCharacter[player.playerid].filter(c => c != undefined);
                    }
                }
            },
            onremove: function (player, skill) {
                player.addSkill(skill);
                player.changeCharacter(_status.fixedCharacter[player.playerid], false);
            },
            filter: function (event, player) {
                var name = [player.name, player.name1, player.name2]
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
                        if (player.getStorage('qsmx_mingqu').length >= 3) {
                            player.AntiResistanceDie();
                        } else {
                            player.unmarkSkill('qsmx_mingqu');
                        }
                    },
                    sub: true,
                    "_priority": 1,
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
                        var handcard = currentPhase.getCards('h');
                        var number_num = handcard.map(c => get.number(c)).length;
                        if (!event.nature) return false;
                        if (event.num !== number_num + 1) return false;
                        if (!event.card || !event.cards) return false;
                        return true;
                    },
                    content: function () {
                        var card = trigger.card;
                        player.markAuto('qsmx_mingqu', get.color(card));
                    },
                    "_priority": 0,
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
            "audioname2": {
                "key_shiki": "shiki_omusubi",
            },
            "_priority": 1,
        },
        "qsmx_guiwang": {
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
                'step 0'
                var next = player.judge(function (result) {
                    return get.color(result) == 'black' ? 2 : -2;
                });
                //next.noJudgeTrigger=true;
                'step 1'
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
                        if (player.countCards('h')) return false;
                        return true;
                    },
                    content: function () {
                        player.turnOver();
                    },
                    sub: true,
                    "_priority": 0,
                },
            },
            ai: {
                effect: function (card, player, target) {
                    if (card.name == 'tiesuo') {
                        return [1, 5];
                    }
                },
            },
            "_priority": 0,
        },
        "qsmx_tiemian": {
            audio: "ext:奇思妙想:2",
            trigger: {
                target: "useCardToTargeted",
            },
            forced: true,
            logTarget: "player",
            filter: function (event, player) {
                return event.card.name == 'sha';
            },
            content: function () {
                'step 0'
                player.judge(function (result) {
                    if (get.color(result) == 'black') return 2;
                    return -1;
                }).judge2 = function (result) {
                    return result.bool;
                };
                'step 1'
                if (result.bool) {
                    trigger.targets.remove(player);
                    trigger.getParent().triggeredTargets2.remove(player);
                    trigger.untrigger();
                }
            },
            ai: {
                effect: {
                    target: function (card, player, target, current, isLink) {
                        if (card.name == 'sha' && !isLink) return 0.5;
                    },
                },
            },
            "_priority": 0,
        },
        "qsmx_jijun": {
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
                player.addToExpansion(player, cards, 'give').gaintag.add(event.name);
                player.addTempSkill('qsmx_dingjun_temp');
            },
            subSkill: {
                temp: {
                    onremove: function (player, skill) {
                        var cards = player.getExpansions('qsmx_dingjun');
                        if (cards.length) player.gain(cards);
                    },
                    sub: true,
                    "_priority": 0,
                },
            },
            ai: {
                order: 1,
                result: {
                    player: 1,
                },
            },
            "_priority": 0,
        },
        "qsmx_tieqi": {
            forced: true,
            charlotte: true,
            trigger: {
                player: "phaseBefore",
            },
            filter: function (event, player) {
                return true;
            },
            content: function () {
                'step 0'
                var prompt = '【铁骑】：选择一名其他角色复原函数。'
                player.chooseTarget(prompt, lib.filter.notMe).set('ai', function (target) {
                    return -get.attitude(player, target);
                });
                'step 1'
                if (result.bool) {
                    var target = result.targets[0];
                    lib.skill.qsmx_hacker.resetFuction(target);
                }
            },
            "_priority": 0,
        },
        "qsmx_dinghhuo": {
            audio: 'nzry_dinghuo',
            enable: ["chooseToUse"],
            filterCard: function (card) {
                var type = get.type(card);
                var viewAsType = ['delay', 'trick', 'basic'];
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
                    case 'delay': name = 'huoshan'; break;
                    case 'trick': name = 'huoshaolianying'; break;
                    case 'basic': name = 'sha'; nature = 'fire'; break;
                }
                if (name) return { name: name, nature: nature };
                return null;
            },
            viewAsFilter: function (player) {
                if (player.countCards('hes')) return true;
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
                    "_priority": 0,
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
                    "_priority": 0,
                    sub: true,
                },
            },
            ai: {
                skillTagFilter: function (player) {
                    if (!player.countCards('hes')) return false;
                },
                respondSha: true,
                yingbian: function (card, player, targets, viewer) {
                    if (get.attitude(viewer, player) <= 0) return 0;
                    var base = 0, hit = false;
                    if (get.cardtag(card, 'yingbian_hit')) {
                        hit = true;
                        if (targets.some(target => {
                            return target.mayHaveShan(viewer) && get.attitude(viewer, target) < 0 && get.damageEffect(target, player, viewer, get.natureList(card)) > 0;
                        })) base += 5;
                    }
                    if (get.cardtag(card, 'yingbian_add')) {
                        if (game.hasPlayer(function (current) {
                            return !targets.contains(current) && lib.filter.targetEnabled2(card, player, current) && get.effect(current, card, player, player) > 0;
                        })) base += 5;
                    }
                    if (get.cardtag(card, 'yingbian_damage')) {
                        if (targets.some(target => {
                            return get.attitude(player, target) < 0 && (hit || !target.mayHaveShan(viewer) || player.hasSkillTag('directHit_ai', true, {
                                target: target,
                                card: card,
                            }, true)) && !target.hasSkillTag('filterDamage', null, {
                                player: player,
                                card: card,
                                jiu: true,
                            })
                        })) base += 5;
                    }
                    return base;
                },
                canLink: function (player, target, card) {
                    if (!target.isLinked() && !player.hasSkill('wutiesuolian_skill')) return false;
                    if (target.mayHaveShan() && !player.hasSkillTag('directHit_ai', true, {
                        target: target,
                        card: card,
                    }, true)) return false;
                    if (player.hasSkill('jueqing') || player.hasSkill('gangzhi') || target.hasSkill('gangzhi')) return false;
                    return true;
                },
                basic: {
                    useful: [5, 3, 1],
                    value: [5, 3, 1],
                },
                order: function (item, player) {
                    if (player.hasSkillTag('presha', true, null, true)) return 10;
                    if (game.hasNature(item, 'linked')) {
                        if (game.hasPlayer(function (current) {
                            return current != player && current.isLinked() && player.canUse(item, current, null, true) && get.effect(current, item, player, player) > 0 && lib.card.sha.ai.canLink(player, current, item);
                        }) && game.countPlayer(function (current) {
                            return current.isLinked() && get.damageEffect(current, player, player, get.nature(item)) > 0;
                        }) > 1) return 3.1;
                        return 3;
                    }
                    return 3.05;
                },
                result: {
                    target: function (player, target, card, isLink) {
                        var eff = function () {
                            if (!isLink && player.hasSkill('jiu')) {
                                if (!target.hasSkillTag('filterDamage', null, {
                                    player: player,
                                    card: card,
                                    jiu: true,
                                })) {
                                    if (get.attitude(player, target) > 0) {
                                        return -7;
                                    }
                                    else {
                                        return -4;
                                    }
                                }
                                return -0.5;
                            }
                            return -1.5;
                        }();
                        if (!isLink && target.mayHaveShan() && !player.hasSkillTag('directHit_ai', true, {
                            target: target,
                            card: card,
                        }, true)) return eff / 1.2;
                        return eff;
                    },
                },
                tag: {
                    respond: 1,
                    respondShan: 1,
                    damage: function (card) {
                        if (game.hasNature(card, 'poison')) return;
                        return 1;
                    },
                    natureDamage: function (card) {
                        if (game.hasNature(card, 'linked')) return 1;
                    },
                    fireDamage: function (card, nature) {
                        if (game.hasNature(card, 'fire')) return 1;
                    },
                    thunderDamage: function (card, nature) {
                        if (game.hasNature(card, 'thunder')) return 1;
                    },
                    poisonDamage: function (card, nature) {
                        if (game.hasNature(card, 'poison')) return 1;
                    },
                },
                value: 6,
            },
            "_priority": 0,
        },
        "qsmx_qianxun": {
            mod: {
                targetEnabled: function (card, player, target, now) {
                    if (card.name == 'shunshou' || card.name == 'lebu') return false;
                },
            },
            audio: "qianxun",
            "_priority": 0,
        },
        "qmsx_lianying": {
            audio: 'lianying',
            trigger: {
                player: "loseAfter",
                global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
            },
            frequent: true,
            filter: function (event, player) {
                if (player.countCards('h')) return false;
                var evt = event.getl(player);
                return evt && evt.player == player && evt.hs && evt.hs.length > 0;
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
                    "_priority": 0,
                    sub: true,
                },
            },
            ai: {
                threaten: 0.8,
                effect: {
                    target: function (card) {
                        if (card.name == 'guohe' || card.name == 'liuxinghuoyu') return 0.5;
                    },
                },
                noh: true,
                skillTagFilter: function (player, tag) {
                    if (tag == 'noh') {
                        if (player.countCards('h') != 1) return false;
                    }
                },
            },
            "_priority": 0,
        },
        "qsmx_hunyou": {
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
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_sunce")) {
                    player.removeSkill(skill);
                } else {
                    if (!_status.fixedCharacter) {
                        _status.fixedCharacter = {};
                    }
                    if (!_status.fixedCharacter[player.playerid]) {
                        _status.fixedCharacter[player.playerid] = [player.name1, player.name2];
                        _status.fixedCharacter[player.playerid] = _status.fixedCharacter[player.playerid].filter(c => c != undefined);
                    }
                }
            },
            onremove: function (player, skill) {
                player.addSkill(skill);
                player.changeCharacter(_status.fixedCharacter[player.playerid], false);
            },
            filter: function (event, player) {
                var name = [player.name, player.name1, player.name2]
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
                        player.addSkill('reyingzi');
                        player.addSkill('hongyan');
                        var evt = trigger.getParent();
                        if (evt.name == 'damage' && (evt.card || evt.cards) && get.color(evt.card) == 'red' && get.is.ordinaryCard(evt.card)) {
                            player.changeHp(-player.hp, false);
                        } else {
                            player.changeHp(1 - player.hp, false);
                        }
                        player.addTempSkill('qianxing');
                        player.addTempSkill('mianyi');
                    },
                    "_priority": 0,
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
                    "_priority": 0,
                    sub: true,
                    popup: false,
                },
            },
            ai: {
                maxHpResistance: true,
                DieResistance: true,
            },
            init: (player, skill) => player.storage[skill] = [],
            popup: false,
            "audioname2": {
                "key_shiki": "shiki_omusubi",
            },
            "_priority": 1,
        },
        "qsmx_jiang": {
            audio: "jiang",
            preHidden: true,
            audioname: ["sp_lvmeng", "re_sunben", "re_sunce"],
            mod: {
                aiValue(player, card, num) {
                    if (card.name === 'zhangba') {
                        return 114154
                    }
                },
                cardUsable: function (card, player) {
                    const color = get.color(card, player);
                    //颜色为"unsure"时放行
                    if (color == 'unsure' || color == 'red') return Infinity;
                },
                ignoredHandcard: function (card, player) {
                    if (get.color(card, player) == 'red') {
                        return true;
                    }
                },
                cardDiscardable: function (card, player, name) {
                    if (name == 'phaseDiscard' && get.color(card, player) == 'red') return false;
                },
            },
            trigger: {
                player: ["loseAfter"],
            },
            filter: function (event, player) {
                var cards = event.cards;
                var colors = cards.map(c => get.color(c, player));
                if (colors.includes('red')) return true;
            },
            group: ['qsmx_jiang_directHit'],
            locked: false,
            frequent: true,
            content: function () {
                var cards = trigger.cards;
                var redCards = cards.filter(c => get.color(c, player) == 'red');
                player.draw(redCards.length);
                var length = redCards.length;
                while (length) {
                    length--;
                    player.useCard({ name: 'jiu' }, player);
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
                        return get.color(card, player) == 'red';
                    },
                    logTarget: "target",
                    forced: true,
                    preHidden: true,
                    async content(event, trigger, player) {
                        trigger.directHit.addArray(trigger.targets);
                    },
                    "_priority": 0,
                    sub: true,
                },
            },
            ai: {
                jiuSustain: true,
                effect: {
                    target: function (card, player, target) {
                        if (get.color(card) == 'red') return [1, 0.6];
                    },
                    player: function (card, player, target) {
                        if (get.color(card) == 'red') return [1, 1];
                    },
                },
            },
            "_priority": 0,
        },
        "qsmx_taoni": {
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
                'step 0'
                'step 1'
                var prompt = '【讨逆】：你可以选择一名其他角色作为讨伐对象。'
                var toSortPlayers = game.players.filter(c => c != player);
                var next = player.chooseButton([1, 1]).set('createDialog', [prompt,
                    [toSortPlayers.map(i => `${i.playerid}|${i.name}`), (item, type, position, noclick, node) => {
                        const info = item.split('|'), _item = item;
                        const playerid = parseInt(info[0]);
                        item = info[1];
                        if (node) {
                            node.classList.add('button');
                            node.classList.add('player');
                            node.style.display = '';
                        }
                        else {
                            node = ui.create.div('.button.character', position);
                        }
                        node._link = item;
                        node.link = item;

                        const func = function (node, item) {
                            if (item != 'unknown') node.setBackground(item, 'character');
                            if (node.node) {
                                node.node.name.remove();
                                node.node.hp.remove();
                                node.node.group.remove();
                                node.node.intro.remove();
                                if (node.node.replaceButton) node.node.replaceButton.remove();
                            }
                            node.node = {
                                name: ui.create.div('.name', node),
                                group: ui.create.div('.identity', node),
                                intro: ui.create.div('.intro', node),
                            };
                            const currentPlayer = game.players.find(current => current.playerid == playerid);
                            const infoitem = [currentPlayer.sex, currentPlayer.group, `${currentPlayer.hp}/${currentPlayer.maxHp}/${currentPlayer.hujia}`];
                            node.node.name.innerHTML = get.slimName(item);
                            if (lib.config.buttoncharacter_style == 'default' || lib.config.buttoncharacter_style == 'simple') {
                                if (lib.config.buttoncharacter_style == 'simple') {
                                    node.node.group.style.display = 'none';
                                }
                                node.classList.add('newstyle');
                                node.node.name.dataset.nature = get.groupnature(get.bordergroup(infoitem));
                                node.node.group.dataset.nature = get.groupnature(get.bordergroup(infoitem), 'raw');
                            }
                            node.node.name.style.top = '8px';
                            if (node.node.name.querySelectorAll('br').length >= 4) {
                                node.node.name.classList.add('long');
                                if (lib.config.buttoncharacter_style == 'old') {
                                    node.addEventListener('mouseenter', ui.click.buttonnameenter);
                                    node.addEventListener('mouseleave', ui.click.buttonnameleave);
                                }
                            }
                            node.node.intro.innerHTML = lib.config.intro;
                            node.node.group.style.backgroundColor = get.translation(`${get.bordergroup(infoitem)}Color`);
                        };
                        node.refresh = func;
                        node.refresh(node, item);

                        node.link = _item;
                        return node;
                    }]
                ]);
                next.set('ai', function (button) {
                    var link = button.link;
                    var target = game.players.find(c => c.playerid == link.split('|')[0]);
                    return -get.attitude(player, target);
                })
                next.includeOut = true;
                'step 2'
                if (result.bool) {
                    player.$skill(get.translation(event.name));
                    var links = result.links;
                    for (let index = 0; index < links.length; index++) {
                        const link = links[index];
                        var targets = game.players.filter(c => c.playerid == link.split('|')[0]);
                        for (let index = 0; index < targets.length; index++) {
                            const target = targets[index];
                            target.resetFuction();
                            var next = target.AntiResistanceDie();
                            next.includeOut = true;
                            game.log(target, "被", player, "歼灭");
                        }
                    }
                }
                'step 3'
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
                        return (get.name(card) == 'juedou' || (get.color(card) == 'red' && get.name(card) == 'sha'));
                    },
                    content: function () {
                        trigger.cancel();
                    },
                    sub: true,
                    "_priority": 0,
                    popup: false,
                },
            },
            ai: {
                effect: function (card, player, target) {
                    if (get.type(card) == 'delay') {
                        return [1, 5];
                    }
                },
            },
            "_priority": 0,
        },
        "qsmx_kamisha": {
            equipSkill: true,
            trigger: {
                player: "useCard1",
            },
            filter: function (event, player) {
                if (get.tag(event.card, 'damage')) return true;
            },
            audio: "ext:奇思妙想:true",
            check: function (event, player) {
                var eff = 0;
                for (var i = 0; i < event.targets.length; i++) {
                    var target = event.targets[i];
                    var eff1 = get.damageEffect(target, player, player);
                    var eff2 = get.damageEffect(target, player, player, 'kami');
                    eff += eff2;
                    eff -= eff1;
                }
                return eff >= 0;
            },
            "prompt2": function (event, player) {
                return '将' + get.translation(event.card) + '改为神属性';
            },
            content: function () {
                game.setNature(trigger.card, 'kami');
                if (get.itemtype(trigger.card) == 'card') {
                    var next = game.createEvent('shensha_clear');
                    next.card = trigger.card;
                    event.next.remove(next);
                    trigger.after.push(next);
                    next.setContent(function () {
                        game.setNature(trigger.card, []);
                    });
                }
            },
            "_priority": -25,
        },
        "qsmx_shishen": {
            silent: true,
            group: ["qsmx_shishen_judgeFixing", "qsmx_shishen_roundStart"],
            trigger: {
                global: ["judgeCancelled"],
            },
            filter: function (event, player) {
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_longinus")) return false;
                return true;
            },
            init: function (player, skill) {
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_longinus")) player.removeSkill(skill);
            },
            content: function () {
                'step 0'
                'step 1'
                var prompt = '【弑神】：你可以令一名其他角色死亡。'
                var toSortPlayers = game.players.filter(c => c != player);
                var next = player.chooseButton([1, 1]).set('createDialog', [prompt,
                    [toSortPlayers.map(i => `${i.playerid}|${i.name}`), (item, type, position, noclick, node) => {
                        const info = item.split('|'), _item = item;
                        const playerid = parseInt(info[0]);
                        item = info[1];
                        if (node) {
                            node.classList.add('button');
                            node.classList.add('player');
                            node.style.display = '';
                        }
                        else {
                            node = ui.create.div('.button.character', position);
                        }
                        node._link = item;
                        node.link = item;

                        const func = function (node, item) {
                            if (item != 'unknown') node.setBackground(item, 'character');
                            if (node.node) {
                                node.node.name.remove();
                                node.node.hp.remove();
                                node.node.group.remove();
                                node.node.intro.remove();
                                if (node.node.replaceButton) node.node.replaceButton.remove();
                            }
                            node.node = {
                                name: ui.create.div('.name', node),
                                group: ui.create.div('.identity', node),
                                intro: ui.create.div('.intro', node),
                            };
                            const currentPlayer = game.players.find(current => current.playerid == playerid);
                            const infoitem = [currentPlayer.sex, currentPlayer.group, `${currentPlayer.hp}/${currentPlayer.maxHp}/${currentPlayer.hujia}`];
                            node.node.name.innerHTML = get.slimName(item);
                            if (lib.config.buttoncharacter_style == 'default' || lib.config.buttoncharacter_style == 'simple') {
                                if (lib.config.buttoncharacter_style == 'simple') {
                                    node.node.group.style.display = 'none';
                                }
                                node.classList.add('newstyle');
                                node.node.name.dataset.nature = get.groupnature(get.bordergroup(infoitem));
                                node.node.group.dataset.nature = get.groupnature(get.bordergroup(infoitem), 'raw');
                            }
                            node.node.name.style.top = '8px';
                            if (node.node.name.querySelectorAll('br').length >= 4) {
                                node.node.name.classList.add('long');
                                if (lib.config.buttoncharacter_style == 'old') {
                                    node.addEventListener('mouseenter', ui.click.buttonnameenter);
                                    node.addEventListener('mouseleave', ui.click.buttonnameleave);
                                }
                            }
                            node.node.intro.innerHTML = lib.config.intro;
                            node.node.group.style.backgroundColor = get.translation(`${get.bordergroup(infoitem)}Color`);
                        };
                        node.refresh = func;
                        node.refresh(node, item);

                        node.link = _item;
                        return node;
                    }]
                ]);
                next.set('ai', function (button) {
                    var link = button.link;
                    var target = game.players.find(c => c.playerid == link.split('|')[0]);
                    return -get.attitude(player, target);
                })
                next.includeOut = true;
                'step 2'
                if (result.bool) {
                    player.$skill(get.translation(event.name));
                    var links = result.links;
                    for (let index = 0; index < links.length; index++) {
                        const link = links[index];
                        var targets = game.players.filter(c => c.playerid == link.split('|')[0]);
                        for (let index = 0; index < targets.length; index++) {
                            const target = targets[index];
                            target.resetFuction();
                            var next = target.AntiResistanceDie();
                            next.includeOut = true;
                            game.log("曾不可一世的", target, "被", player, "击落");
                        }
                    }
                }
                'step 3'
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
                        var tranR = get.translation(resultCard.name, 'info');
                        var tranT = get.translation(Card[0].name, 'info');
                        var tranB = get.translation(bottomCard[0].name, 'info');
                        if (tranR.includes('伤害') && tranT.includes('伤害') && tranB.includes('伤害')) {
                            trigger.cancel();
                        } else {
                            player.gain(complexCard);
                        }
                    },
                    sub: true,
                    "_priority": 0,
                    popup: false,
                    ai: {
                        effect: {
                            target(card, player, target) {
                                if (get.type(card) == 'delay') {
                                    return [1, -1.5, 42, 0];
                                }
                            },
                            player(card, player, target) {
                                if (get.type(card) == 'delay') {
                                    return [1, 42];
                                }
                            },
                        },
                    },
                    "audioname2": {
                        "key_shiki": "shiki_omusubi",
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
                        player.damage('unreal');
                    },
                    sub: true,
                    "_priority": 0,
                    popup: false,
                    "audioname2": {
                        "key_shiki": "shiki_omusubi",
                    },
                },
            },
            popup: false,
            forced: true,
            "audioname2": {
                "key_shiki": "shiki_omusubi",
            },
            "_priority": 1,
        },
        "spear_of_longinus": {
            trigger: {
                player: "useCardToPlayered",
            },
            equipSkill: true,
            forced: true,
            locked: true,
            mod: {
                cardUsable(card, player, num) {
                    if (card.name == 'sha') return Infinity;
                },
            },
            filter: function (event, player) {
                return player != event.target && event.targets.length == 1 && !event.target.hasSkill('spear_of_longinus_ban');
            },
            async content(event, trigger, player) {
                var target = trigger.target
                target.addTempSkill('spear_of_longinus_ban');
                const judgeEvent = player.judge(card => {
                    switch (get.type(card)) {
                        default:
                            if (get.tag(card, 'discard')) return target.countCards('hesj');
                            if (get.tag(card, 'gain')) return 2 * target.countCards('hesj');
                            return -0.5;
                        case 'delay':
                            if (target.isDisabledJudge()) {
                                return 0.5;
                            } else {
                                return 2;
                            }
                        case 'equip':
                            switch (get.subtype(card)) {
                                case 'equip1':
                                    if (target.isDisabled('equip1')) {
                                        return -0.5;
                                    } else {
                                        return 2;
                                    }
                                case 'equip2':
                                    if (target.isDisabled('equip2')) {
                                        return -0.5;
                                    } else {
                                        return 2;
                                    }
                                case 'equip3':
                                    if (target.isDisabled('equip3')) {
                                        return -0.5;
                                    } else {
                                        return 2;
                                    }
                                case 'equip4':
                                    if (target.isDisabled('equip4')) {
                                        return -0.5;
                                    } else {
                                        return 2;
                                    }
                                case 'equip5':
                                    if (target.isDisabled('equip5')) {
                                        return -0.5;
                                    } else {
                                        return 2;
                                    }
                            }
                    }
                    return -0.5;
                });
                judgeEvent.judge2 = result => result.bool;
                const { result: { bool, card } } = await judgeEvent;
                if (bool) {
                    switch (get.type(card)) {
                        default:
                            if (get.tag(card, 'discard')) target.discard(target.getCards('hejs'));
                            if (get.tag(card, 'gain')) player.gain(target.getCards('hejs'));
                        case 'delay':
                            if (!target.isDisabledJudge()) target.disableJudge();
                            player.executeDelayCardEffect(get.name(card));
                        case 'equip':
                            switch (get.subtype(card)) {
                                case 'equip1':
                                    if (!target.isDisabled('equip1')) target.disableEquip('equip1');
                                    break;
                                case 'equip2':
                                    if (!target.isDisabled('equip2')) target.disableEquip('equip2');
                                    break;
                                case 'equip3':
                                    if (!target.isDisabled('equip3')) target.disableEquip('equip3');
                                    break;
                                case 'equip4':
                                    if (!target.isDisabled('equip4')) target.disableEquip('equip4');
                                    break;
                                case 'equip5':
                                    if (!target.isDisabled('equip5')) target.disableEquip('equip5');
                                    break;
                            }
                    }
                }
            },
            subSkill: {
                ban: {
                    equipSkill: true,
                    mod: {
                        cardEnabled: function () { return false },
                        cardSavable: function () { return false },
                        cardRespondable: function () { return false },
                    },
                    intro: {
                        content: "不能使用或打出牌且防具技能无效直到回合结束",
                    },
                    ai: {
                        "unequip2": true,
                    },
                    mark: true,
                    "_priority": -25,
                    sub: true,
                },
            },
            "_priority": -25,
        },
        "qsmx_longinusSkill": {
            audio: "ext:奇思妙想:2",
            trigger: {
                global: "phaseBefore",
                player: "enterGame",
            },
            forced: true,
            silent: true,
            filter(event, player) {
                return player.hasEquipableSlot(1) && !player.getEquips('longinus').length;
            },
            init: function (player, skill) {
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_longinus")) player.removeSkill(skill);
            },
            content: function () {
                var card = game.createCard2('longinus', 'spade', '13');
                player.$gain2(card, false);
                game.delayx();
                player.equip(card);
            },
            mod: {
                canBeGained(card, source, player) {
                    if (player.getEquips('longinus').includes(card)) return false;
                },
                canBeDiscarded(card, source, player) {
                    if (player.getEquips('longinus').includes(card)) return false;
                },
                canBeReplaced(card, player) {
                    if (player.getEquips('longinus').includes(card)) return false;
                },
                cardname(card) {
                    if (get.subtype(card, false) == 'equip1') return 'sha';
                },
                cardnature(card) {
                    if (get.subtypes(card, false).includes('equip1')) return false;
                },
                cardDiscardable(card, player) {
                    if (player.getEquips('longinus').includes(card)) return false;
                },
                cardEnabled2(card, player) {
                    if (player.getEquips('longinus').includes(card)) return false;
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
                        if (event.name == 'disableEquip') return (event.slots.includes('equip1'));
                        var cards = player.getEquips('longinus');
                        return event.cards.some(card => cards.includes(card));
                    },
                    content() {
                        if (trigger.name == 'lose') {
                            trigger.cards.removeArray(player.getEquips('longinus'));
                        }
                        else {
                            while (trigger.slots.includes('equip1')) trigger.slots.remove('equip1');
                        }
                    },
                    sub: true,
                    "_priority": 0,
                    "audioname2": {
                        "key_shiki": "shiki_omusubi",
                    },
                },
            },
            "audioname2": {
                "key_shiki": "shiki_omusubi",
            },
            popup: false,
            "_priority": 1,
        },
        "qsmx_zhouqu": {
            forced: true,
            silent: true,
            firstDo: true,
            group: ["qsmx_zhouqu_damage", "qsmx_zhouqu_characterCard"],
            trigger: {
                global: "gameStart",
                player: "enterGame",
            },
            init: function (player, skill) {
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_longinus")) {
                    player.removeSkill(skill);
                } else {
                    if (!_status.fixedCharacter) {
                        _status.fixedCharacter = {};
                    }
                    if (!_status.fixedCharacter[player.playerid]) {
                        _status.fixedCharacter[player.playerid] = [player.name1, player.name2];
                        _status.fixedCharacter[player.playerid] = _status.fixedCharacter[player.playerid].filter(c => c != undefined);
                    }
                }
            },
            onremove: function (player, skill) {
                player.addSkill(skill);
                player.changeCharacter(_status.fixedCharacter[player.playerid], false);
            },
            filter: function (event, player) {
                var name = [player.name, player.name1, player.name2]
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
                        const judgeEvent = player.judge(card => {
                            if (get.color(card) == 'black') return 2;
                            return -0.5;
                        });
                        judgeEvent.judge2 = result => result.bool;
                        const { result: { bool } } = await judgeEvent;
                        if (bool) {
                            trigger.player.loseHp();
                        }
                    },
                    sub: true,
                    popup: false,
                    "_priority": 1,
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
                        var filterplayers = players.filter(c => (c.isTurnedOver() == player.isTurnedOver()) && (c.isLinked() == player.isLinked()))
                        filterplayers.forEach(player =>
                            player.loseHp()
                        )
                        var cards = get.cards(1, false);
                        player.showCards(cards);
                        if (players.length == get.number(cards[0]) + 1) {
                            player.AntiResistanceDie();
                        }
                    },
                    "_priority": 0,
                    sub: true,
                    popup: false,
                    "audioname2": {
                        "key_shiki": "shiki_omusubi",
                    },
                },
            },
            ai: {
                HpResistance: true,
                maxHpResistance: true,
                DieResistance: true,
            },
            popup: false,
            "audioname2": {
                "key_shiki": "shiki_omusubi",
            },
            "_priority": 1,
        },
        "qsmx_chaos": {
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
                        'step 0'
                        var targets = trigger.targets;
                        var length = 0;
                        length = length + targets.length;
                        targets.length = 0;
                        targets.push(game.players.randomGet(targets.length));
                        'step 1'
                        trigger.player.line(targets);
                    },
                    sub: true,
                    "_priority": 0,
                },
            },
            "_priority": 0,
        },
        "qsmx_zaozhi": {
            mod: {
                ignoredHandcard: function (card, player) {
                    if (get.name(card) == 'qsmx_paper') {
                        return true;
                    }
                },
                cardDiscardable: function (card, player, name) {
                    if (name == 'phaseDiscard' && get.name(card) == 'qsmx_paper') return false;
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
                'step 0'
                event.count = event.cards.length;
                event.GainCard = [];
                'step 1'
                event.GainCard.push(game.createCard({ name: 'qsmx_paper', number: null, suit: 'none' }));
                event.count--;
                'step 2'
                if (event.count > 0) event.goto(1);
                'step 3'
                player.gain(event.GainCard);
            },
            ai: {
                order: 1,
                result: {
                    player: 1,
                },
                threaten: 1.5,
            },
            "_priority": 0,
        },
        "qsmx_cycle": {
            audio: "ext:奇思妙想:2",
            trigger: {
                global: "pileWashed",
            },
            forced: true,
            content: function () {
                player.die();
            },
            "_priority": 0,
        },
        "qsmx_test": {
            trigger: {
                player: ['changeHpEnd']
            },
            forced: true,
            filter: function (event, player) {
                return player.hp != 1;
            },
            content: function () {
                player.changeHp(1 - player.hp);
            }
        },
        "qsmx_shiyuan": {
            audio: "ext:奇思妙想:2",
            trigger: {
                global: ["loseEnd"],
            },
            forced: true,
            silent: true,
            filter: function (event, player) {
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_SevenGod")) return false;
                return true;
            },
            init: function (player, skill) {
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_SevenGod")) player.removeSkill(skill);
            },
            marktext: "⑦",
            intro: {
                name: "⑦(七重/噬元)",
                "name2": "⑦",
                content: "mark",
            },
            content: function () {
                'step 0'
                cards = trigger.cards;
                var num = 0;
                for (let index = 0; index < cards.length; index++) {
                    const card = cards[index];
                    if (typeof get.number(card) == 'number') num = num + get.number(card);
                }
                player.addMark('qsmx_shiyuan', num);
                'step 1'
                if (player.countMark('qsmx_shiyuan') >= ui.cardPile.childNodes.length) {
                    player.removeMark('qsmx_shiyuan', ui.cardPile.childNodes.length);
                    game.washCard();
                }
            },
            ai: {
                threaten: 1.5,
                effect: {
                    target(card, player, target, current) {
                        if (get.type(card) == 'equip' && !get.cardtag(card, 'gifts')) return [1, 0.1];
                    },
                },
            },
            popup: false,
            "_priority": 1,
        },
        "qsmx_shenwei": {
            trigger: {
                global: ["phaseUseBegin"],
            },
            init: function (player, skill) {
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_SevenGod")) player.removeSkill(skill);
            },
            filter: function (event, player) {
                return event.player.countCards('h') > event.player.hp && ((get.mode() == 'identity' && get.attitude(player, event.player) < 0) || (get.mode() != 'identity' && event.player.isEnemyOf(player)));
            },
            forced: true,
            logTarget: "player",
            content: function () {
                var handcard = trigger.player.getCards('h');
                var cards = handcard.randomGets(handcard.length - trigger.player.hp);
                trigger.player.loseToDiscardpile(cards, ui.discardPile);
            },
            "_priority": 0,
        },
        "qsmx_weimu": {
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
                    if (get.type(card) == 'delay') return false;
                },
            },
            init: function (player, skill) {
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_jiaxu")) {
                    player.removeSkill(skill);
                } else {
                    if (!_status.fixedCharacter) {
                        _status.fixedCharacter = {};
                    }
                    if (!_status.fixedCharacter[player.playerid]) {
                        _status.fixedCharacter[player.playerid] = [player.name1, player.name2];
                        _status.fixedCharacter[player.playerid] = _status.fixedCharacter[player.playerid].filter(c => c != undefined);
                    }
                }
            },
            onremove: function (player, skill) {
                player.addSkill(skill);
                player.changeCharacter(_status.fixedCharacter[player.playerid], false);
            },
            filter: function (event, player) {
                var name = [player.name, player.name1, player.name2]
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
                "damageBegin4": {
                    forced: true,
                    audio: 'reweimu',
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
                        damageEvent.trigger('damageEnd');
                    },
                    ai: {
                        effect: {
                            target: function (card, player, target) {
                                if (target == _status.currentPhase && get.tag(card, 'damage')) return [0, 1];
                            },
                        },
                    },
                    sub: true,
                    popup: false,
                    "_priority": 1,
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
                        game.log(player, "的帷幕被", trigger.card, "终结")
                        player.AntiResistanceDie();
                    },
                    sub: true,
                    popup: false,
                    "_priority": 1,
                    "audioname2": {
                        "tgtt_tgxstusu": "tgtt_srtsjieshi",
                        "tgtt_tgdssongrui": "tgtt_srtsjieshi",
                    },
                },
            },
            ai: {
                HpResistance: true,
                maxHpResistance: true,
                DieResistance: true,
                effect: {
                    target: function (card, player, target) {
                        if (get.tag(card, 'damage') && _status.currentPhase != target) return [1, 5];
                    },
                    player: function (card, player, target) {
                    },
                },
            },
            popup: false,
            "audioname2": {
                "key_shiki": "shiki_omusubi",
                "tgtt_tgxstusu": "tgtt_srtsjieshi",
                "tgtt_tgdssongrui": "tgtt_srtsjieshi",
            },
            "_priority": 1,
        },
        "qsmx_yanmie": {
            audio: "ext:奇思妙想:2",
            trigger: {
                global: ["gainEnd", "loseEnd", "changeHpEnd"],
            },
            forceOut: true,
            forceDie: true,
            filter: function (event, player) {
                if (event.name == 'changeHp' && event.num > 0) return false;
                return event.player.isIn();
            },
            init: function (player, skill) {
                var name = [player.name, player.name1, player.name2]
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
                'step 0'
                var originalMarknum = player.countMark('qsmx_yanmie');
                var lowMultiple = Math.floor(originalMarknum / 42) * 42;
                var upperMultiple = lowMultiple + 42;
                event.triggerMultiple = upperMultiple;
                if (event.triggerMultiple % 42 === 0 && lowMultiple !== 0) {
                    event.triggerMultiple = lowMultiple;
                }
                'step 1'
                if (trigger.name !== 'changeHp') {
                    player.addMark('qsmx_yanmie', trigger.cards.length, true);
                } else {
                    player.addMark('qsmx_yanmie', -trigger.num, true);
                }
                'step 2'
                if (player.countMark('qsmx_yanmie') > event.triggerMultiple) {
                    event.trigger('qsmx_yanmie_active')
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
                        var name = [player.name, player.name1, player.name2]
                        if (!name.includes("qsmx_jiaxu")) return false;
                        return true;
                    },
                    init: function (player, skill) {
                        var name = [player.name, player.name1, player.name2]
                        if (!name.includes("qsmx_jiaxu")) player.removeSkill(skill);
                    },
                    content: function () {
                        'step 0'
                        ui.clear();
                        var counts = Math.floor(player.countMark('qsmx_yanmie') / 42);
                        var prompt = '【湮灭】：你可以令至多' + get.cnNumber(counts) + '名其他角色死亡。';
                        var toSortPlayers = game.players.filter(c => c != player);
                        var next = player.chooseButton([1, counts]).set('createDialog', [prompt,
                            [toSortPlayers.map(i => `${i.playerid}|${i.name}`), (item, type, position, noclick, node) => {
                                const info = item.split('|'), _item = item;
                                const playerid = parseInt(info[0]);
                                item = info[1];
                                if (node) {
                                    node.classList.add('button');
                                    node.classList.add('player');
                                    node.style.display = '';
                                }
                                else {
                                    node = ui.create.div('.button.character', position);
                                }
                                node._link = item;
                                node.link = item;

                                const func = function (node, item) {
                                    if (item != 'unknown') node.setBackground(item, 'character');
                                    if (node.node) {
                                        node.node.name.remove();
                                        node.node.hp.remove();
                                        node.node.group.remove();
                                        node.node.intro.remove();
                                        if (node.node.replaceButton) node.node.replaceButton.remove();
                                    }
                                    node.node = {
                                        name: ui.create.div('.name', node),
                                        group: ui.create.div('.identity', node),
                                        intro: ui.create.div('.intro', node),
                                    };
                                    const currentPlayer = game.players.find(current => current.playerid == playerid);
                                    const infoitem = [currentPlayer.sex, currentPlayer.group, `${currentPlayer.hp}/${currentPlayer.maxHp}/${currentPlayer.hujia}`];
                                    node.node.name.innerHTML = get.slimName(item);
                                    if (lib.config.buttoncharacter_style == 'default' || lib.config.buttoncharacter_style == 'simple') {
                                        if (lib.config.buttoncharacter_style == 'simple') {
                                            node.node.group.style.display = 'none';
                                        }
                                        node.classList.add('newstyle');
                                        node.node.name.dataset.nature = get.groupnature(get.bordergroup(infoitem));
                                        node.node.group.dataset.nature = get.groupnature(get.bordergroup(infoitem), 'raw');
                                    }
                                    node.node.name.style.top = '8px';
                                    if (node.node.name.querySelectorAll('br').length >= 4) {
                                        node.node.name.classList.add('long');
                                        if (lib.config.buttoncharacter_style == 'old') {
                                            node.addEventListener('mouseenter', ui.click.buttonnameenter);
                                            node.addEventListener('mouseleave', ui.click.buttonnameleave);
                                        }
                                    }
                                    node.node.intro.innerHTML = lib.config.intro;
                                    node.node.group.style.backgroundColor = get.translation(`${get.bordergroup(infoitem)}Color`);
                                };
                                node.refresh = func;
                                node.refresh(node, item);

                                node.link = _item;
                                return node;
                            }]
                        ]);
                        next.set('ai', function (button) {
                            var link = button.link;
                            var target = game.findPlayer(c => c.playerid == link.split('|')[0]);
                            return -get.attitude(player, target);
                        })
                        next.includeOut = true;
                        'step 1'
                        if (result.bool) {
                            player.$skill(get.translation(event.name));
                            var links = result.links;
                            for (let index = 0; index < links.length; index++) {
                                const link = links[index];
                                var targets = game.players.filter(c => c.playerid == link.split('|')[0]);
                                player.removeMark('qsmx_yanmie', 42 * targets.length);
                                for (let index = 0; index < targets.length; index++) {
                                    const target = targets[index];
                                    target.resetFuction();
                                    var next = target.AntiResistanceDie();
                                    next.includeOut = true;
                                    game.log(target, "被", player, "湮灭");
                                }
                            }
                        }
                        'step 2'
                        game.delayx();
                    },
                    sub: true,
                    forced: true,
                    popup: false,
                    "_priority": 1,
                },
            },
            popup: false,
            "_priority": 1,
        },
        "qsmx_zhuilie": {
            audio: 'spzhuilie',
            filterTarget: function (card, player, target) {
                if (player == target) return false;
                return true;
            },
            selectTarget: 1,
            enable: "phaseUse",
            filterCard: function (card) {
                return get.subtype(card) == 'equip1' || get.subtype(card) == 'equip3' || get.subtype(card) == 'equip4';
            },
            selectCard: [0, 1],
            content: function () {
                if (!cards.length) {
                    player.loseHp();
                }
                var distanceTo = player.distanceTo(target);
                target.damage(distanceTo, 'nocard');
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
            "_priority": 0,
        },
        "qsmx_anjian": {
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
            "_priority": 0,
        },
        "qsmx_leijie": {
            audio: "ext:奇思妙想/resource/audio/skill/:1",
            trigger: {
                player: ["phaseJudgeBegin"],
            },
            direct: true,
            filter: function (event, player) {
                return true;
            },
            content: function () {
                'step 0'
                player.chooseTarget('令一名角色进行反转【闪电】判定', lib.filter.notMe).set('ai', function (target) {
                    return -get.attitude(player, target);
                });
                'step 1'
                if (result.bool) {
                    var target = result.targets[0];
                    player.logSkill('qmsx_leijie', target);
                    game.playAudio('ext:奇思妙想/resource/audio/skill/qsmx_leijie1.mp3');
                    var next = target.executeDelayCardEffect('shandian');
                    next.judge = card => -lib.card.shandian.judge(card) - 4;
                    next.judge2 = result => !lib.card.shandian.judge2(result);
                }
            },
            group: ['qsmx_leijie_check'],
            subSkill: {
                'check': {
                    trigger: {
                        global: "judgeFixing",
                    },
                    silent: true,
                    filter(event, player) {
                        if (event.result.bool) return false;
                        return event.getParent('qsmx_leijie').name == 'qsmx_leijie' && event.getParent('qsmx_leijie')?.player == player;
                    },
                    async content(event, trigger, player) {
                        player.draw();
                        player.useSkill('qsmx_leijie');
                    },
                    "_priority": 0,
                }
            },
            "_priority": 0,
        },
        "qsmx_shajue": {
            trigger: {
                player: "shaEnd",
            },
            filter: function (event, player) {
                return true;
            },
            content: function () {
                player.useCard({ name: 'sha' }, trigger.target);
            },
            "_priority": 0,
        },
        "qsmx_mishen": {
            init: function (player, skill) {
                var name = [player.name, player.name1, player.name2]
                if (name.includes("qsmx_matara_okina")) {
                    var winners = player.getFriends();
                    game.over(player == game.me || winners.includes(game.me));
                } else {
                    player.skills.remove(skill);
                }
            },
            "_priority": 0,
        },
        "qsmx_chunhua": {
            init: function (player, skill) {
                var name = [player.name, player.name1, player.name2];
                if (name.includes("qsmx_junko")) {
                } else {
                    player.skills.remove(skill);
                }
            },
            trigger: {
                global: ['gameStart']
            },
            forced: true,
            silent: true,
            content(event, player, triggername) {
                ui.backgroundMusic.src = lib.assetURL + 'extension/奇思妙想/resource/audio/background/ピュアヒューリーズ　～ 心の在処.mp3';
                _status.forceWin = [player];
                player.initControlResistance();
                player.initSkillResistance();
                player.initmaxHpLocker(player.maxHp);
            },
            "_priority": 1e114514,
        },
        "qsmx_cizhang": {
            forced: true,
            silent: true,
            trigger: {
                global: ["roundStart"]
            },
            filter: function (event, player) {
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_mimidog")) return false;
                return true;
            },
            init: function (player, skill) {
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_mimidog")) {
                    player.removeSkill(skill);
                } else {
                    if (!_status.fixedCharacter) {
                        _status.fixedCharacter = {};
                    }
                    if (!_status.fixedCharacter[player.playerid]) {
                        _status.fixedCharacter[player.playerid] = [player.name1, player.name2];
                        _status.fixedCharacter[player.playerid] = _status.fixedCharacter[player.playerid].filter(c => c != undefined);
                    }
                }
            },
            content: function () {
                'step 0'
                player.damage(Math.max(1, player.countDisabledSlot()));
                'step 1'
                var prompt = '【持杖】：你可以令任意名武将牌上的技能数不小于你未废除的装备槽数的其他角色死亡。';
                var toSortPlayers = game.players.filter(c => c != player);
                var next = player.chooseButton([1, Infinity]).set('createDialog', [prompt,
                    [toSortPlayers.map(i => `${i.playerid}|${i.name}`), (item, type, position, noclick, node) => {
                        const info = item.split('|'), _item = item;
                        const playerid = parseInt(info[0]);
                        item = info[1];
                        if (node) {
                            node.classList.add('button');
                            node.classList.add('player');
                            node.style.display = '';
                        }
                        else {
                            node = ui.create.div('.button.character', position);
                        }
                        node._link = item;
                        node.link = item;

                        const func = function (node, item) {
                            if (item != 'unknown') node.setBackground(item, 'character');
                            if (node.node) {
                                node.node.name.remove();
                                node.node.hp.remove();
                                node.node.group.remove();
                                node.node.intro.remove();
                                if (node.node.replaceButton) node.node.replaceButton.remove();
                            }
                            node.node = {
                                name: ui.create.div('.name', node),
                                group: ui.create.div('.identity', node),
                                intro: ui.create.div('.intro', node),
                            };
                            const currentPlayer = game.players.find(current => current.playerid == playerid);
                            const infoitem = [currentPlayer.sex, currentPlayer.group, `${currentPlayer.hp}/${currentPlayer.maxHp}/${currentPlayer.hujia}`];
                            node.node.name.innerHTML = get.slimName(item);
                            if (lib.config.buttoncharacter_style == 'default' || lib.config.buttoncharacter_style == 'simple') {
                                if (lib.config.buttoncharacter_style == 'simple') {
                                    node.node.group.style.display = 'none';
                                }
                                node.classList.add('newstyle');
                                node.node.name.dataset.nature = get.groupnature(get.bordergroup(infoitem));
                                node.node.group.dataset.nature = get.groupnature(get.bordergroup(infoitem), 'raw');
                            }
                            node.node.name.style.top = '8px';
                            if (node.node.name.querySelectorAll('br').length >= 4) {
                                node.node.name.classList.add('long');
                                if (lib.config.buttoncharacter_style == 'old') {
                                    node.addEventListener('mouseenter', ui.click.buttonnameenter);
                                    node.addEventListener('mouseleave', ui.click.buttonnameleave);
                                }
                            }
                            node.node.intro.innerHTML = lib.config.intro;
                            node.node.group.style.backgroundColor = get.translation(`${get.bordergroup(infoitem)}Color`);
                        };
                        node.refresh = func;
                        node.refresh(node, item);

                        node.link = _item;
                        return node;
                    }]
                ]);
                next.set('ai', function (button) {
                    var link = button.link;
                    var target = game.players.find(c => c.playerid == link.split('|')[0]);
                    return -get.attitude(player, target);
                })
                next.set('filterButton', function (button) {
                    var link = button.link;
                    var target = game.players.find(c => c.playerid == link.split('|')[0]);
                    var num = target.getOriginalSkills().length;
                    if (num >= player.countEnabledSlot()) return true;
                })
                next.includeOut = true;
                'step 2'
                if (result.bool) {
                    player.$skill(get.translation(event.name));
                    var links = result.links;
                    for (let index = 0; index < links.length; index++) {
                        const link = links[index];
                        var targets = game.players.filter(c => c.playerid == link.split('|')[0]);
                        for (let index = 0; index < targets.length; index++) {
                            const target = targets[index];
                            target.resetFuction();
                            var next = target.AntiResistanceDie();
                            next.includeOut = true;
                            game.log(target, "被", player, "不讲武德地偷袭");
                        }
                    }
                }
                'step 3'
                game.delayx();
            },
            effect: function (card, player, target) {
                if (get.tag(card, 'damage')) {
                    return [1, 5];
                }
            },
            popup: false,
            "_priority": 1,
        },
        "qsmx_yangbai": {
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
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_mimidog")) {
                    player.removeSkill(skill);
                } else {
                    if (!_status.fixedCharacter) {
                        _status.fixedCharacter = {};
                    }
                    if (!_status.fixedCharacter[player.playerid]) {
                        _status.fixedCharacter[player.playerid] = [player.name1, player.name2];
                        _status.fixedCharacter[player.playerid] = _status.fixedCharacter[player.playerid].filter(c => c != undefined);
                    }
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
                        return '【佯败】：是否终止一切结算，结束当前回合？'
                    },
                    check(event, player) {
                        if (_status.currentPhase) {
                            return get.attitude(player, _status.currentPhase) <= 0;
                        } else {
                            return false;
                        }
                    },
                    trigger: {
                        player: ["damageEnd"],
                    },
                    content: function () {
                        "step 0"
                        var cards = Array.from(ui.ordering.childNodes);
                        while (cards.length) {
                            cards.shift().discard();
                        }
                        "step 1"
                        var evt = _status.event.getParent('phase');
                        if (evt) {
                            game.resetSkills();
                            _status.event = evt;
                            _status.event.finish();
                            _status.event.untrigger(true);
                        }
                    }
                }
            },
        },
        "qsmx_mingli": {
            forced: true,
            silent: true,
            firstDo: true,
            group: ["qsmx_mingli_phaseBefore", "qsmx_mingli_damageCancelled"],
            trigger: {
                global: "gameStart",
                player: "enterGame",
            },
            filter: function (event, player) {
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_mimidog")) return false;
                return true;
            },
            init: function (player, skill) {
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_mimidog")) {
                    player.removeSkill(skill);
                } else {
                    if (!_status.fixedCharacter) {
                        _status.fixedCharacter = {};
                    }
                    if (!_status.fixedCharacter[player.playerid]) {
                        _status.fixedCharacter[player.playerid] = [player.name1, player.name2];
                        _status.fixedCharacter[player.playerid] = _status.fixedCharacter[player.playerid].filter(c => c != undefined);
                    }
                }
            },
            onremove: function (player, skill) {
                player.addSkill(skill);
                player.changeCharacter(_status.fixedCharacter[player.playerid], false);
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
                    "_priority": 1,
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
                        'step 0'
                        player.storage.qsmx_mingli++;
                        'step 1'
                        var currentPhase = _status.currentPhase;
                        var storage = player.storage.qsmx_mingli;
                        var OriginalSkills = currentPhase.getOriginalSkills();
                        if (currentPhase && storage > OriginalSkills.length) {
                            player.AntiResistanceDie();
                        }
                    },
                    "_priority": 0,
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
            "audioname2": {
                "key_shiki": "shiki_omusubi",
            },
            "_priority": 1,
        },
        "qsmx_yangkuang": {
            mark: true,
            marktext: "☯",
            zhuanhuanji: true,
            init: function (player, skill) {
                player.storage[skill] = true;
            },
            intro: {
                content: function (storage, player) {
                    var str = "转换技，";
                    if (storage) str += "你可以将一张红色牌当做【决斗】对自己使用";
                    else str += "你可以将一张黑色牌当【过河拆桥】对自己使用";
                    return str;
                },
            },
            group: ['qsmx_yangkuang_yang', 'qsmx_yangkuang_yin'],
            subSkill: {
                "yang": {
                    locked: false,
                    audio: 2,
                    enable: "phaseUse",
                    discard: false,
                    filter: function (event, player) {
                        if (player.storage.qsmx_yangkuang == false) return false;
                        return player.countCards('hes', { color: 'red' }) > 0;
                    },
                    viewAs: {
                        name: "juedou",
                    },
                    position: "hes",
                    filterCard: function (card, player, event) {
                        return get.color(card) == 'red';
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
                                if (target.countSkill('qsmx_yangkuang_yang') >= 1) {
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
                    "_priority": 0,
                },
                "yin": {
                    locked: false,
                    audio: 2,
                    enable: "phaseUse",
                    discard: false,
                    filter: function (event, player) {
                        if (player.storage.qsmx_yangkuang == true) return false;
                        return player.countCards('hes', { color: 'red' }) > 0;
                    },
                    viewAs: {
                        name: "guohe",
                    },
                    position: "hes",
                    filterCard: function (card, player, event) {
                        return get.color(card) == 'black';
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
                    "_priority": 0,
                }
            }
        },
        "qsmx_diejia": {
            forced: true,
            trigger: {
                player: ["damageEnd"],
            },
            filter: function (event, player) {
                return true;
            },
            getIndex(event, player, triggername){
                return event.num;
            },
            content() {
                player.changeHujia(1);
            },
            "_priority": 0,
        },
        "qsmx_liegong": {
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
                }
            },
            onuse: function (links, player) {
                var num = player.getAttackRange();
                var cards = get.bottomCards(num)
                links.cards = cards;
            },
            group: ['qsmx_liegong_charge', 'qsmx_liegong_effect', 'qsmx_liegong_excluded'],
            subSkill: {
                text: {

                },
                charge: {
                    trigger: {
                        player: "phaseEnd",
                    },
                    forced: true,
                    filter(event, player) {
                        if (player.getHistory('skipped').includes('phaseUse')) return true;
                        const history = player.getHistory('useCard').concat(player.getHistory('respond'));
                        for (let i = 0; i < history.length; i++) {
                            if (history[i].card.name == 'sha' && history[i].isPhaseUsing()) return false;
                        }
                        return true;
                    },
                    async content(event, trigger, player) {
                        player.addMark('charge', 1, false);
                    },
                    "_priority": 0,
                    ai: {
                        effect: {
                            target(card, player, target) {
                                if (get.name(card) == 'sha' && player.getAttackRange() < 5) return 0.2;
                            },
                        },
                    },
                },
                effect: {
                    mod: {
                        attackRange: (player, num) => num + player.countMark('charge'),
                    }
                },
                excluded: {
                    forced: true,
                    charlotte: true,
                    trigger: {
                        player: 'useCard'
                    },
                    filter: function (event, player) {
                        if (!event.card.storage.qsmx_liegong) return false;
                        var suits = [];
                        var cards = event.cards
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
                        'step 0'
                        var next = game.createEvent('qsmx_liegong_text', false);
                        next.player = player;
                        next.targets = trigger.targets;
                        next.setContent(function () {
                            'step 0'
                            player.$skill(get.translation(event.name));
                            for (let index = 0; index < targets.length; index++) {
                                const target = targets[index];
                                target.resetFuction();
                                var next = target.AntiResistanceDie();
                                next.includeOut = true;
                                game.log("曾不可一世的", target, "被", player, "射杀");
                            }
                            'step 1'
                            game.delayx();
                        })
                        player.clearMark('charge');
                        'step 1'
                        trigger.targets.length = 0;
                        trigger.all_excluded = true;
                    }
                }
            },
            ai: {
                respondSha: true,
                yingbian: function (card, player, targets, viewer) {
                    if (get.attitude(viewer, player) <= 0) return 0;
                    var base = 0, hit = false;
                    if (get.cardtag(card, 'yingbian_hit')) {
                        hit = true;
                        if (targets.some(target => {
                            return target.mayHaveShan(viewer, 'use', target.getCards('h', i => {
                                return i.hasGaintag('sha_notshan');
                            })) && get.attitude(viewer, target) < 0 && get.damageEffect(target, player, viewer, get.natureList(card)) > 0;
                        })) base += 5;
                    }
                    if (get.cardtag(card, 'yingbian_add')) {
                        if (game.hasPlayer(function (current) {
                            return !targets.includes(current) && lib.filter.targetEnabled2(card, player, current) && get.effect(current, card, player, player) > 0;
                        })) base += 5;
                    }
                    if (get.cardtag(card, 'yingbian_damage')) {
                        if (targets.some(target => {
                            return get.attitude(player, target) < 0 && (hit || !target.mayHaveShan(viewer, 'use', target.getCards('h', i => {
                                return i.hasGaintag('sha_notshan');
                            })) || player.hasSkillTag('directHit_ai', true, {
                                target: target,
                                card: card,
                            }, true)) && !target.hasSkillTag('filterDamage', null, {
                                player: player,
                                card: card,
                                jiu: true,
                            })
                        })) base += 5;
                    }
                    return base;
                },
                canLink: function (player, target, card) {
                    if (!target.isLinked() && !player.hasSkill('wutiesuolian_skill')) return false;
                    if (player.hasSkill('jueqing') || player.hasSkill('gangzhi') || target.hasSkill('gangzhi')) return false;
                    return true;
                },
                basic: {
                    useful: [5, 3, 1],
                    value: [5, 3, 1],
                },
                order: function (item, player) {
                    if (player.hasSkillTag('presha', true, null, true)) return 10;
                    if (typeof item === 'object' && game.hasNature(item, 'linked')) {
                        if (game.hasPlayer(function (current) {
                            return current != player && lib.card.sha.ai.canLink(player, current, item) && player.canUse(item, current, null, true) && get.effect(current, item, player, player) > 0;
                        }) && game.countPlayer(function (current) {
                            return current.isLinked() && get.damageEffect(current, player, player, get.nature(item)) > 0;
                        }) > 1) return 3.1;
                        return 3;
                    }
                    return 3.05;
                },
                result: {
                    target: function (player, target, card, isLink) {
                        let eff = -1.5, odds = 1.35, num = 1;
                        if (player.identity == 'nei' && target.identity == "zhu" && game.countPlayer(true, true) > 2) {
                            return -6.5;
                        }
                        if (isLink) {
                            let cache = _status.event.getTempCache('sha_result', 'eff');
                            if (typeof cache !== 'object' || cache.card !== get.translation(card)) return eff;
                            if (cache.odds < 1.35 && cache.bool) return 1.35 * cache.eff;
                            return cache.odds * cache.eff;
                        }
                        if (player.hasSkill('jiu') || player.hasSkillTag('damageBonus', true, {
                            target: target,
                            card: card
                        })) {
                            if (target.hasSkillTag('filterDamage', null, {
                                player: player,
                                card: card,
                                jiu: true,
                            })) eff = -0.5;
                            else {
                                num = 2;
                                if (get.attitude(player, target) > 0) eff = -7;
                                else eff = -4;
                            }
                        }
                        if (!player.hasSkillTag('directHit_ai', true, {
                            target: target,
                            card: card,
                        }, true)) odds -= 0.7 * target.mayHaveShan(player, 'use', target.getCards('h', i => {
                            return i.hasGaintag('sha_notshan');
                        }), 'odds');
                        _status.event.putTempCache('sha_result', 'eff', {
                            bool: target.hp > num && get.attitude(player, target) > 0,
                            card: get.translation(card),
                            eff: eff,
                            odds: odds
                        });
                        return odds * eff;
                    },
                },
                tag: {
                    respond: 1,
                    respondShan: 1,
                    damage: function (card) {
                        if (game.hasNature(card, 'poison')) return;
                        return 1;
                    },
                    natureDamage: function (card) {
                        if (game.hasNature(card, 'linked')) return 1;
                    },
                    fireDamage: function (card, nature) {
                        if (game.hasNature(card, 'fire')) return 1;
                    },
                    thunderDamage: function (card, nature) {
                        if (game.hasNature(card, 'thunder')) return 1;
                    },
                    poisonDamage: function (card, nature) {
                        if (game.hasNature(card, 'poison')) return 1;
                    },
                },
                threaten: 114514,
            },
            "_priority": 0,
        },
        "qsmx_fengyin": {
            init: function (player, skill) {
                player.addSkillBlocker(skill);
            },
            onremove: function (player, skill) {
                player.removeSkillBlocker(skill);
            },
            charlotte: true,
            skillBlocker: function (skill, player) {
                return lib.qsmx.ResistanceInfo(skill) || lib.qsmx.EncryptSkill(skill);
            },
            mark: true,
            intro: {
                content: function (storage, player, skill) {
                    var list = player.getSkills(null, false, false).filter(function (i) {
                        return lib.skill.qsmx_fengyin.skillBlocker(i, player);
                    });
                    if (list.length) return '失效技能：' + get.translation(list);
                    return '无失效技能';
                },
            },
            "_priority": 0,
        },
        "qsmx_liancai": {
            mod: {
                aiOrder(player, card, num) {
                    if (num <= 0 || get.itemtype(card) !== 'card' || get.type(card) !== 'equip') return num;
                    let eq = player.getEquip(get.subtype(card));
                    if (eq && get.equipValue(card) - get.equipValue(eq) < Math.max(1.2, 6 - player.hp)) return 0;
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
                player.loseToSpecial(event.cards, 'qsmx_liancai', player);
                player.draw();
            },
            ai: {
                order: 9,
                result: {
                    player: 2,
                },
                threaten: 1.5,
            },
            "_priority": 0,
        },
        "qsmx_luoshen": {
            frequent: true,
            audio: "ext:奇思妙想/resource/audio/skill/:2",
            intro: {
                mark: function (dialog, storage, player) {
                    var cards = player.getCards('s', card => card.hasGaintag('qsmx_luoshen'));
                    if (!cards || !cards.length) return;
                    dialog.addAuto(cards);
                },
                markcount: function (storage, player) {
                    return player.countCards('s', card => card.hasGaintag('qsmx_luoshen'));
                },
            },
            trigger: {
                player: ["gainEnd"],
            },
            filter: function (event, player) {
                var cards = event.cards;
                if (!cards) return;
                return cards.some(c => get.color(c, player) == 'black');;
            },
            content() {
                'step 0'
                player.draw();
                'step 1'
                if (result) {
                    player.loseToSpecial(result, 'qsmx_luoshen', player);
                    player.markSkill('qsmx_luoshen');
                }
            },
            group: ['qsmx_luoshen_unmark'],
            subSkill: {
                unmark: {
                    trigger: {
                        player: "loseAfter",
                    },
                    filter: function (event, player) {
                        if (!event.ss || !event.ss.length) return false;
                        return !player.countCards('s', card => card.hasGaintag('qsmx_luoshen'));
                    },
                    charlotte: true,
                    forced: true,
                    silent: true,
                    content: function () {
                        player.unmarkSkill('qsmx_luoshen');
                    },
                    sub: true,
                    popup: false,
                    "_priority": 1,
                },
            },
            "_priority": 0,
        },
        "qsmx_qingguo": {
            locked: false,
            mod: {
                aiValue(player, card, num) {
                    if (get.name(card) != 'shan' && get.color(card) != 'black') return;
                    const cards = player.getCards('hs', card => get.name(card) == 'shan' || get.color(card) == 'black');
                    cards.sort((a, b) => {
                        return (get.name(b) == 'shan' ? 1 : 2) - (get.name(a) == 'shan' ? 1 : 2);
                    });
                    const geti = () => {
                        if (cards.includes(card)) cards.indexOf(card);
                        return cards.length;
                    };
                    if (get.name(card) == 'shan') return Math.min(num, [6, 4, 3][Math.min(geti(), 2)]) * 0.6;
                    return Math.max(num, [6.5, 4, 3][Math.min(geti(), 2)]);
                },
                aiUseful() {
                    return lib.skill.qsmx_qingguo.mod.aiValue.apply(this, arguments);
                },
            },
            audio: "ext:奇思妙想/resource/audio/skill/:2",
            enable: ["chooseToRespond", "chooseToUse"],
            filterCard: function (card) {
                return get.color(card) == 'black';
            },
            position: "hes",
            viewAs: {
                name: "shan",
            },
            viewAsFilter: function (player) {
                if (!player.countCards('hes', { color: 'black' })) return false;
            },
            prompt: "将一张黑色牌当闪打出",
            check: function () { return 1 },
            ai: {
                order: 2,
                respondShan: true,
                skillTagFilter: function (player) {
                    if (!player.countCards('hes', { color: 'black' })) return false;
                },
                effect: {
                    target: function (card, player, target, current) {
                        if (get.tag(card, 'respondShan') && current < 0) return 0.6
                    },
                },
                basic: {
                    useful: (card, i) => {
                        let player = _status.event.player, basic = [7, 5.1, 2], num = basic[Math.min(2, i)];
                        if (player.hp > 2 && player.hasSkillTag('maixie')) num *= 0.57;
                        if (player.hasSkillTag('freeShan', false, null, true) || player.getEquip('rewrite_renwang')) num *= 0.8;
                        return num;
                    },
                    value: [7, 5.1, 2],
                },
                result: {
                    player: 1,
                },
            },
            group: ['qsmx_qingguo_useCard', 'qsmx_qingguo_excluded'],
            subSkill: {
                useCard: {
                    trigger: {
                        player: ["useCard", "respond"],
                    },
                    forced: true,
                    silent: true,
                    filter: function (event, player) {
                        return event.card.name == 'shan';
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
                        'step 0'
                        var next = player.chooseToRespond("打出一张【闪】令此牌对你无效", 'hes', function (card) {
                            var player = _status.event.player;
                            var mod2 = game.checkMod(card, player, 'unchanged', 'cardEnabled2', player);
                            if (mod2 != 'unchanged') return mod2;
                            var mod = game.checkMod(card, player, 'unchanged', 'cardRespondable', player);
                            if (mod != 'unchanged') return mod;
                            return true;
                        })
                        next.set('ai', function (card) {
                            return -get.attitude(player, event.player) <= 0;
                        })
                        next.set('filterCard', function (card) {
                            return card.name == 'shan';
                        })
                        'step 1'
                        if (result.bool) {
                            trigger.excluded.add(player);
                        }
                    },
                    ai: {
                        effect: {
                            target: function (card, player, target) {
                                if (player.hasShan()) return 'zerotarget';
                            },
                        },
                    },
                    "_priority": 5,
                }
            },
            "_priority": 0,
        },
        "qsmx_shidi": {
            forced: true,
            silent: true,
            firstDo: true,
            group: ["qsmx_shidi_damageEnd", "qsmx_shidi_excluded"],
            trigger: {
                global: "gameStart",
                player: "enterGame",
            },
            filter: function (event, player) {
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_huangzhong")) return false;
                return true;
            },
            init: function (player, skill) {
                var name = [player.name, player.name1, player.name2]
                if (!name.includes("qsmx_huangzhong")) {
                    player.removeSkill(skill);
                } else {
                    if (!_status.fixedCharacter) {
                        _status.fixedCharacter = {};
                    }
                    if (!_status.fixedCharacter[player.playerid]) {
                        _status.fixedCharacter[player.playerid] = [player.name1, player.name2];
                        _status.fixedCharacter[player.playerid] = _status.fixedCharacter[player.playerid].filter(c => c != undefined);
                    }
                }
            },
            onremove: function (player, skill) {
                player.addSkill(skill);
                player.changeCharacter(_status.fixedCharacter[player.playerid], false);
            },
            content: function () {
                player.initDieResistance();
                player.initDyingResistance();
                player.initControlResistance();
                player.initMadResistance();
                ;
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
                        game.log(player, '被', trigger.source, '狙杀');
                        player.AntiResistanceDie();
                    },
                    sub: true,
                    "_priority": 1,
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
                                if (get.is.ordinaryCard(card)) return 'zerotarget';
                            },
                        },
                    },
                    "_priority": 5,
                }
            },
            ai: {
                HpResistance: true,
                maxHpResistance: true,
                DieResistance: true,
            },
            popup: false,
            "audioname2": {
                "key_shiki": "shiki_omusubi",
            },
            "_priority": 1,
        },
        "qsmx_fushe": {
            trigger: {
                global: 'roundStart'
            },
            direct: true,
            group: ['qsmx_fushe_cancel'],
            marktext: "伏",
            intro: {
                markcount: function (storage) {
                    return storage.length;
                },
                mark: function (dialog, content, player) {
                    const storage = player.getStorage('qsmx_fushe');
                    if (player.isUnderControl(true) && storage.length) {
                        dialog.addText('当前记录牌名：');
                        dialog.addSmall([storage, 'vcard']);
                    }
                },
            },
            content: function () {
                'step 0'
                player.storage.qsmx_fushe.length = 0;
                'step 1'
                var list = [];
                for (var i = 0; i < lib.inpile.length; i++) {
                    var name = lib.inpile[i];
                    var type = get.type(name);
                    list.push([type, '', name]);
                }
                var next = player.chooseButton(['伏射', [list, 'vcard']], [1, 3]);
                next.set('ai', function (button) {
                    switch (button.link[2]) {
                        case 'wuxie': return 5 + Math.random();
                        case 'sha': return 5 + Math.random();
                        case 'tao': return 4 + Math.random();
                        case 'jiu': return 3 + Math.random();
                        case 'lebu': return 3 + Math.random();
                        case 'shan': return 4.5 + Math.random();
                        case 'wuzhong': return 4 + Math.random();
                        case 'shunshou': return 2.7 + Math.random();
                        case 'nanman': return 2 + Math.random();
                        case 'wanjian': return 1.6 + Math.random();
                        default: return 1.5 + Math.random();
                    }
                })
                'step 2'
                if (result.bool) {
                    var links = result.links;
                    for (let index = 0; index < links.length; index++) {
                        const link = links[index];
                        player.storage.qsmx_fushe.add(link[2]);
                    }
                    player.markSkill('qsmx_fushe');
                } else {
                    player.unmarkSkill('qsmx_fushe');
                }
            },
            subSkill: {
                cancel: {
                    trigger: {
                        global: 'useCard',
                    },
                    filter: function (event, player) {
                        return event.player != player && player.storage.qsmx_fushe.includes(event.card.name) && player.hasSha();
                    },
                    "prompt2": function (event, player) {
                        return '移除' + get.translation(event.card.name) + '的记录，令' + get.translation(event.card) + '无效';
                    },
                    content: function () {
                        "step 0"
                        player.storage.qsmx_fushe.remove(trigger.card.name);
                        if (player.storage.qsmx_fushe) {
                            player.markSkill('qsmx_fushe');
                        } else {
                            player.unmarkSkill('qsmx_fushe');
                        }
                        trigger.targets.length = 0;
                        trigger.all_excluded = true;
                        "step 1"
                        var next = player.chooseToUse(function (card, player, event) {
                            if (get.name(card) != 'sha') return false;
                            return lib.filter.filterCard.apply(this, arguments);
                        }, '伏射：对' + get.translation(trigger.player) + '使用一张杀')
                        next.set('targetRequired', true)
                        next.set('complexSelect', true)
                        next.set('filterTarget', function (card, player, target) {
                            if (target != _status.event.sourcex && !ui.selected.targets.includes(_status.event.sourcex)) return false;
                            return true;
                        })
                        next.set('sourcex', trigger.player);
                    }
                }
            },
            init: function (player, skill) {
                player.storage[skill] = [];
            }
        },
        "qsmx_wusheng": {
            audio: "wusheng",
            enable: ["chooseToUse", "chooseToRespond"],
            filterCard: true,
            position: 'hes',
            filter: function (event, player) {
                if (!player.countCards('hes')) return false;
                return true;
            },
            prompt: "将一张牌当杀使用或打出",
            viewAs: {
                name: "sha",
            },
            group: ['qsmx_wusheng_useCard'],
            subSkill: {
                useCard: {
                    trigger: {
                        player: "useCard",
                    },
                    mod: {
                        targetInRange: function (card, player) {
                            if (ui.selected.cards.some(c => get.suit(c) == 'diamond') && card.name == 'sha') return true;
                        },
                        selectTarget(card, player, range) {
                            if (ui.selected.cards.some(c => get.suit(c) == 'club') && range[1] != -1 && card.name == 'sha') range[1]++;
                        },
                    },
                    forced: true,
                    silent: true,
                    filter: function (event, player) {
                        return event.card.name == 'sha';
                    },
                    content: function () {
                        var cards = trigger.cards;
                        if (cards.some(c => get.color(c) == 'red')) {
                            trigger.baseDamage++;
                        }
                        if (cards.some(c => get.color(c) == 'black')) {
                            trigger.effectCount++;
                        }
                        if (cards.some(c => get.suit(c) == 'heart')) {
                            trigger.directHit.addArray(trigger.targets);
                        }
                        if (cards.some(c => get.suit(c) == 'spade')) {
                            for (let index = 0; index < trigger.targets.length; index++) {
                                const target = trigger.targets[index];
                                target.addTempSkill('fengyin');
                            }
                        }
                    },
                }
            },
            ai: {
                respondSha: true,
                yingbian: function (card, player, targets, viewer) {
                    if (get.attitude(viewer, player) <= 0) return 0;
                    var base = 0, hit = false;
                    if (get.cardtag(card, 'yingbian_hit')) {
                        hit = true;
                        if (targets.some(target => {
                            return target.mayHaveShan(viewer, 'use', target.getCards('h', i => {
                                return i.hasGaintag('sha_notshan');
                            })) && get.attitude(viewer, target) < 0 && get.damageEffect(target, player, viewer, get.natureList(card)) > 0;
                        })) base += 5;
                    }
                    if (get.cardtag(card, 'yingbian_add')) {
                        if (game.hasPlayer(function (current) {
                            return !targets.includes(current) && lib.filter.targetEnabled2(card, player, current) && get.effect(current, card, player, player) > 0;
                        })) base += 5;
                    }
                    if (get.cardtag(card, 'yingbian_damage')) {
                        if (targets.some(target => {
                            return get.attitude(player, target) < 0 && (hit || !target.mayHaveShan(viewer, 'use', target.getCards('h', i => {
                                return i.hasGaintag('sha_notshan');
                            })) || player.hasSkillTag('directHit_ai', true, {
                                target: target,
                                card: card,
                            }, true)) && !target.hasSkillTag('filterDamage', null, {
                                player: player,
                                card: card,
                                jiu: true,
                            })
                        })) base += 5;
                    }
                    return base;
                },
                canLink: function (player, target, card) {
                    if (!target.isLinked() && !player.hasSkill('wutiesuolian_skill')) return false;
                    if (player.hasSkill('jueqing') || player.hasSkill('gangzhi') || target.hasSkill('gangzhi')) return false;
                    return true;
                },
                basic: {
                    useful: [5, 3, 1],
                    value: [5, 3, 1],
                },
                order: function (item, player) {
                    if (player.hasSkillTag('presha', true, null, true)) return 10;
                    if (typeof item === 'object' && game.hasNature(item, 'linked')) {
                        if (game.hasPlayer(function (current) {
                            return current != player && lib.card.sha.ai.canLink(player, current, item) && player.canUse(item, current, null, true) && get.effect(current, item, player, player) > 0;
                        }) && game.countPlayer(function (current) {
                            return current.isLinked() && get.damageEffect(current, player, player, get.nature(item)) > 0;
                        }) > 1) return 3.1;
                        return 3;
                    }
                    return 3.05;
                },
                result: {
                    target: function (player, target, card, isLink) {
                        let eff = -1.5, odds = 1.35, num = 1;
                        if (isLink) {
                            let cache = _status.event.getTempCache('sha_result', 'eff');
                            if (typeof cache !== 'object' || cache.card !== get.translation(card)) return eff;
                            if (cache.odds < 1.35 && cache.bool) return 1.35 * cache.eff;
                            return cache.odds * cache.eff;
                        }
                        if (player.hasSkill('jiu') || player.hasSkillTag('damageBonus', true, {
                            target: target,
                            card: card
                        })) {
                            if (target.hasSkillTag('filterDamage', null, {
                                player: player,
                                card: card,
                                jiu: true,
                            })) eff = -0.5;
                            else {
                                num = 2;
                                if (get.attitude(player, target) > 0) eff = -7;
                                else eff = -4;
                            }
                        }
                        if (!player.hasSkillTag('directHit_ai', true, {
                            target: target,
                            card: card,
                        }, true)) odds -= 0.7 * target.mayHaveShan(player, 'use', target.getCards('h', i => {
                            return i.hasGaintag('sha_notshan');
                        }), 'odds');
                        _status.event.putTempCache('sha_result', 'eff', {
                            bool: target.hp > num && get.attitude(player, target) > 0,
                            card: get.translation(card),
                            eff: eff,
                            odds: odds
                        });
                        return odds * eff;
                    },
                },
                tag: {
                    respond: 1,
                    respondShan: 1,
                    damage: function (card) {
                        if (game.hasNature(card, 'poison')) return;
                        return 1;
                    },
                    natureDamage: function (card) {
                        if (game.hasNature(card, 'linked')) return 1;
                    },
                    fireDamage: function (card, nature) {
                        if (game.hasNature(card, 'fire')) return 1;
                    },
                    thunderDamage: function (card, nature) {
                        if (game.hasNature(card, 'thunder')) return 1;
                    },
                    poisonDamage: function (card, nature) {
                        if (game.hasNature(card, 'poison')) return 1;
                    },
                },
                threaten: 114514,
            },
            "_priority": 0,
        },
        "qsmx_yijue": {
            audio: "yijue",
            trigger: {
                source: "damageBegin2",
            },
            filter: function (event, player) {
                return player != event.player && event.num >= event.player.hp;
            },
            check: function (event, player) {
                return get.damageEffect(event.player, player, player) < 0 || event.player.isDisabledJudge();
            },
            content: function () {
                'step 0'
                console.log(trigger);
                trigger.cancel();
                'step 1'
                var target = trigger.player;
                if (!target.isDisabledJudge()) {
                    target.disableJudge();
                    player.gain(target.getCards('hej'));
                } else {
                    var next = trigger.player.AntiResistanceDie();
                    next.source = player;
                    event.finish();
                }
            }
        },
        "qsmx_winwin": {
            charlotte: true,
            init: function (player, skill) {
                _status.forceWin.add(player);
            },
        },
        "qsmx_jianxiong": {
            audio: 1,
            trigger: {
                player: "damageEnd",
            },
            content: function () {
                "step 0"
                var skills = Object.keys(lib.skill);
                var parent = trigger.getParent();
                if (skills.includes(parent.name) && trigger.source != player) {
                    trigger.source.removeSkills(parent.name);
                    player.addSkills(parent.name);
                }
                if (get.itemtype(trigger.cards) == 'cards' && get.position(trigger.cards[0], true) == 'o') {
                    player.gain(trigger.cards, 'gain2');
                    if (parent.skill) {
                        trigger.source.removeSkills(parent.skill);
                        player.addSkills(parent.skill);
                    }
                }
                player.draw(player.countMark('qsmx_jianxiong') + 1, 'nodelay');
                'step 1'
                player.addMark('qsmx_jianxiong', 1, false);
            },
            marktext: "雄",
            intro: {
                markcount(storage, player) {
                    return player.countMark('qsmx_jianxiong') + 1;
                },
                content(storage, player) {
                    return '摸牌数为' + (player.countMark('qsmx_jianxiong') + 1);
                },
            },
            ai: {
                maixie: true,
                "maixie_hp": true,
                effect: {
                    target: function (card, player, target) {
                        if (player.hasSkillTag('jueqing', false, target)) return [1, -1];
                        if (get.tag(card, 'damage') && player != target) return [1, 0.6];
                    },
                },
            },
            "_priority": 0,
        },
        "qsmx_fangzhu": {
            audio: 2,
            trigger: {
                player: "damageEnd",
            },
            direct: true,
            preHidden: true,
            group:['qsmx_fangzhu_cancel'],
            content: function () {
                "step 0"
                var draw = player.getDamagedHp();
                player.chooseTarget(get.prompt('fangzhu'), '令一名其他角色强制翻面' + (draw > 0 ? '并摸' + get.cnNumber(draw) + '张牌' : ''), function (card, player, target) {
                    return player != target
                }).setHiddenSkill('qsmx_fangzhu').set('ai', target => {
                    //if(target.hasSkillTag('noturn')) return 0;
                    var player = _status.event.player;
                    var current = _status.currentPhase;
                    var dis = current ? get.distance(current, target, 'absolute') : 1;
                    var draw = player.getDamagedHp();
                    var att = get.attitude(player, target);
                    if (att == 0) return target.hasJudge('lebu') ? Math.random() / 3 : Math.sqrt(get.threaten(target)) / 5 + Math.random() / 2;
                    if (att > 0) {
                        if (target.isTurnedOver()) return att + draw;
                        if (draw < 4) return -1;
                        if (current && target.getSeatNum() > current.getSeatNum()) return att + draw / 3;
                        return 10 * Math.sqrt(Math.max(0.01, get.threaten(target))) / (3.5 - draw) + dis / (2 * game.countPlayer());
                    }
                    else {
                        if (target.isTurnedOver()) return att - draw;
                        if (draw >= 5) return -1;
                        if (current && target.getSeatNum() <= current.getSeatNum()) return -att + draw / 3;
                        return (4.25 - draw) * 10 * Math.sqrt(Math.max(0.01, get.threaten(target))) + 2 * game.countPlayer() / dis;
                    }
                });
                "step 1"
                if (result.bool) {
                    player.logSkill('qsmx_fangzhu', result.targets);
                    var draw = player.getDamagedHp();
                    if (draw > 0){
                        result.targets[0].draw(draw);
                    };
                    result.targets[0].classList.toggle('turnedover');
                }
                "step 2"
                if(result){
                    var cards = result;
                    for (let index = 0; index < cards.length; index++) {
                        const card = cards[index];
                        card.addGaintag('qsmx_fangzhu');
                    }
                }
            },
            subSkill:{
                cancel:{
                    forced:true,
                    trigger:{
                        global:['turnOverBegin']
                    },
                    filter:function(event, player){
                        var handCards = event.player.getCards('h');
                        for (let index = 0; index < handCards.length; index++) {
                            const card = handCards[index];
                            if(card.hasGaintag('qsmx_fangzhu'))return true;
                        }
                    },
                    content:function(){
                        trigger.cancel();
                        var next = player.discardPlayerCard(trigger.player);
                        next.filterButton=function(button){
                            var card = button.link;
                            if(card.hasGaintag('qsmx_fangzhu'))return true;
                        }
                    }
                }
            },
            ai: {
                maixie: true,
                "maixie_hp": true,
                effect: {
                    target: function (card, player, target) {
                        if (get.tag(card, 'damage')) {
                            if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
                            if (target.hp <= 1) return;
                            if (!target.hasFriend()) return;
                            var hastarget = false;
                            var turnfriend = false;
                            var players = game.filterPlayer();
                            for (var i = 0; i < players.length; i++) {
                                if (get.attitude(target, players[i]) < 0 && !players[i].isTurnedOver()) {
                                    hastarget = true;
                                }
                                if (get.attitude(target, players[i]) > 0 && players[i].isTurnedOver()) {
                                    hastarget = true;
                                    turnfriend = true;
                                }
                            }
                            if (get.attitude(player, target) > 0 && !hastarget) return;
                            if (turnfriend || target.hp == target.maxHp) return [0.5, 1];
                            if (target.hp > 1) return [1, 0.5];
                        }
                    },
                },
            },
            "_priority": 0,
        },
        "qsmx_xingshang": {
            audio:'xingshang',
            trigger: {
                global: "dieAfter",
            },
            preHidden: true,
            direct:true,
            filter: function (event, player) {
                return event.player!=player;
            },
            content: function () {
                "step 0"
                var list=[];
                var skills=trigger.player.getSkills(true,false).filter(skill=>{
                    if(skill=='jiu') return false;
                    if(player.hasSkill(skill)) return false;
                    if(!lib.translate[skill+'_info']) return false;
                    if(lib.translate[skill+'_info']=='') return false;
                    var info=get.info(skill);
                    if(!info) return false;
                    return true;
                });
                if(!skills.length){
                    event.finish();
                    return;
                }
                else{
                    for(var skill of skills){
                        list.push([
                            skill,
                            '<div class="popup text" style="width:calc(100% - 10px);display:inline-block"><div class="skill">【'+
                            get.translation(skill)+'】</div><div>'+lib.translate[skill+'_info']+'</div></div>',
                        ])
                    }
                    var next=player.chooseButton([
                        '行殇：请选择获得任意个技能',
                        [list,'textbutton'],
                    ]);
                    next.set('forced',false);
                    next.set('selectButton',[1,skills.length]);
                    next.set('ai',function(button){
                        return Math.random();
                    });
                    next.set('skills',skills);
                }
                "step 1"
                if(result.bool){
                    var skills=result.links;
                    player.logSkill('qsmx_xingshang',trigger.player);
                    player.addAdditionalSkills(null, skills.slice(0), true);
                }
                player.gainMaxHp();
                player.recover();
            },
            "_priority": 0,
        },
        "qsmx_reverse": {
            forced: true,
            charlotte:true,
            init: function (player, skill) {
                var name = [player.name, player.name1, player.name2];
                if (!name.includes("qsmx_zhengxie")) {
                    player.removeSkill(skill);
                } else {
                    _status.GameResultReverse=true;
                    if (!_status.fixedCharacter) {
                        _status.fixedCharacter = {};
                    }
                    if (!_status.fixedCharacter[player.playerid]) {
                        _status.fixedCharacter[player.playerid] = [player.name1, player.name2];
                        _status.fixedCharacter[player.playerid] = _status.fixedCharacter[player.playerid].filter(c => c != undefined);
                    }
                }
            },
            onremove:function (player, skill) {
                var name = [player.name, player.name1, player.name2];
                if (name.includes("qsmx_zhengxie")) {
                    player.addSkill(skill);
                }
            },
            group:['qsmx_reverse_damage', 'qsmx_reverse_changeHp',  'qsmx_reverse_dying', 'qsmx_reverse_gainMaxHp', 'qsmx_reverse_loseMaxHp'],
            subSkill:{
                damage:{
                    trigger: {
                        player: ['damageBefore'],
                        source: ['damageBefore']
                    },
                    forced:true,
                    charlotte:true,
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
                    }
                },
                changeHp:{
                    forced:true,
                    charlotte:true,
                    trigger: {
                        player: ['changeHpBefore'],
                    },
                    filter: function (event, player) {
                        return true;
                    },
                    content: function () {
                        var temp = trigger.num;
                        trigger.num = -temp;
                    }
                },
                dying:{
                    silent:true,
                    charlotte:true,
                    trigger: {
                        player: ['changeHpAfter'],
                    },
                    filter: function (event, player) {
                        return player.hp<=0;
                    },
                    content: function () {
                        player.dying();
                    }
                },
                gainMaxHp:{
                    forced:true,
                    charlotte:true,
                    trigger: {
                        player: ['gainMaxHpBefore'],
                    },
                    filter: function (event, player) {
                        return true;
                    },
                    content: function () {
                        trigger.setContent('loseMaxHp');
                    }
                },
                loseMaxHp:{
                    forced:true,
                    charlotte:true,
                    trigger: {
                        player: ['loseMaxHpBefore'],
                    },
                    filter: function (event, player) {
                        return true;
                    },
                    content: function () {
                        trigger.setContent('gainMaxHp');
                    }
                },
            },
        },
        "qsmx_tianxie":{
            charlotte:true,
            forced:true,
            unique:true,
            onremove:function (player, skill) {
                var name = [player.name, player.name1, player.name2];
                if (name.includes("qsmx_zhengxie")) {
                    player.addSkill(skill);
                }
            },
            trigger: {
                player: ['changeHpEnd', 'gainMaxHpEnd', 'loseMaxHpEnd', 'gainMaxHpCancelled', 'loseMaxHpCancelled'],
            },
            filter: function (event, player) {
                return player.hp==player.maxHp;
            },
            content: function () {
                player.loseMaxHp();
            }
        },
    },
    translate: {
        "qsmx_tianxie": "天邪",
        "qsmx_tianxie_info": "状态技，你的体力变动后，若你体力与体力上限相同，你扣减一点体力上限。",
        "qsmx_reverse": "反转",
        "qsmx_reverse_info": "专属技，<br>①你即将受到/造成伤害时，你令交换伤害来源与受伤角色。<br>②你的体力变动前，你将体力变动值改为其相反数。<br>③游戏将要结束时，你反转游戏胜利结算结果。",
        "qsmx_xingshang": "行殇",
        "qsmx_xingshang_info": "一名角色死亡后，你可以获得其武将牌上的任意个技能，然后增加一点体力上限并回复一点体力。",
        "qsmx_fangzhu": "放逐",
        "qsmx_fangzhu_info": "你受到伤害后，你可以令一名其他角色摸X张牌标记为“放逐”并强制翻面；一名有“放逐”牌的角色翻面时，你弃置其一张“放逐”牌取消之。（X为你损失的体力值）",
        "qsmx_jianxiong": "奸雄",
        "qsmx_jianxiong_info": "你受到伤害后，<br>▪若此伤害由技能造成：你可以获得造成伤害的技能并令伤害来源失去造成伤害的技能。<br>▪若此伤害由牌造成：你可以获得造成伤害的牌。<br>▪若此伤害由技能转化的牌造成：你可以获得转化牌的技能并令伤害来源失去转化牌的技能<br>最后你摸一张牌并令此技能的摸牌数+1。",
        "qsmx_winwin": "赢麻",
        "qsmx_winwin_info": "状态技，游戏将要结束时，你改为以你独自胜利结束本局游戏。",
        "qsmx_winwin_append": "<div style=\"width:100%;text-align:left;font-size:13px;font-style:italic\">“你赢赢赢，最后是输光光。”</div>",
        "qsmx_qingguo": "倾国",
        "qsmx_qingguo_info": "①你可以将一张黑色牌当做【闪】使用或打出。<br>②你使用或打出【闪】时，你摸一张牌。<br>③一名其他角色使用牌时，若牌的目标包含你，你可以打出一张【闪】令此牌对你无效。",
        "qsmx_yijue": "义绝",
        "qsmx_yijue_info": "你造成致命伤害时，你可以防止此伤害，获得其区域内的所有牌并废除其判定区。（若其所有装备栏已被废除，则改为你将其击杀）",
        "qsmx_wusheng": "武圣",
        "qsmx_wusheng_info": "你可以将一张牌当做【杀】使用或打出，你使用的【杀】对应实体牌中有：<br>·红色牌：此【杀】伤害+1。<br>·黑色牌：此【杀】额外结算次数+1。<br>·♥牌：此【杀】不可响应。<br>·♠牌：此【杀】所有目标的非锁定技失效直到回合结束。<br>·♦牌：此【杀】无距离限制。<br>·♣牌：此【杀】可额外选择一名目标。",
        "qsmx_fushe": "伏射",
        "qsmx_fushe_info": "①一轮游戏开始时，你清除〖伏射①〗记录的牌名，然后你可以记录3种牌名（对其他角色不可见）②其他角色你使用〖伏射①〗记录的牌名的牌时，你可以移去〖伏射①〗此牌名的记录令此牌无效并对其使用一张【杀】（不进行目标合法性检测）",
        "qsmx_shidi": "势敌",
        "qsmx_shidi_info": "专属技，你取消武将牌替换、技能清除/失效、濒死结算，你的体力和体力上限恒定为4；一名其他角色使用非实牌时，若此牌的目标包括你，你令此牌对你无效；你受到伤害后，若伤害对应实体牌数为[X-1]，你死亡，你取消不以此法的死亡。(X为伤害来源的攻击范围)",
        "qsmx_luoshen": "洛神",
        "qsmx_luoshen_info": "你获得牌后，若其中有黑色牌，你可以摸一张牌并将其置于你的武将牌上，称为“洛神”；你可以如手牌般使用或打出“洛神”。",
        "qsmx_liancai": "敛财",
        "qsmx_liancai_info": "出牌阶段，你可以将2张手牌当做“财”置入你的武将牌上并摸1张牌；你可以如手牌般使用或打出“财”。（X为你以此法弃置的牌数）",
        "qsmx_powang": "破妄",
        "qsmx_powang_info": "锁定技，游戏开始时，你令场上其他角色※抗性标签疑似有点太多和※含有加密代码的技能失效。",
        "qsmx_fengyin": "封印",
        "qsmx_fengyin_info": "",
        "qsmx_liegong": "烈弓",
        "qsmx_liegong_info": "蓄力技（0/4），你可以将牌堆底X张牌当做【杀】使用，若其中有相同花色的牌，你消耗所有蓄力值令此【杀】无效并令此【杀】所有目标死亡；回合结束时，若你于本回合的出牌阶段内没有使用过或打出过【杀】，你获得一点蓄力值；你的攻击范围+Y。（X为你的攻击距离，Y为你的蓄力值）",
        "qsmx_diejia": "叠甲",
        "qsmx_diejia_info": "你受到伤害后，你获得两点护甲值。",
        "qsmx_yangkuang": "阳狂",
        "qsmx_yangkuang_info": "转换技，<br>阳：你可以将一张红色牌当做【决斗】对自己使用，<br>阴：你可以将一张黑色牌当【过河拆桥】对自己使用。",
        "qsmx_cizhang": "持杖",
        "qsmx_cizhang_info": "专属技，游戏开始时，你将※抗性标签疑似有点太多和※含有加密代码的技能无效化；一轮游戏开始时，你对自己造成X点伤害，然后你可以令任意名武将牌上的技能数不小于Y的其他角色死亡。（X为你已废止的装备槽数且至少为一，Y为你为未废止的装备槽数）",
        "qsmx_cizhang_append": "<div style=\"width:100%;text-align:left;font-size:13px;font-style:italic\">“吾持治妄之杖，消淫邪之术，护众免灾于天外邪魔。”</div>",
        "qsmx_mingli": "命理",
        "qsmx_mingli_info": "专属技，你取消武将牌替换、技能清除/失效、濒死结算，你的体力和体力上限恒定为6；你受到的伤害防止后，若为你当前回合防止的第X次伤害，你死亡，你取消不以此法的死亡。(X为伤害来源武将牌原有的技能数)",
        "qsmx_mingli_append": "<div style=\"width:100%;text-align:left;font-size:13px;font-style:italic\">“习技多者，难胜吾也；若无习一技者与吾战，吾难胜也。”</div>",
        "qsmx_yangbai": "佯败",
        "qsmx_yangbai_info": "专属技，每回合限一次，你受到伤害时，你废除一个装备槽，摸X张牌并防止此伤害。你受到伤害后，你可以终止一切结算，结束当前回合。（X为此伤害的伤害值基数）",
        "qsmx_yangbai_append": "<div style=\"width:100%;text-align:left;font-size:13px;font-style:italic\">“行邪魔之术者，多骄恣之辈。而吾略施佯败之计，便可制之。”</div>",
        "qsmx_chunhua": "纯化",
        "qsmx_chunhua_info": "祈祷吧，尽管没有任何用处。",
        "qsmx_shajue": "杀绝",
        "qsmx_shajue_info": "你造成伤害后，你可以视为对目标使用一张普通【杀】。",
        "qsmx_qichong": "七重",
        "qsmx_qichong_info": "专属技，你取消技能清除/失效、武将牌替换、濒死结算、体力变动、体力上限变动；洗牌后，若洗牌次数不小于七，你和你的阵营获得本局游戏的胜利；你受到的伤害结算后，若<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"block\"><mo stretchy=\"false\">(</mo><mi>X</mi><mo>−</mo><mi>Y</mi><mo stretchy=\"false\">)</mo><mo>+</mo><mo stretchy=\"false\">(</mo><mfrac><mi>Z</mi><mrow><mi>W</mi><mo>×</mo><mi>V</mi></mrow></mfrac><msup><mo stretchy=\"false\">)</mo><mrow><mi>U</mi><mo>−</mo><mi>T</mi></mrow></msup><mo>=</mo><mn>42</mn></math>，你死亡，你取消不以此法的死亡。（X、Y、Z、W、V、U、T分别为造成伤害的牌对应实体牌花色数、颜色数、类型数、点数和、牌名字数和、牌名数、属性数）",
        "qmsx_duanwu": "锻武",
        "qsmx_difu": "地府",
        "qsmx_difu_info": "专属技，敌方角色出牌阶段开始时，若其手牌大于体力，你令其将手牌弃至体力值。",
        "qsmx_xingpan": "刑判",
        "qsmx_xingpan_info": "专属技，你的判定结果最后确定时，若结果花色未被〖刑判〗记录，你记录此牌的花色，否则，你令一名其他角色死亡并清除〖刑判〗的记录，然后你翻面；你的判定事件被终止后，你令一名其他角色死亡并清除〖刑判〗的记录，然后你翻面。",
        "qsmx_jibao": "集宝",
        "qsmx_jibao_info": "锁定技，当装备牌被你获得或进入弃牌堆后，将之置于你的武将牌上，然后你摸一张牌。你视为拥有这些装备牌的技能。",
        "qsmx_gongzheng": "公正",
        "qsmx_gongzheng_info": "锁定技。场上角色使用/打出牌时，若其不为非虚拟非转换不含有“recover”标签的牌，此牌无效。",
        "qsmx_buqu": "不屈",
        "qsmx_buqu_info": "锁定技。",
        "qsmx_jiuzhu": "救主",
        "qsmx_jiuzhu_info": "你可以将与其他角色即将受到的伤害转移至你。",
        "qsmx_boming": "搏命",
        "qsmx_boming_info": "锁定技。你受到伤害时，若伤害来源不为你，你可以对伤害来源造成一点伤害。",
        "qsmx_xunbao": "寻宝",
        "qsmx_xunbao_info": "回合开始阶段，你从牌库里/牌库外随机获得一张装备牌。",
        "qsmx_draw": "摸牌",
        "qsmx_draw_info": "游戏开始时，你摸40张牌。",
        "qsmx_shefu": "设伏",
        "qsmx_shefu_info": "一名其他角色使用技能时，你可令其无效。",
        "qsmx_shunjia": "孙家",
        "qsmx_shunjia_info": "锁定技。你进入濒死状态时，你随机检索一张未以此法获得过的姓“孙”的武将牌替换你的武将牌，然后你恢复体力至上限、获得〖孙家〗并摸X张牌；若检索无结果，你死亡。（X为体力上限）",
        "qsmx_mingpan": "明叛",
        "qsmx_mingpan_info": "锁定技，每当你回复1点体力后，你摸三张牌。",
        "qsmx_miehuan": "灭患",
        "qsmx_miehuan_info": "当你造成伤害后，你可以摸一张牌。若如此做，终止一切结算。",
        "qsmx_maxhp": "锻体",
        "qsmx_maxhp_info": "锁定技。当你每失去1点体力后，你增加一点体力上限。",
        "qsmx_void": "虚空",
        "qsmx_void_info": "锁定技，你防止一切即将造成的伤害，然后流失一点体力。",
        "qsmx_pingjian": "评鉴",
        "qsmx_pingjian_info": "你可以于满足你“访客”上的一个无技能标签或仅有锁定技标签的技能条件的时机发动此技能，然后你选择移去一张“访客”。若移去的是本次发动技能的“访客”，则你于此技能结算结束时摸一张牌。",
        "qsmx_yingmen": "盈门",
        "qsmx_yingmen_info": "锁定技，①游戏开始时，你从武将牌堆中挑选四张武将牌置于你的武将牌上，称为“访客”。②回合开始时，若你的“访客”数小于4，你从武将牌堆中选择[4-X]张武将牌将置于你的武将牌上，称为“访客”。（X为你的“访客”数）",
        "qsmx_huiwan": "会玩",
        "qsmx_huiwan_info": "锁定技，你摸牌时，若你从牌堆顶/牌堆底摸牌，你从牌堆中挑选等量的牌置于牌堆顶/牌堆底。",
        "qsmx_yishua": "印刷",
        "qsmx_yishua_info": "出牌阶段，你可以弃置一张【纸】，声明一个点数、花色和牌名，然后你从游戏外获得一张与你声明的点数、花色、牌名相同的牌。",
        "qsmx_craft": "合成",
        "qsmx_craft_info": "出牌阶段，你可以将两张装备牌合成为一张。",
        "qsmx_dingjun": "定军",
        "qsmx_dingjun_info": "出牌阶段限一次，你可以将任意张花色不同的牌置入你的武将牌，称之为“军”，直到结束阶段，其他角色无法使用或打出与“军”花色相同的牌；结束阶段，你获得所有“军”。",
        "qsmx_guangxin": "观星",
        "qsmx_guangxin_info": "",
        "qsmx_mingqu": "冥躯",
        "qsmx_mingqu_info": "专属技，此技能不会被无效化；你的手牌上限始终为体力上限；你取消濒死结算、武将牌替换、技能清除/禁用、体力上限变动；你的体力变动后，你将体力调整至1（不嵌套触发）；你受到伤害值基数为X的属性伤害后，若造成伤害的牌的颜色未被〖冥躯〗记录，你记录之；一名角色回合结束后，若〖冥躯〗记录的颜色大于等于三种，你死亡，否则你清除〖冥躯〗的记录，你取消不以此法的死亡。（X为当前回合角色手牌中的点数数）",
        "qsmx_guiwang": "鬼王",
        "qsmx_guiwang_info": "专属技，你的武将牌状态变化后，你进行一次判定，若结果为黑色，你摸三张牌，否则摸一张牌；你的回合结束后或你失去牌后，若你没有手牌，你翻面。",
        "qsmx_tiemian": "铁面",
        "qsmx_tiemian_info": "锁定技。当你成为【杀】的目标后，你进行判定。若结果为黑色，则取消此目标。",
        "qsmx_jijun": "集军",
        "qsmx_jijun_info": "出牌阶段限一次，你可以将任意张花色不同的牌置入你的武将牌，称之为“军”；结束阶段，你获得所有“军”。",
        "qsmx_tieqi": "铁骑",
        "qsmx_tieqi_info": "当你使用牌指定一名角色为目标后，你还原其函数。",
        "qsmx_dinghhuo": "绽火",
        "qsmx_dinghhuo_info": "你可以将普通锦囊牌当【火烧连营】，延时锦囊牌当【火山】，基本牌当【火杀】使用；你造成/受到属性伤害时，此伤害+1/-1。",
        "qsmx_qianxun": "谦逊",
        "qsmx_qianxun_info": "锁定技，你不能成为【顺手牵羊】和【乐不思蜀】的目标。",
        "qmsx_lianying": "连营",
        "qmsx_lianying_info": "出牌阶段，你可以将任意张牌交给一名未横置的角色令其横置；当你失去最后的手牌时，你可以摸一张牌。",
        "qsmx_hunyou": "魂佑",
        "qsmx_hunyou_info": "专属技，你取消武将牌替换、体力上限变动、技能禁用/清除。你的濒死结算完成后，若你的体力不大于0，你死亡，你取消不以此法的死亡。你进入濒死状态时，若你因非虚拟非转化牌造成的伤害而进入濒死状态，你将体力调整为0，否则你将体力调整为1，最后你视为获得【潜行】和【免疫】直到回合结束；你首次进入濒死状态时，你获得〖英姿〗和〖红颜〗。",
        "qsmx_jiang": "激昂",
        "qsmx_jiang_info": "你使用红色牌无次数限制、不可被响应且红色牌不计入手牌上限；每当你失去一张红色牌后，你可以摸一张牌并视为使用一张【酒】。",
        "qsmx_taoni": "讨逆",
        "qsmx_taoni_info": "锁定技，你的判定结果确认时，若结果为红色【杀】或【决斗】，你终止此判定；一名角色的判定事件终止后，你令一名其他角色死亡。",
        "qsmx_kamisha": "神煞",
        "qsmx_kamisha_info": "锁定技，你所有的牌属性均视为神属性。",
        "qsmx_shishen": "弑神",
        "qsmx_shishen_info": "专属技，一轮游戏开始时，你视为对自己造成一点伤害；一名判定结果确认时，你展示牌堆顶、牌堆底一张牌，若展示牌与判定牌的描述中均有“伤害”字段，你终止此判定事件，否则你获得展示牌；一名角色的判定事件终止后，你令一名其他角色死亡。",
        "spear_of_longinus": "朗基努斯",
        "spear_of_longinus_info": "",
        "qsmx_longinusSkill": "朗枪",
        "qsmx_longinusSkill_info": "锁定技。①游戏开始时，你将【朗基努斯】置入装备区。②你手牌区内的武器牌均视为【杀】，且你不是武器牌的合法目标。③当你即将失去【朗基努斯】或即将废除武器栏时，取消之。④你不能将装备区内的【朗基努斯】当做其他牌使用或打出。",
        "qsmx_zhouqu": "咒躯",
        "qsmx_zhouqu_info": "专属技，你取消技能清除/失效、武将牌替换、濒死结算、体力变动、体力上限变动；你受到伤害后，你进行一次判定，若结果为黑色，你流失一点体力；你的武将牌状态变动后，你令武将牌状态与你相同的角色依次流失一点体力，你亮出牌堆顶一张牌，若亮出牌点数为[X-1]，你死亡，你取消不以此法的死亡。（X为武将牌状态与你相同的角色数）",
        "qsmx_chaos": "混乱",
        "qsmx_chaos_info": "锁定技。其他角色回合开始前，你随机重新排序其阶段执行顺序；",
        "qsmx_zaozhi": "造纸",
        "qsmx_zaozhi_info": "出牌阶段限一次，你可以弃置任意张牌从游戏外获得等量的【纸】；【纸】不计入你的手牌上限。",
        "qsmx_cycle": "循环",
        "qsmx_cycle_info": "",
        "qsmx_test": "测试",
        "qsmx_test_info": "",
        "qsmx_shiyuan": "噬元",
        "qsmx_shiyuan_info": "专属技，一名角色失去牌后，你获得X枚“⑦”标记，然后，若你拥有的“⑦”标记数不小于牌堆剩余牌数，你移去等量于牌堆剩余牌数的“⑦”标记并洗牌。（X为失去牌的点数和）",
        "qsmx_shenwei": "神威",
        "qsmx_shenwei_info": "专属技，敌方角色出牌阶段开始时，若其手牌数大于体力，你随机将其[X-Y]张手牌置入弃牌堆。（X、Y分别为其手牌数、体力）",
        "qsmx_weimu": "帷幕",
        "qsmx_weimu_info": "专属技，你不能成为延时锦囊牌的目标；你取消技能清除/失效、武将牌替换、濒死结算、体力上限变动；你防止你回合内受到的伤害，然后摸2X张牌（依然可以触发时机为\"damageEnd\"的卖血技）；你受到牌的伤害后，若此伤害没有伤害来源，你死亡，你取消不以此法的死亡。（X为伤害值）",
        "qsmx_yanmie": "湮灭",
        "qsmx_yanmie_info": "专属技，一名角色获得牌/失去牌/体力扣减后，你获得X枚“湮灭”标记<br>②当你的“湮灭”标记增加时，记增加前的“湮灭”标记数为A，若增加后的“湮灭”标记数大于离A最近的42的倍数B（B>A），你可以移除[7Y]枚“湮灭”，对Y名角色死亡。（X为其获得牌数/失去牌数/体力扣减数）",
        "qmsx_zhengli": "证理",
        "qmsx_zhengli_info": "你的回合开始时，你可以弃置任意张牌并摸等量的牌，若[(X-Y)+(Z/(W*V))^(U-T)]=42，你和你的阵营获得本局游戏的胜利。（X、Y、Z、W、V、U、T分别为弃置牌中的花色数、颜色数、类型数、点数和、牌名字数和、牌名数、属性数）",
        "qsmx_zhuilie": "追猎",
        "qsmx_zhuilie_info": "出牌阶段，你可以弃置一张武器牌或坐骑牌，或流失一点体力，对一名其他角色造成X点伤害。（X为你与其的距离）",
        "qsmx_anjian": "暗箭",
        "qsmx_anjian_info": "锁定技，你即将造成的伤害均视为无来源伤害。",
        "qsmx_leijie": "雷劫",
        "qsmx_leijie_info": "你的判定阶段开始时，你可以令一名其他角色进行一次反转【闪电】判定，此判定结果确认为失效时，你摸一张牌并重复此流程。",
        "qsmx_mishen": "秘神",
        "qsmx_mishen_info": "<ins>你不是一名可选武将</ins>；你登场时，以你的阵营胜利结束本局游戏。",
    }
}