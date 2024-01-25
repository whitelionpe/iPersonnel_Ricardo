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

const LineTypeSeven = ({
  index,
  row,
  boxConfig,
}) => {
  return (
    <>
      {
        row && row.length > 0 &&
        <Row className="my-3" key={index}>
          <Col key={index + '-cl'} xs={12} sm={12} md={5} lg={5}>
            <Row key={index + '-rl'}>{renderColumns(row.slice(0, 3), boxConfig, sizes, index, sectionColumnType.Left, numberItemsPerSection)}</Row>
          </Col>
          <Col className="px-none" key={index + '-cc'} xs={12} sm={12} md={2} lg={2}>
            <Row key={index + '-cc-r'} around="xs" middle="xs">
              <Col className="px-none" key={index + '-cc-c'} xs={12} sm={12} md={10} lg={8}>
                <Row key={index + '-cc-c-r'}>{renderColumns(row.slice(3, 4), boxConfig, undefined, index, sectionColumnType.Middle, numberItemsPerSection)}</Row>
              </Col>
            </Row>
          </Col>
          <Col key={index + '-cr'} xs={12} sm={12} md={5} lg={5}>
            <Row key={index + '-rr'}>{renderColumns(row.slice(4, 7), boxConfig, sizes, index, sectionColumnType.Right, numberItemsPerSection)}</Row>
          </Col>
        </Row>
      }
    </>
  );
}

export default LineTypeSeven;
