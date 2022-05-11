import React, { FC } from "react";

const Logo: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M27 5V27H5M31 9V31H9M1 1H23V23H1V1Z"
      stroke="currentcolor"
      stroke-width="2"
    />
  </svg>
);

export default Logo;
