import React from "react";
import DataGridDynamic from "../../../../../partials/components/DataGridDynamic/DataGridDynamic";
import { PortletBody } from "../../../../../partials/content/Portlet";

const EmisionFotocheckListPage = ({ intl, dataSource }) => {
  const { columns, labels, data } = dataSource;

  const dinamycColumns = columns.map((item, index) => {
    let [field, tipo] = item.Field.split("#");

    let properties = {
      dataField: field,
      caption: labels[index].Label,
      alignment: "left"
    };
    if (!!tipo) {
      if (tipo === "D") {
        properties.alignment = "center";
        properties.events = {
          dataType: "date",
          format: "dd/MM/yyy"
        };
      }
    }
    return { ...properties };
  });

  return (
    <PortletBody>
      <div style={{ overflowX: "auto", maxWidth: "1280px" }}>
        <DataGridDynamic
          id="dg_rs001_EmisionFotoCheck"
          intl={intl}
          dataSource={data}
          staticColumns={[]}
          dynamicColumns={dinamycColumns}
          keyExpr="RowIndex"
        />
      </div>
    </PortletBody>
  );
};

export default EmisionFotocheckListPage;
