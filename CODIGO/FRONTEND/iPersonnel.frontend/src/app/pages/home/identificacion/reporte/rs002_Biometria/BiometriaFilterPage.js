import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado } from "../../../../../store/config/Styles";

//FILTROS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import AdministracionUnidadOrganizativaContratoBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaContratoBuscar";
import { obtenerTodos as obtenerReportes } from "../../../../../api/sistema/moduloAplicacionReporte.api";
// import { obtenerTodos as obtenerMotivos } from "../../../../../api/identificacion/motivo.api";
// import { obtenerTodos as obtenerTodosTipoCredencial } from "../../../../../api/identificacion/tipoCredencial.api";
import { TYPE_SISTEMA_ENTIDAD, listarCondicion, listarTipoImpresion, listarVigencia, listarIdentificacion, listarTipo } from "../../../../../../_metronic";
import { serviceEntidad } from "../../../../../api/sistema/entidad.api";
import { obtenerTodos as obtenerTodosCaracteristica } from "../../../../../api/administracion/caracteristica.api";
import { obtenerTodos as obtenerTodosCaracteristicaDetalle } from "../../../../../api/administracion/caracteristicaDetalle.api";
//import { obtenerTodos as obtenerPersonaCredenciales } from "../../../../../api/identificacion/personaCredencial.api";


