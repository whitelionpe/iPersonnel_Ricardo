import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

//FILTROS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import AdministracionUnidadOrganizativaContratoBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaContratoBuscar";
import {
  listarEstado,
  TYPE_SISTEMA_ENTIDAD,
  isNotEmpty
} from "../../../../../../_metronic";
import { obtenerTodos as obtenerTodosCaracteristicaDetalle } from "../../../../../api/administracion/caracteristicaDetalle.api";
import { obtenerTodos as obtenerTipoEquipo } from "../../../../../api/sistema/tipoequipo.api";
import PersonaTextAreaPopup from "../../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup";
import { obtenerTodos as obtenerTodosCaracteristica } from "../../../../../api/administracion/caracteristica.api";

//import { obtenerTodos as obtenerPersonaCredenciales } from "../../../../../api/identificacion/personaCredencial.api";

const PersonaControlAccesoFilterPage = props => {
  const { intl, setLoading } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const listadoSimple = listarEstado();
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [caracteristicasDetalle, setCaracteristicasDetalle] = useState([]);
  const [tipoEquipos, setTipoEquipos] = useState([]);
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);

  async function cargarCombos() {
    setLoading(true);

    let [tiposEquipos, dataCaracteristicas] = await Promise.all([
      obtenerTipoEquipo({
        IdTipoEquipo: "%",
        IdTipoEquipoHijo: "%"
      }),
      obtenerTodosCaracteristica({
        IdCliente: perfil.IdCliente
      })
    ]);

    setTipoEquipos(tiposEquipos);

    setCaracteristicas(
      dataCaracteristicas.filter(
        x => x.IdEntidad === TYPE_SISTEMA_ENTIDAD.PERSONAS
      )
    );
    setLoading(false);
  }

  async function onValueChangedCaracteristicaDetalle(value) {
    setLoading(true);
    await obtenerTodosCaracteristicaDetalle({
      IdCliente: perfil.IdCliente,
      IdCaracteristica: value
    })
      .then(dataCaracteristicasDetalle => {
        setCaracteristicasDetalle(dataCaracteristicasDetalle);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const selectCompania = dataPopup => {
    //console.log("selectCompania", dataPopup);
    //console.log(dataPopup.map(x => ({ IdCompania: x.IdCompania, Compania: x.Compania })));
    var companias = dataPopup.map(x => x.IdCompania).join(",");
    props.dataRowEditNew.IdCompania = companias;

    let cadenaMostrar = dataPopup.map(x => x.Compania).join(", ");
    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + "...";
    }
    props.dataRowEditNew.Compania = cadenaMostrar;
    setPopupVisibleCompania(false);
  };

  /*POPUP U.ORGANIZATIVA***************************************************/
  const selectUnidadOrganizativa = dataPopup => {
    var unidadOrganizativa = dataPopup
      .map(x => x.IdUnidadOrganizativa)
      .join(",");
    props.dataRowEditNew.IdUnidadOrganizativa = unidadOrganizativa;

    let cadenaMostrar = dataPopup.map(x => x.UnidadOrganizativa).join(", ");
    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + "...";
    }
    props.dataRowEditNew.UnidadOrganizativa = cadenaMostrar;
  };

  const selectPersonas = data => {
    if (isNotEmpty(data)) {
      let strPersonas = data.split("|").join(",");
      props.dataRowEditNew.DocumentosPersona = strPersonas;
    }
  };

  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <Fragment>
      <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <div className="row">
            <div className="col-md-12">
              <>
                <Form
                  formData={props.dataRowEditNew}
                  validationGroup="FormEdicion"
                >
                  <GroupItem itemType="group" colCount={2}>
                    <Item
                      dataField="Compania"
                      label={{
                        text: intl.formatMessage({
                          id: "ADMINISTRATION.PERSON.COMPANY"
                        })
                      }}
                      editorOptions={{
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
                              onClick: () => {
                                setPopupVisibleCompania(true);
                              }
                            }
                          }
                        ]
                      }}
                    />

                    <Item
                      dataField="UnidadOrganizativa"
                      label={{
                        text: intl.formatMessage({
                          id:
                            "ADMINISTRATION.ORGANIZATIONALUNIT.ORGANIZATIONALUNIT"
                        })
                      }}
                      editorOptions={{
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
                              onClick: () => {
                                setPopupVisibleUnidad(true);
                              }
                            }
                          }
                        ]
                      }}
                    />

                    <Item
                      dataField="IdTipoEquipo"
                      label={{
                        text: intl.formatMessage({
                          id: "SYSTEM.TEAM.TEAMTYPE"
                        })
                      }}
                      editorType="dxSelectBox"
                      isRequired={false}
                      editorOptions={{
                        items: tipoEquipos,
                        valueExpr: "IdTipoEquipo",
                        displayExpr: "TipoEquipo",
                        searchEnabled: true,
                        // onValueChanged: e => {
                        //   onValueChangedTipoEquipo(e.value);
                        // },
                        readOnly: false
                      }}
                    />

                    <Item
                      dataField="Personas"
                      label={{
                        text: intl.formatMessage({
                          id: "CASINO.PERSON.GROUP.PERSONS"
                        })
                      }}
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
                              disabled: false,
                              onClick: () => {
                                setPopupVisiblePersonas(true);
                              }
                            }
                          }
                        ]
                      }}
                    />

                    <Item
                      dataField="NumeroSerie"
                      isRequired={false}
                      label={{
                        text: intl.formatMessage({
                          id: "SYSTEM.DEVICE.SERIE"
                        })
                      }}
                      editorOptions={{
                        readOnly: false,
                        maxLength: 100,
                        inputAttr: { style: "text-transform: uppercase" }
                      }}
                    />

                    <Item
                      dataField="Acceso"
                      label={{
                        text: intl.formatMessage({
                          id: "ACCESS"
                        })
                      }}
                      editorType="dxSelectBox"
                      isRequired={false}
                      editorOptions={{
                        items: listadoSimple,
                        valueExpr: "Valor",
                        displayExpr: "Descripcion",
                        readOnly: false
                      }}
                    />
                    <Item
                      colSpan={1}
                      dataField="IdCaracteristica"
                      label={{
                        text: intl.formatMessage({
                          id: "IDENTIFICATION.DETAIL.DATA"
                        })
                      }}
                      editorType="dxSelectBox"
                      editorOptions={{
                        items: caracteristicas,
                        valueExpr: "IdCaracteristica",
                        displayExpr: "Caracteristica",
                        showClearButton: true,
                        onValueChanged: e =>
                          onValueChangedCaracteristicaDetalle(e.value)
                      }}
                    />

                    <Item
                      colSpan={1}
                      dataField="IdCaracteristicaDetalle"
                      label={{
                        text: intl.formatMessage({
                          id: "IDENTIFICATION.ADDITIONAL.DATA"
                        })
                      }}
                      editorType="dxSelectBox"
                      editorOptions={{
                        items: caracteristicasDetalle,
                        valueExpr: "IdCaracteristicaDetalle",
                        displayExpr: "CaracteristicaDetalle",
                        showClearButton: true
                      }}
                    />
                  </GroupItem>
                </Form>
              </>
            </div>
          </div>
        </GroupItem>
      </Form>

      {/*******>POPUP DE COMPANIAS>******** */}
      {popupVisibleCompania && (
        <AdministracionCompaniaBuscar
          selectData={selectCompania}
          showPopup={{
            isVisiblePopUp: popupVisibleCompania,
            setisVisiblePopUp: setPopupVisibleCompania
          }}
          cancelarEdicion={() => setPopupVisibleCompania(false)}
          uniqueId={"companiabuscarReporteFilterPage"}
          selectionMode={"multiple"}
        />
      )}

      {/*******>POPUP DE UNIDAD ORGA.>*********************** */}
      {popupVisibleUnidad && (
        <AdministracionUnidadOrganizativaContratoBuscar
          selectData={selectUnidadOrganizativa}
          showPopup={{
            isVisiblePopUp: popupVisibleUnidad,
            setisVisiblePopUp: setPopupVisibleUnidad
          }}
          cancelar={() => setPopupVisibleUnidad(false)}
          uniqueId={"divisionbuscarUnidadListPage"}
          selectionMode={"multiple"}
          filtro={{ IdCompaniaMandante: "", IdCompaniaContratista: "" }}
        />
      )}

      {popupVisiblePersonas && (
        <PersonaTextAreaPopup
          isVisiblePopupDetalle={popupVisiblePersonas}
          setIsVisiblePopupDetalle={setPopupVisiblePersonas}
          obtenerNumeroDocumento={selectPersonas}
        />
      )}
    </Fragment>
  );
};

export default injectIntl(WithLoandingPanel(PersonaControlAccesoFilterPage));
