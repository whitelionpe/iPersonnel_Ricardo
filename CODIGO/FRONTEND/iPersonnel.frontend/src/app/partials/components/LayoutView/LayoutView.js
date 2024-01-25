import React, { useState, useEffect } from "react";
import { Grid, Row, Col } from 'react-flexbox-grid';
import { isFunction, isNullOrUndefined, isObject, isPrimitive, isSet, isString } from "../../shared/CommonHelper";
import { 
  sysLayoutCssClass,
  sysViewContainerCssClass,
  sysHeaderCssClass,
  sysContentContainerCssClass,
  sysLeftCssClass,
  sysCenterCssClass,
  sysRightCssClass,
  sysFooterCssClass, 
  SectionType, 
} from ".";

import "./style.css";
import { isNumber } from "lodash";

const LayoutView = ({
  data: usrData,
  visible = true,
  // cssClass
  layoutCssClass: usrLayoutCssClass,
  viewContainerCssClass: usrViewContainerCssClass,
  headerCssClass: usrHeaderCssClass,
  contentContainerCssClass: usrContentContainerCssClass,
  leftCssClass: usrLeftCssClass,
  centerCssClass: usrCenterCssClass,
  rightCssClass: usrRightCssClass,
  footerCssClass: usrFooterCssClass,
  // Sizes
  leftSizes: usrLeftSizes,
  centerSizes: usrCenterSizes,
  rightSizes: usrRightSizes,
  // Renderers
  renderHeader,
  renderLeft,
  renderCenter,
  renderRight,
  renderFooter,
}) => {
  // --------------------------------------------------------------------
  // declarations
  // --------------------------------------------------------------------
  const totalSizes = { xs: 12, sm: 12, md: 12, lg: 12 };
  const defaultSizes = { 
    [SectionType.Left]:   { xs: 12, sm: 4, md: 3, lg: 3 },
    [SectionType.Center]: { xs: 12, sm: 4, md: 6, lg: 6 },
    [SectionType.Right]:  { xs: 12, sm: 4, md: 3, lg: 3 },
  };

  const [data, setData] = useState();
  // sizes
  const [leftSizes, setLeftSizes] = useState({ ...defaultSizes[SectionType.Left] });
  const [centerSizes, setCenterSizes] = useState({ ...defaultSizes[SectionType.Center] });
  const [rightSizes, setRightSizes] = useState({ ...defaultSizes[SectionType.Right] });
  // cssClass
  const [layoutCssClass, setLayoutCssClass] = useState(sysLayoutCssClass);
  const [viewContainerCssClass, setViewContainerCssClass] = useState(sysViewContainerCssClass);
  const [headerCssClass, setHeaderCssClass] = useState(sysHeaderCssClass);
  const [contentContainerCssClass, setContentContainerCssClass] = useState(sysContentContainerCssClass);
  const [leftCssClass, setLeftCssClass] = useState(sysLeftCssClass);
  const [centerCssClass, setCenterCssClass] = useState(sysCenterCssClass);
  const [rightCssClass, setRightCssClass] = useState(sysRightCssClass);
  const [footerCssClass, setFooterCssClass] = useState(sysFooterCssClass);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const getSysCssClass = (sectionType = undefined) => {
    switch(sectionType) {
      case SectionType.ViewContainer: return sysViewContainerCssClass;
      case SectionType.Header: return sysHeaderCssClass;
      case SectionType.ContentContainer: return sysContentContainerCssClass;
      case SectionType.Left: return sysLeftCssClass;
      case SectionType.Center: return sysCenterCssClass;
      case SectionType.Right: return sysRightCssClass;
      case SectionType.Footer: return sysFooterCssClass;
      default: return sysLayoutCssClass;
    }
  }
  const getCssClass = (usrCssClass, sectionType = undefined) => {
    if (!isPrimitive(usrCssClass) && !isFunction(usrCssClass)) return getSysCssClass(sectionType);
    if (isPrimitive(usrCssClass)) return `${getSysCssClass(sectionType)} ${usrCssClass}`;
    if (isFunction(usrCssClass)) return `${getSysCssClass(sectionType)} ${usrCssClass()}`;
  }
  const isThereOnlyOneContentRender = () => {
    return (
      ( isFunction(renderLeft) && !isFunction(renderCenter) && !isFunction(renderRight)) || 
      (!isFunction(renderLeft) &&  isFunction(renderCenter) && !isFunction(renderRight)) ||
      (!isFunction(renderLeft) && !isFunction(renderCenter) &&  isFunction(renderRight))
    );
  }
  const getSizes = (sizes, sectionType) => {
    let result = {};
    if (isNullOrUndefined(sizes)) {
      result = isThereOnlyOneContentRender() ? { ...totalSizes } : defaultSizes[sectionType];
    } else if (isNumber(sizes) || isString(sizes)) {
      result = { xs: sizes, sm: sizes, md: sizes, lg: sizes };
    } else if (isObject(sizes)) {
      const { xs, sm, md, lg } = sizes;
      if (isSet(xs)) result = { ...result, xs };
      if (isSet(sm)) result = { ...result, sm };
      if (isSet(md)) result = { ...result, md };
      if (isSet(lg)) result = { ...result, lg };
    }
    return result;
  }
  const getRendered = (render, props = {}) => isFunction(render) ? render(props) : render;
  const isSetRender = render => isObject(render) || isFunction(render);
  const hasSomeContentRender = () => isSetRender(renderLeft) || isSetRender(renderCenter) || isSetRender(renderRight);
  const hasSomeRender = () => isSetRender(renderHeader) || hasSomeContentRender() || isSetRender(renderFooter);
  // --------------------------------------------------------------------
  
  // --------------------------------------------------------------------
  // functionality for effects
  // --------------------------------------------------------------------
  const performOnAfterChangedUsrData = () => setData(usrData);
  // sizes
  const performOnAfterChangedUsrLeftSizes = () => setLeftSizes(getSizes(usrLeftSizes, SectionType.Left));
  const performOnAfterChangedUsrCenterSizes = () => setCenterSizes(getSizes(usrCenterSizes, SectionType.Center));
  const performOnAfterChangedUsrRightSizes = () => setRightSizes(getSizes(usrRightSizes, SectionType.Right));
  // cssClass
  const performOnAfterChangedUsrLayoutCssClass = () => setLayoutCssClass(getCssClass(usrLayoutCssClass));
  const performOnAfterChangedUsrViewContainerCssClass = () => setViewContainerCssClass(getCssClass(usrViewContainerCssClass, SectionType.ViewContainer));
  const performOnAfterChangedUsrHeaderCssClass = () => setHeaderCssClass(getCssClass(usrHeaderCssClass, SectionType.Header));
  const performOnAfterChangedUsrContentContainerCssClass = () => setContentContainerCssClass(getCssClass(usrContentContainerCssClass, SectionType.ContentContainer));
  const performOnAfterChangedUsrLeftCssClass = () => setLeftCssClass(getCssClass(usrLeftCssClass, SectionType.Left));
  const performOnAfterChangedUsrCenterCssClass = () => setCenterCssClass(getCssClass(usrCenterCssClass, SectionType.Center));
  const performOnAfterChangedUsrRightCssClass = () => setRightCssClass(getCssClass(usrRightCssClass, SectionType.Right));
  const performOnAfterChangedUsrFooterCssClass = () => setFooterCssClass(getCssClass(usrFooterCssClass, SectionType.Footer));
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // attach effects
  // --------------------------------------------------------------------
  useEffect(performOnAfterChangedUsrData, [usrData]);
  // sizes
  useEffect(performOnAfterChangedUsrLeftSizes, [usrLeftSizes]);
  useEffect(performOnAfterChangedUsrCenterSizes, [usrCenterSizes]);
  useEffect(performOnAfterChangedUsrRightSizes, [usrRightSizes]);
  // cssClass
  useEffect(performOnAfterChangedUsrLayoutCssClass, [usrLayoutCssClass]);
  useEffect(performOnAfterChangedUsrViewContainerCssClass, [usrViewContainerCssClass]);
  useEffect(performOnAfterChangedUsrHeaderCssClass, [usrHeaderCssClass]);
  useEffect(performOnAfterChangedUsrContentContainerCssClass, [usrContentContainerCssClass]);
  useEffect(performOnAfterChangedUsrLeftCssClass, [usrLeftCssClass]);
  useEffect(performOnAfterChangedUsrCenterCssClass, [usrCenterCssClass]);
  useEffect(performOnAfterChangedUsrRightCssClass, [usrRightCssClass]);
  useEffect(performOnAfterChangedUsrFooterCssClass, [usrFooterCssClass]);
  // useEffect(() => {
  //   console.log("renderCenter", renderCenter)
  // }, [renderCenter]);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // rendering
  // --------------------------------------------------------------------
  return (
    <>
      {
        !!visible && hasSomeRender() && 
        <Grid className={layoutCssClass}>
          <Row>
            <Col className={viewContainerCssClass}>
              { isSetRender(renderHeader) && <Row><Col className={headerCssClass} { ...totalSizes }>{ getRendered(renderHeader, { data }) }</Col></Row> }
              {
                hasSomeContentRender() && 
                <Row className={contentContainerCssClass}>
                  { isSetRender(renderLeft) && <Col className={leftCssClass} { ...leftSizes }>{ getRendered(renderLeft, { data }) }</Col> }
                  { isSetRender(renderCenter) && <Col className={centerCssClass} { ...centerSizes }>{ getRendered(renderCenter, { data }) }</Col> }
                  { isSetRender(renderRight) && <Col className={rightCssClass} { ...rightSizes }>{ getRendered(renderRight, { data }) }</Col> }
                </Row>
              }
              { isSetRender(renderFooter) && <Row><Col className={footerCssClass} { ...totalSizes }>{ getRendered(renderFooter, { data }) }</Col></Row> }
            </Col>
          </Row>
        </Grid>
      }
    </>
  );
  // --------------------------------------------------------------------
};

export default LayoutView;