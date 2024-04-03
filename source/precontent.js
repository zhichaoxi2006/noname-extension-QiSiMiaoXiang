import { lib, game, ui, get, ai, _status } from '../../../noname.js'
export async function precontent(config, pack) {
    //MathJax
    window.MathJax = {
        tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']]
        },
        svg: {
            fontCache: 'global'
        },
        options: {
            renderActions: {
                // 设置SVG输出并启用缩放
                findScript: [1, function (doc) {
                    for (const node of document.querySelectorAll('math')) {
                        if (!node.getAttribute('mode') || node.getAttribute('mode') === 'display') {
                            // 对于display模式的公式，可以考虑添加类以方便CSS控制
                            node.classList.add('mjx-svg-display');
                        } else {
                            node.classList.add('mjx-svg-inline');
                        }
                    }
                }, ''],
            },
            SVG: {
                fontCache: 'global', // 共享字体缓存可以优化SVG渲染后的缩放
            },
        },
    };
    (function () {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        script.async = true;
        document.head.appendChild(script);
    })();
    //namePrifix
    if (lib.namePrefix) {
        lib.namePrefix.set('妙', {
            color: '#dcdcdc',
            nature: 'black',
        });
        lib.namePrefix.set('会玩', {
            color: '#dcdcdc',
            nature: 'black',
        });
        const prefix = {
            'qsmx':['qsmx_baozheng','qsmx_sunce','qsmx_jiaxu','qsmx_luxun','qsmx_xusha','qsmx_zhonghui','qsmx_sunquan','qsmx_wangshuang','qsmx_nanhua','qsmx_cenhun','qsmx_huangzhong','qsmx_zhenji','qsmx_guanyu','qsmx_caocao',"qsmx_caopi"],
            'qsmx_hw':['qsmx_hw_sunquan','qsmx_hw_zhonghui']
        };
        for (var i of prefix['qsmx']) lib.translate[i + '_prefix'] = '妙';
        for (var i of prefix['qsmx_hw']) lib.translate[i + '_prefix'] = '会玩';
    }
}