import React from "react";
import { Grid, Row, Col } from 'react-flexbox-grid';
import { isArray } from "../../../shared/CommonHelper";

import { renderColumns } from '../Line';

const Line = ({
  rowIndex,
  selected,
  row,
  boxConfig,
  columnCount,
}) => {
  return (
    <>
      {
        isArray(row, true) &&
        // <Row className="my-3" key={rowIndex}>
        <Row key={rowIndex}>
          <Col key={rowIndex + '-c'} xs>
            <Row key={rowIndex + '-cr'}>
              { renderColumns({ row, selected, boxConfig, columnCount, rowIndex }) }
            </Row>
          </Col>
        </Row>
      }
    </>
  );
}

export default Line;
