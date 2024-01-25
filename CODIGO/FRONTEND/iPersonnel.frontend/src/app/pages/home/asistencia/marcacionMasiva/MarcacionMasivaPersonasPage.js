import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';
import { saveAs } from 'file-saver';

//Utils
import { DataGrid, Column, Editing, Button as ColumnButton, Summary, TotalItem, Selection, Export } from "devextreme-react/data-grid";
import { DoubleLinePersona as DoubleLineLabel, PersonaCondicionLabel } from "../../../../partials/content/Grid/DoubleLineLabel";

import { obtener as obtenerConfiguracion } from "../../../../api/sistema/configuracion.api";
import HeaderInformation from '../../../../partials/components/HeaderInformation';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';

const MarcacionMasivaPersonasPage = (props) => {

  const { intl, setLoading } = props;
  const classesEncabezado = useStylesEncabezado();
 
  function onExporting(e) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Detalle');//Main sheet
    exportDataGrid({
      component: e.component,
      worksheet: worksheet,
      customizeCell: function (options) {
        options.excelCell.font = { name: 'Arial', size: 12 };
        options.excelCell.alignment = { horizontal: 'left' };
      }
    }).then(function () {
      workbook.xlsx.writeBuffer()
        .then(function (buffer) {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'DetalleMarcaciones.xlsx'); //DetalleTrabajadores.xlsx
        });
    });
  }

  useEffect(() => {

  }, []);


  return (
    <Fragment>

      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
        toolbar={

          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>
                <PortletHeaderToolbar>

                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    onClick={props.cancelarEdicion}
                  />
                </PortletHeaderToolbar>
              </PortletHeaderToolbar>
            }
          />

        } />

      <PortletBody >

        <AppBar position="static" className={classesEncabezado.secundario}>
          <Toolbar variant="dense" className={classesEncabezado.toolbar}>
            <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
              {
                intl.formatMessage({ id: "CASINO.MASIVO.TAB1" })
              }
            </Typography>
          </Toolbar>
        </AppBar>
        <br />
        <DataGrid
          dataSource={props.historialData}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          repaintChangesOnly={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
          onExporting={onExporting}
        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={false}
            allowDeleting={false}
          //texts={textEditing}
          />
          <Export enabled={true} />
          <Column dataField="RowIndex" caption="#" width={"4%"} alignment={"center"} />
          <Column dataField="IdPersona" caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.CODE" })} width={"10%"} alignment={"center"} />
          <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"20%"} alignment={"left"} />
          <Column dataField="Documento" caption={intl.formatMessage({ id: "CASINO.REPORT.DOCUMENTNUMBER" })} width={"10%"} alignment={"center"} />  
          <Column dataField="FechaMarca" caption={intl.formatMessage({ id: "CASINO.MARKING.DATEMARKING" })} dataType="datetime" format="dd/MM/yyyy HH:mm" width={"10%"} alignment={"center"} /> 
 
          <Column dataField="CodigoEquipo" caption={intl.formatMessage({ id: "SYSTEM.DEVICE" })} width={"10%"} alignment={"center"} />
          <Column dataField="CodigoPuerta" caption={intl.formatMessage({ id: "ACCESS.DOOR" })} width={"10%"} alignment={"center"} />
          <Column dataField="CodigoZona" caption={intl.formatMessage({ id: "ACCESS.GROUP.RESTRICTION.ZONE" })} width={"10%"} alignment={"center"} />
          <Column dataField="Observacion" caption={intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES.OBSERVATION" })} width={"20%"} alignment={"left"} />

          {/* <Column dataField="Observacion" caption={intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES.OBSERVATION" })} width={"20%"} alignment={"left"} /> */}
          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="NombreCompleto"
              alignment="left"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>
        </DataGrid>


      </PortletBody>


    </Fragment >
  );
};


export default injectIntl(WithLoandingPanel(MarcacionMasivaPersonasPage));
