import React from "react";
import { Col } from 'react-flexbox-grid';
import { v4 as uuid4 } from "uuid";

import Asiento from '../Asiento';

export const sectionColumnType = {
  Unique: 'unique',
  Left: 'left',
  Middle: 'middle',
  Right: 'right',
};

export const renderColumnas = (row, config, sizes, rowIndex, columnType = sectionColumnType.Unique, numberItemsPerSection = 0) => {
  if (row && row.length > 0) {
    let xs = 12, sm = 12, md = 12, lg = 12;
    if (columnType !== sectionColumnType.Middle ) ({ xs, sm, md, lg } = sizes);
    const { uniqueDataField } = config;
    return row.map((item, colIndex) => {
      let columnIndex = colIndex;

      switch(columnType) {
        case sectionColumnType.Middle: columnIndex += numberItemsPerSection; break;
        case sectionColumnType.Right: columnIndex += numberItemsPerSection + 1; break;
      }

      if (item && item[uniqueDataField]) {
        return (
          <Col key={'cc-' + item[uniqueDataField]} xs={xs} sm={sm} md={md} lg={lg}>
            <Asiento data={item} { ... { ...config, position: { row: rowIndex, col: columnIndex }} } />
          </Col>
        );
      } else {
        return (
          <Col key={uuid4()} xs={xs} sm={sm} md={md} lg={lg} />
        );
      }
    });
  }
}
