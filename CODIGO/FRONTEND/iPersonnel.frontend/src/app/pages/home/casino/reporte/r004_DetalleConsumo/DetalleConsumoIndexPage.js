import React, { useEffect, useRef, useState } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { AppBar } from '@material-ui/core';
import { Typography } from "@material-ui/core";
import { Toolbar } from "@material-ui/core";
import { serviceCasinoReporte,exportarR003ExcelDetalleConsumo } from '../../../../../api/casino/reporte.api';
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import DataGridDynamic from '../../../../../partials/components/DataGridDynamic/DataGridDynamic';
import { Portlet, PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { Button } from 'devextreme-react';
import { dateFormat, isNotEmpty, listarEstadoSimple, PaginationSetting } from '../../../../../../_metronic';
import Form, { Item, GroupItem, EmptyItem } from "devextreme-react/form";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import AdministracionCentroCostoBuscar from "../../../../../partials/components/AdministracionCentroCostoBuscar";

//import PersonaTextAreaPopup from '../../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';
import { obtenerTodos as obtenerCmbComedor } from "../../../../../api/casino/comedor.api";
import { obtenerTodos as obtenerCmbServicio } from "../../../../../api/casino/comedorServicio.api";


export const initialFilter = {
  IdCompania: '',
  IdComedor: '',
  IdServicio: '',
  IdCliente: '',
  IdDivision: '',
  IdCentroCosto: '',
  FechaInicio: new Date(new Date().getFullYear(), 0, 1),
  FechaFin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
};

const DetalleConsumoIndexPage = (props) => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;
  const dataGridRef = useRef(null);
  const [listaTrabajadores, setListaTrabajadores] = useState([]);
  const [viewFilter, setViewFilter] = useState(true);

  const [dataRowEditNew, setDataRowEditNew] = useState({ ...initialFilter });
  // const [dataRowEditNew, setDataRowEditNew] = useState({
  //   FechaInicio: new Date(new Date().getFullYear(), 0, 1),
  //   FechaFin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  // });


  const [cmbComedor, setCmbComedor] = useState([]);
  const [cmbServicio, setCmbServicio] = useState([]);
  const [Filtros, setFiltros] = useState({ FlRepositorio: "1", IdUnidadOrganizativa: "" });

  const [columnasDinamicas, setColumnasDinamicas] = useState([]);
  const [viewPagination, setViewPagination] = useState(false);
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [isVisibleCentroCosto, setisVisibleCentroCosto] = useState(false);

  const classesEncabezado = useStylesEncabezado();

  const [comedorPorDefecto, setcomedorPorDefecto] = useState(null);
  const columnasEstaticas = [
    {
      dataField: "RowIndex",
      caption: "#",
      width: "30",
      alignment: "center"
    },
    {
      dataField: "CompaniaMandante",
      caption: "Empresa",
      width: "230"
    },
    {
      dataField: "NombreCompleto",
      caption: intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" }),
      width: "230"
    },
    {
      dataField: "Documento",
      caption: intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" }),
      width: "90",
      alignment: "center"
    },
    {
      dataField: "Credencial",
      caption: intl.formatMessage({ id: "ADMINISTRATION.PERSON.FOTOCHECK" }),
      width: "90",
      alignment: "center"
    },
    {
      dataField: "FechaMarca",
      caption: intl.formatMessage({ id: "COMMON.STARTDATE" }),
      width: "100",
      alignment: "center"
    }
  ];

  const buscarDetalleConsumo = async (skip, take) => {
    try {
      let datosTrabajadores = await consultarDetalleConsumoxComedor(skip, take);
      // console.log("buscarDetalleConsumo|datosTrabajadores:",datosTrabajadores);
      if (datosTrabajadores.IdError === 0) {
        setListaTrabajadores(datosTrabajadores[0]);
        if (datosTrabajadores.length > 1) {
          let columnas = datosTrabajadores[1]?.[0]?.Columnas.split(",");
          if (columnas) setColumnasDinamicas(crearArregloColumnasHeader(columnas));
          setTimeout(() => {
            setViewPagination(true);
          }, 500);
        }
      } else {
        setViewPagination(false);
        setColumnasDinamicas([]);
      }
    } catch (error) {
      console.log(error);
      setViewPagination(false);
      setColumnasDinamicas([]);
    }
  };

  const crearArregloColumnasHeader = (array_header) => {
    let header_json = [];
    for (let i = 0; i < array_header.length; i++) {
      let item = array_header[i];
      header_json.push({
        dataField: item,
        caption: item,
        key: item,
        alignment: "center",
        width: 120
      });
    }
    return header_json;
  };

  const consultarDetalleConsumoxComedor = async (skip, take) => {


    setLoading(true);
    const {
      IdComedor,
      IdCompania,
      IdServicio,
      IdCentroCosto,
      FechaInicio,
      FechaFin } = dataRowEditNew;

    let params = {
      idDivision: perfil.IdDivision,
      idCompania: !isNotEmpty(IdCompania) ? "" : IdCompania,
      idComedor: IdComedor,
      IdServicio: !isNotEmpty(IdServicio) ? "" : IdServicio,
      IdCentroCosto: !isNotEmpty(IdCentroCosto) ? "" : IdCentroCosto,
      FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
      skip,
      take,
      orderField: "NombreCompleto",
      orderDesc: 0
    };

    let datosTrabajadores = await serviceCasinoReporte.listar_r003_DetalleConsumo(params)
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        return { IdErro: 1, trabajadores: [] };
      })
      .finally(() => {
        setLoading(false);
      });

    //console.log("----------->", datosReserva);
    if (typeof datosTrabajadores === "object" && datosTrabajadores !== null) {
      datosTrabajadores.IdError = 0;
      return datosTrabajadores;
    } else return { IdErro: 1, trabajadores: [] };
  };

  const exportExcel = async () => {
    if (dataGridRef.current.props.dataSource.length > 0) {

      let ListColumnName = [];
      let ListDataField = [];

      dataGridRef.current._optionsManager._currentConfig.configCollections.columns.forEach(item => {

        let { caption, visible, type, dataField } = item.options;
        if (!!caption) {
          if ((visible === undefined || visible === true) && type !== 'buttons') {
            ListColumnName.push(caption.toUpperCase().replace("_", " "));
            ListDataField.push(dataField);
          }
        }

      });
      let ArrayColumnHeader = ListColumnName.join('|');
      let ArrayColumnId = ListDataField.join('|');
      const {
        IdComedor,
        IdCompania,
        IdServicio,
        IdCentroCosto,
        FechaInicio,
        FechaFin } = dataRowEditNew;

      let params = {
        IdDivision: perfil.IdDivision,
        IdCompania: !isNotEmpty(IdCompania) ? "" : IdCompania,
        IdComedor,
        IdServicio: !isNotEmpty(IdServicio) ? "" : IdServicio,
        IdCentroCosto: !isNotEmpty(IdCentroCosto) ? "" : IdCentroCosto,
        FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
        FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
        OrderField: "NombreCompleto",
        orderDesc: 0,
        skip: 0,
        take: 0,
        TituloHoja: intl.formatMessage({ id: "ACTION.EXPORT" }) + ' ' + intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.DETALLE_DE_CONSUMO" }),
        NombreHoja: intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.DETALLE_DE_CONSUMO" }),
        ArrayColumnId,
        ArrayColumnHeader
      };

      setLoading(true);
      await exportarR003ExcelDetalleConsumo(params).then(response => {
        if (isNotEmpty(response.fileBase64)) {
          let download = document.createElement('a');
          download.href = `data:application/vnd.ms-excel;base64,${encodeURIComponent(response.fileBase64)}`;
          download.download = response.fileName;
          download.click();
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
        }

      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => {
        setLoading(false);
      })
    }
  };

  async function cargarCombos() {
    setLoading(true);
    await Promise.all([
      obtenerCmbComedor({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdTipo: '%' }),
    ])
      .then(resp => {
        setCmbComedor(resp[0]);
        const { IdComedor } = resp[0][0];
        dataRowEditNew.IdComedor = IdComedor;
        CargarServicios(IdComedor);
        setcomedorPorDefecto(IdComedor);
      })
      .finally(resp => {
        setLoading(false);
      })
  }

  async function CargarServicios(idComedor) {
    let cmbServicioX = await obtenerCmbServicio({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdComedor: idComedor });
    setCmbServicio(cmbServicioX);
  }

  const selectCompania = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    dataRowEditNew.IdCompania = IdCompania;
    dataRowEditNew.Compania = Compania;
    setPopupVisibleCompania(false);
  };

  const agregarCentroCosto = (dataPopup) => {
    const { IdCentroCosto, CentroCosto } = dataPopup[0];
    setisVisibleCentroCosto(false);
    if (isNotEmpty(IdCentroCosto)) {
      setDataRowEditNew({
        //...props.dataRowEditNew,
        ...dataRowEditNew,
        IdCentroCosto: IdCentroCosto,
        CentroCosto: CentroCosto,
      });
    }
  };

  const limpiar = () => {
    console.log("Limpiando", comedorPorDefecto);
    setDataRowEditNew({
      IdCompania: '',
      IdComedor: comedorPorDefecto,
      IdServicio: '',
      IdCliente: '',
      IdDivision: '',
      IdCentroCosto: '',
      FechaInicio: new Date(new Date().getFullYear(), 0, 1),
      FechaFin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    });
    buscarDetalleConsumo(0, PaginationSetting.TOTAL_RECORDS)
  };

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


  useEffect(() => {
    cargarCombos();
    console.log("Antes de limpiar: ", comedorPorDefecto);
    //limpiar();

  }, []);

  const groupFechas = (e) => {
    return (
      <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
        <GroupItem itemType="group" colCount={2} colSpan={2}>

          <Item
            dataField="FechaInicio"
            isRequired={true}
            label={{
              text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }),
            }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
            }}
          />

          <Item
            dataField="FechaFin"
            isRequired={true}
            label={{
              text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }),
            }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
            }}
          />
        </GroupItem>
      </Form>
    )
  }

  const groupServicio = (e) => {
    return (
      <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
        <GroupItem itemType="group" colCount={2} colSpan={2}>

          <Item
            dataField="IdComedor"
            label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: cmbComedor,
              valueExpr: "IdComedor",
              displayExpr: "Comedor",
              //showClearButton: true,
              onValueChanged: (e) => {
                if (isNotEmpty(e.value)) {
                  CargarServicios(e.value);
                }
              },
            }}
          />

          <Item
            dataField="IdServicio"
            editorType="dxSelectBox"
            label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE" }) }}
            editorOptions={{
              items: cmbServicio,
              valueExpr: "IdServicio",
              showClearButton: true,
              displayExpr: function (item) {
                if (item) {
                  return item.Servicio + "- [" + item.HoraInicio + " " + item.HoraFin + "]";
                }
              },
            }}
          />
        </GroupItem>
      </Form>
    )
  }

  const formularioFiltros = (e) => {
    return (
      <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <Item

            dataField="Compania"
            label={{ text: intl.formatMessage({ id: "CASINO.CONSOLIDATED.REPORT.DININGROOMS" }) }}
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
            colSpan={1} dataField="CentroCosto"

            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" }), }}
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
                      setFiltros({ FlRepositorio: "1", IdUnidadOrganizativa: "" })
                      setisVisibleCentroCosto(true);
                    },
                  },
                },
              ],
            }}
          />
        </GroupItem>
      </Form>
    )
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>
    <CustomBreadcrumbs
      Title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.MENU" })}
      SubMenu={intl.formatMessage({ id: "ACCESS.REPORT.SUBMENU" })}
      Subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
    />

    <Portlet>
      <AppBar position="static" className={classesEncabezado.principal}>
        <Toolbar variant="dense" className={classesEncabezado.toolbar}>
          <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
            {intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
          </Typography>
        </Toolbar>
      </AppBar>

      <PortletHeader
        title={""}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon="fa fa-search"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.SEARCH" })}
              onClick={e => {
                buscarDetalleConsumo(0, PaginationSetting.TOTAL_RECORDS);
              }}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            />
            &nbsp;
            <Button
              icon="refresh"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
              onClick={limpiar}
              visible={true}
            />
            &nbsp;
            <Button
              icon="fa fa-file-excel"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
              onClick={exportExcel}
            />
          </PortletHeaderToolbar>
        }
      />

      <PortletBody>
        <React.Fragment>
          <Form formData={dataRowEditNew} validationGroup="FormEdicion" >

            <GroupItem itemType="group" colCount={2} colSpan={2}>

              <div className="row">
                <div className="col-md-12">
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ACCREDITATION.PEOPLE.GENERALDATA" })} </h5></legend>
                    {formularioFiltros()}
                  </fieldset>
                </div>
                <div className="col-md-6">
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >   <h5>SERVICIOS </h5></legend>
                    {groupServicio()}
                  </fieldset>
                </div>
                <div className="col-md-6">
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >   <h5>FECHAS </h5></legend>
                    {groupFechas()}
                  </fieldset>
                </div>
              </div>
            </GroupItem>
          </Form>
          <br />

          <DataGridDynamic
            id='dg_ReporteEstadoActual'
            intl={intl}
            dataSource={listaTrabajadores}
            staticColumns={columnasEstaticas}
            dynamicColumns={columnasDinamicas}
            isLoadedResults={viewPagination}
            setIsLoadedResults={setViewPagination}
            refreshDataSource={buscarDetalleConsumo}
            keyExpr="RowIndex"
            dataGridRef={dataGridRef}
          />

        </React.Fragment>
      </PortletBody>


      {/*******>POPUP DE COMPANIAS>******** */}
      {popupVisibleCompania && (
        <AdministracionCompaniaBuscar
          selectData={selectCompania}
          showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
          cancelarEdicion={() => setPopupVisibleCompania(false)}
          uniqueId={"004ReporteDetalleConsumoCompaniaBuscar"}
        />
      )}

      {/*******>POPUP DE CENCTRO COSTO >******** */}
      {isVisibleCentroCosto && (
        <AdministracionCentroCostoBuscar
          selectData={agregarCentroCosto}
          showButton={false}
          showPopup={{ isVisiblePopUp: isVisibleCentroCosto, setisVisiblePopUp: setisVisibleCentroCosto }}
          cancelarEdicion={() => setisVisibleCentroCosto(false)}
          uniqueId={"004ReporteDetalleConsumiBuscarCentroCosto"}
          selectionMode={"row"}
          Filtros={Filtros}
        />
      )}


    </Portlet>


  </>
};

export default injectIntl(WithLoandingPanel(DetalleConsumoIndexPage));
