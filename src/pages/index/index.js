import React, { useState } from "react";
import { View, Button } from "remax/wechat";
import styles from "./index.css";
import F2Canvas, { f2Tool } from "../../components/f2-canvas";

export default () => {
  const [op, setOp] = useState(true);
  const onInit = (F2, config) => {
    const chart = new F2.Chart(config);
    const data = [
      { value: 63.4, city: "New York", date: "2011-10-01" },
      { value: 62.7, city: "Alaska", date: "2011-10-01" },
      { value: 72.2, city: "Austin", date: "2011-10-01" },
      { value: 58, city: "New York", date: "2011-10-02" },
      { value: 59.9, city: "Alaska", date: "2011-10-02" },
      { value: 67.7, city: "Austin", date: "2011-10-02" },
      { value: 53.3, city: "New York", date: "2011-10-03" },
      { value: 59.1, city: "Alaska", date: "2011-10-03" },
      { value: 69.4, city: "Austin", date: "2011-10-03" },
    ];
    chart.source(data, {
      date: {
        range: [0, 1],
        type: "timeCat",
        mask: "MM-DD",
      },
      value: {
        max: 300,
        tickCount: 4,
      },
    });
    chart.area().position("date*value").color("city").adjust("stack");
    chart.line().position("date*value").color("city").adjust("stack");
    chart.render();
    return chart;
  };
  return (
    <View>
      <View className={styles.chart} style={op ? null : { display: "none" }}>
        <F2Canvas id="test" canvasId="test" onInit={onInit} />
      </View>
      <View>
        <Button
          onClick={() => {
            setOp(!op);
          }}
        >
          开关
        </Button>
        <Button
          onClick={() => {
            f2Tool.getChart("test").changeData([
              {
                value: Math.round(Math.random() * 100 + 1),
                city: "New York",
                date: "2011-10-01",
              },
              {
                value: Math.round(Math.random() * 100 + 1),
                city: "Alaska",
                date: "2011-10-01",
              },
              {
                value: Math.round(Math.random() * 100 + 1),
                city: "Austin",
                date: "2011-10-01",
              },
              {
                value: Math.round(Math.random() * 100 + 1),
                city: "New York",
                date: "2011-10-02",
              },
              {
                value: Math.round(Math.random() * 100 + 1),
                city: "Alaska",
                date: "2011-10-02",
              },
              {
                value: Math.round(Math.random() * 100 + 1),
                city: "Austin",
                date: "2011-10-02",
              },
              {
                value: Math.round(Math.random() * 100 + 1),
                city: "New York",
                date: "2011-10-03",
              },
              {
                value: Math.round(Math.random() * 100 + 1),
                city: "Alaska",
                date: "2011-10-03",
              },
              {
                value: Math.round(Math.random() * 100 + 1),
                city: "Austin",
                date: "2011-10-03",
              },
            ]);
          }}
        >
          更新数据
        </Button>
      </View>
    </View>
  );
};
