import React, { useEffect, useRef, useState } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
// import ArrayStore from 'devextreme/data/array_store';
// import DataSource from 'devextreme/data/data_source';
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { AppBar } from '@material-ui/core';
import { Typography } from "@material-ui/core";
import { Toolbar } from "@material-ui/core";
import { serviceReporte } from '../../../../../api/acceso/reporte.api';
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import DataGridDynamic from '../../../../../partials/components/DataGridDynamic/DataGridDynamic';
import { Portlet, PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { Button } from 'devextreme-react';
import { dateFormat, getStartAndEndOfMonthByDay, isNotEmpty, PaginationSetting } from '../../../../../../_metronic';
import Form, { Item, GroupItem } from "devextreme-react/form";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";

const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(new Date());

export const initialFilter = {
  IdCliente: '',
  Compania: '',
  NombresVisita: '',
  ApellidosVisita: '',
  FechaInicio,
  FechaFin
};

const ReporteVisitasIndex = (props) => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;
  const dataGridRef = useRef(null);
  const [listaVisitas, setListaVisitas] = useState([]);

  const [dataRowEditNew, setDataRowEditNew] = useState({ ...initialFilter });

  const [columnasDinamicas, setColumnasDinamicas] = useState([]);
  const [viewPagination, setViewPagination] = useState(true);
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
      dataField: "Perfil",
      caption: intl.formatMessage({ id: "ACCESS.PERSON.ACCESS_PROFILE" }),
      width: "150",
    },
    {
      dataField: "UnidadOrganizativa",
      caption: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA" }),
      width: "150",
    },
    {
      dataField: "Responsable",
      caption: intl.formatMessage({ id: "ADMINISTRATION.PERSON.RESPONSIBLE" }),
      width: "230",
    },
    {
      dataField: "FechaInicio",
      caption: intl.formatMessage({ id: "COMMON.STARTDATE" }),
      width: "100",
      alignment: "center"
    },
    {
      dataField: "FechaFin",
      caption: intl.formatMessage({ id: "COMMON.ENDDATE" }),
      width: "100",
      alignment: "center"
    },
    {
      dataField: "Motivo",
      caption: intl.formatMessage({ id: "ACCESS.PERSON.REASON" }),
      width: "250"
    },
    {
      dataField: "TipoDocumento",
      caption: intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT.TYPE" }),
      width: "120"
    },
    {
      dataField: "Documento",
      caption: intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" }),
      width: "90",
      alignment: "center"
    },
    {
      dataField: "NombreCompleto",
      caption: intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" }),
      width: "230"
    },
    {
      dataField: "Compania",
      caption: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }),
      width: "250",
    },
    {
      dataField: "FechaNacimiento",
      caption: intl.formatMessage({ id: "ADMINISTRATION.PERSON.BIRTHDAY" }),
      width: "120",
      alignment: "center"
    },
    {
      dataField: "Sexo",
      caption: intl.formatMessage({ id: "ADMINISTRATION.PERSON.GENDER" }),
      width: "100"
    },
    {
      dataField: "TelefonoMovil",
      caption: intl.formatMessage({ id: "ADMINISTRATION.PERSON.MOBILE.PHONE" }),
      width: "150"
    },
    {
      dataField: "Email",
      caption: intl.formatMessage({ id: "ADMINISTRATION.PERSON.MAIL" }),
      width: "200"
    },
    {
      dataField: "Direccion",
      caption: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.ADDRESS" }),
      width: "250"
    },
    {
      dataField: "Credencial",
      caption: intl.formatMessage({ id: "ADMINISTRATION.PERSON.CREDENTIALS" }),
      width: "100",
      alignment: "center"
    },
    {
      dataField: "Vencimiento",
      caption: intl.formatMessage({ id: "IDENTIFICATION.EXPIRATION" }),
      width: "100",
      alignment: "center"
    },
    {
      dataField: "Grupo",
      caption: intl.formatMessage({ id: "ACCESS.PERSON.GRUPO.TAB" }),
      width: "150"
    },
    {
      dataField: "Activo",
      caption: intl.formatMessage({ id: "COMMON.ACTIVE" }),
      width: "80",
      alignment: "center"
    }
  ];

  const buscaVisitas = async (skip, take) => {
    try {
      let datosVisitas = await consultarEstadoVisitas(skip, take);
      // console.log("buscaTrabajadores|datosTrabajadores:",datosTrabajadores);
      if (datosVisitas.IdError === 0) {
        setListaVisitas(datosVisitas[0]);
        if (datosVisitas.length > 1) {
          let columnas = datosVisitas[1]?.[0]?.Columnas.split(",");
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

  const consultarEstadoVisitas = async (skip, take) => {
    setLoading(true);
    let {
      FechaInicio,
      FechaFin,
      Compania,
      NombresVisita,
      ApellidosVisita
    } = dataRowEditNew;

    let params = {
      idDivision: perfil.IdDivision,
      fechaInicioRango: dateFormat(FechaInicio, 'yyyyMMdd'),
      fechaFinRango: dateFormat(FechaFin, 'yyyyMMdd'),
      compania: Compania ?? '',
      nombresVisita: NombresVisita ?? '',
      apellidosVisita: ApellidosVisita ?? '',
      skip,
      take,
      orderField: "FechaInicio",
      orderDesc: 0
    };

    let datosVisitas = await serviceReporte.consultaEstadoVisitas(params)
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        return { IdErro: 1, visitas: [] };
      })
      .finally(() => {
        setLoading(false);
      });

    //console.log("----------->", datosReserva);
    if (typeof datosVisitas === "object" && datosVisitas !== null) {
      datosVisitas.IdError = 0;
      return datosVisitas;
    } else return { IdErro: 1, visitas: [] };
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
        IdDivision: perfil.IdDivision,
        FechaInicioRango: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'),
        FechaFinRango: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd'),
        Compania: dataRowEditNew.Compania ?? '',
        NombresVisita: dataRowEditNew.NombresVisita ?? '',
        ApellidosVisita: dataRowEditNew.ApellidosVisita ?? '',
        OrderField: "FechaInicio",
        orderDesc: 0,
        skip: 0,
        take: 0,
        TituloHoja: intl.formatMessage({ id: "ACTION.EXPORT" }) + ' ' + intl.formatMessage({ id: "CONFIG.MENU.ACCESO.VISITAS_ESTADO_ACTUAL" }),
        NombreHoja: intl.formatMessage({ id: "CONFIG.MENU.ACCESO.VISITAS_ESTADO_ACTUAL" }),
        ArrayColumnId,
        ArrayColumnHeader
      };

      setLoading(true);
      serviceReporte.exportarExcelEstadoVisita(params).then(response => {
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
    const { Compania } = dataPopup[0];
    dataRowEditNew.Compania = Compania;
    setPopupVisibleCompania(false);
  };

  const limpiar = () => {
    setDataRowEditNew({
      Compania: '',
      NombresVisita: '',
      ApellidosVisita: '',
      FechaInicio,
      FechaFin
    });
    buscaVisitas(0, PaginationSetting.TOTAL_RECORDS)
  };

  useEffect(() => {

    limpiar();

  }, []);

  const formularioFiltros = (e) => {
    return (
      <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
        <GroupItem itemType="group" colCount={2} colSpan={1}>
          <Item
            dataField="FechaInicio"
            label={{ text: intl.formatMessage({ id: "ACCESS.VISIT.VISIT_STARTS_SINCE" }) }}
            editorType="dxDateBox"
            editorOptions={{
              displayFormat: "dd/MM/yyyy",
              onValueChanged: (e) => setDataRowEditNew({...dataRowEditNew, FechaInicio: e.value})
            }}
          />
          <Item
            dataField="FechaFin"
            label={{ text: intl.formatMessage({ id: "ACCESS.DATE.UNTIL" }) }}
            editorType="dxDateBox"
            editorOptions={{
              displayFormat: "dd/MM/yyyy",
              min: dataRowEditNew.FechaInicio
            }}
          />
        </GroupItem>

        <GroupItem itemType="group" colCount={3} colSpan={1}>

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
            dataField="NombresVisita"
            label={{ text: intl.formatMessage({ id: "ACCESS.VISIT.VISITOR_NAME" }) }}
            editorOptions={{
              inputAttr: { 'style': 'text-transform: uppercase' }
            }}
          />

          <Item
            dataField="ApellidosVisita"
            label={{ text: intl.formatMessage({ id: "ACCESS.VISIT.VISITOR_SURNAME" }) }}
            editorOptions={{
              inputAttr: { 'style': 'text-transform: uppercase' }
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
                buscaVisitas(0, PaginationSetting.TOTAL_RECORDS);
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
            id='dg_ReporteEstadoActualVisita'
            intl={intl}
            dataSource={listaVisitas}
            staticColumns={columnasEstaticas}
            dynamicColumns={columnasDinamicas}
            isLoadedResults={viewPagination}
            setIsLoadedResults={setViewPagination}
            refreshDataSource={buscaVisitas}
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
          uniqueId={"administracionCompaniaBuscarR004"}
        />
      )}

    </Portlet>


  </>
};

export default injectIntl(WithLoandingPanel(ReporteVisitasIndex));
