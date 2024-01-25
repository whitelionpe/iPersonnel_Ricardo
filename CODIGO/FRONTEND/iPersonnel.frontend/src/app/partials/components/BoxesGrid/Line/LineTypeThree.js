import React from "react";
import { Row } from 'react-flexbox-grid';

import { renderColumns } from '../Line';

const sizes = {
  xs: 12,
  sm: 12,
  md: 4,
  lg: 4,
};

const LineTypeThree = ({
  index,
  row,
  boxConfig,
}) => {
  return (
    <>
      {
        row && row.length > 0 &&
        <Row className="my-3" key={index}>
          {renderColumns(row.slice(0, 3), boxConfig, sizes, index)}
        </Row>
      }
    </>
  );
}

export default LineTypeThree;
