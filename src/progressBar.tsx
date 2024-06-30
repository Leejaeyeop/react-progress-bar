"use client";
import "./progressBar.css";
import { useEffect, useRef, useMemo } from "react";

export type ProgressBarProps = {
  value?: number;
  maxValue?: number;
  increaseDuration?: number;
  divide?: boolean;
  sections?: number;
  color?: keyof typeof colorClass;
  colorChange?: boolean;
  stripped?: boolean;
  animated?: boolean;
};

type ColorInfo = {
  [color: string]: {
    begin: number[];
    end: number[];
  };
};

const colorClass = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  black: "bg-black",
};

export const ProgressBarStyle = {
  color: colorClass,
};

export default function ProgressBar(props: ProgressBarProps) {
  const curPercentage = useRef(0);
  const targetPercentage = useRef(0);
  const isAnimating = useRef(false);

  const {
    value = 0,
    increaseDuration = 1000,
    color = "primary",
    colorChange = false,
    divide = true,
    maxValue = 100,
    animated = false,
    stripped = false,
  } = props;
  let { sections = 2 } = props;
  if (sections < 1) {
    sections = 1;
  }

  const progressRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const defaultColorClass = "bg-info";
    const progressElement = progressRef.current as HTMLDivElement;
    const progressBarElement = progressBarRef.current as HTMLDivElement;

    progressElement.className = "progress";
    progressBarElement.className = "progress-bar";

    progressElement.classList.add(colorClass[color] ?? defaultColorClass);
    progressBarElement.classList.add(colorClass[color] ?? defaultColorClass);

    if (stripped) {
      progressElement.classList.add("progress-bar-striped");
    }
    if (animated) {
      progressElement.classList.add("progress-bar-animated");
    }
  }, [color, stripped, animated]);

  useEffect(() => {
    const colorInfo: ColorInfo = {
      primary: {
        begin: [144, 202, 249],
        end: [66, 165, 245],
      },
      secondary: {
        begin: [227, 126, 255],
        end: [214, 67, 255],
      },
      info: {
        begin: [144, 202, 249],
        end: [47, 162, 255],
      },
      success: {
        begin: [47, 198, 128],
        end: [0, 171, 139],
      },
      warning: {
        begin: [255, 193, 7],
        end: [255, 162, 0],
      },
      danger: {
        begin: [255, 149, 160],
        end: [255, 72, 91],
      },
      black: {
        begin: [67, 67, 67],
        end: [0, 0, 0],
      },
    };

    const getCurColor = (currentPercentage: number): string => {
      let r,
        g,
        b = 0;
      const [beginR, beginG, beginB] = colorInfo[color]
        ? colorInfo[color]["begin"]
        : colorInfo["primary"]["begin"];
      const [endR, endG, endB] = colorInfo[color]
        ? colorInfo[color]["end"]
        : colorInfo["primary"]["end"];

      r = Math.floor((endR - beginR) * (currentPercentage * 0.01));
      g = Math.floor((endG - beginG) * (currentPercentage * 0.01));
      b = Math.floor((endB - beginB) * (currentPercentage * 0.01));

      return `rgb(${beginR + r}, ${beginG + g}, ${beginB + b})`;
    };

    let animation: number | null = null;
    const animateProgressBar = (duration: number) => {
      const startPercentage = curPercentage.current;
      const startTime = performance.now();

      return function updatePercentage(timestamp: number) {
        const progressElement = progressRef.current as HTMLDivElement;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentPercentage =
          startPercentage +
            (targetPercentage.current - startPercentage) * progress ?? 0;

        progressElement.style.width = currentPercentage + "%";
        if (colorChange) {
          progressElement.style.backgroundColor =
            getCurColor(currentPercentage);
        }
        curPercentage.current = currentPercentage;

        if (progress < 1 && isAnimating.current) {
          animation = requestAnimationFrame(updatePercentage);
        } else {
          isAnimating.current = false;
        }
      };
    };

    if (value > maxValue) {
      targetPercentage.current = maxValue;
    } else if (value < 0) {
      targetPercentage.current = 0;
    } else {
      targetPercentage.current = value;
    }

    if (!isAnimating.current && value < maxValue) {
      isAnimating.current = true;
      animation = requestAnimationFrame(
        animateProgressBar(increaseDuration >= 0 ? increaseDuration : 0)
      );
    }

    return () => {
      isAnimating.current = false;
      if (animation) {
        cancelAnimationFrame(animation);
      }
    };
  }, [value, increaseDuration, maxValue, colorChange, color]);

  const getSections = useMemo((): number[] => {
    let arr = [];
    for (let i = 0; i < sections; i++) arr.push(i);
    return arr;
  }, [sections]);

  return (
    <div className="progress-bar-container">
      <div ref={progressBarRef} className="progress-bar">
        <div ref={progressRef} className="progress">
          <div className="cur-progress-text">{value}%</div>
        </div>
        {divide ? (
          <div className="divide-bar-container">
            {getSections.map((i) =>
              i < sections - 1 ? (
                <div key={i} className="divide-bar"></div>
              ) : (
                <div key={i}></div>
              )
            )}
          </div>
        ) : null}
      </div>
      {divide ? (
        <div className="divide-count">
          {getSections.map((i) => (
            <div key={i}>{((maxValue / sections) * i).toFixed(0)}</div>
          ))}
          <div>{maxValue}</div>
        </div>
      ) : null}
    </div>
  );
}
