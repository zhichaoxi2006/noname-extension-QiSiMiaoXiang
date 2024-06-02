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
	//CheckUpdate
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
			qsmx_sp: ['qsmx_sp_zhangliao'],
			qsmx_shen: ['qsmx_shen_zhangjiao', 'qsmx_shen_zhangliao'],
		};
		for (var i of prefix["qsmx_sp"]) lib.translate[i + "_prefix"] = "SP妙";
		for (var i of prefix["qsmx_shen"]) lib.translate[i + "_prefix"] = "妙神";
		for (var i of prefix["qsmx"]) lib.translate[i + "_prefix"] = "妙";
		for (var i of prefix["qsmx_hw"]) lib.translate[i + "_prefix"] = "会玩";
	}
}
