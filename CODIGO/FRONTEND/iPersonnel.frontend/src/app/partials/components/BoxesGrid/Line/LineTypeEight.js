import React from "react";
import { Row, Col } from 'react-flexbox-grid';

import { renderColumns, sectionColumnType } from '../Line';

const sizes = {
  xs: 12,
  sm: 12,
  md: 3,
  lg: 3,
};

const numberItemsPerSection = 4;

const LineTypeEight = ({
  index,
  row,
  boxConfig
}) => {
  return (
    <>
      {
        row && row.length > 0 &&
        <Row className="my-3" key={index}>
          <Col key={index + '-cl'} xs={12} sm={12} md={6} lg={6}>
            <Row key={index + '-rl'}>{renderColumns(row.slice(0, 4), boxConfig, sizes, index, sectionColumnType.Left, numberItemsPerSection)}</Row>
          </Col>
          <Col key={index + '-cr'} xs={12} sm={12} md={6} lg={6}>
            <Row key={index + '-rr'}>{renderColumns(row.slice(4, 8), boxConfig, sizes, index, sectionColumnType.Right, numberItemsPerSection)}</Row>
          </Col>
        </Row>
      }
    </>
  );
}

export default LineTypeEight;
