import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty, dateFormat } from "../../../../../../_metronic";

import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";

import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";

import {
  handleErrorMessages,
  handleSuccessMessages,
  handleInfoMessages,
} from "../../../../../store/ducks/notify-messages";

import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";

import {
  listar ,
  obtener ,
  crear ,
  actualizar ,
  eliminar 
} from "../../../../../api/identificacion/personaRostro.api";

import PersonaRostroEditPage from "./PersonaRostroEditPage";

const PersonaRostroIndexPage = (props) => {

  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdPersona, cancelarEdicion } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const classes = useStylesTab();


  const [listarTabs, setListarTabs] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});

   //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Rostro-Persona-:::::::::::::::::::::::::::::::::

   async function listarRostro() {
    setModoEdicion(false);
    let data = await listar({
      IdCliente: IdCliente,
      IdPersona: varIdPersona
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));

    setListarTabs(data);
  }

  async function agregarRostro(dataRow) {
    setLoading(true);
    const {
      Rostro,
      FechaRegistro,
    } = dataRow;
    let params = {
      IdCliente: IdCliente,
      IdPersona: varIdPersona, 
      Rostro: isNotEmpty(Rostro) ? Rostro : "",
      FechaRegistro: isNotEmpty(FechaRegistro) ? dateFormat(FechaRegistro,'yyyyMMdd')  : "",
      IdUsuario: usuario.username,
    };
      await crear(params)
        .then((response) => {
          if (response){
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setDataRowEditNew({
              ...response,esNuevoRegistro: false 
            })
           listarRostro();
          }
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
  }

  async function actualizarRostro(dataRow) {
    setLoading(true);
    const {
      IdCliente,
      IdPersona,
      Rostro,
      FechaRegistro,
    } = dataRow;
    let params = {
      IdCliente: IdCliente,
      IdPersona: IdPersona,
      Rostro: isNotEmpty(Rostro) ? Rostro : "",
      FechaRegistro: isNotEmpty(FechaRegistro) ? dateFormat(FechaRegistro,'yyyyMMdd')  : "",
      IdUsuario: usuario.username,
    };  
      await actualizar(params)
        .then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
          listarRostro();
        }).catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    
  }

  async function eliminarRegistro(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const {IdCliente, IdPersona} = selectedDelete;
      await eliminar({
        IdCliente : IdCliente,
        IdPersona : IdPersona
      })
        .then(() => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarRostro();
    }
  }

  async function obtenerRostro(dataRow) {
    setLoading(true);
    const {IdCliente, IdPersona} = dataRow;
    await obtener({ IdPersona, IdCliente })
      .then(data => {
        if (isNotEmpty(data)) {
          setDataRowEditNew({ ...data, esNuevoRegistro: false });
        } else {
          setDataRowEditNew({ esNuevoRegistro: true });
        }
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });
  }

  const seleccionarRegistro = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  const editarRegistro = (dataRow) => {
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
  };

  const nuevoRegistro = () => {
    let nuevo = { Activo: "S" };
    setDataRowEditNew({
      ...nuevo,
      esNuevoRegistro: true,
    });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

 const cancelarEdicionRostro = () => {
   setModoEdicion(false);
   setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
   setDataRowEditNew({});
 };


  useEffect(() => {
      obtenerRostro(props.selected);
  }, []);

  return <>

        <PersonaRostroEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarRostro={actualizarRostro}
          agregarRostro={agregarRostro}
          // cancelarEdicion={cancelarEdicionRostro}
          cancelarEdicion={props.cancelarEdicion}
          titulo={titulo}
          size={classes.avatarLarge}
          uploadImagen={true}
          varIdPersona={varIdPersona}
          showHeaderInformation = {true}
          getInfo={getInfo}
          setDataRowEditNew = { setDataRowEditNew }
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

};

export default injectIntl(WithLoandingPanel(PersonaRostroIndexPage));

