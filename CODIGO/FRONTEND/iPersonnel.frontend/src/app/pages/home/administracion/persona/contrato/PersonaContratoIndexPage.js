import React, { useState } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import PersonaContratoListPage from "./PersonaContratoListPage";
import PersonaContratoEditPage from "./PersonaContratoEditPage";
import usePersonaContrato from "./usePersonaContrato";
import PersonaContratoCesePopup from "./PersonaContratoCesePopup";

const PersonaContratoIndexPage = ({
  intl,
  setLoading,
  getInfo,
  accessButton,
  settingDataField,
  varIdPersona,
  cancelarEdicion,
  selectedIndex,
  ocultarEdit,
  showButtons,
}) => {

  const {
    //Propiedades
    selected,
    tituloTabs,
    posicionDefault,
    auditoriaSwitch,
    listarTabs,
    isVisible,
    selectedDelete,
    modoEdicion,
    dataRowEditNew,
    showConfirm,
    showMotivoCese,
    oldContract,
    motivosCese,
    fechasContrato,
    //Metodos:
    setFechasContrato,
    setDataRowEditNew,
    editarRegistro,
    actualizarRegistro,
    agregarRegistro,
    cancelarContrato,
    setAuditoriaSwitch,

    eliminarRegistro,
    nuevoRegistro,
    seleccionarRegistro,
    focusedRowKey,
    verRegistro,

    setIsVisible,
    setInstance,
    setShowConfirm,
    setShowMotivoCese,
    eventConfirm,
    setOldContract,
    saveEventOldContract,
  } = usePersonaContrato({
    intl,
    setLoading,
    varIdPersona,
    selectedIndex,
  });

  const [motivoCeseSwitch, setMotivoCeseSwitch] = useState(false);

  return <>


    {modoEdicion && (
      <>
        <PersonaContratoEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          setDataRowEditNew={setDataRowEditNew}
          actualizarRegistro={actualizarRegistro}
          agregarRegistro={agregarRegistro}
          cancelarEdicion={cancelarContrato}
          accessButton={accessButton}
          settingDataField={settingDataField}
          selectedIndex={selected}
          titulo={tituloTabs}
          ocultarEdit={ocultarEdit}
          posicionDefault={posicionDefault}
          fechasContrato={fechasContrato}
          setFechasContrato={setFechasContrato}
          motivoCeseSwitch={motivoCeseSwitch}
          setMotivoCeseSwitch={setMotivoCeseSwitch}
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
        <PersonaContratoListPage
          contratos={listarTabs}
          editarRegistro={editarRegistro}
          eliminarRegistro={eliminarRegistro}
          nuevoRegistro={nuevoRegistro}
          seleccionarRegistro={seleccionarRegistro}
          focusedRowKey={focusedRowKey}
          cancelarEdicion={cancelarEdicion}
          getInfo={getInfo}
          accessButton={accessButton}
          showButtons={showButtons}
          ocultarEdit={ocultarEdit}
          verRegistro={verRegistro}
        />

      </>
    )}


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

    <Confirm
      message={intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONTRACT.CONFIM.CESE" })}
      isVisible={showConfirm}
      setIsVisible={setShowConfirm}
      setInstance={setInstance}
      onConfirm={eventConfirm}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />

    {showMotivoCese && (
      <PersonaContratoCesePopup
        intl={intl}
        showPopup={{ isVisiblePopUp: showMotivoCese, setisVisiblePopUp: setShowMotivoCese }}
        dataRowEditNew={oldContract}
        setDataRowEditNew={setOldContract}
        motivosCese={motivosCese}
        saveEvent={saveEventOldContract}
      />
    )}


  </>

};

export default injectIntl(WithLoandingPanel(PersonaContratoIndexPage));
