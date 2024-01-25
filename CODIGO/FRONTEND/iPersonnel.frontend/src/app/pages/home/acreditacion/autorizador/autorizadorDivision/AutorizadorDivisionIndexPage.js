import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import {
  listarTreeView,
  eliminar as eliminarADivision,
  crear as crearADivision
} from "../../../../api/acreditacion/autorizadorDivision.api";
import AutorizadorDivisionEditPage from "../autorizadorDivision/AutorizadorDivisionEditPage";

import {
  listarTreeView as listarTreeViewUOrg, eliminar as eliminarUOrg, crear as crearUOrg
} from "../../../../api/acreditacion/autorizadorRequisitoUnidadOrg.api";


const AutorizadorDivisionIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdAutorizador, varIdRequisito, selected, cancelarEdicion } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const classesEncabezado = useStylesEncabezado();
  const [focusedRowKey, setFocusedRowKey] = useState(0);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  //const [selected, setSelected] = useState({});

  const [menus, setMenus] = useState([{
    Icon: "flaticon2-expand"
    , IdMenu: null
    //, IdModulo: null //ff
    , IdMenuPadre: null
    , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
    , MenuPadre: null
    , Nivel: 0
    //, Orden: 0 //ff
    , expanded: true
    , selected: false
  }]);


  const [menusUnidadOrg, setMenusUnidadOrg] = useState([{
    Icon: "flaticon2-expand"
    , IdMenu: null
    //, IdModulo: null //ff
    , IdMenuPadre: null
    , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
    , MenuPadre: null
    , Nivel: 0
    //, Orden: 0 //ff
    , expanded: true
    , selected: false
  }]);


  //:::::::::::::::::::::::::::TREE VIEW :::::::::::::::::::::::::::::::::::::

  async function listarTreeViewDivision() {
    setLoading(true);
    const { IdCliente } = selected;
    //let divisiones = 
    await listarTreeView({
      IdCliente
      , IdDivision: perfil.IdDivision
      , IdAutorizador: varIdAutorizador
      , IdRequisito: varIdRequisito
    }).then(divisiones => {
      setMenus(divisiones);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }


  async function agregarAutorizadorDivision(detalleDivision) {
    //Eliminar 
    setLoading(true);
    await eliminarAutorizadorDivision(detalleDivision[0]).then(() => {
      let promesas = [];
      setLoading(true);
      for (let i = 0; i < detalleDivision.length; i++) {
        let node = detalleDivision[i];

        const { IdCliente, IdDivision } = node;
        let params = {
          IdCliente
          , IdDivision
          , IdAutorizador: varIdAutorizador
          , IdRequisito: varIdRequisito
          , IdUsuario: usuario.username
        };
        // Insertar 
        promesas.push(crearADivision(params));
      }

      Promise.all(promesas)
        .then(res => {
          let tot_recibidos = res.length;

          if (tot_recibidos >= 1) {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            cancelarEdicion();
            //setModoEdicion(false);
            //listarTreeViewDivision();
          }

          setLoading(false);
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          setLoading(false);
        }).finally(() => { setLoading(false); });

    });
  }


  async function eliminarAutorizadorDivision(detalleDivision) {
    setLoading(true);
    const { IdCliente, IdDivision } = detalleDivision;
    await eliminarADivision({
      IdCliente
      , IdDivision
      , IdAutorizador: varIdAutorizador
      , IdRequisito: varIdRequisito
      , IdUsuario: usuario.username
    }).then(() => {
      // handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }



  //*********TREE VIEW UNIDAD ORG********************************************/

  async function listarTreeViewUnidadOrg() {
    setLoading(true);
    const { IdCliente } = selected;
    await listarTreeViewUOrg({
      IdCliente
      , IdAutorizador: varIdAutorizador
      , IdRequisito: varIdRequisito
    }).then(unidadesOrg => {
      setMenusUnidadOrg(unidadesOrg);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }


  async function agregarAutorizadorRequisitoUnidadOrg(unidadOrg) {
    //Eliminar 
    setLoading(true);
    await eliminarAutorizadorRequisitoUnidadOrg(unidadOrg[0]).then(() => {
      let promesas = [];
      setLoading(true);
      for (let i = 0; i < unidadOrg.length; i++) {
        let node = unidadOrg[i];

        const { IdCliente, IdUnidadOrganizativa } = node;
        let params = {
          IdCliente
          , IdUnidadOrganizativa
          , IdAutorizador: varIdAutorizador
          , IdRequisito: varIdRequisito
          , IdUsuario: usuario.username
        };
        // Insertar 
        promesas.push(crearUOrg(params));
      }


      Promise.all(promesas)
        .then(res => {
          let tot_recibidosUorg = res.length;

          if (tot_recibidosUorg >= 1) {
            //handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            //setModoEdicion(false);
            //listarTreeViewUnidadOrg();
            cancelarEdicion();
          }

          setLoading(false);
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          setLoading(false);
        }).finally(() => { setLoading(false); });

    });
  }


  async function eliminarAutorizadorRequisitoUnidadOrg(unidadOrg) {
    setLoading(true);
    const { IdCliente } = unidadOrg;
    await eliminarUOrg({
      IdCliente
      , IdAutorizador: varIdAutorizador
      , IdRequisito: varIdRequisito
      , IdUsuario: usuario.username
    }).then(() => {
      // handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  useEffect(() => {
    listarTreeViewDivision();
    listarTreeViewUnidadOrg();
  }, []);


  return <>

    {/* {modoEdicion && ( */}
    <>
      <AutorizadorDivisionEditPage
        dataRowEditNew={dataRowEditNew}
        agregarAutorizadorDivision={agregarAutorizadorDivision}
        cancelarEdicion={cancelarEdicion}
        menus={menus}
        getInfo={getInfo}
        accessButton={accessButton}
        menusUnidadOrg={menusUnidadOrg}

        agregarAutorizadorRequisitoUnidadOrg={agregarAutorizadorRequisitoUnidadOrg}
        listarTreeViewDivision={listarTreeViewDivision}
        listarTreeViewUnidadOrg={listarTreeViewUnidadOrg}
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
    {/* )} */}


  </>

};



export default injectIntl(WithLoandingPanel(AutorizadorDivisionIndexPage));
