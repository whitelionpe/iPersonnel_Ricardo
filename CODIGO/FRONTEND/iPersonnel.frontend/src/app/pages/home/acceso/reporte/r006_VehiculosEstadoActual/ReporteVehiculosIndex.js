import React, { useEffect, useRef, useState } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";

import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { AppBar } from '@material-ui/core';
import { Typography } from "@material-ui/core";
import { Toolbar } from "@material-ui/core";
import { serviceReporte } from '../../../../../api/acceso/reporte.api';
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import DataGridDynamic from '../../../../../partials/components/DataGridDynamic/DataGridDynamic';
import { Portlet, PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { Button } from 'devextreme-react';
import { isNotEmpty, listarEstadoSimple, PaginationSetting } from '../../../../../../_metronic';
import Form, { Item, GroupItem, EmptyItem } from "devextreme-react/form";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";

export const initialFilter = {
  IdCompania: '',
  IdCliente: '',
  IdDivision: '',
  Activo: 'S',
};

const ReporteVehiculosIndex = (props) => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;
  const dataGridRef = useRef(null);
  const [listaTrabajadores, setListaTrabajadores] = useState([]);

  const [dataRowEditNew, setDataRowEditNew] = useState({ ...initialFilter });

  const [columnasDinamicas, setColumnasDinamicas] = useState([]);
  const [viewPagination, setViewPagination] = useState(false);
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  //const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);
  const classesEncabezado = useStylesEncabezado();

  const columnasEstaticas = [
    {
      dataField: "RowIndex",
      caption: "#",
      width: "30",
      alignment: "center"
    },
    {
      dataField: "TipoVehiculo",
      caption: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.VEHICLETYPE" }),
      width: "150"
    },
    {
      dataField: "Placa",
      caption: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.PLATE" }),
      width: "100",
      alignment: "center"
    },
    {
      dataField: "Modelo",
      caption: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.MODEL" }),
      width: "150",
    },
    {
      dataField: "Marca",
      caption: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.BRAND" }),
      width: "150",
    },
    {
      dataField: "UnidadOrganizativa",
      caption: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA" }),
      width: "150",
    },
    {
      dataField: "CompaniaContratista",
      caption: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }),
      width: "150",
    },
    {
      dataField: "CompaniaSubcontratista",
      caption: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBCONTRACTOR" }),
      width: "150",
    },
    {
      dataField: "IdContrato",
      caption: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }),
      width: "150",
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
      width: "150",
    },
    {
      dataField: "Perfil",
      caption: intl.formatMessage({ id: "ACCESS.PERSON.ACCESS_PROFILE" }),
      width: "150",
    },
    {
      dataField: "Activo",
      caption: intl.formatMessage({ id: "COMMON.ACTIVE" }),
      width: "80",
      alignment: "center"
    },
  ];

  const buscarVehiculos = async (skip, take) => {
    try {
      let datosTrabajadores = await consultarEstadoVehiculo(skip, take);
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

  const consultarEstadoVehiculo = async (skip, take) => {
    setLoading(true);
    let {
      IdCompania,
      Activo
    } = dataRowEditNew;

    let params = {
      idDivision: perfil.IdDivision,
      idCompania: IdCompania,
      Activo,
      skip,
      take,
      orderField: "Placa",
      orderDesc: 0
    };

    let datos = await serviceReporte.consultaEstadoVehiculo(params)
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        return { IdErro: 1, trabajadores: [] };
      })
      .finally(() => {
        setLoading(false);
      });

    //console.log("----------->", datosReserva);
    if (typeof datos === "object" && datos !== null) {
      datos.IdError = 0;
      return datos;
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
      let params = {
        IdDivision: perfil.IdDivision,
        IdCompania: dataRowEditNew.IdCompania ?? '',
        Activo: dataRowEditNew.Activo ?? '',
        OrderField: "Placa",
        orderDesc: 0,
        skip: 0,
        take: 0,
        TituloHoja: intl.formatMessage({ id: "ACTION.EXPORT" }) + ' ' + intl.formatMessage({ id: "CONFIG.MENU.ACCESO.VEHICULOS_ESTADO_ACTUAL" }),
        NombreHoja: intl.formatMessage({ id: "CONFIG.MENU.ACCESO.VEHICULOS_ESTADO_ACTUAL" }),
        ArrayColumnId,
        ArrayColumnHeader
      };

      setLoading(true);
      serviceReporte.exportarExcelEstadoVehiculo(params).then(response => {
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
    const { IdCompania, Compania } = dataPopup[0];
    // props.dataSource.loadDataWithFilter({ data: { IdCompania, Compania } })
    dataRowEditNew.IdCompania = IdCompania;
    dataRowEditNew.Compania = Compania;
    setPopupVisibleCompania(false);
  };


  const limpiar = () => {
    setDataRowEditNew({
      IdCompania: '',
      Activo: 'S'
    });
    buscarVehiculos(0, PaginationSetting.TOTAL_RECORDS)
  };

  useEffect(() => {

    limpiar();

  }, []);

  const formularioFiltros = (e) => {
    return (
      <Form formData={dataRowEditNew} validationGroup="FormEdicion" >

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
            dataField="Activo"
            isRequired={true}
            label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: listarEstadoSimple(),
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
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
                buscarVehiculos(0, PaginationSetting.TOTAL_RECORDS);
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
            id='dg_ReporteEstadoActual'
            intl={intl}
            dataSource={listaTrabajadores}
            staticColumns={columnasEstaticas}
            dynamicColumns={columnasDinamicas}
            isLoadedResults={viewPagination}
            setIsLoadedResults={setViewPagination}
            refreshDataSource={buscarVehiculos}
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

export default injectIntl(WithLoandingPanel(ReporteVehiculosIndex));
