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
} from "../../../../../api/identificacion/personaHuella.api";

import PersonaHuellaEditPage from "./PersonaHuellaEditPage";
import {serviceLocal} from "../../../../../api/serviceLocal.api";

const PersonaHuellaIndexPage = (props) => {

  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdPersona, cancelarEdicion, selected } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const classes = useStylesTab();


  const [listarTabs, setListarTabs] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  //const [selected, setSelected] = useState({});



  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Huella-Persona-:::::::::::::::::::::::::::::::::

  async function listarHuella() {
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

  async function agregarHuella(dataRow) {
    setLoading(true);
    const {
      Huella1,
      Huella2,
      Huella3,
      FechaRegistro,
    } = dataRow;
    let params = {
      IdCliente: IdCliente,
      IdPersona: varIdPersona, 
      Huella1: isNotEmpty(Huella1) ? Huella1 : "",
      Huella2: isNotEmpty(Huella2) ? Huella2 : "",
      Huella3: isNotEmpty(Huella3) ? Huella3 : "",
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
           listarHuella();
          }
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
  }

  async function actualizarHuella(dataRow) {
    setLoading(true);
    const {
      IdCliente,
      IdPersona,
      Huella1,
      Huella2,
      Huella3,
      FechaRegistro,
    } = dataRow;
    let params = {
      IdCliente: IdCliente,
      IdPersona: IdPersona,
      Huella1: isNotEmpty(Huella1) ? Huella1 : "",
      Huella2: isNotEmpty(Huella2) ? Huella2 : "",
      Huella3: isNotEmpty(Huella3) ? Huella3 : "",
      FechaRegistro: isNotEmpty(FechaRegistro) ? dateFormat(FechaRegistro,'yyyyMMdd')  : "",
      IdUsuario: usuario.username,
    };  
      await actualizar(params)
        .then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
          listarHuella();
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
      listarHuella();
    }
  }

  // async function obtenerHuella(dataRow) {
  //   const {IdCliente, IdPersona} = dataRow;
  //   setLoading(true);

  //   if (IdPersona) {
  //     let data = await obtener({
  //       IdCliente : IdCliente,
  //       IdPersona : IdPersona
  //     }).catch((err) => {
  //       handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //     });
  //     setDataRowEditNew({ ...data, esNuevoRegistro: false });
  //   }
  //   setLoading(false);
  // }

  async function obtenerHuella(dataRow) {
    setLoading(true);
    const {IdCliente, IdPersona} = dataRow;
    await obtener({ IdPersona, IdCliente })
      .then(data => {
        if (isNotEmpty(data)) {
          setDataRowEditNew({ ...data, esNuevoRegistro: false });
        } else {
          setDataRowEditNew({ ...selected, esNuevoRegistro: true });
        }
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });
  }

    /*Se conecta a la Api de LocalHost, para ejecutar un programa .exe */
    function ejecutarEnrolador(){
        //console.log(selected);
        serviceLocal.EnroladorSigma({ idCliente: selected.IdCliente, idPersona : selected.IdPersona,
            persona: selected.NombreCompleto, idUsuarioWeb: usuario.username, compania:  selected.Compania,
            unidadOrganizativa: selected.UnidadOrganizativa, documentoIdentidad:  selected.Documento})
            .then(response => {
            })
            .catch(err => {
                console.log(err);
            });
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

 const cancelarEdicionHuella = () => {
   setModoEdicion(false);
   setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
   setDataRowEditNew({});
 };


  useEffect(() => {
      obtenerHuella(props.selected);
  }, []);

  return <>

        <PersonaHuellaEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarHuella={actualizarHuella}
          agregarHuella={agregarHuella}
          cancelarEdicion={props.cancelarEdicion}
          titulo={titulo}
          size={classes.avatarLarge}
          uploadImagen={true}
          varIdPersona={varIdPersona}
          showHeaderInformation = {true}
          getInfo={getInfo}
          setDataRowEditNew = { setDataRowEditNew }
          ejecutarEnrolador = {ejecutarEnrolador}
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



export default injectIntl(WithLoandingPanel(PersonaHuellaIndexPage));

