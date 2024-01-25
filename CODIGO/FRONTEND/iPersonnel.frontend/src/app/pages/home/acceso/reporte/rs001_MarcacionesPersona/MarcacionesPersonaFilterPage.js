import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import Form, { Item, GroupItem, EmptyItem } from "devextreme-react/form";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { getDateOfDay, truncateDate } from '../../../../../../_metronic/utils/utils';

//FILTROS OBTENIDOS:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
//import AdministracionContratoDivisionBuscar from "../../../../../partials/components/AdministracionContratoDivisonBuscar";
import AdministracionUnidadOrganizativaContratoBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaContratoBuscar";
import AdministracionPersonaBuscar from "../../../../../partials/components/AdministracionPersonaBuscar";


import { obtenerTodos as obtenerZona } from "../../../../../api/administracion/zona.api";
import { obtenerTodos as obtenerPuerta } from "../../../../../api/acceso/puerta.api";
import { obtenerTodos as obtenerTipoMarcacion } from "../../../../../api/acceso/tipoMarcacion.api";
import { obtenerTodos as obtenerReportes } from "../../../../../api/sistema/moduloAplicacionReporte.api";

const MarcacionesPersonaFilterPage = (props) => {
  const { intl, setLoading } = props;
  const perfil = useSelector((state) => state.perfil.perfilActual);
  //const classesEncabezado = useStylesEncabezado();

  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  //const [isVisiblePopUpDivision, setisVisiblePopUpDivision] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [isVisiblePopUpPersonas, setisVisiblePopUpPersonas] = useState(false);


  const [lstZona, setlstZona] = useState([]);
  const [lstPuerta, setlstPuerta] = useState([]);
  //const [lstEquipo, setlstEquipo] = useState([]);
  const [lstTipoMarcacion, setlstTipoMarcacion] = useState([]);
  const [lstReporte, setlstReporte] = useState([]);
  //const [lstTipoIdentificacion, setlstTipoIdentificacion] = useState([]);


  useEffect(() => {
    cargarCombos();
  }, []);


  async function cargarCombos() {
    setLoading(true);
    /*************************** */
    let [cboZona,
      cboTipoMarcacion,
      cboPuerta,
      cboReportes] = await Promise.all([
        obtenerZona({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, }),
        obtenerTipoMarcacion(),
        obtenerPuerta({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdZona: '' }),
        obtenerReportes({ IdCliente: perfil.IdCliente, IdModulo: '04', IdAplicacion: 'AP00' })
      ]).finally(() => { setLoading(false); });

    //idCliente, string idModulo, string idAplicacion, string idReporte, int numPagina, int tamPagina
    cboZona.unshift({ IdZona: ' ', Zona: 'Todos' });
    cboPuerta.unshift({ IdPuerta: ' ', Puerta: 'Todos' });
    cboTipoMarcacion.unshift({ IdTipoMarcacion: ' ', TipoMarcacion: 'Todos' });

    setlstZona(cboZona);
    setlstTipoMarcacion(cboTipoMarcacion);
    setlstPuerta(cboPuerta);
    setlstReporte(cboReportes);

  }

  const selectCompania = (dataPopup) => {

    var companias = dataPopup.map(x => (x.IdCompania)).join(',');
    props.dataRowEditNew.IdCompania = companias;

    let cadenaMostrar = dataPopup.map(x => (x.Compania)).join(', ');
    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
    }

    props.dataRowEditNew.Compania = cadenaMostrar;
    setPopupVisibleCompania(false);
  }

  // const selectDivision = (divsiones) => {
  //   //console.log(divsiones);
  //   //
  //   props.dataRowEditNew.ListaDivision = divsiones.map(x => ({ IdDivision: x.IdDivision, Division: x.Division }));
  //   let cadenaMostrar = divsiones.map(x => (x.Division)).join(', ');

  //   if (cadenaMostrar.length > 100) {
  //     cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
  //   }
  //   props.dataRowEditNew.ListaDivisionView = cadenaMostrar;
  //   setisVisiblePopUpDivision(false);

  // };

  /*POPUP U.ORGANIZATIVA***************************************************/
  const selectUnidadOrganizativa = (dataPopup) => {
    var unidadOrganizativa = dataPopup.map(x => (x.IdUnidadOrganizativa)).join(',');
    props.dataRowEditNew.IdUnidadOrganizativa = unidadOrganizativa;

    let cadenaMostrar = dataPopup.map(x => (x.UnidadOrganizativa)).join(', ');
    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
    }
    props.dataRowEditNew.UnidadOrganizativa = cadenaMostrar;
    setPopupVisibleUnidad(false);
  };

  async function agregarPersonaAdministrador(personas) {
    //setLoading(true);
    props.dataRowEditNew.ListaPersona = personas.map(x => ({ IdPersona: x.IdPersona, NombreCompleto: x.NombreCompleto }));
    let cadenaMostrar = personas.map(x => (x.NombreCompleto)).join(', ');

    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
    }
    props.dataRowEditNew.ListaPersonaView = cadenaMostrar;
    setisVisiblePopUpPersonas(false);
  }


  async function onValueChangedZona(value) {
    if (value !== ' ') {
      let cboPuerta = await obtenerPuerta({
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,
        IdZona: value,
      });

      //setIdPuerta(value);
      setlstPuerta(cboPuerta);
    }

  }

  const onValueChangedReporte = (e) => {

    props.dataRowEditNew.Reporte = e.component.option("text");
  }

  const datosGenerales = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >
            <Item dataField="IdCompania" visible={false} />
            <Item dataField="IdUnidadOrganizativa" visible={false} />

            <Item
              colSpan={2}
              dataField="IdReporte"
              label={{ text: intl.formatMessage({ id: "ACCESS.REPORT.ID" }) }}
              editorType="dxSelectBox"
              isRequired={true}
              editorOptions={{
                //readOnly: !props.modoEdicion,
                items: lstReporte,// campamentos,
                valueExpr: "Objeto",
                displayExpr: "Reporte",
                //disabled: !props.dataRowEditNew.esNuevoRegistro,
                placeholder: "Seleccione..",
                onValueChanged: (e) => onValueChangedReporte(e),
                searchEnabled: true,
                showClearButton: true,
              }}
            />

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
              // isRequired={modoEdicion ? isRequired('IdUnidadOrganizativa', settingDataField) : false}
              editorOptions={{
                // readOnly: !(modoEdicion ? isModified('IdUnidadOrganizativa', settingDataField) : false),
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
              colSpan={2}
              dataField="ListaPersonaView"
              // isRequired={modoEdicion}
              label={{ text: intl.formatMessage({ id: "ACCESS.REPORT.PEOPLE" }) }}
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
                      readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                      onClick: (evt) => {
                        setisVisiblePopUpPersonas(true);
                      },
                    },
                  },
                ],
              }}
            />

          </GroupItem>
        </Form>
      </>
    );
  }


  const control = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item
              colSpan={2}
              dataField="IdZona"
              label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ZONE" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: lstZona,
                valueExpr: "IdZona",
                displayExpr: "Zona",
                onValueChanged: (e) => onValueChangedZona(e.value),
                searchEnabled: true,
                showClearButton: true,
              }}
            />

            <Item
              colSpan={2}
              dataField="IdPuerta"
              label={{
                text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.DOOR" })
              }}
              editorType="dxSelectBox"
              editorOptions={{
                items: lstPuerta,
                valueExpr: "IdPuerta",
                displayExpr: "Puerta",
                searchEnabled: true,
                showClearButton: true,
              }}
            />

            <Item
              colSpan={2}
              dataField="IdTipoMarcacion"
              label={{ text: intl.formatMessage({ id: "ACCESS.REPORT.TYPE.MARK" }) }}
              editorType="dxSelectBox"
              // isRequired={modoEdicion ? isRequired('IdTipoMarcacion', settingDataField) : false}
              editorOptions={{
                items: lstTipoMarcacion,
                valueExpr: "IdTipoMarcacion",
                displayExpr: "TipoMarcacion",
                // readOnly: readOnlyRecord,
                searchEnabled: true,
                showClearButton: true,
              }}
            />

            <Item
              dataField="Funcion"
              label={{ text: intl.formatMessage({ id: "ACCESS.REPORT.FUNCTION" }) }}
              editorType="dxSelectBox"
              isRequired={false}
              editorOptions={{
                items: [{ valor: "", descripcion: "TODOS" }, { valor: "S", descripcion: "ENTRADA" }, { valor: "N", descripcion: "SALIDA" }],
                valueExpr: "valor",
                displayExpr: "descripcion",
                searchEnabled: true,
                showClearButton: true,
              }}
            />

            <Item
              dataField="TipoAcceso"
              label={{ text: intl.formatMessage({ id: "ACCESS" }) }}
              editorType="dxSelectBox"
              // isRequired={modoEdicion ? isRequired('IdTipoMarcacion', settingDataField) : false}
              editorOptions={{
                items: [{ valor: "", descripcion: "TODOS" }, { valor: "N", descripcion: "OTORGADO" }, { valor: "S", descripcion: "NEGADO" }],
                valueExpr: "valor",
                displayExpr: "descripcion",
                searchEnabled: true,
                showClearButton: true,
              }}
            />
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
              dataField="FechaInicio"
              label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }) }}
              isRequired={true}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
              }}
            />

            <Item
              dataField="FechaFin"
              colSpan={2}
              label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }) }}
              // isRequired={habilitarFecha}
              // visible={habilitarFecha}
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

  const horas = (e) => { 
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item
              dataField="HoraInicio"
              label={{ text: intl.formatMessage({ id: "ACCESS.REPORT.STARTTIME" }) }}
              isRequired={true}
              editorType="dxDateBox"
              editorOptions={{
                type: "time",
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "HH:mm",
              }}
            />

            <Item
              dataField="HoraFin"
              label={{ text: intl.formatMessage({ id: "ACCESS.REPORT.ENDTIME" }) }}
              editorType="dxDateBox"
              editorOptions={{
                type: "time",
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "HH:mm",
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
        <GroupItem itemType="group" colCount={2} colSpan={2}>

          <div className="row">

            <div className="col-md-6">
              <fieldset className="scheduler-border" >
                <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ACCREDITATION.PEOPLE.GENERALDATA" })} </h5></legend>
                {datosGenerales()}
              </fieldset>
            </div>

            <div className="col-md-6">
              <fieldset className="scheduler-border" >
                <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.CONTROL" })} </h5></legend>
                {control()}
              </fieldset>
            </div>

            <div className="col-md-6">
              <fieldset className="scheduler-border" >
                <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ACCESS.DATE" })} </h5></legend>
                {fechas()}
              </fieldset>
            </div>

            <div className="col-md-6">
              <fieldset className="scheduler-border" >
                <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ACCESS.HOUR" })} </h5></legend>
                {horas()}
              </fieldset>
            </div>

          </div>


        </GroupItem>
      </Form>

      {/*******>POPUP DE COMPANIAS>******** */}
      {popupVisibleCompania && (
        <AdministracionCompaniaBuscar
          selectData={selectCompania}
          showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
          cancelarEdicion={() => setPopupVisibleCompania(false)}
          uniqueId={"ReportCompaniabuscarReporteFilterPage"}
          selectionMode={"multiple"}
        />
      )}


      {/*POPUP DIVISIÓN------------------------------ */}
      {/* <AdministracionContratoDivisionBuscar
        selectData={selectDivision}
        showPopup={{ isVisiblePopUp: isVisiblePopUpDivision, setisVisiblePopUp: setisVisiblePopUpDivision }}
        cancelar={() => setisVisiblePopUpDivision(false)}
        uniqueId={"divisionbuscarReporteListPage"}
        selectionMode={"multiple"} 
      //filtro={filtroLocal}
      />*/}

      {/*******>POPUP DE UNIDAD ORGA.>*********************** */}
      {popupVisibleUnidad&&(
        <AdministracionUnidadOrganizativaContratoBuscar
        selectData={selectUnidadOrganizativa}
        showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
        cancelar={() => setPopupVisibleUnidad(false)}
        uniqueId={"ReportBuscarUnidadListPage"}
        selectionMode={"multiple"}
        filtro={{ IdCompaniaMandante: '', IdCompaniaContratista: '' }}
      />
      )}
      

      {/* POPUP-> buscar persona */}
      {isVisiblePopUpPersonas&&(
        <AdministracionPersonaBuscar
        showPopup={{ isVisiblePopUp: isVisiblePopUpPersonas, setisVisiblePopUp: setisVisiblePopUpPersonas }}
        cancelar={() => setisVisiblePopUpPersonas(false)}
        agregar={agregarPersonaAdministrador}
        selectionMode={"multiple"}
        uniqueId={"ReportPersonasBuscarAdministrador"}
      />
      )}
      
    </Fragment>

  );
};

export default injectIntl(WithLoandingPanel(MarcacionesPersonaFilterPage));
