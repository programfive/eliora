import { useEffect, useRef } from "react";
import { createChart, ColorType, Time, AreaSeries, BarSeries } from "lightweight-charts";
import styles from "@/styles/stats.module.css";

interface DataPoint {
  time: Time | string;
  value: number;
}

interface BarDataPoint {
  time: Time | string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface StatsChartProps {
  data: DataPoint[];
  title?: string;
  color?: string;
  isBarChart?: boolean;
}

export default function StatsChart({ data, title, color = "#2563eb", isBarChart = false }: StatsChartProps) {
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

    // Responsive resize handler
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };

    // Convert string time values to timestamps for non-date data
    const processedData = data.map((point, index) => {
      if (typeof point.time === 'string' && !point.time.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // For non-date strings, create a sequence of dates starting from today
        const date = new Date();
        date.setDate(date.getDate() - (data.length - index - 1));
        return {
          time: date.toISOString().split('T')[0],
          value: point.value
        };
      }
      return point;
    });

    if (isBarChart) {
      // Convert data to bar format
      const barData: BarDataPoint[] = processedData.map(point => ({
        time: point.time,
        open: point.value,
        high: point.value,
        low: point.value,
        close: point.value
      }));

      const barSeries = chart.addSeries(BarSeries, {
        upColor: color,
        downColor: color,
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01
        }
      });
      barSeries.setData(barData);

      // Add custom labels below the chart
      const labelsContainer = document.createElement('div');
      labelsContainer.style.display = 'flex';
      labelsContainer.style.justifyContent = 'space-between';
      labelsContainer.style.padding = '10px';
      labelsContainer.style.marginTop = '-30px';
      
      data.forEach((point) => {
        if (typeof point.time === 'string') {
          const label = document.createElement('div');
          label.textContent = point.time;
          label.style.textAlign = 'center';
          label.style.flex = '1';
          labelsContainer.appendChild(label);
        }
      });

      chartContainerRef.current?.appendChild(labelsContainer);

      window.addEventListener("resize", handleResize);

      return () => {
        chartContainerRef.current?.removeChild(labelsContainer);
        window.removeEventListener("resize", handleResize);
        chart.remove();
      };
    } else {
      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor: color,
        topColor: color,
        bottomColor: 'rgba(37, 99, 235, 0.1)'
      });
      areaSeries.setData(processedData);

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        chart.remove();
      };
    }
  }, [data, color, isBarChart]);

  return (
    <div className={styles.chartCard}>
      {title && <h4 className={styles.chartTitle}>{title}</h4>}
      <div ref={chartContainerRef} className={styles.chartContainer} />
    </div>
  );
}