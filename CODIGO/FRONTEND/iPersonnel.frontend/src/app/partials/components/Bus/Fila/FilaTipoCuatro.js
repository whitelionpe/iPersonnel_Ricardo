import React from "react";
import { Row } from 'react-flexbox-grid';

import { renderColumnas } from '../Fila';

const sizes = {
  xs: 12,
  sm: 12,
  md: 3,
  lg: 3,
};

const FilaTipoCuatro = ({
  index,
  row,
  configAsiento,
}) => {
  return (
    <>
      {
        row && row.length > 0 &&
        <Row className="my-3" key={index}>
          {renderColumnas(row.slice(0, 4), configAsiento, sizes, index)}
        </Row>
      }
    </>
  );
}

export default FilaTipoCuatro;
