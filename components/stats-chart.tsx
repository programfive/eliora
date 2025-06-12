import { useEffect, useRef } from "react";
import { createChart, ColorType, Time, AreaSeries } from "lightweight-charts";
import styles from "@/styles/stats.module.css";

interface DataPoint {
  time: Time;
  value: number;
}

interface StatsChartProps {
  data: DataPoint[];
  title?: string;
  color?: string;
}

export default function StatsChart({ data, title, color = "#2563eb" }: StatsChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#091a44",
      },
      grid: {
        vertLines: { color: "#e3e8ee" },
        horzLines: { color: "#e3e8ee" },
      },
      rightPriceScale: {
        borderColor: "#c3cfe2",
      },
      timeScale: {
        borderColor: "#c3cfe2",
        timeVisible: true,
        secondsVisible: false,
      },
    });


    const areaSeries = chart.addSeries(AreaSeries);

    areaSeries.setData(data);

    // Responsive resize
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, color]);

  return (
    <div className={styles.chartCard}>
      {title && <h4 className={styles.chartTitle}>{title}</h4>}
      <div ref={chartContainerRef} className={styles.chartContainer} />
    </div>
  );
}