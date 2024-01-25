import React from "react";
import { Row, Col } from 'react-flexbox-grid';

import { renderColumns, sectionColumnType } from '../Line';

const sizes = {
  xs: 12,
  sm: 12,
  md: 6,
  lg: 6,
};

const numberItemsPerSection = 2;

const LineTypeFive = ({
  index,
  row,
  boxConfig
}) => {
  return (
    <>
      {
        row && row.length > 0 &&
        <Row className="my-3" key={index}>
          <Col key={index + '-cl'} xs={12} sm={12} md={5} lg={5}>
            <Row key={index + '-rl'}>{renderColumns(row.slice(0, 2), boxConfig, sizes, index, sectionColumnType.Left, numberItemsPerSection)}</Row>
          </Col>
          <Col className="px-none" key={index + '-cc'} xs={12} sm={12} md={2} lg={2}>
            <Row key={index + '-rm'}>{renderColumns(row.slice(2, 3), boxConfig, undefined, index, sectionColumnType.Middle, numberItemsPerSection)}</Row>
          </Col>
          <Col key={index + '-cr'} xs={12} sm={12} md={5} lg={5}>
            <Row key={index + '-rr'}>{renderColumns(row.slice(3, 5), boxConfig, sizes, index, sectionColumnType.Right, numberItemsPerSection)}</Row>
          </Col>
        </Row>
      }
    </>
  );
}

export default LineTypeFive;
