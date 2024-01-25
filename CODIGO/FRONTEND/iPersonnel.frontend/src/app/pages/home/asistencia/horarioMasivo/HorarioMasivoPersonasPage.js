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

//Utils
import { DataGrid, Column, Editing, Button as ColumnButton, Summary, TotalItem, Selection } from "devextreme-react/data-grid";
import { DoubleLinePersona as DoubleLineLabel, PersonaCondicionLabel } from "../../../../partials/content/Grid/DoubleLineLabel";

import { obtener as obtenerConfiguracion } from "../../../../api/sistema/configuracion.api";
import HeaderInformation from '../../../../partials/components/HeaderInformation';

const HorarioMasivoPersonasPage = (props) => {

  const { intl, setLoading } = props;
  const classesEncabezado = useStylesEncabezado();


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
                intl.formatMessage({ id: "ADMINISTRATION.POSITION.WORKER" })
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
        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={false}
            allowDeleting={false}
          //texts={textEditing}
          />
          <Column dataField="RowIndex" caption="#" width={"5%"} alignment={"center"} />
          <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"15%"} alignment={"left"} />
          <Column dataField="Compania" caption={intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES.COMPANY" })} width={"15%"} alignment={"left"} />
          <Column dataField="Horario" caption={intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES" })} width={"10%"} alignment={"left"} />
          <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "COMMON.STARTDATE" })} width={"10%"} alignment={"left"} />
          <Column dataField="FechaFin" caption={intl.formatMessage({ id: "COMMON.ENDDATE" })} width={"10%"} alignment={"left"} />
          <Column dataField="Observacion" caption={intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES.OBSERVATION" })} width={"20%"} alignment={"left"} />
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


export default injectIntl(WithLoandingPanel(HorarioMasivoPersonasPage));
