import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { useSelector } from "react-redux";
import { Button } from "devextreme-react";
import { isNotEmpty } from "../../../../../_metronic";

import PropTypes from 'prop-types';

import AvatarFoto from "../../../../partials/content/avatarFoto";
import BusinessCenterOutlinedIcon from '@material-ui/icons/BusinessCenterOutlined';
import TransferWithinAStationSharpIcon from '@material-ui/icons/TransferWithinAStationSharp';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import { useStylesTab } from "../../../../store/config/Styles";
import { Portlet } from "../../../../partials/content/Portlet";

import PersonaEditPage from "./PersonaEditPage";
import PersonaPosicionEditPage from "./posicion/PersonaPosicionEditPage";
import PersonaVisitaEditPage from "./visita/PersonaVisitaEditPage";

import { obtenerActual as obtenerVisita } from "../../../../api/administracion/personaVisita.api";
import { servicioPersonaPosicion } from "../../../../api/administracion/personaPosicion.api";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { handleErrorMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import HeaderInformation from "../../../../partials/components/HeaderInformation";


const PersonaEditTabPage = props => {

  const { intl, idPersona, modoEdicion, setLoading, settingDataField, accessButton } = props;
  //console.log("PersonaEditTabPage|accessButton:",accessButton);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);
  const [dataRowEditPosicion, setDataRowEditPosicion] = useState({});
  const [dataRowEditVisita, setDataRowEditVisita] = useState({});
  const [varIdMotivoCese, setVarIdMotivoCese] = useState("");
  const [registraVisita, setRegistraVisita] = useState(false);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  async function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      let ubigeo = { IdUbigeoNacimiento: props.idUbigeoNacimiento, IdUbigeoResidencia: props.idUbigeoResidencia };

      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarPersona(props.dataRowEditNew, ubigeo);
      } else {
        props.actualizarPersona(props.dataRowEditNew, ubigeo);
      }
    }
  }

  /********************************************************************* */
  //Persona datos: 
  const actualizarPersona = () => {
    props.actualizarPersona();
  }

  const cancelarEdicion = () => {
    props.cancelarEdicion();
  }



  async function obtenerPersonaPosicion() {
    setLoading(true);
    await servicioPersonaPosicion.obtenerActualxSede({ IdCliente, IdPersona: idPersona, IdDivision }).then(response => {
      const { IdMotivoCese } = response;
      setVarIdMotivoCese(IdMotivoCese);
      setDataRowEditPosicion({ ...response, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
  }

  async function obtenerPersonaVisita() {
    // console.log("obtenerPersonaVisita,", idPersona);
    setLoading(true);
    setRegistraVisita(false);
    await obtenerVisita({ IdCliente, IdPersona: idPersona }).then(response => {
      if (response) {
        setRegistraVisita(true);
        setDataRowEditVisita({ ...response, esNuevoRegistro: false });
      }
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
  }

  /********************************************************************* */
  //Persona posicion 
  const actualizarPersonaPosicion = () => { }
  const agregarPersonaPosicion = () => { }
  const cancelarEdicionTabs = () => { }

  /********************************************************************* */
  useEffect(() => {
    if (isNotEmpty(idPersona)) obtenerPersonaVisita();
  }, [idPersona]);

  const titlePersonActive = (dataRowEditNew) => {
    return <>
      {dataRowEditNew.Severidad === 3 ? (
        <b style={{ color: "red" }}>{dataRowEditNew.Activo === "N" ? intl.formatMessage({ id: "ADMINISTRATION.PERSON.INACTIVE" }) + "-[F3]" : ""}</b>
      ) : (
        <b style={{ color: "red" }}>{dataRowEditNew.Activo === "N" ? intl.formatMessage({ id: "ADMINISTRATION.PERSON.INACTIVE" }) : ""}</b>
      )
      }
    </>
  }

  return (
    <>
      <HeaderInformation
        data={props.getInfo()}
        visible={props.dataRowEditNew.esNuevoRegistro ? false : true}
        labelLocation={'left'}
        colCount={6}
        toolbar={
          <PortletHeader
            //title={(<><b style={{ color: "red" }}>{props.dataRowEditNew.Activo === "N" ? intl.formatMessage({ id: "ADMINISTRATION.PERSON.INACTIVE" }) : ""}</b> </>)}
            title={titlePersonActive(props.dataRowEditNew)}
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  icon="fa fa-save"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  onClick={grabar}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  visible={modoEdicion}
                  disabled={!accessButton.grabar}
                />
                &nbsp;
                <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={props.cancelarEdicion}
                />
              </PortletHeaderToolbar>
            }
          />
        }
      />

      <PortletBody>

        <AppBar position="static">
          <Tabs
            orientation="horizontal"
            value={tabIndex}
            onChange={handleChange}
            aria-label="Vertical tabs"
            className={classes.tabs}
            indicatorColor="primary"
            textColor="primary"

          >
            <Tab label={intl.formatMessage({ id: "ADMINISTRATION.PERSON" })}
              icon={<AvatarFoto fontSize="small" />}
              className={classes.tabContent}
              {...tabPropsIndex(0)}
            />
            <Tab label={intl.formatMessage({ id: "ADMINISTRATION.PERSON.WORK" })}
              icon={<BusinessCenterOutlinedIcon fontSize="large" />}
              className={classes.tabContent}
              onClick={obtenerPersonaPosicion}
              {...tabPropsIndex(1)}
              disabled={isNotEmpty(idPersona) ? false : true}
            />
            <Tab label={intl.formatMessage({ id: "ADMINISTRATION.PERSON.VISIT" })}
              icon={<TransferWithinAStationSharpIcon fontSize="large" />}
              className={classes.tabContent}
              onClick={obtenerPersonaVisita}
              {...tabPropsIndex(2)}
              disabled={isNotEmpty(idPersona) && registraVisita ? false : true}
            />
          </Tabs>
        </AppBar>

        <TabPanel value={tabIndex} className={classes.TabPanel} index={0} >
          <PersonaEditPage
            modoEdicion={modoEdicion}
            titulo={props.titulo}
            dataRowEditNew={props.dataRowEditNew}
            actualizarPersona={actualizarPersona}
            cancelarEdicion={cancelarEdicion}
            settingDataField={settingDataField}
            showButtons={false}
            dataCombos={props.dataCombos}
            accessButton={accessButton}
            activarTxtUbigeo={props.activarTxtUbigeo}
          />
        </TabPanel>

        <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
          <PersonaPosicionEditPage
            modoEdicion={modoEdicion && props.dataRowEditNew.IdPersona > 0 ? false : modoEdicion}
            dataRowEditNew={dataRowEditPosicion}
            actualizarPosicion={actualizarPersonaPosicion}
            agregarPosicion={agregarPersonaPosicion}
            cancelarEdicion={cancelarEdicionTabs}
            titulo={props.titulo}
            showButtons={false}
            idMotivoCese={varIdMotivoCese}
            accessButton={accessButton}
            settingDataField={settingDataField}
            disabledControlSwitch={!modoEdicion}
          />
        </TabPanel>

        <TabPanel value={tabIndex} className={classes.TabPanel} index={2}>

          <PersonaVisitaEditPage
            modoEdicion={modoEdicion && props.dataRowEditNew.IdPersona > 0 ? false : modoEdicion}
            dataRowEditNew={dataRowEditVisita}
            titulo={props.titulo}
            showButtons={false}
            accessButton={accessButton}
            settingDataField={settingDataField}
          />
        </TabPanel>

      </PortletBody>

    </>
  );

};
PersonaEditTabPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  proteccionDatos: PropTypes.array,
  modoDetalle: PropTypes.bool,

}
PersonaEditTabPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  proteccionDatos: [],
  modoDetalle: false
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Portlet
      component="div"
      role="tabpanel"
      hidden={value !== index} //view
      //id={`wrapped-tabpanel-${index}`}
      //aria-labelledby={`wrapped-tab-${index}`}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Portlet>
  );
}

TabPanel.propTypes =
{
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function tabPropsIndex(index) {
  return {
    id: `simple-tabpanel-${index}`,
    'aria-controls': `simple-tab-${index}`,
  };
}

export default injectIntl(WithLoandingPanel(PersonaEditTabPage));