const BiometriaFilterPage = (props) => {
  const { intl, setLoading } = props;
  const perfil = useSelector((state) => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();

  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [entidades, setEntidades] = useState([]);
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [caracteristicasDetalle, setCaracteristicasDetalle] = useState([]);
  const [condicion, setCondicion] = useState([]);
  const [identificacion, setIdentificacion] = useState([]);
  const [tipos, setTipo] = useState([]);


  async function cargarCombos() {
    setLoading(true);
    let [
      cboReportes] = await Promise.all([
        obtenerReportes({ IdCliente: perfil.IdCliente, IdModulo: '07', IdAplicacion: 'AP00' })
      ]).finally(() => { setLoading(false); });

    let dataEntidades = await serviceEntidad.obtenerTodos({ ImprimirFotocheck: "" });
    let dataCaracteristicas = await obtenerTodosCaracteristica({ IdCliente: perfil.IdCliente });
    let dataCaracteristicasDetalle = await obtenerTodosCaracteristicaDetalle({ IdCliente: perfil.IdCliente, IdCaracteristica: "%" });
    let condicion = listarCondicion();
    let dataidentificacion = listarIdentificacion();
    let dataTipos = listarTipo();
    setEntidades(dataEntidades);


    setCaracteristicas(dataCaracteristicas.filter(x => x.IdEntidad === TYPE_SISTEMA_ENTIDAD.PERSONAS));
    setCondicion(condicion);
    setIdentificacion(dataidentificacion);
    setTipo(dataTipos);
  }


  async function onValueChangedCaracteristica(value) {
    setLoading(true);
    await obtenerTodosCaracteristica({ IdCliente: perfil.IdCliente, IdEntidad: value }).then(dataCaracteristicas => {
      setCaracteristicas(dataCaracteristicas);
    }).finally(() => { setLoading(false) });
  }

  async function onValueChangedCaracteristicaDetalle(value) {
    setLoading(true);
    await obtenerTodosCaracteristicaDetalle({ IdCliente: perfil.IdCliente, IdCaracteristica: value }).then(dataCaracteristicasDetalle => {
      setCaracteristicasDetalle(dataCaracteristicasDetalle);
    }).finally(() => { setLoading(false) });
  }

  const selectCompania = (dataPopup) => {
    //console.log("selectCompania", dataPopup);
    //console.log(dataPopup.map(x => ({ IdCompania: x.IdCompania, Compania: x.Compania })));

    var companias = dataPopup.map(x => (x.IdCompania)).join(',');
    props.dataRowEditNew.IdCompania = companias;

    let cadenaMostrar = dataPopup.map(x => (x.Compania)).join(', ');
    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
    }
    props.dataRowEditNew.Compania = cadenaMostrar;

    setPopupVisibleCompania(false);
  }


  /*POPUP U.ORGANIZATIVA***************************************************/
  const selectUnidadOrganizativa = (dataPopup) => {
    var unidadOrganizativa = dataPopup.map(x => (x.IdUnidadOrganizativa)).join(',');
    props.dataRowEditNew.IdUnidadOrganizativa = unidadOrganizativa;

    let cadenaMostrar = dataPopup.map(x => (x.UnidadOrganizativa)).join(', ');
    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
    }
    props.dataRowEditNew.UnidadOrganizativa = cadenaMostrar;    
  };


  useEffect(() => {
    cargarCombos();
  }, []);



  const datosGenerales = (e) => {
    return (
      <>
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >
            <Item dataField="IdCompania" visible={false} />
            <Item dataField="IdUnidadOrganizativa" visible={false} />
            <Item
              colSpan={2}
              dataField="Compania"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" }) }}
              editorOptions={{
                hoverStateEnabled: false,
                inputAttr: { 'style': 'text-transform: uppercase' },
                showClearButton: true,
                buttons: [{
                  name: 'search',
                  location: 'after',
                  useSubmitBehavior: true,
                  options: {
                    stylingMode: 'text',
                    icon: 'search',
                    onClick: () => {
                      setPopupVisibleCompania(true);
                    },
                  }
                }]
              }}
            />

            <Item
              colSpan={2}
              dataField="UnidadOrganizativa"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.ORGANIZATIONALUNIT" }) }}
              editorOptions={{
                hoverStateEnabled: false,
                inputAttr: { 'style': 'text-transform: uppercase' },
                showClearButton: true,
                buttons: [{
                  name: 'search',
                  location: 'after',
                  useSubmitBehavior: true,
                  options: {
                    stylingMode: 'text',
                    icon: 'search',
                    onClick: () => {
                      setPopupVisibleUnidad(true);
                    },
                  }
                }]
              }}
            />

            <Item
              colSpan={1}
              dataField="IdEntidad"
              label={{ text: intl.formatMessage({ id: "CONFIG.MENU.SISTEMA.ENTIDAD" }), }}
              editorType="dxSelectBox"
              editorOptions={{
                items: entidades,
                valueExpr: "IdEntidad",
                displayExpr: "Entidad",
                showClearButton: true,
                onValueChanged: (e => onValueChangedCaracteristica(e.value))
              }}
            />


            <Item
              colSpan={1}
              dataField="IdCaracteristica"
              label={{ text: intl.formatMessage({ id: "IDENTIFICATION.DETAIL.DATA" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: caracteristicas,
                valueExpr: "IdCaracteristica",
                displayExpr: "Caracteristica",
                showClearButton: true,
                onValueChanged: (e => onValueChangedCaracteristicaDetalle(e.value))
              }}
            />

            <Item
              colSpan={1}
              dataField="IdCaracteristicaDetalle"
              label={{ text: intl.formatMessage({ id: "IDENTIFICATION.ADDITIONAL.DATA" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: caracteristicasDetalle,
                valueExpr: "IdCaracteristicaDetalle",
                displayExpr: "CaracteristicaDetalle",
                showClearButton: true
              }}
            />

            <Item
              colSpan={1}
              dataField="Condicion"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONDITION" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: condicion,
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                showClearButton: true
              }} />

          </GroupItem>
        </Form>
      </>
    );
  }

  const biometria = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item
              colSpan={1}
              dataField="Identificacion"
              label={{ text: intl.formatMessage({ id: "IDENTIFICATION.REASON.MENU" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: identificacion,
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                //showClearButton: true
              }} />

            <Item
              colSpan={1}
              dataField="Tipos"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.TYPE" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: tipos,
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                showClearButton: true
              }} />

          </GroupItem>
        </Form>
      </>
    );
  }

  const fechas = (e) => {
    return (
      <>
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >
            <Item
              colSpan={1}
              dataField="FechaInicio"
              label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }) }}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
              }}
            />

            <Item
              colSpan={1}
              dataField="FechaFin"
              label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }) }}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",

              }}
            />
          </GroupItem>
        </Form>
      </>
    );
  }

  return (
    <Fragment>
      <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
        <GroupItem itemType="group" colCount={2} colSpan={2} >

          <div className="row">
            <div className="col-md-6">
              <fieldset className="scheduler-border" >
                <legend className="scheduler-border" >
                  <h5>{intl.formatMessage({ id: "ACCREDITATION.PEOPLE.GENERALDATA" })}</h5>
                </legend>
                {datosGenerales()}
              </fieldset>
            </div>

            <div className="col-md-6">
              <fieldset className="scheduler-border" >
                <legend className="scheduler-border" >
                  <h5> {intl.formatMessage({ id: "IDENTIFICATION.BIOMETRICS" })}</h5>
                </legend>
                {biometria()}
              </fieldset>
              <br></br>
              <br></br>
              <fieldset className="scheduler-border" >
                <legend className="scheduler-border" >
                  <h5>{intl.formatMessage({ id: "ACCESS.DATE" })}  </h5>
                </legend>
                {fechas()}
              </fieldset>
            </div>

          </div>


        </GroupItem>
      </Form>

      {/*******>POPUP DE COMPANIAS>******** */}
      <AdministracionCompaniaBuscar
        selectData={selectCompania}
        showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
        cancelarEdicion={() => setPopupVisibleCompania(false)}
        uniqueId={"companiabuscarReporteFilterPage"}
        selectionMode={"multiple"}
      />

      {/*******>POPUP DE UNIDAD ORGA.>*********************** */}
      <AdministracionUnidadOrganizativaContratoBuscar
        selectData={selectUnidadOrganizativa}
        showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
        cancelar={() => setPopupVisibleUnidad(false)}
        uniqueId={"divisionbuscarUnidadListPage"}
        selectionMode={"multiple"}
        filtro={{ IdCompaniaMandante: '', IdCompaniaContratista: '' }}
      />

    </Fragment>

  );
};

export default injectIntl(WithLoandingPanel(BiometriaFilterPage));
