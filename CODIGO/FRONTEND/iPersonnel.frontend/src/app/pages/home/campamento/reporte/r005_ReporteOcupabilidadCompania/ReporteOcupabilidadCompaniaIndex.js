import React, { useEffect, useRef, useState } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { AppBar } from '@material-ui/core';
import { Typography } from "@material-ui/core";
import { Toolbar } from "@material-ui/core";
import { service } from '../../../../../api/campamento/reporte.api';
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import DataGridDynamic from '../../../../../partials/components/DataGridDynamic/DataGridDynamic';
import { Portlet, PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { Button } from 'devextreme-react';
import { dateFormat, getStartAndEndOfMonthByDay, isNotEmpty, PaginationSetting } from '../../../../../../_metronic';
import Form, { Item, GroupItem } from "devextreme-react/form";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import { obtenerTodos } from "../../../../../api/campamento/campamento.api";

const ReporteOcupabilidadCompaniaIndex = (props) => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { IdDivision } = perfil;
  const { intl, setLoading, dataMenu } = props;
  let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();
  const hoy = new Date();
  hoy.setHours(23, 59, 0);
  if (FechaFin > hoy) FechaFin = hoy;
  const dataGridRef = useRef(null);
  const [listaOcupabilidad, setListaOcupabilidad] = useState([]);
  const [campamentos, setCampamentos] = useState([]);
  const [dataRowEditNew, setDataRowEditNew] = useState({ IdDivision, IdCampamento: '', IdCompania: '', FechaInicio, FechaFin });

  const [columnasDinamicas, setColumnasDinamicas] = useState([]);
  const [viewPagination, setViewPagination] = useState(false);
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const classesEncabezado = useStylesEncabezado();

  const columnasEstaticas = [
    {
      dataField: "RowIndex",
      caption: "#",
      width: "30",
      alignment: "center"
    },
    {
      dataField: "Campamento",
      caption: intl.formatMessage({ id: "CAMP.RESERVATION.CAMPAMENT" }),
      width: "180"
    },
    {
      dataField: "Compania",
      caption: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }),
      width: "250"
    }
  ];

  const cargarCombos = async () => {
    try {
      let camps = await obtenerTodos({ IdDivision });
      setCampamentos(camps);
    } catch (err) {
      console.log(err);
    }
  };

  const buscaOcupabilidad = async (skip, take) => {
    try {
      let datosOcupabilidad = await consultarOcupalidadCompania(skip, take);
      // console.log("buscaOcupabilidad|datosOcupabilidad:",datosOcupabilidad);
      if (datosOcupabilidad.IdError === 0) {
        setListaOcupabilidad(datosOcupabilidad[0]);
        if (datosOcupabilidad.length > 1) {
          let columnas = datosOcupabilidad[1]?.[0]?.Columnas.split(",");
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

  const consultarOcupalidadCompania = async (skip, take) => {
    setLoading(true);
    let {
      IdDivision,
      IdCompania,
      IdCampamento,
      FechaInicio,
      FechaFin
    } = dataRowEditNew;

    let params = {
      idDivision: IdDivision,
      idCompania: IdCompania ?? '',
      idCampamento: IdCampamento ?? '',
      fechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      fechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
      skip,
      take,
      orderField: "Campamento",
      orderDesc: 0
    };

    let datosOcupabilidad = await service.reporteOcupabilidadCompania(params)
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        return { IdErro: 1, ocupabilidad: [] };
      })
      .finally(() => {
        setLoading(false);
      });

    //console.log("----------->", datosReserva);
    if (typeof datosOcupabilidad === "object" && datosOcupabilidad !== null) {
      datosOcupabilidad.IdError = 0;
      return datosOcupabilidad;
    } else return { IdErro: 1, ocupabilidad: [] };
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
      let params = {
        IdDivision,
        IdCompania: dataRowEditNew.IdCompania ?? '',
        IdCampamento: dataRowEditNew.IdCampamento ?? '',
        FechaInicio: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'),
        FechaFin: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd'),
        OrderField: "Campamento",
        orderDesc: 0,
        skip: 0,
        take: 0,
        TituloHoja: `${intl.formatMessage({ id: "CAMP.REPORT.OCCUPABILITY_BY_COMPANIES" })} ${intl.formatMessage({ id: "COMMON.DATE_FROM" }).toUpperCase()} ${dataRowEditNew.FechaInicio.toLocaleDateString()} ${intl.formatMessage({ id: "COMMON.DATE_TO"}).toUpperCase()} ${dataRowEditNew.FechaFin.toLocaleDateString()}`,
        NombreHoja: intl.formatMessage({ id: "CAMP.REPORT.OCCUPABILITY_BY_COMPANIES" }),
        ArrayColumnId,
        ArrayColumnHeader
      };

      setLoading(true);
      service.exportarExcelOcupabilidadCompania(params).then(response => {
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

  const selectCompania = dataPopup => {
    dataRowEditNew.IdCompania = dataPopup[0].IdCompania;
    dataRowEditNew.Compania = dataPopup[0].Compania;
    setPopupVisibleCompania(false);
  };

  const limpiar = () => {
    setDataRowEditNew({
      IdDivision,
      IdCompania: '',
      IdCampamento: '',
      FechaInicio,
      FechaFin
    });
    buscaOcupabilidad(0, PaginationSetting.TOTAL_RECORDS)
  };

  useEffect(() => {
    cargarCombos();
    limpiar();
  }, []);

  const formularioFiltros = (e) => {
    return (
      <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
        <GroupItem itemType="group" colCount={2} colSpan={1}>
          <Item
            dataField="IdCampamento"
            label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.CAMPAMENT" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: campamentos,
              valueExpr: "IdCampamento",
              displayExpr: "Campamento",
              showClearButton: true,
            }}
          />
          <Item
            dataField="Compania"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" }) }}
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
            dataField="FechaInicio"
            label={{
              text: intl.formatMessage({ id: "COMMON.STARTDATE" }),
            }}
            isRequired={true}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              max: new Date()
            }}
          />

          <Item
            dataField="FechaFin"
            label={{
              text: intl.formatMessage({ id: "COMMON.ENDDATE" }),
            }}
            isRequired={true}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              max: new Date()
            }}
          />
        </GroupItem>

      </Form>

    )
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>
    <CustomBreadcrumbs
      Title={intl.formatMessage({ id: "CONFIG.MODULE.CAMPAMENTOS" })}
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
                buscaOcupabilidad(0, PaginationSetting.TOTAL_RECORDS);
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
            <GroupItem itemType="group" colCount={3} colSpan={3}>
              <fieldset className="scheduler-border"  >
                <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ACTION.SEARCH" })} </h5></legend>
                {formularioFiltros()}
              </fieldset>

            </GroupItem>

          </Form>
          <br />

          <DataGridDynamic
            id='dg_ReporteOcupabilidadCompania'
            intl={intl}
            dataSource={listaOcupabilidad}
            staticColumns={columnasEstaticas}
            dynamicColumns={columnasDinamicas}
            isLoadedResults={viewPagination}
            setIsLoadedResults={setViewPagination}
            refreshDataSource={buscaOcupabilidad}
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
          uniqueId={"administracionCompaniaBuscarR005"}
        />
      )}


    </Portlet>


  </>
};

export default injectIntl(WithLoandingPanel(ReporteOcupabilidadCompaniaIndex));
