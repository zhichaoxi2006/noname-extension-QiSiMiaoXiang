import { lib, game, ui, get, ai, _status } from '../../../noname.js'
export const config = {
    "skill_delete": { 
        "name": "技能灭杀", 
        "init": false, 
        "intro": "开启并重启游戏后，所有※抗性标签疑似有点太多和※含有加密代码的技能将会被替换为空技能。（判定规则在lib.qsmx中存放）", 
        "_name": "skill_delete" 
    },
    "easter_egg": { 
        "name": "神秘功能", 
        "init": false, 
        "intro": "某些没啥用的功能，开启可能会导致某些武将强度飙升。", 
        "_name": "easter_egg" 
    },
    "blue_shield": { 
        "name": "蓝盾", 
        "init": false, 
        "intro": "开启后，当一名角色体力扣减时，若满足以下所有条件：①你的护甲值大于0②你的护甲可以为你抵挡伤害③体力扣减由伤害造成④体力扣减值A大于X，你将A改为X。（X为你的护甲值）", 
        "_name": "blue_shield" 
    },
    /*'wand_of_anti_resistance': { 
        "name": "治妄之杖", 
        "init": true, 
        "intro": "游戏开始时，场上角色※抗性标签疑似有点太多和※含有加密代码的技能失效。（判定规则在lib.qsmx中存放）" 
    },*/
}