import { lib, game, ui, get, ai, _status } from '../../../../../noname.js'
import { basic } from '../../basic.js';
export const character = async function () {
    var pack = {
        character: {
            "qsmx_longinus": ["male", "western", 4, ["qsmx_shishen", "qsmx_longinusSkill", "qsmx_zhouqu"], ["ext:奇思妙想/resource/image/character/qsmx_longinus.jpg", "die:ext:奇思妙想/resource/audio/die/qsmx_longinus.mp3"]],
            "qsmx_xusha": ["male", "qun", 3, ["qsmx_yingmen", "qsmx_pingjian"], ["ext:奇思妙想/resource/image/character/qsmx_xusha.jpg", "die:ext:奇思妙想/resource/audio/die/qsmx_xusha.mp3"]],
            "qsmx_huangzhong": ["male", "shu", "4/4", ["qsmx_liegong", "qsmx_fushe", "qsmx_shidi"], ["ext:奇思妙想/resource/image/character/qsmx_huangzhong.jpg", "die:ext:奇思妙想/resource/audio/die/qsmx_huangzhong.mp3"]],
            "qsmx_hw_sunquan": ["male", "wu", "4/4", ["rezhiheng", "rejiuyuan", "qsmx_huiwan", "qsmx_winwin"], ["ext:奇思妙想/resource/image/character/qsmx_hw_sunquan.jpg", "die:ext:奇思妙想/resource/audio/die/qsmx_hw_sunquan.mp3"]],
            "qsmx_sunquan": ["male", "wu", "4/4", ["qsmx_zhiheng", "rejiuyuan"], ["ext:奇思妙想/resource/image/character/qsmx_sunquan.jpg", "die:ext:奇思妙想/resource/audio/die/qsmx_sunquan.mp3", "zhu"]],
            "qsmx_baozheng": ["male", "qun", "1/12", ["qsmx_difu", "qsmx_guiwang", "qsmx_xingpan", "qsmx_mingqu"], ["ext:奇思妙想/resource/image/character/qsmx_baozheng.jpg", "die:ext:奇思妙想/resource/audio/die/qsmx_baozheng.mp3"]],
            "qsmx_hw_zhonghui": ["male", "wei", "4/4", ["xinquanji", "xinzili", "qsmx_huiwan"], ["ext:奇思妙想/resource/image/character/qsmx_hw_zhonghui.jpg", "die:ext:奇思妙想/resource/audio/die/qsmx_hw_zhonghui.mp3"]],
            "qsmx_luxun": ["male", "wu", "4/4", ["qsmx_qianxun", "qsmx_dinghhuo", "qmsx_lianying"], ["ext:奇思妙想/resource/image/character/qsmx_luxun.jpg", "die:ext:奇思妙想/resource/audio/die/qsmx_luxun.mp3"]],
            "qsmx_sunce": ["male", "wu", "4/4", ["qsmx_jiang", "qsmx_hunyou", "qsmx_taoni"], ["ext:奇思妙想/resource/image/character/qsmx_sunce.jpg", "zhu", "die:ext:奇思妙想/resource/audio/die/qsmx_sunce.mp3"]],
            "qsmx_cailun": ["male", "qun", "3/3", ["qsmx_zaozhi", "qsmx_yishua"], ["ext:奇思妙想/resource/image/character/qsmx_cailun.jpg"]],
            "qsmx_SevenGod": ["female", "shen", "7/7", ["qsmx_qichong", "qsmx_shenwei", "qsmx_shiyuan"], ["ext:奇思妙想/resource/image/character/qsmx_SevenGod.jpg"]],
            "qsmx_jiaxu": ["male", "wei", "4/4", ["qsmx_weimu", "qsmx_yanmie",], ["ext:奇思妙想/resource/image/character/qsmx_jiaxu.jpg", "die:ext:奇思妙想/resource/audio/die/qsmx_jiaxu.mp3"]],
            "qsmx_wangshuang": ["male", "wei", "8/8", ["qsmx_zhuilie"], ["ext:奇思妙想/resource/image/character/qsmx_wangshuang.jpg", "die:ext:奇思妙想/resource/audio/die/qsmx_wangshuang.mp3"]],
            "qsmx_nanhua": ["male", "qun", "3/3", ["qsmx_void", "qsmx_leijie"], ["ext:奇思妙想/resource/image/character/qsmx_nanhua.jpg", "die:ext:奇思妙想/resource/audio/die/qsmx_nanhua.mp3"]],
            //"qsmx_junko": ["female", "shen", "4/4", ["qsmx_chunhua"], ["ext:奇思妙想/resource/image/character/qsmx_junko.jpg" ,'boss', 'bossallowed']],
            "qsmx_matara_okina": ["female", "shen", "4/4", ["qsmx_mishen"], ["ext:奇思妙想/resource/image/character/qsmx_matara_okina.jpg"]],
            "qsmx_cenhun": ["male", "wu", "6/6", ["qsmx_liancai", "jishe", "lianhuo"], ["ext:奇思妙想/resource/image/character/qsmx_cenhun.jpg", "die:ext:奇思妙想/resource/audio/die/qsmx_cenhun.mp3"]],
            "qsmx_zhenji": ["female", "wei", "3/3", ["qsmx_luoshen", "qsmx_qingguo"], ["ext:奇思妙想/resource/image/character/qsmx_zhenji.jpg", "die:ext:奇思妙想/resource/audio/die/qsmx_zhenji.mp3"]],
            "qsmx_zhengxie": ["female", "key", "1/2", ["qsmx_tianxie", "qsmx_reverse"], ["ext:奇思妙想/resource/image/character/qsmx_zhengxie.jpg", "die:ext:奇思妙想/resource/audio/die/qsmx_zhengxie.mp3"]],
            "qsmx_guanyu": ["male", "shu", "4/4", ["qsmx_wusheng", "qsmx_yijue"], ["ext:奇思妙想/resource/image/character/qsmx_guanyu.jpg", "die:ext:奇思妙想/resource/audio/die/qsmx_guanyu.mp3"]],
            "qsmx_mimidog": ["male", "key", "6/6", ["qsmx_cizhang", "qsmx_yangbai", "qsmx_mingli"], ["ext:奇思妙想/resource/image/character/qsmx_mimidog.jpg"]],
            "qsmx_caocao": ["male", "wei", "4/4", ["qsmx_jianxiong", "rehuojia"], ["ext:奇思妙想/resource/image/character/qsmx_caocao.jpg", "zhu"]],
            "qsmx_caopi": ["male", "wei", "3/3", ["qsmx_xingshang", "qsmx_fangzhu", "songwei"], ["ext:奇思妙想/resource/image/character/qsmx_caopi.jpg", "zhu"]],
            "qsmx_caorui": ["male", "wei", "3/3/1", ["qsmx_huituo", "qsmx_mingjian", "xingshuai"], ["ext:奇思妙想/resource/image/character/qsmx_caorui.jpg", "zhu"]],
            "qsmx_menghuo": ["male", "qun", "4/7", ["qsmx_manqin", "qsmx_zaiqi"], ["ext:奇思妙想/resource/image/character/qsmx_menghuo.jpg"]],
            "qsmx_huatuo": ["male", "qun", "3/3", ['qsmx_jishi', 'qsmx_jingyu'], ["ext:奇思妙想/resource/image/character/qsmx_huatuo.jpg"]],
            "qsmx_zhangliao": ["male", "wei", "4/4", ["qsmx_tuxi"], ["ext:奇思妙想/resource/image/character/qsmx_zhangliao.jpg"]],
            "qsmx_simashi": ["male", "jin", "3/4", ["qsmx_taoyin", "qsmx_yimie", "qsmx_tairan", "qsmx_ruilve"], ["ext:奇思妙想/resource/image/character/qsmx_simashi.jpg", "zhu", "hiddenSkill"]],
        },
        characterTitle: {
            "qsmx_longinus": "百夫长",
            "qsmx_cailun": "纸圣",
            "qsmx_luxun": "夷陵火神",
            "qsmx_matara_okina": "究极的绝对秘神",
            "qsmx_SevenGod": "反记叙存在",
        },
        characterIntro: {
            "qsmx_cailun": "蔡伦（63年－121年），字敬仲，东汉桂阳郡人。 汉明帝永平末年（公元75年），蔡伦入宫给事；汉章帝建初年间（76-84年），升任小黄门；汉和帝继位后，升任中常侍， 后又兼任尚方令，监造刀剑器械 。永元十四年（102年）蔡伦在邓皇后的支持下 ，总结以往人们的造纸经验，革新造纸工艺，最终制成了“蔡侯纸”，并于元兴元年（公元105年）奏报朝廷，汉和帝下令推广他的造纸法 。建光元年（公元121年），邓太后崩逝，汉安帝亲政，蔡伦服毒自尽，享年59岁。  蔡伦富有才学，敦厚谨慎，常犯颜谏诤，匡正得失，是宦官中少见的品德。其性格孤傲高洁，每至假期便闭门谢客，从不结派弄权，因而被誉为“汉宦官之贤者”。蔡伦改进 （一说发明）的造纸术被列为中国古代“四大发明” ，对人类文化的传播和世界文明的进步做出了杰出的贡献，千百年来备受人们的尊崇 ，被纸工奉为造纸鼻祖、“纸圣”、“纸神” 。 麦克·哈特的《影响人类历史进程的100名人排行榜》中，蔡伦排在第七位 。美国《时代》周刊公布的“有史以来的最佳发明家”中蔡伦上榜 。2008年北京奥运会开幕式，特别展示了蔡伦改进（一说发明）的造纸术 。",
            "qsmx_matara_okina": "摩多罗隐岐奈是东方系列中的官方角色，首次登场于东方天空璋，担任天空璋的六面Boss及EX面Boss。 是创立幻想乡的贤者之一，不过一直以来极少出现在世人眼中，拥有在万物背上制作门扉程度的能力。 究极的绝对秘神，神格极多，发动季节异变明面上是为了给二童子找继任者，真正目的则是引人注目。 在天空璋登场后也曾在小数点作和官方漫画登场，是比较活跃的新角色。 刚欲异闻中，她最早注意到了饕餮尤魔在血池地狱的异常行为，便一手主导了黑水异变。她暗中把消息透露给地上的众人，并派遣芙兰朵露击败饕餮尤魔，最终没有隐患地平息了骚动。 ",
            "qsmx_SevenGod": "七角噬元神，网络共笔怪谈体系《SCP基金会》中登场的反记叙存在，又称七重毁灭者/非存在之主。其同时存在于多个叙事层面，并能够摧毁任意将其信息囊括到一定程度的叙事，已经有多个元虚构叙事层因其而亡。戏里的故事，戏外的现实，层层嵌套的叙事，有着真实与虚构的差别，但在本质上都是七角噬元神的毁灭目标。",
        },
        characterFilter: {
            "qsmx_matara_okina": function (mode) {
                return false;
            },
            "qsmx_xusha": function (mode) {
                return false;
            }
        },
        characterSort: {
            "mode_extension_奇思妙想": {
                "qsmx_junko_aura": ['qsmx_junko'],
                "qsmx_HellOfResistance": ['qsmx_huangzhong', 'qsmx_baozheng', 'qsmx_SevenGod', 'qsmx_sunce', 'qsmx_jiaxu', 'qsmx_longinus', 'qsmx_mimidog', 'qsmx_simashi'],
                "qsmx_huiwanxili": ['qsmx_xusha', 'qsmx_hw_zhonghui', 'qsmx_hw_sunquan'],
                "qmsx_diy": ['qsmx_sunquan', 'qsmx_menghuo', 'qsmx_caorui', 'qsmx_caopi', 'qsmx_caocao', 'qsmx_huatuo', 'qsmx_zhangliao', 'qsmx_guanyu', 'qsmx_zhenji', 'qsmx_luxun', 'qsmx_cailun', 'qsmx_wangshuang', 'qsmx_nanhua', 'qsmx_cenhun'],
                "qsmx_touhou": ['qsmx_matara_okina', 'qsmx_zhengxie']
            }
        },
        translate: {
            "qsmx_junko_aura": "无技能的炼狱",
            "qsmx_HellOfResistance": "纯粹的抗性地狱",
            "qsmx_huiwanxili": "会玩系列武将",
            "qsmx_hw_sunquan": "会玩孙权",
            "qsmx_hw_zhonghui": "会玩钟会",
            "qmsx_diy": "DIY武将",
            "qsmx_touhou": "东方武将",
            "qsmx_caorui": "妙曹叡",
            "qsmx_zhangliao": "妙张辽",
            "qsmx_huatuo": "妙华佗",
            "qsmx_caopi": "妙曹丕",
            "qsmx_zhengxie": "鬼人正邪",
            "qsmx_menghuo": "妙孟获",
            "qsmx_caocao": "妙曹操",
            "qsmx_mimidog": "眯咪狗",
            "qsmx_guanyu": "妙关羽",
            "qsmx_zhenji": "妙甄宓",
            "qsmx_cenhun": "妙岑昏",
            "qsmx_simashi": "妙司马师",
            "qsmx_huangzhong": "妙黄忠",
            "qsmx_longinus": "朗基努斯",
            "qsmx_baozheng": "妙包拯",
            "qsmx_sunce": "妙孙策",
            "qsmx_xusha": "妙许劭",
            "qsmx_sunquan": "妙孙权",
            "qsmx_zhonghui": "妙钟会",
            "qsmx_luxun": "妙陆逊",
            "qsmx_cailun": "蔡伦",
            "qsmx_SevenGod": "七重毁灭者",
            "qsmx_jiaxu": "妙贾诩",
            "qsmx_wangshuang": "妙王双",
            "qsmx_nanhua": "妙南华老仙",
            "qsmx_matara_okina": "摩多罗隐岐奈",
            "qsmx_junko": "纯狐"
        },
    };
    return pack;
}