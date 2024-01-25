import React from "react";
import { Row } from 'react-flexbox-grid';

import { renderColumnas } from '../Fila';

const sizes = {
  xs: 12,
  sm: 12,
  md: 4,
  lg: 4,
};

const FilaTipoTres = ({
  index,
  row,
  configAsiento,
}) => {
  return (
    <>
      {
        row && row.length > 0 &&
        <Row className="my-3" key={index}>
          {renderColumnas(row.slice(0, 3), configAsiento, sizes, index)}
        </Row>
      }
    </>
  );
}

export default FilaTipoTres;
