import React, { useState } from "react";
import { useNativeEffect } from "remax";
import { Canvas, View } from "remax/wechat";
import F2 from "@antv/f2";
import * as wx from "remax/wechat";
import styles from "./index.css";

let f2Charts = {};

function initByNewWay(id, onInit) {
  const query = wx.createSelectorQuery();
  query
    .select(`#${id}`)
    .fields({ node: true, size: true })
    .exec((res) => {
      const { node, width, height } = res[0];
      const context = node.getContext("2d");
      const pixelRatio = wx.getSystemInfoSync().pixelRatio;
      // 高清设置
      node.width = width * pixelRatio;
      node.height = height * pixelRatio;
      const config = { context, width, height, pixelRatio };
      const chart = onInit(F2, config);
      if (chart && f2Charts[id]) {
        f2Charts[id] = {
          ...f2Charts[id],
          chart,
          canvasEl: chart.get("el"),
        };
      }
    });
}

function initByOldWay(id, canvasId, onInit) {
  // 1.9.91 <= version < 2.9.0：原来的方式初始化
  var query = wx.createSelectorQuery();
  query
    .select(`#${id}`)
    .boundingClientRect((res) => {
      const { width, height } = res;
      const context = wx.createCanvasContext(canvasId);
      const pixelRatio = wx.getSystemInfoSync().pixelRatio;
      const config = { context, width, height, pixelRatio };
      const chart = onInit(F2, config);
      if (chart && f2Charts[id]) {
        f2Charts[id] = {
          ...f2Charts[id],
          chart,
          canvasEl: chart.get("el"),
        };
      }
    })
    .exec();
}

function init(id, canvasId, onInit) {
  const isUseNewCanvas = f2Charts[id].isUseNewCanvas;
  if (isUseNewCanvas) {
    initByNewWay(id, onInit);
  } else {
    const version = wx.getSystemInfoSync().SDKVersion;
    const isValid = compareVersion(version, "1.9.91") >= 0;
    if (!isValid) {
      console.error(
        "微信基础库版本过低，需大于等于 1.9.91。" +
          "参见：https://github.com/ecomfe/echarts-for-weixin" +
          "#%E5%BE%AE%E4%BF%A1%E7%89%88%E6%9C%AC%E8%A6%81%E6%B1%82"
      );
      return;
    } else {
      console.warn(
        "建议将微信基础库调整大于等于2.9.0版本。升级后绘图将有更好性能"
      );
      initByOldWay(id, canvasId, onInit);
    }
  }
}

const F2Canvas = (props) => {
  const [firstRender, setFirstRender] = useState(true); // 是否是首次被渲染，以下的首次均指的是：前一次页面渲染该组件不存在，那么这次渲染组件则是我们所说的首次渲染，而不是指该组件在整个页面的首次出现
  const [isUseNewCanvas, setIsUseNewCanvas] = useState(() => {
    const version = wx.getSystemInfoSync().SDKVersion;
    const canUseNewCanvas = compareVersion(version, "2.9.0") >= 0;
    const forceUseOldCanvas = props.forceUseOldCanvas;
    const isUseNewCanvas = canUseNewCanvas && !forceUseOldCanvas; // 判断是否使用新版Canvas
    if (forceUseOldCanvas && canUseNewCanvas) {
      console.warn("开发者强制使用旧canvas,建议关闭");
    }

    f2Charts[props.id] = {
      isUseNewCanvas,
    };

    return isUseNewCanvas;
  });

  useNativeEffect(() => {
    // 当该组件存在时监听页面渲染完成
    if (firstRender) {
      // 如果是首次渲染完成，初始化图表
      if (!props.lazyLoad) {
        init(props.id, props.canvasId, props.onInit);
      }
      setFirstRender(false);
    }
  });

  const touchStart = (e) => {
    const canvasEl = f2Charts[props.id].canvasEl;
    if (!canvasEl) {
      return;
    }
    canvasEl.dispatchEvent("touchstart", wrapEvent(e));
  };

  const touchMove = (e) => {
    const canvasEl = f2Charts[props.id].canvasEl;
    if (!canvasEl) {
      return;
    }
    canvasEl.dispatchEvent("touchmove", wrapEvent(e));
  };

  const touchEnd = (e) => {
    const canvasEl = f2Charts[props.id].canvasEl;
    if (!canvasEl) {
      return;
    }
    canvasEl.dispatchEvent("touchend", wrapEvent(e));
  };

  return (
    <View className={styles.container}>
      {isUseNewCanvas ? (
        <Canvas
          className={styles.f2Canvas}
          id={props.id}
          type="2d"
          onTouchStart={touchStart}
          onTouchMove={touchMove}
          onTouchEnd={touchEnd}
        ></Canvas>
      ) : (
        <Canvas
          className={styles.f2Canvas}
          id={props.id}
          canvasId={props.canvasId}
          onTouchStart={touchStart}
          onTouchMove={touchMove}
          onTouchEnd={touchEnd}
        ></Canvas>
      )}
    </View>
  );
};

function compareVersion(v1, v2) {
  v1 = v1.split(".");
  v2 = v2.split(".");
  const len = Math.max(v1.length, v2.length);

  while (v1.length < len) {
    v1.push("0");
  }
  while (v2.length < len) {
    v2.push("0");
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i]);
    const num2 = parseInt(v2[i]);

    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }
  return 0;
}

function wrapEvent(e) {
  if (!e) return;
  if (!e.preventDefault) {
    e.preventDefault = function () {};
  }
  return e;
}

/**
 * 根据EcCanvas组件id获取其对应的chart对象；
 * @param {String} id
 */
function getChart(id) {
  if (f2Charts[id] && f2Charts[id].chart) {
    return f2Charts[id].chart;
  }
}

export default F2Canvas;

export const f2Tool = {
  getChart,
};
