import React from "react";
import { Row } from 'react-flexbox-grid';

import { renderColumnas } from '../Fila';

const sizes = {
  xs: 12,
  sm: 12,
  md: 2,
  lg: 2,
};

const FilaTipoSeis = ({
  index,
  row,
  configAsiento,
}) => {
  return (
    <>
      {
        row && row.length > 0 &&
        <Row className="my-3" key={index}>
          {renderColumnas(row.slice(0, 6), configAsiento, sizes, index)}
        </Row>
      }
    </>
  );
}

export default FilaTipoSeis;
