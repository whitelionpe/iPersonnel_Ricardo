import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages,handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import { devolucionFotocheckMasiva } from "../../../../api/identificacion/personaCredencial.api";
import DevolucionMasivaListPage from "./DevolucionMasivaListPage";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import AssignmentReturn from '@material-ui/icons/AssignmentReturn';

const DevolucionMasivaIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [focusedRowKey, setFocusedRowKey] = useState(0);
  const [selected, setSelected] = useState({});
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const [dataFotocheksTemportal, setDataFotocheksTemportal] = useState([]);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  //::::::::::::::::::::::::::::FUNCIONES DEVOLUCION-:::::::::::::::::::::::::::::::::::
  async function devolverFotocheck(Credencial) {
    setLoading(true);
    await devolucionFotocheckMasiva({
      Credencial: Credencial,
      IdUsuarioModificacion: usuario.username
    }).then(data => {

      if (data.length > 0) { 
        for (let i = 0; i < data.length; i++) {
          if (!dataFotocheksTemportal.find(x => x.Credencial === data[i].Credencial))
          dataFotocheksTemportal.push(data[i]);
        }
        setDataFotocheksTemportal([]);
        setDataFotocheksTemportal(dataFotocheksTemportal);

      }
      else{
        handleInfoMessages(intl.formatMessage({ id: "IDENTIFICATION.PHOTOCHECK.NOEXISTS" }));
      }
   
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }

  const seleccionarRegistro = dataRow => {
    const { RowIndex } = dataRow;
      setFocusedRowKey(RowIndex);
  }


  //Conf Botones
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 5;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  useEffect(() => {

  }, []);


  //Datos Principales
  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  const getInfo = () => {

    const { IdLicencia, Licencia } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdLicencia, colSpan: 2 },
      { text: [intl.formatMessage({ id: "IDENTIFICATION.LICENSE.LICENSE" })], value: Licencia, colSpan: 4 }
    ];
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabContent_DevolucionMasivaListPage = () => {
    return <DevolucionMasivaListPage
      dataFotocheksTemportal = {dataFotocheksTemportal}
      titulo={titulo}
      dataRowEditNew ={dataRowEditNew}
      devolverFotocheck={devolverFotocheck}
      seleccionarRegistro={seleccionarRegistro}
      focusedRowKey={focusedRowKey}
      accessButton={accessButton}
    />
  }


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "CONFIG.MENU.IDENTIFICACION.OPERACIONES" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.IDENTIFICACION.DEVOLUCIÓN_MASIVA_DE_FO" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "IDENTIFICATION.CREDENTIAL.TAB" }),
            icon: <AssignmentReturn fontSize="large" />
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
             tabContent_DevolucionMasivaListPage(),
          ]
        }
      />

    </>
  );
};

export default injectIntl(WithLoandingPanel(DevolucionMasivaIndexPage));
