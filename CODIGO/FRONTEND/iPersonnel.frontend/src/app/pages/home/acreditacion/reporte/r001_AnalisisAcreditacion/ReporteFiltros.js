import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Form, {
  Item,
  GroupItem,
  PatternRule
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import {
  isNotEmpty,
  listarEstadoAprobacion,
  getFirstDayAndCurrentlyMonthOfYear,
  getMonths,
  dateFormat,
  addDaysToDate
} from "../../../../../../_metronic";
import { service } from "../../../../../api/acreditacion/perfil.api";
import AdministracionUnidadOrganizativaBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import { handleErrorMessages, handleInfoMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import Pdf from "react-to-pdf";
import { serviceReporte } from "../../../../../api/acreditacion/reporte.api";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";

const ReporteFiltros = props => {

  const { intl, varCompaniaMandanteDefault, setLoading } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const { FechaInicio, FechaFin } = getFirstDayAndCurrentlyMonthOfYear();
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [perfil, setPerfil] = useState([]);
  const [estadosAprobacion, setEstadosAprobacion] = useState([]);
  const [viewFilter, setViewFilter] = useState(true);

  useEffect(() => {
    cargarCombos();
  }, []);


  async function cargarCombos() {

    props.dataRowEditNew.Anio = new Date().getFullYear();
    props.dataRowEditNew.IdCompania = varCompaniaMandanteDefault.IdCompaniaMandante;
    props.dataRowEditNew.Compania = varCompaniaMandanteDefault.CompaniaMandante;
    props.dataRowEditNew.MesInicio = dateFormat(addDaysToDate(new Date(), -180), "MM");
    props.dataRowEditNew.MesFin = dateFormat(addDaysToDate(new Date(), 1), "MM")
    if (props.dataRowEditNew.MesInicio > props.dataRowEditNew.MesFin) props.dataRowEditNew.MesInicio = props.dataRowEditNew.MesFin;

    props.dataRowEditNew.FechaInicio = FechaInicio;
    props.dataRowEditNew.FechaFin = FechaFin;

    let dataEstados = listarEstadoAprobacion();
    let perfil = await service.obtenerTodos({ IdCliente });
    setEstadosAprobacion(dataEstados.filter(x => x.Valor != 'I'));
    setPerfil(perfil.filter(x => x.IdEntidad === 'P' && x.Visita === 'N'));
  }

  const selectCompania = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    props.dataRowEditNew.IdCompania = IdCompania;
    props.dataRowEditNew.Compania = Compania;
    setPopupVisibleCompania(false);
  }

  const selectUnidadOrganizativa = async (selectedRow) => {
    let strUnidadesOrganizativas = selectedRow.map(x => x.IdUnidadOrganizativa).join('|');
    let UnidadesOrganizativasDescripcion = selectedRow.map(x => x.Menu).join(',');
    props.dataRowEditNew.UnidadesOrganizativas = strUnidadesOrganizativas;
    props.dataRowEditNew.UnidadesOrganizativasDescripcion = UnidadesOrganizativasDescripcion;
    setPopupVisibleUnidad(false);
  };


  const resetearFiltro = () => {
    props.dataRowEditNew.IdCompania = '';
    props.dataRowEditNew.Compania = '';
    props.dataRowEditNew.IdUnidadOrganizativa = '';
    props.dataRowEditNew.UnidadesOrganizativasDescripcion = '';
    props.dataRowEditNew.UnidadesOrganizativas = '';
    props.dataRowEditNew.IdPerfil = '';
    props.dataRowEditNew.EstadoAprobacion = '';
    props.setDataRowEditNew({ ...props.dataRowEditNew });
    props.ObtenerListas();
  }

  const hideFilter = () => {
    let form = document.getElementById("FormFilter");
    if (viewFilter) {
      setViewFilter(false);
      form.classList.add('hidden');
    } else {
      form.classList.remove('hidden');
      setViewFilter(true);
    }
  }

  const datosGenerales = (e) => {
    return (
      <>
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >
            <Item
              colSpan={2}
              dataField="Compania"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
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

          </GroupItem>
        </Form>
      </>
    );
  }

  const acreditaciones = (e) => {
    return (
      <>
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item dataField="IdPerfil"
              label={{ text: intl.formatMessage({ id: "ACCREDITATION.MANAGEMENT.PROFILE" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: perfil,
                valueExpr: "IdPerfil",
                displayExpr: "Perfil",
                showClearButton: true,
              }}
            />

            <Item
              dataField="EstadoAprobacion"
              label={{ text: intl.formatMessage({ id: "ACCREDITATION.MANAGEMENT.STATUS" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: estadosAprobacion,
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
                items: getMonths(),
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
                items: getMonths(),
                valueExpr: "Id",
                displayExpr: "Mes",
              }}
            />

          </GroupItem>
        </Form>
      </>
    );
  }

  const filtrar = () => {
    //debugger;
    const { Anio, MesInicio, MesFin } = props.dataRowEditNew;

    if (Anio === null || MesInicio === undefined || MesFin === undefined) {
      handleInfoMessages(intl.formatMessage({ id: "Tiene que seleccionar un periodo de tiempo" }));
      return;
    }

    //let FechaInicio = new Date(Anio, MesInicio - 1, 1);
    let FechaInicio = new Date(Anio, MesInicio - 1, 1);
    let FechaFin = new Date(Anio, MesFin, 0);

    props.dataRowEditNew.FechaInicio = FechaInicio;
    props.dataRowEditNew.FechaFin = FechaFin;
    props.ObtenerListas();

  }

  const exportarDatos = async () => {

    let result = JSON.parse(localStorage.getItem('vcg:' + 'ReporteHistogramaDetalleListPage' + ':loadOptions'));
    console.log("exportarDatos|result:", result);
    if (!isNotEmpty(result)) return;

    let filterExport = {
      IdCompania,
      Perfil,
      UnidadesOrganizativas,
      EstadoAprobacion,
      FechaInicio,
      FechaFin
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
    const { IdCompania, Perfil, UnidadesOrganizativas, EstadoAprobacion, FechaInicio, FechaFin } = filterExport;



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
        Perfil: isNotEmpty(Perfil) ? Perfil : "",
        UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
        EstadoAprobacion: isNotEmpty(EstadoAprobacion) ? EstadoAprobacion : "",
        FechaInicio: FechaInicio,
        FechaFin: FechaFin,
        TituloHoja: intl.formatMessage({ id: "CONFIG.MENU.ACREDITACION.__ACREDITACION_POR_PERI" }),
        NombreHoja: intl.formatMessage({ id: "CONFIG.MENU.ACREDITACION.__ACREDITACION_POR_PERI" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      setLoading(true);
      await serviceReporte.r001_detalle_toExcel(params).then(response => {
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

      <PortletHeader
        title={''}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon={viewFilter ? "chevronup" : "chevrondown"}
              type="default"
              hint={viewFilter ? intl.formatMessage({ id: "COMMON.HIDE" }) : intl.formatMessage({ id: "COMMON.SHOW" })}
              onClick={hideFilter}
            />
            &nbsp;
            <Button
              icon="fa fa-search"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.FILTER" })}
              onClick={filtrar}
              disabled={viewFilter ? false : true}
            />
            &nbsp;
            <Button icon="refresh"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
              disabled={(props.tabIndex === 0) ? false : true}
              onClick={resetearFiltro}
            />
            &nbsp;
            <Button
              icon="fa fa-file-excel"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
              disabled={(props.tabIndex === 0) ? true : false}
              onClick={exportarDatos}
            />
            &nbsp;
            <Pdf targetRef={props.refPdf} filename={intl.formatMessage({ id: "ACCREDITATION.MAIN" }) + intl.formatMessage({ id: "ACCREDITATION.MAIN" }) + ".pdf"} options={optionsPDF} x={.1} y={.1}>
              {({ toPdf }) => <Button
                icon="file"
                type="default"
                onClick={toPdf}
                hint={intl.formatMessage({ id: "ACTION.DOWNLOAD.PDF" })}
                disabled={(props.tabIndex === 0) ? false : true} />}
            </Pdf>

          </PortletHeaderToolbar>
        }

      />


      <Form id="FormFilter" formData={props.dataRowEditNew} validationGroup="FormEdicion" >
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <div className="row">
            <div className="col-md-6">
              <fieldset className="scheduler-border" style={{ height: "152px" }} >
                <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ACCREDITATION.PEOPLE.GENERALDATA" })} </h5></legend>
                {datosGenerales()}
              </fieldset>
            </div>

            <div className="col-md-6">
              <fieldset className="scheduler-border" >
                <legend className="scheduler-border" >
                  <h5>{intl.formatMessage({ id: "ACCREDITATION.MAIN" })} </h5>
                </legend>
                {acreditaciones()}
              </fieldset>

              <fieldset className="scheduler-border" >
                <legend className="scheduler-border" >
                  <h5>{intl.formatMessage({ id: "ACREDITATION.R001.REPORT.PERIOD" })} </h5>
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
        uniqueId={"administracionCompaniaBuscar"}
      />

      {/*******>POPUP DE UNIDAD ORGA.>******** */}
      <AdministracionUnidadOrganizativaBuscar
        selectData={selectUnidadOrganizativa}
        showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
        cancelarEdicion={() => setPopupVisibleUnidad(false)}
        selectionMode={"multiple"}
        showCheckBoxesModes={"normal"}
      />

    </>
  );

};
export default injectIntl(WithLoandingPanel(ReporteFiltros));
