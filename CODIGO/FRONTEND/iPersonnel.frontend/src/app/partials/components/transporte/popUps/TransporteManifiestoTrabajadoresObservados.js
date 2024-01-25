import React, { useState, useEffect, createRef } from "react";
import DataGrid, { Scrolling, Paging, Pager, Column, FilterRow, HeaderFilter, Selection } from 'devextreme-react/data-grid';
import { Popup } from 'devextreme-react/popup';

import ScrollBar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import { injectIntl } from "react-intl";

const TransporteManifiestoTrabajadoresObservados = props => {

  const { intl } = props;

  return (
    <Popup
      visible={props.isVisible}
      dragEnabled={true}
      resizeEnabled={true}
      closeOnOutsideClick={true}
      showTitle={true}
      title={intl.formatMessage({ id: "ADMINISTRATION.POSITION.WORKER" }).toUpperCase()} 
      width={700}
      height={500}
      onHiding={() => props.setIsVisible(!props.isVisible)}
    >
      <ScrollBar component="div">
      
          <DataGrid
            dataSource={props.source}
            showBorders={true}
            repaintChangesOnly={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
            columnAutoWidth={true}
            scrolling={{showScrollbar: 'always'}} // add scroll style blue
            className="tablaScrollHorizontal" // add scroll style blue
          >
            <FilterRow visible={false} />
            <Selection mode="single" />
            <Column
              caption={intl.formatMessage({ id: "COMMON.CODE" })}
              dataField="IdPersona"
              width={"70px"}
              allowSorting={false}
              allowFiltering={true}
              allowHeaderFiltering={false}
              alignment={"center"}
            />
            <Column
              caption={intl.formatMessage({ id: "SECURITY.PROFILE.USER.USERNAME" })}
              dataField="NombreCompleto"
              width={"200px"}
            />
            <Column
              caption={intl.formatMessage({ id: "SECURITY.PROFILE.USER.DOCUMENT" })}
              dataField="Documento"
              width={"120px"}   
              alignment={"center"}
           
            />
            <Column
              caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.MESSAGE" })}
              dataField="Mensaje"
              width={"1500px"}
            />
            <Paging defaultPageSize={20} />
            <Pager showPageSizeSelector={false} />
          </DataGrid>

       
      </ScrollBar>
    </Popup>
  );
};

export default injectIntl(TransporteManifiestoTrabajadoresObservados);




