import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { dateFormat, isNotEmpty } from "../../../../../_metronic";
import Confirm from "../../../../partials/components/Confirm";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import PersonaPerfilEditPage from "../persona/perfil/PersonaPerfilEditPage";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import PersonaPerfilListPage from "../persona/perfil/PersonaPerfilListPage";
import PerfilPersonaListPage from "./PerfilPersonaListPage";
import { servicePersona } from "../../../../api/administracion/persona.api";
import { servicePersonaPerfil } from "../../../../api/campamento/personaPerfil.api";

import {
  handleErrorMessages,
  handleInfoMessages,
  handleSuccessMessages
} from "../../../../store/ducks/notify-messages";
import { isAsyncMode } from "react-is";
import PerfilPersonaMasivoPage from "./PerfilPersonaMasivoPage";
import PerfilPersonaMasivoMessage from "./PerfilPersonaMasivoMessage";

const PerfilPersonaIndexPage = ({
  intl,
  setLoading,
  getInfo,
  accessButton,
  varIdPerfil,
  cancelarEdicion,
  dataSource,
  settingDataField,
  refrescarGrilla
}) => {
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(
    state => state.perfil.perfilActual
  );

  const [listarTabs, setListarTabs] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);
  const [registroMasivo, setRegistroMasvio] = useState(false);
  const [fechasContrato, setFechasContrato] = useState({
    FechaInicioContrato: null,
    FechaFinContrato: null
  });

  const [titulo, setTitulo] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({ NombresCompletos: "" });
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);
  const [isVisibleMessage, setIsVisibleMessage] = useState(false);
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [instance, setInstance] = useState({});
  const [varIdPersona, setvarIdPersona] = useState(0);
  const [dataSourceProcesados, setDataSourceProcesados] = useState([]);
  //:::::::::::::::::::::::::::::::::::::::::::::-FUNCIONES GRUPO COMPAÑIA:::::::::::::::::::::::::::::::::

  const getInfoPersona = () => {
    const { NombreCompleto } = selected;
    return [
      {
        text: [intl.formatMessage({ id: "COMMON.CODE" })],
        value: varIdPersona,
        colSpan: 2
      },
      {
        text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.NAME" })],
        value: NombreCompleto,
        colSpan: 4
      }
    ];
  };

  async function listarGrupo() {
    // setLoading(true);
    // await listar({
    //   IdCliente: IdCliente,
    //   IdGrupo: varIdGrupo,
    //   IdDivision: IdDivision,
    //   IdCompania: "%",
    //   NumPagina: 0,
    //   TamPagina: 0
    // })
    //   .then(grupoCompania => {
    //     setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    //     setListarTabs(grupoCompania);
    //     setModoEdicion(false);
    //   })
    //   .catch(err => {
    //     handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
  }

  async function obtenerCompaniaGrupo(dataRow) {
    setLoading(true);
    const { IdCliente, IdCompania, IdDivision, IdGrupo } = dataRow;
    // await obtener({
    //   IdCliente,
    //   IdCompania,
    //   IdDivision,
    //   IdGrupo
    // })
    //   .then(data => {
    //     setDataRowEditNew({ ...data, esNuevoRegistro: false });
    //   })
    //   .catch(err => {
    //     handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
  }

  const cancelarGrupo = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  useEffect(() => {
    listarGrupo();
  }, []);

  const editarRegistroPersonaPerfil = async data => {
    console.log("editarRegistroPersonaPerfil", { data });
    let { IdPersona, IdSecuencial } = data;
    setvarIdPersona(IdPersona);
    setSelected({ ...data });
    setLoading(true);
    setRegistroMasvio(false);
    await servicePersona
      .obtenerPeriodo({
        IdCliente: IdCliente,
        IdPersona: IdPersona,
        FechaInicio: dateFormat(new Date(), "yyyyMMdd"),
        FechaFin: dateFormat(new Date(), "yyyyMMdd")
      })
      .then(response => {
        if (response) {
          if (!isNotEmpty(response.MensajeValidacion)) {
            setFechasContrato({
              FechaInicioContrato: response.FechaInicio,
              FechaFinContrato: response.FechaFin
            });
          } else {
            setFechasContrato({
              FechaInicioContrato: null,
              FechaFinContrato: null
            });
            handleInfoMessages(
              intl.formatMessage({ id: "MESSAGES.INFO" }),
              response.MensajeValidacion
            );
          }
        }
      })
      .finally(x => {
        setLoading(false);
      });

    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerPerfil({ IdPersona, IdSecuencial });
  };

  async function obtenerPerfil(dataRow) {
    const { IdCliente, IdPersona, IdSecuencial } = dataRow;
    if (IdPersona) {
      let perfiles = await servicePersonaPerfil
        .obtener({
          IdCliente: IdCliente,
          IdPersona: IdPersona,
          IdSecuencial: IdSecuencial
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        });
      setDataRowEditNew({ ...perfiles, esNuevoRegistro: false });
      setModoEdicion(true);
    }
  }

  async function agregarPerfil(dataRow) {
    setLoading(true);
    const {
      IdSecuencial,
      IdPerfil,
      FechaInicio,
      FechaFin,
      CheckInSinReserva,
      DiasPermanencia,
      Activo
    } = dataRow;
    let params = {
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
      IdDivision: IdDivision,
      IdPerfil: IdPerfil,
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      IdCompania: "",
      FechaInicio: isNotEmpty(FechaInicio)
        ? dateFormat(FechaInicio, "yyyyMMdd")
        : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, "yyyyMMdd") : "",
      CheckInSinReserva: isNotEmpty(CheckInSinReserva) ? CheckInSinReserva : "",
      DiasPermanencia: isNotEmpty(DiasPermanencia) ? DiasPermanencia : 0,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await servicePersonaPerfil
      .crear(params)
      .then(response => {
        if (response)
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
        //listarPerfil();
        //EGSC
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function actualizarPerfil(dataRow) {
    setLoading(true);
    const {
      IdCliente,
      IdDivision,
      IdPersona,
      IdPerfil,
      IdSecuencial,
      FechaInicio,
      FechaFin,
      CheckInSinReserva,
      DiasPermanencia,
      Activo
    } = dataRow;
    let params = {
      IdCliente: IdCliente,
      IdPersona: IdPersona,
      IdDivision: IdDivision,
      IdPerfil: IdPerfil,
      IdSecuencial: IdSecuencial,
      IdCompania: "",
      FechaInicio: isNotEmpty(FechaInicio)
        ? dateFormat(FechaInicio, "yyyyMMdd")
        : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, "yyyyMMdd") : "",
      CheckInSinReserva: isNotEmpty(CheckInSinReserva) ? CheckInSinReserva : "",
      DiasPermanencia: isNotEmpty(DiasPermanencia) ? DiasPermanencia : 0,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await servicePersonaPerfil
      .actualizar(params)
      .then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        refrescarGrilla();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const eliminarRegistro = async (dataRow, confirm) => {
    setSelected({ ...dataRow });

    if (confirm) {
      setLoading(true);
      console.log("=>", { selected });
      const { IdPersona, IdSecuencial } = selected;
      await servicePersonaPerfil
        .eliminar({
          IdCliente,
          IdPersona,
          IdSecuencial
        })
        .then(() => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.SUCESS" }),
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
          refrescarGrilla();
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        })
        .finally(() => {
          setLoading(false);
        });
      //listarPerfil();
    } else {
      setIsVisibleConfirm(true);
    }
  };

  const nuevoRegistroMasivoPerfil = () => {
    setModoEdicion(true);
    setRegistroMasvio(true);
  };

  const grabarMasivo = async parametros => {
    console.log("grabarMasivo", { parametros });
    setLoading(true);
    let data = await servicePersonaPerfil
      .crearmasivobyperfil(parametros)
      .then(resp => {
        console.log(resp);
        return resp;
      })
      .catch(err => []);

    setIsVisibleMessage(true);
    console.log(data);
    setDataSourceProcesados(data);
    setModoEdicion(false);
    setRegistroMasvio(false);
    setDataRowEditNew({});
    refrescarGrilla();
    setLoading(false);
    //crearmasivobyperfil
  };

  return (
    <>
      {modoEdicion && !registroMasivo && (
        <>
          <PersonaPerfilEditPage
            intl={intl}
            modoEdicion={modoEdicion}
            settingDataField={settingDataField}
            fechasContrato={fechasContrato}
            varIdPersona={varIdPersona}
            dataRowEditNew={dataRowEditNew}
            agregarPerfil={agregarPerfil}
            actualizarPerfil={actualizarPerfil}
            getInfo={getInfoPersona}
            showHeaderInformation={true}
            cancelarEdicion={() => {
              setLoading(true);
              setModoEdicion(false);
              setDataRowEditNew({});
              setLoading(false);
            }}
          />

          <div className="container_only">
            <div className="float-right">
              <ControlSwitch
                checked={auditoriaSwitch}
                onChange={e => {
                  setAuditoriaSwitch(e.target.checked);
                }}
              />
              <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && <AuditoriaPage dataRowEditNew={dataRowEditNew} />}
        </>
      )}

      {modoEdicion && registroMasivo && (
        <>
          <PerfilPersonaMasivoPage
            intl={intl}
            modoEdicion={modoEdicion}
            settingDataField={settingDataField}
            fechasContrato={fechasContrato}
            varIdPersona={varIdPersona}
            dataRowEditNew={dataRowEditNew}
            agregarPerfil={agregarPerfil}
            actualizarPerfil={actualizarPerfil}
            getInfo={getInfo}
            showHeaderInformation={true}
            cancelarEdicion={() => {
              setLoading(true);
              setModoEdicion(false);
              setDataRowEditNew({});
              setLoading(false);
            }}
            IdPerfilCampamento={varIdPerfil}
            setLoading={setLoading}
            grabarMasivo={grabarMasivo}
          />
        </>
      )}

      {!modoEdicion && (
        <>
          <PerfilPersonaListPage
            intl={intl}
            dsPerfil={dataSource}
            getInfo={getInfo}
            showHeaderInformation={true}
            nuevoRegistro={nuevoRegistroMasivoPerfil}
            cancelarEdicion={() => {
              cancelarEdicion();
            }}
            editarRegistro={editarRegistroPersonaPerfil}
            eliminarRegistro={eliminarRegistro}
          />
        </>
      )}

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisibleConfirm}
        setIsVisible={setIsVisibleConfirm}
        setInstance={setInstance}
        onConfirm={() => eliminarRegistro(selected, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

      <PerfilPersonaMasivoMessage
        intl={intl}
        showPopup={{
          isVisiblePopUp: isVisibleMessage,
          setisVisiblePopUp: setIsVisibleMessage
        }}
        dataSourcePersona={dataSourceProcesados}
      />
    </>
  );
};

export default PerfilPersonaIndexPage;
