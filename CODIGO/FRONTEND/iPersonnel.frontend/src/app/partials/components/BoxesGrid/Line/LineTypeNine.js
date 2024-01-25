import React from "react";
import { Row, Col } from 'react-flexbox-grid';

import { renderColumns, sectionColumnType } from '../Line';

const sizes = {
  xs: 12,
  sm: 12,
  md: 4,
  lg: 4,
};

const numberItemsPerSection = 3;

const LineTypeNine = ({
  index,
  row,
  boxConfig
}) => {
  return (
    <>
      {
        row && row.length > 0 &&
        <Row className="my-3" key={index}>
          <Col key={index + '-cl'} xs={12} sm={12} md={4} lg={4}>
            <Row key={index + '-rl'}>{renderColumns(row.slice(0, 3), boxConfig, sizes, index, sectionColumnType.Left, numberItemsPerSection)}</Row>
          </Col>
          <Col key={index + '-cc'} xs={12} sm={12} md={4} lg={4}>
            <Row key={index + '-rm'}>{renderColumns(row.slice(3, 6), boxConfig, sizes, index, sectionColumnType.Middle, numberItemsPerSection)}</Row>
          </Col>
          <Col key={index + '-cr'} xs={12} sm={12} md={4} lg={4}>
            <Row key={index + '-rr'}>{renderColumns(row.slice(6, 9), boxConfig, sizes, index, sectionColumnType.Right, numberItemsPerSection)}</Row>
          </Col>
        </Row>
      }
    </>
  );
}

export default LineTypeNine;
