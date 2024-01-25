import React, { useEffect, useState ,createRef} from "react";
import { useSelector } from "react-redux";
import Form, {
  Item,
  GroupItem,
  PatternRule
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { injectIntl } from "react-intl";

import { isRequired } from "../../../../../../_metronic/utils/securityUtils";
import { isNotEmpty,
   listarEstado,
    listarEstadoAprobacion,
    getFirstDayAndCurrentlyMonthOfYear,
    listarCondicionReportePersonas,
    listarEstadoSimple,
    getMonths
  }
     from "../../../../../../_metronic";
import { service } from "../../../../../api/acreditacion/perfil.api";
import AdministracionUnidadOrganizativaBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AdministracionPosicionBuscar from "../../../../../partials/components/AdministracionPosicionBuscar";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import PersonaTextAreaPopup from '../../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';
import AdministracionContratoBuscar from "../../../../../partials/components/AdministracionContratoBuscar";
import AdministracionDivisionBuscar from "../../../../../partials/components/AdministracionDivisionBuscar";
import { handleErrorMessages, handleInfoMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import Pdf from "react-to-pdf";
import { serviceReporte } from "../../../../../api/administracion/reporte.api";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";

const ReporteMovimientoFiltros = props => {
  const { intl, modoEdicion, settingDataField,setLoading } = props;

  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const { FechaInicio, FechaFin } = getFirstDayAndCurrentlyMonthOfYear();
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);
  const [popupVisibleContrato, setPopupVisibleContrato] = useState(false);

  // const [perfil, setPerfil] = useState([]);
  // const [companiaContratista, setCompaniaContratista] = useState("");
  // const [estadosAprobacion, setEstadosAprobacion] = useState([]);
  // const classesEncabezado = useStylesEncabezado();

  const [isActiveFilters, setIsActiveFilters] = useState(true);
  const [isVisiblePopUpDivision, setisVisiblePopUpDivision] = useState(false);
  const [condicion, setCondicion] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [meses, setMeses] = useState(true);

  useEffect(() => {
    cargarCombos();
  }, []);

  async function cargarCombos() {

    props.dataRowEditNew.Anio = new Date().getFullYear();
    props.dataRowEditNew.MesInicio = '01';
    props.dataRowEditNew.MesFin = (new Date().getMonth() + 1).toString().length == 1 ?  '0' + (new Date().getMonth() + 1).toString() : (new Date().getMonth() + 1).toString() ;
    props.dataRowEditNew.FechaInicio = FechaInicio;
    props.dataRowEditNew.FechaFin = FechaFin;

    // let dataEstados = listarEstadoAprobacion(); 
    // let estado = listarEstado(); 
    // let perfil = await service.obtenerTodos({IdCliente});
    let condicion = listarCondicionReportePersonas();
    let estadoSimples = listarEstadoSimple();   
    let meses = getMonths();

    // setEstadosAprobacion(dataEstados);
    setMeses(meses);
    // setPerfil(perfil);
    // setEstado(estado);
    setCondicion(condicion);
    setEstadoSimple(estadoSimples);

  }
  const selectCompania = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    props.dataRowEditNew.IdCompania = IdCompania;
    props.dataRowEditNew.Compania = Compania;
    setPopupVisibleCompania(false);
  }

  const selectUnidadOrganizativa = async (selectedRow) => {
  let strUnidadesOrganizativas = selectedRow.map(x => x.IdUnidadOrganizativa ).join('|');
  let UnidadesOrganizativasDescripcion = selectedRow.map(x => x.Menu).join(',');
  props.dataRowEditNew.UnidadesOrganizativas = strUnidadesOrganizativas;
  props.dataRowEditNew.UnidadesOrganizativasDescripcion = UnidadesOrganizativasDescripcion;
  setPopupVisibleUnidad(false);
  };

     /*** POPUP DIVISIONES ***/
  const selectDataDivisiones = (data) => {
    const { Division, IdDivision } = data;
    props.dataRowEditNew.IdDivision = IdDivision;
    props.dataRowEditNew.Division = `${IdDivision} - ${Division}`;
    setisVisiblePopUpDivision(false);
  }

  const selectPosicion = async (dataPopup) => {
    const { IdPosicion, Posicion } = dataPopup[0];
    props.dataRowEditNew.IdPosicion = IdPosicion;
    props.dataRowEditNew.Posicion = Posicion;
    setPopupVisiblePosicion(false);
  }

  const selectPersonas = (data) => {
    if (isNotEmpty(data)) {
      let strPersonas = data.split('|').join(',');
      props.dataRowEditNew.Personas = strPersonas;
    }
  }

   const agregarContrato = (contrato) => {
    const { IdContrato, Contrato } = contrato[0];
    if (isNotEmpty(IdContrato)) {
    }
  };


  const resetearFiltro  = () =>{ 
  props.dataRowEditNew.IdCompania = '';
  props.dataRowEditNew.Compania = '';
  props.dataRowEditNew.IdUnidadOrganizativa = '';
  props.dataRowEditNew.UnidadesOrganizativasDescripcion = '';
  props.dataRowEditNew.UnidadesOrganizativas = '';
  props.dataRowEditNew.IdDivision = '';
  props.dataRowEditNew.Division = '';
  props.dataRowEditNew.Condicion = '';
  props.dataRowEditNew.IdPosicion = '';
  props.dataRowEditNew.Posicion = '';
  props.dataRowEditNew.Activo = '';
   props.setDataRowEditNew({...props.dataRowEditNew});
   props.ObtenerListas();

  }

  const datosGenerales = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >  

          <Item
            colSpan={2}
            dataField="Compania"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACTORCOMPANY" }) }}
            editorOptions={{
              readOnly: true,
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
                  disabled: false,
                  onClick: () => {
                    setPopupVisibleCompania(true);
                  },
                }
              }]
            }}
          />

          <Item
                dataField="IdContrato"
                colSpan={1}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }) }}
                isRequired={false}
                visible={false}
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
                      onClick: (evt) => {
                        setPopupVisibleContrato(true);
                      },
                    }
                  }]
                }}
              />

          <Item
            colSpan={2}
            dataField="UnidadesOrganizativasDescripcion" 
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" }) }}
            editorOptions={{
              readOnly: true,
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
                  disabled: false,
                  onClick: () => {
                    setPopupVisibleUnidad(true);
                  },
                }
              }]
            }}
          />   

            <Item
                colSpan={2} 
                dataField="Division" 
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.DIVISION.NAME" }) }}
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
                        onClick: (evt) => {
                          setisVisiblePopUpDivision(true);
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

  const personales = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

      <Item
            dataField="Posicion"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION" }) }}
            editorOptions={{
              readOnly: true,
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
                  disabled: false,
                  onClick: () => {
                    setPopupVisiblePosicion(true);
                  },
                }
              }]
            }}
          />

          <Item dataField="Condicion"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONDITION" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: condicion,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
            }} 
          />

          <Item
            dataField="Activo"
            label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
            visible={false} // Se solicito Esconderlo.
            editorType="dxSelectBox"
            editorOptions={{
              items: estadoSimple,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
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
          <GroupItem itemType="group" colCount={3} >
        <Item
            dataField="Anio"
            label={{ text: intl.formatMessage({ id: "ACCESS.VEHICLE.YEAR" }) }}
            isRequired={true}
            editorType="dxNumberBox"
            dataType="number"
            maxLength={4}
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase; text-align: right" },
              showSpinButtons: true,
              showClearButton: false,
              min: 2000,
              max: 4000,
            }}
          >
             <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
          </Item>

          <Item
              dataField="MesInicio"
              label={{ text: intl.formatMessage({ id: "REPORT.MONTH.START" }) }}
              editorType="dxSelectBox"
              isRequired={true}
              editorOptions={{
                  items: meses,
                  valueExpr: "Id",
                  displayExpr: "Mes",
              }}
          />

          <Item
              dataField="MesFin"
              label={{ text: intl.formatMessage({ id: "REPORT.MONTH.END" }) }}
              editorType="dxSelectBox"
              isRequired={true}
              editorOptions={{
                  items: meses,
                  valueExpr: "Id",
                  displayExpr: "Mes",
              }}
          />

          </GroupItem>
        </Form>
      </>
    );
  }

  const filtrarOptions = () =>{ 
     const { Anio, MesInicio,MesFin, } = props.dataRowEditNew;
    if ( Anio === null || MesInicio === undefined ||  MesFin === undefined  ) {
      handleInfoMessages(intl.formatMessage({ id: "Tiene que seleccionar un periodo de tiempo" }));
      return;
  }

    let FechaInicio = new Date(Anio, MesInicio -1, 1);
    let FechaFin = new Date(Anio, MesFin , 0);

    props.dataRowEditNew.FechaInicio = FechaInicio;
    props.dataRowEditNew.FechaFin = FechaFin;
    props.ObtenerListas();
  }

  const exportarDatos = async () => {

    let result = JSON.parse(localStorage.getItem('vcg:' + 'ReporteMovimientoEstadisticasDetalleListPage' + ':loadOptions'));
    // console.log("exportarDatos|result:",result);
    if (!isNotEmpty(result)) return;

    // Recorremos los filtros usados:
   let filterExport = {
          IdCompania,
          UnidadesOrganizativas,
          IdDivision,
          IdPosicion,
          Condicion,
          Activo,
          FechaInicio,
          FechaFin,
          Funcion
      };
    for (let i = 0; i < result.filter.length; i++) {
      let currentValue = result.filter[i];

      // Filtramos solo los Array
      if (currentValue instanceof Array) {
        // Recorremos cada uno de los filtros en el array
        for (let j = 0; j < currentValue.length; j++) {
          //Llenamos filterData para decompilarlo en el siguente punto.
          filterExport[currentValue[0]] = currentValue[2];
        }
      }
    }
    //obtener orden para exportar
    const { selector } = result.sort[0];

    // Decompilando filterData
    const { IdCompania,UnidadesOrganizativas,IdDivision,IdPosicion,Condicion,Activo, FechaInicio,FechaFin,Funcion} = filterExport

    if (props.dataGridRef.current.props.dataSource._items.length > 0) {

      let ListColumnName = [];
      let ListDataField = [];

      props.dataGridRef.current._optionsManager._currentConfig.configCollections.columns.map(item => {
        if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {
          ListColumnName.push(item.options.caption.toUpperCase());
          ListDataField.push(item.options.dataField);
        }
      })
      //Obtener dataGrid titulo columnas + idColumnas para exportar de forma dinamica.
      var ArrayColumnHeader = ListColumnName.join('|');
      var ArrayColumnId = ListDataField.join('|');

      let params = {
        IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
        UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
        IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",
        IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : "",
        Condicion: isNotEmpty(Condicion) ? Condicion : "",
        Activo: isNotEmpty(Activo) ? Activo : "",
        FechaInicio: FechaInicio,
        FechaFin: FechaFin,
        Funcion: isNotEmpty(Funcion) ? Funcion : "",
        TituloHoja: intl.formatMessage({ id: "CONFIG.MENU.ADMINISTRACION.MOVIMIENTO_PERSONAL" }),
        NombreHoja: intl.formatMessage({ id: "CONFIG.MENU.ADMINISTRACION.MOVIMIENTO_PERSONAL" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      setLoading(true);
      await serviceReporte.exportarR001_MovimientoPersonasDetalle(params).then(response => {
        if (isNotEmpty(response.fileBase64)) {
          let download = document.getElementById('iddescarga');
          download.href = `data:application/vnd.ms-excel;base64,${encodeURIComponent(response.fileBase64)}`;
          download.download = response.fileName;
          download.click();
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
        }

      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => {
        setLoading(false);
      });
    }
  }

  const optionsPDF = {
    orientation: 'landscape',
    unit: 'in',
    format: [20, 20] //height, width
  };

  return (
    <>
    
        <HeaderInformation  data={props.getInfo()} visible={true} labelLocation={'left'} colCount={1}
          toolbar={
          <PortletHeader
          title={''}
          toolbar={
          <PortletHeaderToolbar>
            
              <Button
                icon={ isActiveFilters ? "chevronup" : "chevrondown"}
                type="default"
                hint={isActiveFilters ? intl.formatMessage({ id: "COMMON.HIDE" }) : intl.formatMessage({ id: "COMMON.SHOW" })}
                onClick={() => setIsActiveFilters(!isActiveFilters)}
                disabled={false}
              />
                &nbsp;
              <Button
                  icon="fa fa-search"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                  onClick={filtrarOptions}
                  disabled={isActiveFilters ? false : true }
                />
              &nbsp;
              <Button icon="refresh"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                disabled={ (props.tabIndex === 0) ? false:true }
                onClick={resetearFiltro}
              />
              &nbsp;
              <Button
                icon="fa fa-file-excel"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                disabled={ (props.tabIndex === 1) ? false:true }
                onClick={exportarDatos}
              />
              &nbsp; 
              <Pdf targetRef={props.refPdf} filename="Reporte_Estadistico.pdf" options={optionsPDF} x={.1} y={.1}>
              {({ toPdf }) => 
              <Button icon="file" 
              type="default" 
              hint={intl.formatMessage({ id: "ACTION.DOWNLOAD.PDF" })}
              onClick={toPdf}
              disabled={(props.tabIndex === 0) ? false : true}
              />

              }

              </Pdf>
            
          </PortletHeaderToolbar>
        }
        /> 
        } 
      />

      {isActiveFilters && (
              <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                  <GroupItem itemType="group" colCount={2} colSpan={2}>
                  <div className="row">
                    <div className="col-md-6">
                    <fieldset className="scheduler-border" style={{height:"153px"}} >
                    <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ACCREDITATION.PEOPLE.GENERALDATA" })} </h5></legend>
                    {datosGenerales()}
                    </fieldset>
                    </div>

                    <div className="col-md-6">
                    <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >
                    <h5>{intl.formatMessage({ id: "ADMINISTRATION.PERSON.PERSONAL.INFORMATION" })} </h5>
                    </legend>
                    {personales()}
                    </fieldset>

                    <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >
                    <h5>{intl.formatMessage({ id: "ACCESS.DATE" })} </h5>
                    </legend>
                    {fechas()}
                    </fieldset>
                    </div>
                  </div>        
                  </GroupItem>
              </Form>
      )}
      {/*******>POPUP DE COMPANIAS>******** */}
      <AdministracionCompaniaBuscar
          selectData={selectCompania}
          showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
          cancelarEdicion={() => setPopupVisibleCompania(false)}
          uniqueId={"administracionCompaniaBuscar"}
          isContratista={"S"}
        />

        {/*******>POPUP DE UNIDAD ORGA.>******** */}
        <AdministracionUnidadOrganizativaBuscar
          selectData={selectUnidadOrganizativa}
          showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
          cancelarEdicion={() => setPopupVisibleUnidad(false)}
          selectionMode = {"multiple"}       
          showCheckBoxesModes = {"normal"}
        />

        <PersonaTextAreaPopup
          isVisiblePopupDetalle={popupVisiblePersonas}
          setIsVisiblePopupDetalle={setPopupVisiblePersonas}
          obtenerNumeroDocumento={selectPersonas}
        />

          {/*******>POPUP DE CONTRATO>****************************** */}
          <AdministracionContratoBuscar
            selectData={agregarContrato}
            showPopup={{ isVisiblePopUp: popupVisibleContrato, setisVisiblePopUp: setPopupVisibleContrato }}
            cancelar={() => setPopupVisibleContrato(false)}
          />

          {/*******>POPUP DIVISIONES>******** */}
          <AdministracionDivisionBuscar
            selectData={selectDataDivisiones}
            showPopup={{ isVisiblePopUp: isVisiblePopUpDivision, setisVisiblePopUp: setisVisiblePopUpDivision }}
            cancelarEdicion={() => setisVisiblePopUpDivision(false)}
          />

           {/*******>POPUP DE UNIDAD ORGA. CON POSICIONES>******** */}
          <AdministracionPosicionBuscar
            selectData={selectPosicion}
            showPopup={{ isVisiblePopUp: popupVisiblePosicion, setisVisiblePopUp: setPopupVisiblePosicion }}
            cancelarEdicion={() => setPopupVisiblePosicion(false)}
            uniqueId={"posionesBuscarPersonaList"}
          />
          
    </>
  );

};
export default injectIntl(WithLoandingPanel(ReporteMovimientoFiltros));
