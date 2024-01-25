import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";

import {
  service
} from "../../../../api/transporte/rutaParadero.api";

import {
  service as serviceProgramacionParadero
} from "../../../../api/transporte/programacionParadero.api";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import TransporteRutaBuscar from '../../../../partials/components/transporte/popUps/TransporteRutaBuscar';
import DataGrid, { Column, Editing, Paging, Summary, TotalItem } from 'devextreme-react/data-grid';


const ProgramacionEditPage = props => {

  const { intl, setLoading,accessButton,modoEdicion,settingDataField,varIdProgramacion } = props;

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [listTipoRuta, setListTipoRuta] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  const [popUpVisibleRuta, setpopUpVisibleRuta] = useState(false);
  const [dataGrid, setDataGrid] = useState(null);

  const [rutaParaderos, setRutaParaderos] = useState([]);


  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);

    console.log("1.-cargarCombos|props.dataRowEditNew:",props.dataRowEditNew);
   if(!props.dataRowEditNew.esNuevoRegistro) {

    console.log("2.-cargarCombos|props.dataRowEditNew:",props.dataRowEditNew);
    let data = await serviceProgramacionParadero.listar({
    IdProgramacion : props.dataRowEditNew.IdProgramacion,
    IdRuta : props.dataRowEditNew.IdRuta,
    IdParadero:'%',
    NumPagina:0,
    TamPagina:0
    });
    setRutaParaderos(data);
   }
 

  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarProgramacion(props.dataRowEditNew);
      } else {
        props.actualizarProgramacion(props.dataRowEditNew);
      }
    }

  }

  const onRowValidating = (e) => {
    var position = e.newData.Position;
    actualizarProgramacionParaderos(e.oldData.IdRuta, e.oldData.IdParadero, e.newData.Activo)
  }

   const actualizarProgramacionParaderos = async (IdRuta, IdParadero, Activo) => {
     let dataActualizada = await serviceProgramacionParadero.actualizarEstado({
        IdProgramacion:varIdProgramacion,
        IdRuta,
        IdParadero,
        Activo : Activo.toUpperCase()
        });
     setRutaParaderos(dataActualizada);
   }

  const onCellPrepared = (e) => {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const selectRuta = async (datos) => {
    const { IdRuta, Ruta, Origen,Destino } = datos[0];
    props.dataRowEditNew.IdRuta = IdRuta;
    props.dataRowEditNew.Ruta = Ruta;
    props.dataRowEditNew.Origen = Origen;
    props.dataRowEditNew.Destino = Destino;

    let data = await service.listar({IdRuta : IdRuta, IdParadero:'%'});
    setRutaParaderos(data);

    setpopUpVisibleRuta(false);
};




  useEffect(() => {
    if(props.dataRowEditNew) cargarCombos();
  }, []);

  return (
    <>
  
      <PortletHeader
        title={props.titulo}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon="fa fa-save"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.RECORD" })}
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              visible={modoEdicion}
            />
            &nbsp;
            <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
              onClick={props.cancelarEdicion}
            />

          </PortletHeaderToolbar>
        }
      />

      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <Item colSpan={2}>
              <AppBar position="static" className={classesEncabezado.secundario}>
                <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                  <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                    {intl.formatMessage({ id: "COMMON.DETAIL" })}
                  </Typography>
                </Toolbar>
              </AppBar>
            </Item>

            <GroupItem
              itemType="group"
              colCount={2}
              colSpan={2}
            >
              <Item dataField="IdProgramacion"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                editorOptions={{
                  maxLength: 10,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: true,
                }}
              />
              
              <Item
                dataField="IdTipoProgramacion"
                label={{ text: intl.formatMessage({ id: "TRANSPORTE.PROGRAMMING.TYPE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('IdTipoProgramacion', settingDataField) : false}
                editorOptions={{
                  items: props.tipoProgramacionData,
                  valueExpr: "IdTipoProgramacion",
                  displayExpr: "TipoProgramacion",
                  readOnly: !(modoEdicion ? isModified('IdTipoProgramacion', settingDataField) : false),
                }}
              />
              
              <Item dataField="Ruta" 
                with="50"
                isRequired={modoEdicion ? isRequired('Ruta', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "TRANSPORTE.ROUTE" }) }}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Ruta', settingDataField) : false),
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  buttons: [{
                    name: 'search',
                    location: 'after',
                    useSubmitBehavior: true,
                    readOnly: props.dataRowEditNew && props.dataRowEditNew.ReadOnly,
                    options: {
                      stylingMode: 'text',
                      icon: 'search',
                      disabled: modoEdicion ? false : true,
                      onClick: () => {
                        setpopUpVisibleRuta(true);
                      }
                    }
                  }]
                }}
              />

              <Item 
                dataField="FechaProgramacion"
                label={{ text: intl.formatMessage({ id: "TRANSPORTE.PROGRAMMING.DATE" }) }}
                isRequired={modoEdicion ? isRequired('FechaProgramacion', settingDataField) : false}
                editorType="dxDateBox"
                editorOptions={{
                  type: "datetime",
                  displayFormat: "dd/MM/yyyy HH:mm",
                  min: new Date(),
                  readOnly: !(modoEdicion ? isModified('FechaProgramacion', settingDataField) : false),
                }}
              />

              <Item
                dataField="Origen"
                label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.ORIGEN" }) }}
                editorOptions={{
                  readOnly: true
                }}
              />
              <Item
                dataField="Destino"
                label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.DESTINO" }) }}
                editorOptions={{
                  readOnly: true
                }}
              />

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              /> 

            </GroupItem>

          </Form>
          <br></br>
          <Form>
            <Item colSpan={2}>
              <AppBar position="static" className={classesEncabezado.secundario}>
                <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                  <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                    {intl.formatMessage({ id: "TRANSPORTE.ROUTE.LIST" })}
                  </Typography>
                </Toolbar>
              </AppBar>
            </Item>
            <GroupItem
              itemType="group"
              colCount={2}
              colSpan={2}
            >
              <DataGrid
                dataSource={rutaParaderos}
                keyExpr="IdParadero"
                showBorders={true}
                ref={ref => setDataGrid(ref)}
                onRowValidating={onRowValidating}
                onCellPrepared={onCellPrepared}
              >
                <Editing
                  mode="row"
                  useIcons={true}
                  allowUpdating={true}
                />
                <Paging enabled={true} />
                <Column dataField="IdParadero" caption={ intl.formatMessage({ id: "COMMON.CODE" }) } editorOptions={false} allowEditing={false} visible={false} />
                <Column dataField="Paradero" caption={ intl.formatMessage({ id: "TRANSPORTE.WHEREABOUTS" }) } editorOptions={false} allowEditing={false} />
                <Column dataField="Orden" caption={ intl.formatMessage({ id: "SYSTEM.MODULE.ORDER" }) }  width={'5%'} alignment="center"  editorOptions={false} allowEditing={false} />
                <Column dataField="Activo" caption={ intl.formatMessage({ id: "COMMON.STATE" }) }  width={'8%'}  editorOptions={true} allowEditing={true} alignment="center" visible={props.dataRowEditNew.esNuevoRegistro ? false : true}
                  lookup={{
                    dataSource: estadoSimple,
                    displayExpr: 'Descripcion',
                    valueExpr: 'Valor'
                  }} />
                <Column type="buttons" width={'8%'} visible={modoEdicion} buttons={['edit']} />  
                <Summary >
                  <TotalItem
                    column="IdParadero"
                    summaryType="count" />
                </Summary>
              </DataGrid>
            </GroupItem>
          </Form>


        </React.Fragment>
      </PortletBody>

      {popUpVisibleRuta && (
              <TransporteRutaBuscar
                  selectData={selectRuta}
                  showPopup={{ isVisiblePopUp: popUpVisibleRuta, setisVisiblePopUp: setpopUpVisibleRuta }}
                  cancelarEdicion={() => setpopUpVisibleRuta(false)}
                  uniqueId={"TransporteRutaBuscar"}
                  showButton={true}
              />
          )}

    </>
  );

};

export default injectIntl(ProgramacionEditPage);
