import React from "react";
import { Col } from 'react-flexbox-grid';
import { v4 as uuid4 } from "uuid";
import { isArray, isNullOrUndefined, isObject } from "../../../shared/CommonHelper";

import Box from '../Box';

export const renderColumns = ({ row, selected, boxConfig, columnCount, rowIndex }) => {
  if (isArray(row, true)) {
    const { uniqueId } = boxConfig;
    const rowItemCount = row.length;
    return Array.of(...Array(columnCount)).map((_, colIndex) => {
      const item = colIndex < rowItemCount && uniqueId in row[colIndex] && !isNullOrUndefined(row[colIndex][uniqueId]) ? row[colIndex] : undefined;
      if (!isNullOrUndefined(item)) {
        const isSelected = !isObject(selected) && !isNullOrUndefined(item[uniqueId]) && selected[uniqueId] === item[uniqueId];
        return (
          <Col key={item[uniqueId]} >
            <Box data={item} { ... { ...boxConfig, selected, isSelected, position: { row: rowIndex, col: colIndex }} } />
          </Col>
        );
      } else {
        return (
          <Col key={uuid4()} />
        );
      }
    });
  }
}
// export const renderColumns = (row, config, sizes, rowIndex, columnType = sectionColumnType.Unique, numberItemsPerSection = 0) => {
//   if (row && row.length > 0) {
//     let xs = 12, sm = 12, md = 12, lg = 12;
//     // if (columnType !== sectionColumnType.Middle ) ({ xs, sm, md, lg } = sizes);
//     if (sizes) ({ xs, sm, md, lg } = sizes);
//     const { uniqueId, uniqueDataField } = config;
//     return row.map((item, colIndex) => {
//       let columnIndex = colIndex;

//       switch(columnType) {
//         case sectionColumnType.Middle: columnIndex += numberItemsPerSection; break;
//         case sectionColumnType.Right: columnIndex += numberItemsPerSection + 1; break;
//       }

//       if (item && item[uniqueId]) {
//         return (
//           <Col key={'cc-' + item[uniqueId]} xs={xs} sm={sm} md={md} lg={lg}>
//             <Box data={item} { ... { ...config, position: { row: rowIndex, col: columnIndex }} } />
//           </Col>
//         );
//       } else {
//         return (
//           <Col key={uuid4()} xs={xs} sm={sm} md={md} lg={lg} />
//         );
//       }
//     });
//   }
// }