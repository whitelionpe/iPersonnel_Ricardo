import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
//import Confirm from "../../../../../partials/components/Confirm";

import {
  service as servicePerfilRequisito
} from "../../../../../api/acreditacion/perfilDivisionRequisito.api";
import {
  service as servicePerfilDatosEvaluar
} from "../../../../../api/acreditacion/perfilDivisionRequisitoDatoEvaluar.api";

import PerfilDivisionRequisitoEditPage from "./PerfilDivisionRequisitoEditPage";
import PerfilDivisionRequisitoDatoEvaluarEditPage from "./PerfilDivisionRequisitoDatoEvaluarEditPage"

import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import { PortletHeader, PortletHeaderToolbar, PortletBody } from "../../../../../partials/content/Portlet";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

import { Button } from "devextreme-react";
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import MenuTreeViewPage from "../../../../../partials/content/TreeView/MenuTreeViewPage";

import { isNotEmpty } from "../../../../../../_metronic";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";


const PerfilDivisionRequisitoIndexPage = (props) => {

  const { intl, setLoading, settingDataField, getInfo, selectedIndex, accessButton, varIdPerfil, varIdDivision } = props;

  const usuario = useSelector(state => state.auth.user);

  const classes = useStylesTab();
  const classesEncabezado = useStylesEncabezado();


  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  //Agregado...
  const [actionButton, setActionButton] = useState({ new: false, edit: false, save: false, delete: false, cancel: false });
  const [showForm, setShowForm] = useState("");
  const [selectedNode, setSelectedNode] = useState();

  const [varIdNodo, setVarIdNodo] = useState("");

  const [menus, setMenus] = useState([{
    Icon: "flaticon2-expand"
    , varIdMenu: null
    , varIdMenuPadre: null
    , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
    , MenuPadre: null
    , Nivel: 0
    , expanded: true
    , selected: false
  }]);

  //::FUNCIONES  DIVISION :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const seleccionarNodo = async (dataSelectedNode) => {
    //console.log("seleccionarNodo", dataRow);
    const { IdMenu, Nivel } = dataSelectedNode;
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));

    if (IdMenu != varIdNodo) {
      setDataRowEditNew({});
      setVarIdNodo(IdMenu)
      if (Nivel === 1) {
        setModoEdicion(false);
        setShowForm("");
        setActionButton({ new: false, delete: false, edit: false, cancel: false });
      } else if (Nivel === 2) {
        //setModoEdicion(true);
        setShowForm("REQUISITO");
        //>Obtener Requisito perfil.
        await obtenerPerfilRequisito(dataSelectedNode);
        setActionButton({ new: true, delete: true, edit: true, cancel: false });
      } else if (Nivel === 3) {
        //setModoEdicion(true);
        setShowForm("DATOSEVALUAR");
        //>obetener Requisito datos evaluar.
        await obtenerPerfilRequisitoDatosEvaluar(dataSelectedNode);
        setActionButton({ new: true, delete: true, edit: true, cancel: false });
      }
      setSelectedNode(dataSelectedNode);
    }
  }

  async function listarRequisitoTreeview() {
    setLoading(true);
    const { IdCliente, IdPerfil } = selectedIndex;
    let requisitos = await servicePerfilRequisito.listarTreeview({
      IdCliente,
      IdDivision: varIdDivision,
      IdPerfil
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
    if (!isNotEmpty(requisitos)) {
      setMenus([{
        Activo: "S"
        , icon: "flaticon2-expand"
        , IdMenu: null
        , IdMenuPadre: null
        , IdModulo: ""
        , Menu: "-SIN DATOS-"
        , MenuPadre: null
        , expanded: true
      }])
    } else {
      setMenus(requisitos);

    }
    setModoEdicion(false);
  }


  const editarNodoTreeView = () => {
    setModoEdicion(true);
    //Activar botones
    setActionButton({ new: false, edit: false, save: true, cancel: true });
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
  };


  const cancelarEdicionTreeView = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setActionButton({ new: true, edit: true, save: false, cancel: false });
  };


  //:::::::::::::::::::::::::::::::::::::::::::::-|funciones- perfil requisitos|-:::::::::::::::::::::::::::::::::

  async function agregarPerfilRequisito(dataRow) {
    const { IdCliente, IdPerfil } = selectedIndex;
    const { IdRequisito, Orden, Activo } = dataRow;
    let params = {
      IdCliente,
      IdPerfil,
      IdDivision: varIdDivision,
      IdRequisito,
      Orden: isNotEmpty(Orden) ? Orden : 0,
      Activo,
      IdUsuario: usuario.username,
    };
    setLoading(true);
    servicePerfilRequisito.crear(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      setDataRowEditNew({});
      //listarTreeview();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarPerfilRequisito(dataRow) {
    const { IdCliente, IdPerfil } = selectedIndex;
    const { IdRequisito, Orden, Activo } = dataRow;
    let params = {
      IdCliente,
      IdPerfil,
      IdDivision: varIdDivision,
      IdRequisito,
      Orden: isNotEmpty(Orden) ? Orden : 0,
      Activo: Activo,
      IdUsuario: usuario.username,
    };
    //console.log("actualizarPerfilRequisito",params);
    setLoading(true);
    servicePerfilRequisito.actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      //setDataRowEditNew({});
      setActionButton({ new: true, edit: true, save: false, cancel: false });
      listarRequisitoTreeview();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerPerfilRequisito(dataRow) {
    console.log("obtenerPerfilRequisito.param", dataRow);
    const { IdCliente, IdPerfil } = selectedIndex;
    const { IdRequisito } = dataRow;
    setLoading(true);
    await servicePerfilRequisito.obtener({
      IdCliente,
      IdPerfil,
      IdDivision: varIdDivision,
      IdRequisito
    }).then(data => {
      //console.log("obtenerPerfilRequisito.[]", data);
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-|end|-::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  //:::::::::::::::::::::::::::::::::::::::::::::-|funciones- perfil requisitos datos evaluar|-:::::::::::::::::::::::::::::::::::::
  async function obtenerPerfilRequisitoDatosEvaluar(dataRow) {
    const { IdCliente, IdPerfil } = selectedIndex;
    const { IdRequisito, IdDatoEvaluar } = dataRow;
    //console.log("obtenerPerfilRequisitoDatosEvaluar:.param:", dataRow);
    setLoading(true);
    await servicePerfilDatosEvaluar.obtener({
      IdCliente,
      IdPerfil,
      IdDivision: varIdDivision,
      IdRequisito,
      IdDatoEvaluar
    }).then(data => {
      //console.log("obtenerPerfilRequisitoDatosEvaluar.data", data);
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const agregarPerfilRequisitoDatoEvaluar = async (data) => {
    const { IdCliente, IdPerfil } = selectedIndex;
    const { IdRequisito, IdDatoEvaluar, AdjuntarArchivo, Activo } = data;
    let params = {
      IdCliente,
      IdPerfil,
      IdDivision: varIdDivision,
      IdRequisito,
      IdDatoEvaluar,
      Activo,
      AdjuntarArchivo,
      IdUsuario: usuario.username,
    };
    setLoading(true);
    servicePerfilDatosEvaluar.crear(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      setDataRowEditNew({});
      listarRequisitoTreeview();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const actualizarPerfilRequisitoDatoEvaluar = async (data) => {
    const { IdCliente, IdPerfil } = selectedIndex;
    const { IdRequisito, IdDatoEvaluar, AdjuntarArchivo, Activo } = data;
    let params = {
      IdCliente,
      IdPerfil,
      IdDivision: varIdDivision,
      IdRequisito,
      IdDatoEvaluar,
      Activo,
      AdjuntarArchivo,
      IdUsuario: usuario.username,
    };
    setLoading(true);
    servicePerfilDatosEvaluar.actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      //setDataRowEditNew({});
      setActionButton({ new: true, edit: true, save: false, cancel: false });
      listarRequisitoTreeview();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  //:::::::::::::::::::::::::::::::::::::::::::::-|end|-::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  useEffect(() => {
    //listarRequisito();
    listarRequisitoTreeview();
  }, []);


  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setShowForm("");
  };
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  return <>
    <div className={classes.gridRoot}>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
        toolbar={
          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>

                <Button
                  icon="fa fa-edit"
                  type="default"
                  hint="Editar"
                  disabled={!actionButton.edit}
                  onClick={editarNodoTreeView}
                />
                &nbsp;
                <Button
                  icon="fa fa-save"
                  type="default"
                  hint="Grabar"
                  onClick={() => { document.getElementById("idButtonGrabar").click() }}
                  disabled={!actionButton.save}
                />
                &nbsp;
                <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  // onClick={cancelarEdicion}
                  onClick={cancelarEdicionTreeView}
                  disabled={!actionButton.cancel}
                />
                &nbsp;
                &nbsp;
                <Button
                  icon="arrowleft"
                  type="normal"
                  hint={intl.formatMessage({ id: "AUTH.GENERAL.BACK_BUTTON" })}
                  onClick={props.cancelarEdicion}
                />
              </PortletHeaderToolbar>

            }
          />

        } />

      <PortletBody>
        <AppBar position="static" className={classesEncabezado.secundario}>
          <Toolbar variant="dense" className={classesEncabezado.toolbar}>
            <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
              {intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.CONFIG" })}
            </Typography>
          </Toolbar>
        </AppBar>
        <Paper className={classes.paper}>
          <Grid container spacing={1} direction="row" justify="flex-start" alignItems="stretch" >
            <Grid item xs={5} style={{ borderRight: "1px solid #ebedf2" }} >

              <MenuTreeViewPage
                menus={menus}
                modoEdicion={modoEdicion}
                seleccionarNodo={seleccionarNodo}
              />
            </Grid>
            <Grid item xs={7} >
              <Paper className={classes.paper}>
                <>
                  {(showForm === "REQUISITO") && (
                    <PerfilDivisionRequisitoEditPage
                      dataRowEditNew={dataRowEditNew}
                      actualizar={actualizarPerfilRequisito}
                      agregar={agregarPerfilRequisito}
                      cancelarEdicion={cancelarEdicion}
                      titulo={titulo}
                      modoEdicion={modoEdicion}
                      settingDataField={settingDataField}
                      accessButton={accessButton}
                      getInfo={getInfo}
                      varIdPerfil={varIdPerfil}
                      setModoEdicion={setModoEdicion}
                    //filtroLocal={filtroLocal}
                    />
                  )}

                  {(showForm === "DATOSEVALUAR") && (
                    <PerfilDivisionRequisitoDatoEvaluarEditPage
                      dataRowEditNew={dataRowEditNew}
                      actualizar={actualizarPerfilRequisitoDatoEvaluar}
                      agregar={agregarPerfilRequisitoDatoEvaluar}
                      cancelarEdicion={cancelarEdicion}
                      titulo={titulo}
                      modoEdicion={modoEdicion}
                      settingDataField={settingDataField}
                      accessButton={accessButton}
                      getInfo={getInfo}
                      varIdPerfil={varIdPerfil}
                      setModoEdicion={setModoEdicion}
                    //filtroLocal={filtroLocal}
                    />

                  )}
                  {(showForm === "REQUISITO" || showForm === "DATOSEVALUAR") && (<>
                    <div className="col-12 d-inline-block">
                      <div className="float-right">
                        <ControlSwitch checked={auditoriaSwitch}
                          onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                        /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                      </div>
                    </div>
                    {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
                  </>
                  )}

                </>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </PortletBody>
    </div>


    {/* <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarListRowTab(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    /> */}
  </>
};

export default injectIntl(WithLoandingPanel(PerfilDivisionRequisitoIndexPage));
