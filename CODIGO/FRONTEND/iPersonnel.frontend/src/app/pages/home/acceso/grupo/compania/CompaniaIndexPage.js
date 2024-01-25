import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty, dateFormat, validarUsoLicencia } from "../../../../../../_metronic";

import { handleErrorMessages, handleSuccessMessages, handleWarningMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";

import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";

import {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
} from "../../../../../api/acceso/personaGrupo.api";
import { serviceAccesoGrupoPuerta } from "../../../../../api/acceso/grupoPuerta.api";

import CompaniaListPage from "../../grupo/compania/CompaniaListPage";
import CompaniaEditPage from "../../grupo/compania/CompaniaEditPage";

import { serviceAccesoCompaniaGrupo } from "../../../../../api/acceso/companiaGrupo.api";

const varFechaReferencia = "20200525"; 

const PersonaGrupoIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdPersona, cancelarEdicion,selectedIndex } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const [listarTabs, setListarTabs] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});

  const [instance, setInstance] = useState({});
  // const [selectedDelete, setSelectedDelete] = useState({});
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);

 //::::::::::::::::::::::FUNCIONES COMPANIA GRUPO:::::::::::::::::::::::::::::::::::::::::::::::::

 async function agregarCompaniaGrupo(data) {
  setLoading(true);
  const { IdGrupo,IdDivision,IdCompania, Activo } = data;
  let param = {
    IdCompania: IdCompania,
    IdDivision: selectedIndex.IdDivision,
    IdGrupo: selectedIndex.IdGrupo,
    Activo: Activo,
  };
  await serviceAccesoCompaniaGrupo.crear(param)
    .then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarCompaniaGrupo()
    })
    .catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
}


async function actualizarCompaniaGrupo(dataRow) {
  setLoading(true);
  const { IdCompania,IdDivision,IdGrupo, Activo } = dataRow;
  let params = {
    IdCompania,
    IdDivision,
    IdGrupo,
    Activo,
  };
  await serviceAccesoCompaniaGrupo.actualizar(params)
    .then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarCompaniaGrupo();
    })
    .catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
}

async function obtenerCompaniaGrupo(dataRow) {
  setLoading(true);
  const { IdCompania,IdDivision, IdGrupo } = dataRow;
  await serviceAccesoCompaniaGrupo.obtener({
    IdCompania,
    IdDivision,
    IdGrupo
  }).then(data => {
    setDataRowEditNew({ ...data, esNuevoRegistro: false });
  }).catch(err => {
    handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  })
    .finally(() => { setLoading(false); });
}

async function eliminarCompaniaGrupo(dataRow, confirm) {
  setSelected(dataRow);
  setIsVisibleConfirm(true);
  if (confirm) {
    setLoading(true);
    const { IdCompania,IdDivision, IdGrupo } = dataRow;
    await serviceAccesoCompaniaGrupo.eliminar({
      IdCompania,
      IdDivision,
      IdGrupo
    })
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    listarCompaniaGrupo();
  }
}

async function listarCompaniaGrupo() {
  setLoading(true);
  await serviceAccesoCompaniaGrupo.listar({
    IdCompania:'%',
    IdDivision: selectedIndex.IdDivision,
    IdGrupo: selectedIndex.IdGrupo,
    NumPagina: 0,
    TamPagina: 0
  }).then(data => {
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setListarTabs(data);
    setModoEdicion(false);
  }).catch(err => {
    handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  }).finally(() => { setLoading(false); });
}

const seleccionarCompaniaGrupo = dataRow => {
  const { RowIndex } = dataRow;
  setFocusedRowKey(RowIndex);
};

const editarCompaniaGrupo = dataRow => {
  const { RowIndex } = dataRow;
  setModoEdicion(true);
  setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
  setDataRowEditNew(dataRow);
  obtenerCompaniaGrupo(dataRow);
  setFocusedRowKey(RowIndex);
};

const nuevoCompaniaGrupo = (e) => {
  let nuevo = { Activo: "S" };
  setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
  setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
  setModoEdicion(true);
};


const cancelarEdicionTabs = () => {
  setModoEdicion(false);
  setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
  setDataRowEditNew({});
};


  useEffect(() => {
    listarCompaniaGrupo();
  }, []);

  return <>

    {modoEdicion && (
      <>
         <CompaniaEditPage
            dataRowEditNew={dataRowEditNew}
            titulo={titulo}
            modoEdicion={modoEdicion}
            agregarCompaniaGrupo={agregarCompaniaGrupo}
            actualizarCompaniaGrupo={actualizarCompaniaGrupo}
            cancelarEdicion={cancelarEdicionTabs}

            accessButton={accessButton}
            settingDataField={props.settingDataField}

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
    )}
    {!modoEdicion && (
      <>
       <CompaniaListPage
            modoEdicion={modoEdicion}
            companiaPerfilData={listarTabs}
            editarRegistro={editarCompaniaGrupo}
            eliminarRegistro={eliminarCompaniaGrupo}
            nuevoRegistro={nuevoCompaniaGrupo}
            cancelarEdicion={cancelarEdicion}
            seleccionarRegistro={seleccionarCompaniaGrupo}
            focusedRowKey={focusedRowKey}
            getInfo={getInfo}
            accessButton={accessButton}
          />
      </>
    )}

    <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisibleConfirm}
        setIsVisible={setIsVisibleConfirm}
        setInstance={setInstance}
        onConfirm={() => eliminarCompaniaGrupo(selected, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

  </>

};



export default injectIntl(WithLoandingPanel(PersonaGrupoIndexPage));
