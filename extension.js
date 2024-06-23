// game.import(name: "奇思妙想",用于诗笺版快捷导入识别扩展名
import { lib, game, ui, get, ai, _status } from '../../noname.js'
import { content } from './source/content.js'
import { precontent } from './source/precontent.js'
import { config } from './source/config.js'
import { help } from './source/help.js'
import { basic } from './source/basic.js'
import { extensionDefaultPackage } from './source/packages/main/main.js'

export let type = 'extension';

export default async function () {
    const extensionInfo =
        await lib.init.promises.json(`${lib.assetURL}${basic.extensionDirectoryPath}info.json`);
    let extension = {
        name: extensionInfo.name,
        content: content,
        precontent: precontent,
        config: await basic.resolve(config),
        help: await basic.resolve(help),
        package: await basic.resolve(extensionDefaultPackage),
        files: {
            "character": [
                "./resource/image/character/qsmx_nanhua.jpg",
                "./resource/image/character/qsmx_sunquan.jpg",
                "./resource/image/character/qsmx_SevenGod.jpg",
                "./resource/image/character/qsmx_matara_okina.jpg",
                "./resource/image/character/qsmx_luxun.jpg",
                "./resource/image/character/qsmx_wangshuang.jpg",
                "./resource/image/character/qsmx_sunce.jpg",
                "./resource/image/character/qsmx_zhonghui.jpg",
                "./resource/image/character/qsmx_cailun.jpg",
                "./resource/image/character/qsmx_longinus.jpg",
                "./resource/image/character/qsmx_xusha.jpg",
                "./resource/image/character/qsmx_jiaxu.jpg",
                "./resource/image/character/qsmx_baozheng.jpg",
                "./resource/image/character/qsmx_mimidog.jpg"
            ],
            "card": [
                "./resource/image/card/longinus.png",
                "./resource/image/card/qsmx_paper.png"
            ],
            "skill": [],
            "audio": [
                './resource/audio/background/ピュアヒューリーズ　～ 心の在処.mp3',
                './resource/audio/die/qsmx_huangzhong.mp3',
                './resource/audio/skill/qsmx_liegong1.mp3',
                './resource/audio/skill/qsmx_liegong2.mp3',
            ]
        }
    };
    Object.keys(extensionInfo)
        .filter(key => key != 'name')
        .forEach(key => extension.package[key] = extensionInfo[key]);
    return extension;
}
