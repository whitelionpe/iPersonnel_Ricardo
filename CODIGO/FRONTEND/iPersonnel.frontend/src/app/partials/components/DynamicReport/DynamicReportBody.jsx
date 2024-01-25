import React from "react";
import { PortletBody } from "../../content/Portlet";
import DataGridDynamic from "../DataGridDynamic/DataGridDynamic";

const DynamicReportBody = ({
  intl,
  dataSource,
  additionalProperties = [],
  dataGridProperties = {}
}) => {
  /*
    dataSource={
        columns:[{Field: "valor#tipodato"}] ->Nombre de las columnas + tipo de dato
        labels:[{Label:"label"}] -> Nombres a mostrar en la grilla.
        data:[] -> DataSource para la grilla
    }
    additionalProperties=[
        {
            dataField:"nombre",
            properties:{ ..Eventos }
        }
    ]
    */
  const { columns, labels, data } = dataSource;

  const dynamicColumns = columns.map((item, index) => {
    let [field, tipo] = item.Field.split("#");
    let fieldProperties = additionalProperties.find(x => x.dataField === field);
    let properties = {
      dataField: field,
      caption: labels[index].Label,
      alignment: "left",
      events: {}
    };

    if (!!fieldProperties) {
      properties.events = {
        ...fieldProperties.properties
      };
    }
    if (!!tipo) {
      if (tipo === "D") {
        properties.alignment = "center";
        properties.events = {
          ...properties.events,
          dataType: "date",
          format: "dd/MM/yyy"
        };
      }
    }
    return { ...properties };
  });

  return ( 
        <PortletBody>
          <div style={{ overflowX: "auto", maxWidth: "98%" }}>
            <DataGridDynamic
              id="dg_rs001_EmisionFotoCheck"
              intl={intl}
              dataSource={data}
              staticColumns={[]}
              dynamicColumns={dynamicColumns}
              keyExpr="RowIndex"
              events={dataGridProperties}
            />
          </div>
        </PortletBody> 
  );
};

export default DynamicReportBody;
