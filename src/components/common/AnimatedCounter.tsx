import React from 'react';
import { useCountUp } from '../../lib/animations';

export interface AnimatedCounterProps {
  value: number | string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  decimals,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  // If it's a number
  if (typeof value === 'number') {
    const animatedValue = useCountUp(value);
    const hasDecimals = decimals !== undefined ? decimals : (value % 1 !== 0 ? 1 : 0);
    return (
      <span className={className}>
        {prefix}
        {animatedValue.toFixed(hasDecimals)}
        {suffix}
      </span>
    );
  }

  // If it's a string, attempt to parse percentage or number
  const numMatch = String(value).match(/^([^\d\-\.]*)([\d\.\-]+)(.*)$/);
  if (numMatch) {
    const extractedPrefix = prefix || numMatch[1];
    const numericPart = parseFloat(numMatch[2]);
    const extractedSuffix = suffix || numMatch[3];

    if (!isNaN(numericPart)) {
      const animatedValue = useCountUp(numericPart);
      const hasDecimals = decimals !== undefined ? decimals : (numericPart % 1 !== 0 ? 1 : 0);
      return (
        <span className={className}>
          {extractedPrefix}
          {animatedValue.toFixed(hasDecimals)}
          {extractedSuffix}
        </span>
      );
    }
  }

  // Fallback to literal value for non-numeric strings
  return (
    <span className={className}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
};
