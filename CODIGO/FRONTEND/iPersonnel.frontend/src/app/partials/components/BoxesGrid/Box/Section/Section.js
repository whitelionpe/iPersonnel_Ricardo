import React from "react";

import { sectionContentType } from "../../BoxesGrid";

const Section = ({
  type,
  readOnly,
  getCaptionRef,
  getIconRef,
  getText,
  getCssClass,
  getClassNameCaption,
  getClassNameIcon,
  toggleTooltipHandler,
  onClick,
  onDoubleClick,
  showText,
  showIcon,
}) => {
  return (
    <>
      {
        showText(type) && 
        <span ref={getCaptionRef(type)}
          className={`${getClassNameCaption(type)} ${getCssClass(type, sectionContentType.Span)}`}
          onMouseEnter={() => toggleTooltipHandler(type)}
          onMouseLeave={() => toggleTooltipHandler()}
          onClick={(event) => !readOnly && onClick({type, contentType: sectionContentType.Span, event})}
          // onDoubleClick={(event) => onDoubleClick({type, contentType: sectionContentType.Span, event})}
        >
          {getText(type)}
        </span>
      }
      {
        showIcon(type) && !readOnly && 
        <i ref={getIconRef(type)}
          className={`${getClassNameIcon(type)} ${getCssClass(type, sectionContentType.Icon)}`}
          onMouseEnter={() => toggleTooltipHandler(type)}
          onMouseLeave={() => toggleTooltipHandler()}
          onClick={(event) => onClick({type, contentType: sectionContentType.Icon, event})}
          // onDoubleClick={(event) => onDoubleClick({type, contentType: sectionContentType.Icon, event})}
        />
      }
    </>
  );
}

export default Section;
