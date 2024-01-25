import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";

import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";

import {
  service
} from "../../../../../api/acreditacion/perfilDivision.api";

import {
  service as servicePerfilRequisito
} from "../../../../../api/acreditacion/perfilRequisito.api";


import PerfilDivisionEditPage from "./PerfilDivisionEditPage";
import PerfilDivisionListPage from "./PerfilDivisionListPage"
import PerfilDivisionRequisitoIndexPage from "../requisito/PerfilDivisionRequisitoIndexPage";

const PerfilDivisionIndexPage = (props) => {

  const { intl, setLoading, settingDataField, getInfo, selectedIndex, accessButton, varIdPerfil ,varVisita} = props;

  const usuario = useSelector(state => state.auth.user);
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [selected, setSelected] = useState({});

  const { IdPerfil, IdEntidad } = selectedIndex;// props.selected;

  const [isVisible, setIsVisible] = useState(false);
  const [focusedRowKey, setFocusedRowKey] = useState();

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [showEditForm, setShowEditForm] = useState("DIVISION");
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState({});

  const [listarTabs, setListarTabs] = useState([]);
  const [instance, setInstance] = useState({});

  const [varIdDivision, setVarIdDivision] = useState();

  const [filtroLocal, setFiltroLocal] = useState({
    IdPerfil: IdPerfil, IdEntidad: IdEntidad,
  });

  //:::::::::::::::::::::::::::::::::::::::::::::-|funciones para división|-:::::::::::::::::::::::::::::::::

  async function agregarRegistro(dataRow) {

    try {
      setLoading(true);
      const { IdDivision, Activo, DiasPermanencia } = dataRow;
      let params = {
        IdCliente,
        IdPerfil: varIdPerfil,
        DiasPermanencia,
        IdDivision,
        Activo,
        IdUsuario: usuario.username
      };
      await service.crear(params).then(() => {
        listarPerfilDivision();
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        setModoEdicion(false);
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => {
        setLoading(false);
      });

    } catch (err) {
      setLoading(false);
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }
  }

  async function actualizarRegistro(datarow) {
    setLoading(true);
    const { IdCliente, IdPerfil, IdDivision, Activo, DiasPermanencia } = datarow;
    let data = {
      IdCliente
      , IdPerfil
      ,DiasPermanencia
      , IdDivision
      , Activo
      , IdUsuario: usuario.username
    };

    await service.actualizar(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarPerfilDivision();
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerRegistro(dataRow) {
    
    setLoading(true);
    const { IdCliente, IdPerfil, IdDivision } = dataRow;
    await service.obtener({
      IdCliente,
      IdPerfil,
      IdDivision,
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(data, confirm) {
    setSelectedDelete(data);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPerfil, IdDivision } = selectedDelete;
      await service.eliminar({
        IdCliente,
        IdPerfil,
        IdDivision
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPerfilDivision();
    }
  }

  async function listarPerfilDivision() {
    setLoading(true);
    await service.listar({
      IdCliente,
      IdPerfil: varIdPerfil,
    }).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarRegistro = async (dataRow) => {
    const { RowIndex, IdDivision } = dataRow;
    setSelected(dataRow);
    setVarIdDivision(IdDivision);
    setFocusedRowKey(RowIndex);
  };

  const nuevoRegistro = () => {
    let data = { esNuevoRegistro: true, Activo: 'S' ,varVisita:varVisita};
    setDataRowEditNew(data);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  }

  const editarRegistro = async (dataRow) => {
    setModoEdicion(true);
    setShowEditForm("DIVISION");
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    await obtenerRegistro(dataRow);
  }

  const editarRegistroRequisito = async (dataRow) => {
     let dataRequisitos =  await servicePerfilRequisito.listar( {IdCliente,IdPerfil: varIdPerfil,})
     if(dataRequisitos.length > 0){
      setModoEdicion(true);
      setShowEditForm("REQUISITO");
      setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
      await obtenerRegistro(dataRow);
     }else{
      handleInfoMessages(intl.formatMessage({ id: "ACCREDITATION.PROFILE.DIVISION.CONFIGURATION.MSG"}));
     }
  };
  
  useEffect(() => {
    listarPerfilDivision();
  }, []);


  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function eliminarListRowTab(selected, confirm) {
    eliminarRegistro(selected, confirm);
  }

  const getInfoDivision = () => {
    const { IdPerfil, Perfil, Entidad } = selectedIndex;
    const { Division } = selected;
    return [
      { text: intl.formatMessage({ id: "COMMON.CODE" }), value: IdPerfil, colSpan: 1 },
      { text: intl.formatMessage({ id: "ACCREDITATION.PROFILE" }), value: Perfil, colSpan: 1 },
     // { text: intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY.ASSIGNEDTO" }), value: Entidad, colSpan: 1 },
      { text: intl.formatMessage({ id: "SYSTEM.DIVISION" }), value: Division, colSpan: 1 }
    ];

  }


  return <>
    {modoEdicion && (
      <>
        {showEditForm === "DIVISION" && (<>
          <PerfilDivisionEditPage
            dataRowEditNew={dataRowEditNew}
            actualizar={actualizarRegistro}
            agregar={agregarRegistro}
            cancelarEdicion={cancelarEdicion}
            titulo={titulo}
            modoEdicion={modoEdicion}
            settingDataField={settingDataField}
            accessButton={accessButton}
            getInfo={getInfo}
            varIdPerfil={varIdPerfil}
          //setModoEdicion={setModoEdicion}
          //filtroLocal={filtroLocal}
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
        {showEditForm == "REQUISITO" && (<>
          {/*******> DIVISION REQUISITO PERFIL >******** */}
          <PerfilDivisionRequisitoIndexPage
            varIdPerfil={varIdPerfil}
            varIdDivision={varIdDivision}
            selectedIndex={selectedIndex}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfoDivision}
            accessButton={accessButton}
            settingDataField={settingDataField}
          />
        </>
        )}
      </>
    )}

    {!modoEdicion && (
      <PerfilDivisionListPage
        dataSource={listarTabs}
        seleccionarRegistro={seleccionarRegistro}
        editarRegistro={editarRegistro}
        editarRegistroRequisito={editarRegistroRequisito}
        eliminarRegistro={eliminarRegistro}
        nuevoRegistro={nuevoRegistro}
        showEditForm={showEditForm}
        cancelarEdicion={props.cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        focusedRowKey={focusedRowKey}
      />
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarListRowTab(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />
  </>
};

export default injectIntl(WithLoandingPanel(PerfilDivisionIndexPage));
