"use client";

import React, { useState } from "react";
import { AgGauge } from "ag-charts-react";
import { AgRadialGaugeOptions } from "ag-charts-enterprise";
import "ag-charts-enterprise";
import clone from "clone";

const RadialGaugeChart = () => {
  const [options, setOptions] = useState<AgRadialGaugeOptions>({
    type: "radial-gauge",
    value: 80,
    scale: {
      min: 0,
      max: 100,
    },
    needle: {
      enabled: true,
    },
    bar: {
      enabled: false,
    },
    theme: {
        baseTheme: 'ag-default-dark',
        palette: {
            fills: ['#5C5CFF', '#5CC3FF', '#A35CFF'],
            strokes: ['#4242B4', '#428AB4', '#7342B4']
        }
    },
    background: {
        fill: 'transparent',
    }
  });

  const setNeedleEnabled = (enabled: boolean) => {
    const nextOptions = clone(options);
    if (nextOptions.needle) {
        nextOptions.needle.enabled = enabled;
    }
    setOptions(nextOptions);
  };

  const setBarEnabled = (enabled: boolean) => {
    const nextOptions = clone(options);
    if (nextOptions.bar) {
        nextOptions.bar.enabled = enabled;
    }
    setOptions(nextOptions);
  };

  return (
    <div style={{ width: '300px', height: '300px' }}>
      <AgGauge options={options} />
      {/* 为了简洁，我暂时移除了控制按钮。
        如果你需要它们，可以取消下面的注释。
      */}
      <div className="example-controls">
        <div className="controls-row">
          <button onClick={() => setNeedleEnabled(false)}>Hide Needle</button>
          <button className="gap-right" onClick={() => setNeedleEnabled(true)}>
            Show Needle
          </button>
          <button onClick={() => setBarEnabled(false)}>Hide Bar</button>
          <button onClick={() => setBarEnabled(true)}>Show Bar</button>
        </div>
      </div> 
    </div>
  );
};

export default RadialGaugeChart;
