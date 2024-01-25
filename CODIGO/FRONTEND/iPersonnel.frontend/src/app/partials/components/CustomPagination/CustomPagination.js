import React, { useState, useEffect } from "react";
import Pagination from 'react-bootstrap/Pagination';
import { isArray, isFunction, isNumber } from "../../shared/CommonHelper";

import './style.css';

const elementType = {
  First: 'ElementType:First',
  Prev: 'ElementType:Prev',
  LeftEllipsis: 'ElementType:LeftEllipsis',
  Item: 'ElementType:Item',
  RightEllipsis: 'ElementType:RightEllipsis',
  Next: 'ElementType:Next',
  Last: 'ElementType:Last',
};

const sectionType = {
  Left: 'SectionType:Left',
  Middle: 'SectionType:Middle',
  Right: 'SectionType:Right',
};

const getTotalPages = usrTotalPages => isNumber(usrTotalPages) && usrTotalPages >= 0 && usrTotalPages || 0;
const getCurrentPage = (usrCurrentPage, totalPages) => isNumber(usrCurrentPage) && usrCurrentPage > 0 && (usrCurrentPage <= totalPages && usrCurrentPage || totalPages) || 1;

const CustomPagination = ({
  visible = true,
  disabled: usrDisabled = false,
  size = 'md',
  currentPage: usrCurrentPage = 1,
  totalPages: usrTotalPages,
  showMaxButtons: usrShowMaxButtons = 3,
  showFirstLast: usrShowFirstLast = true,
  showPrevNext: usrShowPrevNext = true,
  showEllipsis: usrShowEllipsis = true,
  onPageChanged: usrOnPageChanged,
}) => {
  const defaultShowMaxButtons = 3;
  const type = { ...elementType };
  const initTotalPages = getTotalPages(usrTotalPages);

  // --------------------------------------------------------------------
  // declarations
  // --------------------------------------------------------------------
  const [totalPages, setTotalPages] = useState(initTotalPages);  // ==> usrTotalPages = 0, ocultará todo el componente
  const [currentPage, setCurrentPage] = useState(getCurrentPage(usrCurrentPage, initTotalPages));
  const [showMaxButtons, setShowMaxButtons] = useState(isNumber(usrShowMaxButtons) && usrShowMaxButtons || defaultShowMaxButtons);
  const [showFirstLast, setShowFirstLast] = useState(!!usrShowFirstLast);
  const [showPrevNext, setShowPrevNext] = useState(!!usrShowPrevNext);
  const [showEllipsis, setShowEllipsis] = useState(!!usrShowEllipsis);

  const [leftButtons, setLeftButtons] = useState([]);
  const [middleButtons, setMiddleButtons] = useState([]);
  const [rightButtons, setRightButtons] = useState([]);
  
  const [showAllButtons, setShowAllButtons] = useState(false);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const sort = (a,b) => a - b;
  const onPageChanged = page => isFunction(usrOnPageChanged) && usrOnPageChanged(page);
  const getDisabled = (kind = type.Item, page = undefined) => {
    if (!!usrDisabled) return { disabled: true };
    let disabled = false;
    switch (kind) {
      case type.First:
        disabled = currentPage === 1;
        break;
      case type.Prev:
        disabled = currentPage < 2 || totalPages === 1;
        break;
      case type.Next:
        disabled = currentPage > totalPages - 1 || totalPages === 1;
        break;
      case type.Last:
        disabled = currentPage === totalPages;
        break;
    }
    return disabled ? { disabled: true } : {};
  }
  const getActive = (kind = type.Item, page = undefined) => kind === type.Item && currentPage === page ? { active: true } : {};
  const getVisible = (kind = type.Item, page = undefined) => {
    switch (kind) {
      case type.Item:
        return true;
      case type.First:
        return showFirstLast;
      case type.Prev:
        return showPrevNext;
      case type.LeftEllipsis:
        return showEllipsis && isArray(leftButtons, true);
      case type.RightEllipsis:
        return showEllipsis && isArray(rightButtons, true);
      case type.Next:
        return showPrevNext;
      case type.Last:
        return showFirstLast;
      default: return false;
    }
  }
  const performOnClick = (kind = type.Item, page = undefined) => {
    if (![type.LeftEllipsis, type.RightEllipsis].includes(kind) && page > 0) setCurrentPage(page);
    if ([type.LeftEllipsis, type.RightEllipsis].includes(kind)) recalculatePaginationElements(kind);
  }
  const getShouldBeLocatedAt = () => {
    const [l, m, r] = getOriginalButtonsBySection();
    const [ left, middle, right ] = [
      l.length > 0 && Math.abs(currentPage - l[l.length - 1]) || 0,
      m.length > 0 && Math.min(Math.abs(currentPage - m[0]), Math.abs(currentPage - m[m.length - 1])) || 0,
      r.length > 0 && Math.abs(currentPage - r[0]) || 0,
    ];
    const section = Math.min(left, middle, right);
    return (section === left ? sectionType.Left : (section === middle ? sectionType.Middle : sectionType.Right));
  }
  const getSizes = () => [ Math.floor(showMaxButtons / 3), showMaxButtons % 3 ];
  const getOriginalButtonsBySection = () => {
    const [ int, mod ] = getSizes();
    const [left, middle, right] = [ [], [], [] ];
    const baseMiddle = Math.floor(totalPages / 2) - Math.floor((int + mod) / 2);
    if (showMaxButtons >= 3) for(let i = 0; i < int; i++) left.push(i + 1);
    for(let i = 0; i < int + mod; i++) middle.push(baseMiddle + i);
    if (showMaxButtons >= 3) for(let i = 0; i < int; i++) right.push(totalPages - int + i + 1);
    return [left, middle, right];
  }
  const getIsInSection = () => {
    const section = getShouldBeLocatedAt();
    return [section === sectionType.Left, section === sectionType.Middle, section === sectionType.Right];
  }
  const isCurrentPageInAnySection = () => {
    return leftButtons.includes(currentPage) || middleButtons.includes(currentPage) || rightButtons.includes(currentPage);
  }
  const getBases = () => {
    const [ int, mod ] = getSizes();
    const [ isLeft, isMiddle, isRight ] = getIsInSection();
    const [ int2Floor, int2Ceil ] = [ Math.floor(int / 2), Math.ceil(int / 2) ];
    const [ baseLeft, baseMiddle, baseRight ] = [
      isLeft ? currentPage - (currentPage < int2Ceil ? int2Floor : int2Ceil) : 0,
      (isMiddle ? currentPage : Math.floor(totalPages / 2)) - Math.floor((int + mod) / 2),
      (isRight && (totalPages - currentPage >= int2Floor) ? currentPage + int2Floor : totalPages) - int,
    ];
    return [baseLeft, baseMiddle, baseRight];
  }
  const calculateShowEllipsis = () => {
    if (!!showEllipsis && showMaxButtons >= totalPages) setShowEllipsis(false);
    else if (!showEllipsis && showMaxButtons < totalPages) setShowEllipsis(true);
  }
  const calculateButtons = (section, base) => {
    const buttons = [];
    const [ int, mod ] = getSizes();
    switch(section) {
      case sectionType.Left: 
        if (showMaxButtons >= 3) for(let i = 0; i < int; i++) buttons.push(base + i + 1);
        break;
      case sectionType.Middle: 
        for(let i = 0; i < int + mod; i++) buttons.push(base + i);
        break;
      case sectionType.Right: 
        if (showMaxButtons >= 3) for(let i = 0; i < int; i++) buttons.push(base + i + 1);
        break;
    }
    return buttons;
  }
  const getNormalizedButtons = (left, middle, right) => {
    const [ int ] = getSizes();
    let [ leftDiff, rightDiff ] = [ [], [] ];
    let [ leftMissing, rightMissing ] = [ 0, 0 ];
    
    ([ left, middle, right ] = [left.sort(sort), middle.sort(sort), right.sort(sort)]);

    // left - middle
    if (left.some(item => middle.includes(item))) {
      leftDiff = left.filter(item => !middle.includes(item));
      middle = [ ...leftDiff, ...middle ];
      left = [];
      leftMissing = int - leftDiff.length;
    } else if (left.length > 0 && middle.length > 0 && left[left.length - 1] + 1 === middle[0]) {
      middle = [ ...left, ...middle ];
      left = [];
    }

    // middle - right
    if (right.some(item => middle.includes(item))) {
      rightDiff = right.filter(item => !middle.includes(item));
      middle = [ ...middle, ...rightDiff ];
      right = [];
      rightMissing = int - rightDiff.length;
    } else if (right.length > 0 && middle.length > 0 && middle[middle.length - 1] + 1 === right[0]) {
      middle = [ ...middle, ...right ];
      right = [];
    }

    ([ left, middle, right ] = [left.sort(sort), middle.sort(sort), right.sort(sort)]);
    
    const [ , lr ] = [ left.length > 0 ? left[0] : false, left.length > 0 ? left[left.length - 1] : false ];
    const [ ml, mr ] = [ middle.length > 0 ? middle[0] : false, middle.length > 0 ? middle[middle.length - 1] : false ];
    const [ rl, ] = [ right.length > 0 ? right[0] : false, right.length > 0 ? right[right.length - 1] : false ];

    if (leftMissing > 0 && mr > 0) {
      if (mr + leftMissing < rl) {
        for (let i = 0; i < leftMissing; i++) {
          middle.push(mr + leftMissing + i);
        }
      } else if (ml - leftMissing >= 0) {
        for (let i = 0; i < leftMissing; i++) {
          middle.push(ml - leftMissing + i + 1);
        }
      }
    }
    
    if (rightMissing > 0 && ml > 0) {
      if (ml - rightMissing > lr) {
        for (let i = 0; i < rightMissing; i++) {
          middle.push(ml - rightMissing + i);
        }
      } else if (mr + rightMissing <= totalPages) {
        for (let i = 0; i < rightMissing; i++) {
          middle.push(mr + rightMissing + i + 1);
        }
      }
    }

    ([ left, middle, right ] = [left.sort(sort), middle.sort(sort), right.sort(sort)]);
    
    if (leftMissing > 0 || rightMissing > 0) ([ left, middle, right ] = getNormalizedButtons(left, middle, right));

    return [ left, middle, right ];
  }
  const calculatePaginationElements = () => {
    let [left, middle, right] = [ [], [], [] ];
    if (!showAllButtons) {
      const [ baseLeft, baseMiddle, baseRight ] = getBases();
      left = calculateButtons(sectionType.Left, baseLeft);
      middle = calculateButtons(sectionType.Middle, baseMiddle);
      right = calculateButtons(sectionType.Right, baseRight);
    } else {
      for (let i = 1; i <= totalPages; i++) left.push(i);
    }

    ([left, middle, right] = getNormalizedButtons(left, middle, right));

    setLeftButtons(left);
    setMiddleButtons(middle);
    setRightButtons(right);
  }
  const recalculatePaginationElements = (kind) => {
    const [ int, mod ] = getSizes();
    let [ left, middle, right ] =  [ [], [], [] ];
    const [ baseLeft, baseMiddle, baseRight ] = getBases();
    switch (kind) {
      case type.LeftEllipsis:
        left = calculateButtons(sectionType.Left, leftButtons.length > 0 ? leftButtons[leftButtons.length - 1] : baseLeft);
        middle = calculateButtons(sectionType.Middle, middleButtons.length > 0 ? middleButtons[0] - (int + mod) : baseMiddle);
        right = calculateButtons(sectionType.Right, baseRight);
        break;
      case type.RightEllipsis:
        left = calculateButtons(sectionType.Left, baseLeft);
        middle = calculateButtons(sectionType.Middle, middleButtons.length > 0 ? middleButtons[middleButtons.length - 1] + 1 : baseMiddle);
        right = calculateButtons(sectionType.Right, rightButtons.length > 0 ? rightButtons[0] - int - 1 : baseRight);
        break;
    }
    
    ([left, middle, right] = getNormalizedButtons(left, middle, right));

    setLeftButtons(left);
    setMiddleButtons(middle);
    setRightButtons(right);
  }
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionality for effects
  // --------------------------------------------------------------------
  const initialization = () => {
    calculatePaginationElements();
    return () => {
      
    };
  }
  const performOnAfterChangedTotalPages = () => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (!showAllButtons && showMaxButtons >= totalPages) setShowAllButtons(true);
    else if (!!showAllButtons && showMaxButtons < totalPages) setShowAllButtons(false);
  };
  const performOnAfterChangedCurrentPage = () => currentPage > 0 && onPageChanged(currentPage);
  const performOnAfterChangedUsrTotalPages = () => isNumber(usrTotalPages) && usrTotalPages >= 0 && setTotalPages(getTotalPages(usrTotalPages));
  const performOnAfterChangedUsrCurrentPage = () => isNumber(usrCurrentPage) && usrCurrentPage > 0 && setCurrentPage(getCurrentPage(usrCurrentPage, totalPages));
  const performOnAfterChangedUsrShowMaxButtons = () => isNumber(usrShowMaxButtons) && usrShowMaxButtons >= 0 && setShowMaxButtons(isNumber(usrShowMaxButtons) && usrShowMaxButtons >= 0 && usrShowMaxButtons || defaultShowMaxButtons);
  const performOnAfterChangedUsrShowFirstLast = () => setShowFirstLast(!!usrShowFirstLast);
  const performOnAfterChangedUsrShowPrevNext = () => setShowPrevNext(!!usrShowPrevNext);
  const performOnAfterChangedUsrShowEllipsis = () => setShowEllipsis(!!usrShowEllipsis);
  // --------------------------------------------------------------------
  // --------------------------------------------------------------------
  // attach effects
  // --------------------------------------------------------------------
  useEffect(initialization, []);
  useEffect(performOnAfterChangedUsrCurrentPage, [usrCurrentPage]);
  useEffect(performOnAfterChangedUsrTotalPages, [usrTotalPages]);
  useEffect(performOnAfterChangedUsrShowMaxButtons, [usrShowMaxButtons]);
  useEffect(performOnAfterChangedUsrShowFirstLast, [usrShowFirstLast]);
  useEffect(performOnAfterChangedUsrShowPrevNext, [usrShowPrevNext]);
  useEffect(performOnAfterChangedUsrShowEllipsis, [usrShowEllipsis]);
  useEffect(performOnAfterChangedTotalPages, [totalPages]);
  useEffect(performOnAfterChangedCurrentPage, [currentPage]);
  useEffect(calculateShowEllipsis, [totalPages, showMaxButtons, showEllipsis]);
  useEffect(calculatePaginationElements, [currentPage, totalPages, showMaxButtons, showAllButtons]);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // rendering
  // --------------------------------------------------------------------
  return (
    <div className="vcg-custom-pagination">
      {
        !!visible && totalPages > 0 && !isCurrentPageInAnySection() && 
        <div className="mr-2">
          <Pagination size={size} bsPrefix="vcg-pagination pagination">
            <Pagination.Item active>{ currentPage }</Pagination.Item>
          </Pagination>
        </div>
      }
      <div>
        {
          !!visible && totalPages > 0 &&
          <Pagination size={size} bsPrefix="vcg-pagination pagination">
            { getVisible(type.First) && <Pagination.First { ...getActive(type.First) } { ...getDisabled(type.First) } onClick={() => performOnClick(type.First, 1)} /> }
            { getVisible(type.Prev) && <Pagination.Prev { ...getActive(type.Prev) } { ...getDisabled(type.Prev) } onClick={() => performOnClick(type.Prev, currentPage - 1)} /> }
            { leftButtons.map(page => (getVisible(type.Item, page) ? <Pagination.Item key={page} { ...getActive(type.Item, page) } { ...getDisabled(type.Item, page) } onClick={() => performOnClick(type.Item, page)}>{ page }</Pagination.Item> : <React.Fragment key={page} />)) }
            { getVisible(type.LeftEllipsis) && <Pagination.Ellipsis  { ...getActive(type.LeftEllipsis) } { ...getDisabled(type.LeftEllipsis) } onClick={() => performOnClick(type.LeftEllipsis)} /> }
            { middleButtons.map(page => (getVisible(type.Item, page) ? <Pagination.Item key={page} { ...getActive(type.Item, page) } { ...getDisabled(type.Item, page) } onClick={() => performOnClick(type.Item, page)}>{ page }</Pagination.Item> : <React.Fragment key={page} />)) }
            { getVisible(type.RightEllipsis) && <Pagination.Ellipsis  { ...getActive(type.RightEllipsis) } { ...getDisabled(type.RightEllipsis) } onClick={() => performOnClick(type.RightEllipsis)} /> }
            { rightButtons.map(page => (getVisible(type.Item, page) ? <Pagination.Item key={page} { ...getActive(type.Item, page) } { ...getDisabled(type.Item, page) } onClick={() => performOnClick(type.Item, page)}>{ page }</Pagination.Item> : <React.Fragment key={page} />)) }
            { getVisible(type.Next) && <Pagination.Next { ...getActive(type.Next) } { ...getDisabled(type.Next) } onClick={() => performOnClick(type.Next, currentPage + 1)} /> }
            { getVisible(type.Last) && <Pagination.Last { ...getActive(type.Last) } { ...getDisabled(type.Last) } onClick={() => performOnClick(type.Last, totalPages)} /> }
          </Pagination>
        }
      </div>
    </div>
  );
  // --------------------------------------------------------------------
};

export default CustomPagination;
export { CustomPagination };
