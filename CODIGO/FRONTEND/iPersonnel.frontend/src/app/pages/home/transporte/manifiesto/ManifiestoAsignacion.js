import React, { useEffect, useState } from "react";
import { DataGrid, Column, Editing } from "devextreme-react/data-grid";
import { Button } from 'devextreme-react';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { Item } from 'devextreme-react/form';
import TransporteManifiestoAsignacionMultiple from "../../../../partials/components/transporte/popUps/TransporteManifiestoAsignacionMultiple";
import { injectIntl } from "react-intl";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

const ref = React.createRef(); 

const ManifiestoAsignacion = props => {
  const { intl, setLoading } = props;

    const classesEncabezado = useStylesEncabezado();
    const [isVisiblePopUps, setIsVisiblePopUps] = useState(false);
    const [isVisiblePopUpTrabajadores, setisVisiblePopUpTrabajadores] = useState(false);
    
    const selecteccionarTrabajadores = (trabajadores) => {
        props.agregarManifiestoDetalle(trabajadores);
        setisVisiblePopUpTrabajadores(false);
    }

    return (
        <>

      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
        toolbar={
          <PortletHeader
          title={ props.selected.IdTipoRuta ==="URBANO" ?  <div style={{color:"red"}}> {intl.formatMessage({ id: "TRANSPORTE.MANIFEST.INFOURBAN" })} </div> : intl.formatMessage({ id: "TRANSPORTE.MANIFEST.INFORMATION" }) }
          toolbar={
              <PortletHeaderToolbar>

                  <Button
                      icon="fa fa-plus"
                      type="default"
                      disabled={props.selected.NumeroAsientosLibres === 0}
                      hint={intl.formatMessage({ id: "ACTION.ADD" })}
                      onClick={() => {
                          setisVisiblePopUpTrabajadores(true)
                          props.setDataRowEditNew({});
                      }
                      }
                  />
                  &nbsp;

                  <Button
                      icon="fa fa-times-circle"
                      type="normal"
                      stylingMode="outlined"
                      hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                      onClick={props.cancelarEdicion}
                  />
              </PortletHeaderToolbar>
          }
        />
        }
      />



            <div ref={ref}>
                <PortletBody >
                    <Item colSpan={2}>
                        <AppBar position="static" className={classesEncabezado.secundario}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "TRANSPORTE.MANIFEST.DATA" })}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                    </Item>
                    <DataGrid
                        dataSource={props.asignacion}
                        showBorders={true}
                        keyExpr="RowIndex"
                        allowColumnReordering={true}
                        allowColumnResizing={true}
                        columnAutoWidth={true}
                    >
                        <Column dataField="RowIndex" caption="#" width={"7%"} visible={false} />
                        <Column dataField="Asiento" caption={intl.formatMessage({ id: "TRANSPORTE.MANIFEST.SEAT" })} alignment="center" width={"10%"} />
                        <Column dataField="NumeroDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}  width={"10%"} alignment="center" />
                        <Column dataField="Nombres" caption={intl.formatMessage({ id: "ACCESS.VEHICLE.MARK.PASSENGERS" })} width={"50%"} alignment="left" ColumnHeaderAutoHeight={true} />
                        <Column dataField="Edad" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.AGE" })} width={"10%"} alignment="center" />
                        <Column dataField="Sexo" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.GENDER" })} width={"10%"} alignment="center" />

                    </DataGrid>
                </PortletBody>
            </div>

            {/* <PopupExport
                isVisiblePopUps={isVisiblePopUps}
                setIsVisiblePopUps={setIsVisiblePopUps}
                asignacion={props.asignacion}
            /> */}

            {/*** PopUp -> Buscar Trabajador ****/}
            {isVisiblePopUpTrabajadores && (
                <TransporteManifiestoAsignacionMultiple
                    selectData={selecteccionarTrabajadores}
                    showPopup={{ isVisiblePopUp: isVisiblePopUpTrabajadores, setisVisiblePopUp: setisVisiblePopUpTrabajadores }}
                    cancelarEdicion={() => setisVisiblePopUpTrabajadores(false)}
                    selectionMode={"multiple"}
                    IdManifiesto={props.varIdManifiesto}
                    FechaProgramacion={props.fechaProgramacion}
                    dataRowEditNew={props.dataRowEditNew}
                    setDataRowEditNew={props.setDataRowEditNew}
                    NumeroAsientosLibres={props.selected.NumeroMaximoPasajeros - props.numeroAsientosAsignados}
                />
            )} 
        </>


    );
};
export default injectIntl(ManifiestoAsignacion);
