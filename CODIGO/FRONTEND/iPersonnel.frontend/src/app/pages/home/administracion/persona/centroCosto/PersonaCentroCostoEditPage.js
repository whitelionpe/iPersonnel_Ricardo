import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
//import { listarEstadoSimple } from "../../../../../api/sistema/entidad.api";
import { obtenerTodos as obtenerTodosCentroCosto } from "../../../../../api/administracion/centroCosto.api";
import AdministracionCentroCostoBuscar from "../../../../../partials/components/AdministracionCentroCostoBuscar";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty, listarEstadoSimple } from "../../../../../../_metronic";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";

const PersonaCentroCostoEditPage = props => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl, dataRowEditNew } = props;
  //console.log("dataRowEditNewFechaInicio", dataRowEditNew.FechaInicio);
  const [centroCostos, setCentroCostos] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [isVisibleCentroCosto, setisVisibleCentroCosto] = useState(false);
  const [Filtros, setFiltros] = useState({ FlRepositorio: "2" });


  async function cargarCombos() {

    if (perfil.IdCliente) {
      let centroCostos = await obtenerTodosCentroCosto({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision });
      let estadoSimple = listarEstadoSimple();

      setCentroCostos(centroCostos);
      setEstadoSimple(estadoSimple);
    }
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {

      if (Date.parse(new Date(props.dataRowEditNew.FechaInicio)) > Date.parse(new Date(props.dataRowEditNew.FechaFin))) {
        handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
        return;
      }
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregar(props.dataRowEditNew);
      } else {
        props.actualizar(props.dataRowEditNew);
      }
    }
  }

  const agregarCentroCosto = (dataPopup) => {
    const { IdCentroCosto, CentroCosto } = dataPopup[0];
    if (isNotEmpty(IdCentroCosto)) {
      props.setDataRowEditNew({
        ...props.dataRowEditNew,
        IdCentroCosto: IdCentroCosto,
        CentroCosto: CentroCosto,
      });
    }
    setisVisibleCentroCosto(false);
  };

  useEffect(() => {
    cargarCombos();

  }, []);

  return (
    <>
      {/* {props.showButton && (
                <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
                    toolbar={
                        <PortletHeader
                            title=""
                            toolbar={
                                <PortletHeaderToolbar>
                                    <PortletHeaderToolbar>
                                        <Button
                                            icon="fa fa-save"
                                            type="default"
                                            hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                                            onClick={grabar}
                                            useSubmitBehavior={true}
                                            validationGroup="FormEdicion"
                                            visible={props.modoEdicion}
                                        />
                                        &nbsp;
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

                    } />)} */}


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
              visible={props.modoEdicion}
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
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item dataField="IdCliente" visible={false} />
              <Item dataField="IdPersona" visible={false} />
              <Item dataField="IdCompania" visible={false} />
              <Item dataField="IdSecuencialCentroCosto" visible={false} />
              <Item dataField="IdUnidadOrganizativa" visible={false} />
              <Item dataField="IdSecuencial" visible={false} />
              <Item dataField="IdCentroCosto" visible={false} />

              <Item dataField="IdPosicion" visible={true} editorOptions={{ readOnly: true, }} />
              <Item dataField="Posicion" visible={true} editorOptions={{ readOnly: true, }} />
              <Item dataField="UnidadOrganizativa" visible={true} editorOptions={{ readOnly: true, }} />

              <Item
                colSpan={1} dataField="CentroCosto" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" }), }}
                editorOptions={{
                  readOnly: true,
                  hoverStateEnabled: false,
                  inputAttr: { style: "text-transform: uppercase" },
                  showClearButton: true,
                  buttons: [
                    {
                      name: "search",
                      location: "after",
                      useSubmitBehavior: true,
                      options: {
                        stylingMode: "text",
                        icon: "search",
                        disabled: !props.dataRowEditNew.esNuevoRegistro,
                        onClick: () => {
                          let { IdCliente, IdUnidadOrganizativa } = props.dataRowEditNew;
                          setFiltros({ ...Filtros, IdCliente, IdUnidadOrganizativa })
                          setisVisibleCentroCosto(true);
                        },
                      },
                    },
                  ],
                }}
              />

              <Item dataField="FechaInicio"
                label={{ text: "Fecha Inicio" }}
                isRequired={true}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  min: props.dataRowEditNew.FechaInicioPosicion,
                  max: props.dataRowEditNew.FechaFinPosicion
                }}
              />

              <Item dataField="FechaFin"
                label={{ text: "Fecha Fin" }}
                isRequired={true}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  min: props.dataRowEditNew.FechaInicioPosicion,
                  max: props.dataRowEditNew.FechaFinPosicion
                }}
              />
              <Item
                dataField="Activo"
                label={{ text: "Activo" }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />
            </GroupItem>
          </Form>

          {/* ---------------------------------------------------- */}

          <AdministracionCentroCostoBuscar
            selectData={agregarCentroCosto}
            showButton={false}
            showPopup={{ isVisiblePopUp: isVisibleCentroCosto, setisVisiblePopUp: setisVisibleCentroCosto }}
            cancelarEdicion={() => setisVisibleCentroCosto(false)}
            uniqueId={"PersonaPosicionCentroCostoListPage"}
            selectionMode={"row"}
            // IdUnidadOrganizativa={IdUnidadOrganizativa}
            Filtros={Filtros}
          />

          {/* ---------------------------------------------------- */}
        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(PersonaCentroCostoEditPage);
