import React from "react";
import { Row } from 'react-flexbox-grid';

import { renderColumns } from '../Line';

const sizes = {
  xs: 12,
  sm: 12,
  md: 6,
  lg: 6,
};

const LineTypeTwo = ({
  index,
  row,
  boxConfig,
}) => {
  return (
    <>
      {
        row && row.length > 0 &&
        <Row className="my-3" key={index}>
          {renderColumns(row.slice(0, 2), boxConfig, sizes, index)}
        </Row>
      }
    </>
  );
}

export default LineTypeTwo;
