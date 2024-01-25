import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { useStylesTab } from "../../../../store/config/Styles";

import {
  obtener as obtenerConfigM, listar as listarConfigM, actualizar as actualizarConfigM, crear as crearConfigM
} from "../../../../api/sistema/configuracionModulo.api";
import ConfiguracionModuloEditPage from "./ConfiguracionModuloEditPage";
import ConfiguracionModuloListPage from "./ConfiguracionModuloListPage";

import { isNotEmpty } from "../../../../../_metronic";


const ConfiguracionModuloIndexPage = (props) => {

  const usuario = useSelector(state => state.auth.user);
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);

  const { intl, setLoading, getInfo, accessButton, varIdModulo, varIdAplicacion, settingDataField, selected, varIdCliente, cancelarEdicion } = props;
  const [focusedRowKeyConfiguracionModulo, setFocusedRowKeyConfiguracionModulo] = useState();

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  const classes = useStylesTab();
  const [listarTabs, setListarTabs] = useState([]);

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Persona-:::::::::::::::::::::::::::::::::

 /*  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  }; */


  useEffect(() => {
    listarConfiguracionModulo();
  }, []);




  //CONFIGURACIÓN MÓDULO:::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function actualizarConfiguracionModulo(datarow) {
    setLoading(true);
    const { IdConfiguracion, Configuracion, Valor1, Valor2, Valor3, Valor4, Valor5 } = datarow;
    let params = {
      IdCliente
      , IdModulo: varIdModulo
      , IdAplicacion: varIdAplicacion
      , IdConfiguracion: isNotEmpty(IdConfiguracion) ? IdConfiguracion.toUpperCase() : ""
      , Configuracion: isNotEmpty(Configuracion) ? Configuracion.toUpperCase() : ""
      , Valor1: isNotEmpty(Valor1) ? Valor1.toUpperCase() : ""
      , Valor2: isNotEmpty(Valor2) ? Valor2.toUpperCase() : ""
      , Valor3: isNotEmpty(Valor3) ? Valor3.toUpperCase() : ""
      , Valor4: isNotEmpty(Valor4) ? Valor4.toUpperCase() : ""
      , Valor5: isNotEmpty(Valor5) ? Valor5.toUpperCase() : ""
      , IdUsuario: usuario.username
    };
    await actualizarConfigM(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarConfiguracionModulo();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function listarConfiguracionModulo() {
    setLoading(true);
    setModoEdicion(false);
    await listarConfigM(
      {
        IdCliente
        , IdModulo: varIdModulo
        , IdAplicacion: varIdAplicacion
        , IdConfiguracion: "%"
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data)
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerConfiguracionModulo(dataRow) {
    setLoading(true);
    const { IdCliente, IdConfiguracion } = dataRow;
    await obtenerConfigM({
      IdCliente,
      IdModulo: varIdModulo,
      IdAplicacion: varIdAplicacion,
      IdConfiguracion
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarConfiguracionModulo = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyConfiguracionModulo(RowIndex);
  };


  const editarRegistroConfiguracionModulo = async (dataRow) => {
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerConfiguracionModulo(dataRow);

  };

  const cancelarEdicionTabsConfiguracionModulo = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  async function importarConfiguracionModulo(listarConfiguracionImpor) {
    //console.log("importarConfiguracionModulo",listarConfiguracionImpor);
   try {
     //debugger;
     setTimeout(function () {
      if (listarConfiguracionImpor.length > 0)
      {
        listarConfiguracionImpor.map(async (data) => {
         const {IdModulo, IdAplicacion, IdConfiguracion, Configuracion, Valor1, Valor2, Valor3, Valor4, Valor5 } = data;
 
           let params = {
               IdCliente : varIdCliente
             , IdModulo : isNotEmpty(IdModulo) ? IdModulo.toUpperCase() : ""
             , IdAplicacion : isNotEmpty(IdAplicacion) ? IdAplicacion.toUpperCase() : ""
             , IdConfiguracion: isNotEmpty(IdConfiguracion) ? IdConfiguracion.toUpperCase() : ""
             , Configuracion: isNotEmpty(Configuracion) ? Configuracion.toUpperCase() : ""
             , Valor1: isNotEmpty(Valor1) ? Valor1.toUpperCase() : ""
             , Valor2: isNotEmpty(Valor2) ? Valor2.toUpperCase() : ""
             , Valor3: isNotEmpty(Valor3) ? Valor3.toUpperCase() : ""
             , Valor4: isNotEmpty(Valor3) ? Valor4.toUpperCase() : ""
             , Valor5: isNotEmpty(Valor3) ? Valor5.toUpperCase() : ""
             , IdUsuario: usuario.username
           };
           await crearConfigM(params)
               .then((response) => { 
                listarConfiguracionModulo();
                })
               .catch((err) => {
                   handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
               });
       });
      }
 
    }, 500);
  
      } catch (err) {
        setLoading(false);
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }
   }



  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  return <>

    {modoEdicion && (
      <>
        <ConfiguracionModuloEditPage
          dataRowEditNew={dataRowEditNew}
          actualizarConfiguracionModulo={actualizarConfiguracionModulo}
          cancelarEdicion={cancelarEdicionTabsConfiguracionModulo}
          titulo={titulo}
          modoEdicion={modoEdicion}
          accessButton={accessButton}
          getInfo={getInfo}
          varIdModulo={varIdModulo}
          varIdAplicacion={varIdAplicacion}
          settingDataField={settingDataField}
        />
        <div className="container_only">
           <div className="float-right">
            <ControlSwitch checked={auditoriaSwitch}
              onChange={e => { setAuditoriaSwitch(e.target.checked) }}
            /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
          </div>
        </div>
        {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
      </>
    )}

    {!modoEdicion && (
      <>
        <ConfiguracionModuloListPage
          configuracionesModulo={listarTabs}
          seleccionarRegistro={seleccionarConfiguracionModulo}
          editarRegistro={editarRegistroConfiguracionModulo}
          cancelarEdicion={cancelarEdicion}
          getInfo={getInfo}
          accessButton={accessButton}
          focusedRowKey={focusedRowKeyConfiguracionModulo}
          varIdModulo={varIdModulo}
          varIdAplicacion={varIdAplicacion}

          dataRowEditNew={dataRowEditNew}
          selected = {selected}
          importarConfiguracionModulo = {importarConfiguracionModulo}
          varIdCliente = {varIdCliente}
        />
      </>
    )}


  </>
};

export default injectIntl(WithLoandingPanel(ConfiguracionModuloIndexPage));
