
import React, { useState, useId } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-1.5';
      case 'left':
        return 'top-1/2 right-full -translate-y-1/2 mr-1.5';
      case 'right':
        return 'top-1/2 left-full -translate-y-1/2 ml-1.5';
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-1.5';
    }
  };

  const showTooltip = () => setVisible(true);
  const hideTooltip = () => setVisible(false);

  const isInteractive = React.isValidElement(children) && (
    (typeof children.type === 'string' && ['button', 'input', 'a', 'select', 'textarea'].includes(children.type)) ||
    (children.props && ((children.props as any).onClick || (children.props as any).onFocus))
  );

  const triggerElement = isInteractive ? children : (
    <span tabIndex={0} className="inline-block cursor-help outline-none">
      {children}
    </span>
  );
  
  const tooltipBgColor = 'bg-zinc-800 dark:bg-zinc-700';
  const tooltipTextColor = 'text-zinc-100 dark:text-zinc-50';
  const arrowBorderColor = 'border-t-zinc-800 dark:border-t-zinc-700'; // Assuming top position for default arrow

  return (
    <div className="relative inline-block">
      <span
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        aria-describedby={visible ? tooltipId : undefined}
      >
        {triggerElement}
      </span>
      {visible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 px-2.5 py-1 text-xs font-medium ${tooltipTextColor} ${tooltipBgColor} rounded-md shadow-lg whitespace-nowrap ${getPositionClasses()} animate-fadeIn`}
        >
          {text}
          <div className={`absolute w-0 h-0 border-solid border-transparent 
            ${position === 'top' ? `left-1/2 -translate-x-1/2 bottom-[-4px] border-t-[4px] ${arrowBorderColor} border-x-[4px] border-x-transparent` :
            position === 'bottom' ? `left-1/2 -translate-x-1/2 top-[-4px] border-b-[4px] border-b-zinc-800 dark:border-b-zinc-700 border-x-[4px] border-x-transparent` :
            position === 'left' ? `top-1/2 -translate-y-1/2 right-[-4px] border-l-[4px] border-l-zinc-800 dark:border-l-zinc-700 border-y-[4px] border-y-transparent` :
            `top-1/2 -translate-y-1/2 left-[-4px] border-r-[4px] border-r-zinc-800 dark:border-r-zinc-700 border-y-[4px] border-y-transparent`
          }`}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
