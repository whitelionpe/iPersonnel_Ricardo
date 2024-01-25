import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty, dateFormat } from "../../../../../_metronic";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'

import {
  obtener, listar, crear, actualizar, eliminar
} from "../../../../api/asistencia/cuponera.api";
import CuponeraListPage from "./CuponeraListPage";
import CuponeraEditPage from "./CuponeraEditPage";

import {
  obtener as obtenerConfigM
} from "../../../../api/sistema/configuracionModulo.api";

import { serviceCompania } from "../../../../api/administracion/compania.api";
import { Portlet, PortletBody, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import Form, { Item, GroupItem, EmptyItem } from "devextreme-react/form";

const CuponeraIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const [cuponera, setCuponera] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});
  const [selectedCompany, setSelectedCompany] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [maxHorasCupon, setMaxHorasCupon] = useState(0);

  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  const [companiaData, setCompaniaData] = useState([]);
  const [varIdCompania, setVarIdCompania] = useState("");
  const [varIdDivision, setVarIdDivision] = useState("");


  async function agregarCuponera(datarow) {
    setLoading(true);
    const { IdDivision, Periodo, MesesParaGanarCupon, Cupones, HorasCupon, MaximoCuponesDia, MaximoCuponesSemana, } = datarow;
    let data = {
      IdCliente: IdCliente
      , IdCompania: varIdCompania
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
      , Periodo: isNotEmpty(Periodo) ? Periodo : 0
      , MesesParaGanarCupon: isNotEmpty(MesesParaGanarCupon) ? MesesParaGanarCupon : 0
      , Cupones: isNotEmpty(Cupones) ? Cupones : 0
      , HorasCupon: isNotEmpty(HorasCupon) ? HorasCupon : (0, 0)
      , MaximoCuponesDia: isNotEmpty(MaximoCuponesDia) ? MaximoCuponesDia : 0
      , MaximoCuponesSemana: isNotEmpty(MaximoCuponesSemana) ? MaximoCuponesSemana : 0
      , IdUsuario: usuario.username
    };
    await crear(data).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarCuponera(varIdCompania);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function actualizarCuponera(datarow) {
    setLoading(true);
    const { IdCliente, IdCompania, IdDivision, Periodo, MesesParaGanarCupon, Cupones, HorasCupon, MaximoCuponesDia, MaximoCuponesSemana, } = datarow;
    let data = {
      IdCliente: IdCliente
      , IdCompania: IdCompania
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
      , Periodo: isNotEmpty(Periodo) ? Periodo : 0
      , MesesParaGanarCupon: isNotEmpty(MesesParaGanarCupon) ? MesesParaGanarCupon : 0
      , Cupones: isNotEmpty(Cupones) ? Cupones : 0
      , HorasCupon: isNotEmpty(HorasCupon) ? HorasCupon : (0, 0)
      , MaximoCuponesDia: isNotEmpty(MaximoCuponesDia) ? MaximoCuponesDia : 0
      , MaximoCuponesSemana: isNotEmpty(MaximoCuponesSemana) ? MaximoCuponesSemana : 0
      , IdUsuario: usuario.username
    };
    await actualizar(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarCuponera(varIdCompania);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistro(data, confirm) {
    setSelectedDelete(data);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdDivision } = selectedDelete;
      await eliminar({
        IdCliente: IdCliente,
        IdCompania: IdCompania,
        IdDivision: IdDivision,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        listarCuponera(varIdCompania);
        setFocusedRowKey();
        setVarIdDivision("");
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
  }

  async function listarCuponera(idCompania) {
    setLoading(true);
    await listar(
      {
        IdCliente
        , IdCompania: idCompania
        , IdDivision
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setCuponera(data);
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerCuponera() {
    const { IdCliente, IdCompania, IdDivision } = selected;
    setLoading(true);
    await obtener({
      IdCliente: IdCliente,
      IdCompania: IdCompania,
      IdDivision: IdDivision
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerConfiguracionParameters() {
    setLoading(true);
    await obtenerConfigM({
      IdCliente: IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "MAXIMOHORASCUPON"
    }).then(data => {
      const { Valor1 } = data;
      setMaxHorasCupon(parseInt(Valor1));
    }).catch(err => { }).finally(() => { setLoading(false); });
  }

  const nuevoRegistro = () => {
    changeTabIndex(1);
    let data = { Activo: "S", IdCompania: varIdCompania };
    setDataRowEditNew({ ...data, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistro = async () => {
    changeTabIndex(1);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerCuponera();

  };

  const cancelarEdicionCuponera = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarRegistro = dataRow => {
    const {RowIndex,IdDivision } = dataRow;
    setSelected(dataRow);
    setVarIdDivision(IdDivision);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setFocusedRowKey(RowIndex);
  }


  async function listarCompanias() {
    let data = await serviceCompania.obtenerTodosConfiguracion({
      IdCliente: IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "ID_COMPANIA"
    }
    ).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });
    setCompaniaData(data);
  }

  const getInfo = () => {
    const { IdCompania, Compania } = selectedCompany;
    return [

      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdCompania, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })], value: Compania, colSpan: 4 }

    ];
  }

  //Conf Botones
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    setAccessButton({ ...accessButton, ...buttonsPermissions });
  }

  const changeValueCompany = (company) => {
    if(isNotEmpty(company)){
      const { IdCompania } = company;
      setSelectedCompany(company);
      setVarIdCompania(IdCompania);
      listarCuponera(IdCompania);
      setVarIdDivision("");
    }else
    {
      setSelectedCompany("");
      setVarIdCompania("");
      setCuponera([]);
    }
  }

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  useEffect(() => {
    obtenerConfiguracionParameters();
    listarCompanias();
    loadControlsPermission();
  }, []);


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
 
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
    ];
    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabsDisabled = () => {
    return (isNotEmpty(varIdCompania)  && isNotEmpty(varIdDivision) )? true : false;
  }


  const tabContent_CuponeraListPage = () => {
    return <CuponeraListPage
      cuponeraData={cuponera}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      focusedRowKey={focusedRowKey}
      accessButton={accessButton}
      settingDataField={dataMenu.datos}
      companiaData={companiaData}
      changeValueCompany={changeValueCompany}
      varIdCompania={varIdCompania}
      setVarIdCompania={setVarIdCompania}
      setFocusedRowKey = {setFocusedRowKey}
    />
  }

  const tabContent_CuponeraEditTabPage = () => {
    return <>
      <CuponeraEditPage
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarCuponera={actualizarCuponera}
        agregarCuponera={agregarCuponera}
        cancelarEdicion={cancelarEdicionCuponera}
        titulo={titulo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        varIdCompania={varIdCompania}
        getInfo={getInfo}
        maxHorasCupon={maxHorasCupon}
      />
      <div className="container_only">
        <div className="float-right">
          <ControlSwitch
            checked={auditoriaSwitch}
            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
          /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
        </div>
      </div>
      {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
    </>
  }



  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.PARAMETRIZACION" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />
          },
          {
            label: intl.formatMessage({ id: "ASSISTANCE.COUPON.TAB" }),
            icon: <AspectRatioIcon fontSize="large" />,
            onClick: (e) => { obtenerCuponera() },
            disabled: !tabsDisabled()
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_CuponeraListPage(),
            tabContent_CuponeraEditTabPage()
          ]
        }
      />
      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarRegistro(selectedDelete, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );

};



export default injectIntl(WithLoandingPanel(CuponeraIndexPage));
