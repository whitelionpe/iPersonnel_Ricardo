import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import {
  handleErrorMessages,
  handleSuccessMessages,
  handleInfoMessages
} from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";

import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import { useStylesTab } from "../../../../../store/config/Styles";

import {
  obtener as obtenerM,
  listar as listarM,
  crear as crearM,
  actualizar as actualizarM,
  eliminar as eliminarM
} from "../../../../../api/asistencia/marcacion.api";

import MarcacionListPage from "./MarcacionListPage";

import { dateFormat, isNotEmpty } from "../../../../../../_metronic";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
export const initialFilterMarcas = {
  IdPersona: "",
  IdCliente: "",
  IdDivision: "",
  IdZona: "",
  IdEquipo: "",
  FechaMarca: Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  ),
  FechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  FechaFin: new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate() + 26
  )
};

const MarcacionIndexPage = props => {
  const usuario = useSelector(state => state.auth.user);
  const { IdDivision, IdCliente } = useSelector(
    state => state.perfil.perfilActual
  );

  const { IdZona, IdEquipo } = props.selectedNode;
  console.log("MarcacionIndexPage|props.selectedNode:", props.selectedNode);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const {
    intl,
    setLoading,
    settingDataField,
    getInfo,
    accessButton,
    varIdPersona,
    selectedIndex,
    dataMenu
  } = props;
  // const {IdDivision,IdZona, IdEquipo} = props.selectedNode
  // const [filterDataMarcas, setFilterDataMarcas] = useState({ ...initialFilterMarcas,IdZona,IdEquipo });
  const [isVisible, setIsVisible] = useState(false);
  const [tituloTabs, setTituloTabs] = useState(
    intl.formatMessage({ id: "ACTION.EDIT" })
  );
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );

  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [focusedRowKeyMarcacion, setFocusedRowKeyMarcacion] = useState();
  const [selectedDelete, setSelectedDelete] = useState({});
  const classes = useStylesTab();
  const [instance, setInstance] = useState({});
  const [ocultarEdit, setOcultarEdit] = useState(false);
  const ds = new DataSource({
    store: new ArrayStore({ data: [], key: "RowIndex" }),
    reshapeOnPush: false
  });
  const [dataSource] = useState(ds);
  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  const [selected, setSelected] = useState({});
  //::::::::::::::::::::::::::::::::::::::::::::: Funciones Marcación ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  // async function agregarMarcacion(datarow) {
  //   setLoading(true);
  //   const {
  //     IdZona,
  //     IdSecuencial,
  //     IdEquipo,
  //     IdTipoIdentificacion,
  //     Identificacion,
  //     FechaMarca,
  //     Hash,
  //     Automatico,
  //     Observacion,
  //     Online,
  //     FechaRegistro
  //   } = datarow;
  //   let data = {
  //     IdCliente,
  //     IdDivision: perfil.IdDivision,
  //     IdPersona: varIdPersona,
  //     IdSecuencial: 0,
  //     IdZona: isNotEmpty(IdZona) ? IdZona.toUpperCase() : "",
  //     IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo.toUpperCase() : "",
  //     IdTipoIdentificacion: isNotEmpty(IdTipoIdentificacion)
  //       ? IdTipoIdentificacion.toUpperCase()
  //       : "",
  //     Identificacion: isNotEmpty(Identificacion)
  //       ? Identificacion.toUpperCase()
  //       : "",
  //     FechaMarca: new Date(FechaMarca).toLocaleString(),
  //     Hash: isNotEmpty(Hash) ? Hash.toUpperCase() : "",
  //     Automatico: "N",
  //     Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : "",
  //     Online: Online,
  //     FechaRegistro: new Date(FechaRegistro).toLocaleString(),
  //     IdUsuario: usuario.username
  //   };
  //   await crearM(data)
  //     .then(response => {
  //       if (response)
  //         handleSuccessMessages(
  //           intl.formatMessage({ id: "MESSAGES.SUCESS" }),
  //           intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
  //         );
  //       setModoEdicion(false);
  //       setRefreshData(true);
  //     })
  //     .catch(err => {
  //       handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // }

  // async function actualizarMarcacion(datarow) {
  //   setLoading(true);
  //   const {
  //     IdZona,
  //     IdSecuencial,
  //     IdEquipo,
  //     IdTipoIdentificacion,
  //     Identificacion,
  //     FechaMarca,
  //     Hash,
  //     Automatico,
  //     Observacion,
  //     Online,
  //     FechaRegistro
  //   } = datarow;
  //   let data = {
  //     IdCliente,
  //     IdDivision: perfil.IdDivision,
  //     IdPersona: varIdPersona,
  //     IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
  //     IdZona: isNotEmpty(IdZona) ? IdZona.toUpperCase() : "",
  //     IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo.toUpperCase() : "",
  //     IdTipoIdentificacion: isNotEmpty(IdTipoIdentificacion)
  //       ? IdTipoIdentificacion.toUpperCase()
  //       : "",
  //     Identificacion: isNotEmpty(Identificacion)
  //       ? Identificacion.toUpperCase()
  //       : "",
  //     FechaMarca: new Date(FechaMarca).toLocaleString(),
  //     Hash: isNotEmpty(Hash) ? Hash.toUpperCase() : "",
  //     Automatico: Automatico ? "S" : "N",
  //     Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : "",
  //     Online: Online,
  //     FechaRegistro: new Date(FechaRegistro).toLocaleString(),
  //     IdUsuario: usuario.username
  //   };
  //   await actualizarM(data)
  //     .then(() => {
  //       handleSuccessMessages(
  //         intl.formatMessage({ id: "MESSAGES.SUCESS" }),
  //         intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
  //       );
  //       setModoEdicion(false);
  //       setRefreshData(true);
  //     })
  //     .catch(err => {
  //       handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // }

  async function eliminarRegistroMarcacion(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPersona, IdSecuencial } = dataRow;
      await eliminarM({ IdCliente, IdPersona, IdSecuencial })
        .then(response => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.SUCESS" }),
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch(err => {
          handleErrorMessages(
            intl.formatMessage({ id: "MESSAGES.ERROR" }),
            err
          );
        })
        .finally(() => {
          setLoading(false);
        });
      setRefreshData(true);
    }
  }

  async function obtenerMarcacion(dataRow) {
    setLoading(true);
    const { IdCliente, IdPersona, IdSecuencial } = dataRow;
    await obtenerM({ IdCliente, IdPersona, IdSecuencial })
      .then(data => {
        data.DisabledControl = data.Automatico === "S";
        data.Automatico = data.Automatico === "S" ? true : false;
        setDataRowEditNew({ ...data, esNuevoRegistro: false });
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });
  }

  /*  const seleccionarMarcacion = (dataRow) => {
  };
 */
  const seleccionarMarcacion = async dataRow => {
    const { RowIndex } = dataRow;
    setSelected(dataRow);
    // if (RowIndex !== focusedRowKeyMarcacion) {
    setFocusedRowKeyMarcacion(RowIndex);
    // setRefreshData(true);
    //listarPersonaHorarioDia(dataRow);
    // }
  };

  const nuevoRegistroMarcacion = () => {
    let data = {
      Activo: "S",
      FechaRegistro: new Date().toJSON().slice(0, 10),
      FechaMarca: new Date().toJSON().slice(0, 10)
    };
    setDataRowEditNew({ ...data, esNuevoRegistro: true, isReadOnly: false });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistroMarcacion = async (dataRow, flEditar) => {
    const { RowIndex } = dataRow;

    setTituloTabs(
      flEditar
        ? intl.formatMessage({ id: "ACTION.EDIT" })
        : intl.formatMessage({ id: "ACTION.VIEW" })
    );
    await obtenerMarcacion(dataRow);
    setModoEdicion(true);
  };

  const verRegistroMarcacion = async dataRow => {
    setModoEdicion(false);
    await obtenerMarcacion();
  };

  const cancelarEdicionMarcacion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  useEffect(() => {}, []);

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      {modoEdicion && <>{/* Page Edit  */}</>}

      {!modoEdicion && (
        <>
          <MarcacionListPage
            seleccionarRegistro={seleccionarMarcacion}
            // editarRegistro={editarRegistroMarcacion}
            // eliminarRegistro={eliminarRegistroMarcacion}
            // nuevoRegistro={nuevoRegistroMarcacion}
            cancelarEdicion={props.cancelarEdicion}
            getInfo={getInfo}
            accessButton={accessButton}
            focusedRowKey={focusedRowKeyMarcacion}
            verRegistroMarcacion={verRegistroMarcacion}
            //=>..CustomerDataGrid
            // filterData={filterDataMarcas}
            // setFilterData={setFilterDataMarcas}
            isFirstDataLoad={isFirstDataLoad}
            //setIsFirstDataLoad={setIsFirstDataLoad}
            dataSource={dataSource}
            refresh={refresh}
            resetLoadOptions={resetLoadOptions}
            refreshData={refreshData}
            setRefreshData={setRefreshData}
            //IdPersona={0}
            IdZona={IdZona}
            IdEquipo={IdEquipo}
            ocultarEdit={ocultarEdit}
            // selectedNode={props.selectedNode}
          />
        </>
      )}

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarRegistroMarcacion(selectedDelete, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};

export default injectIntl(WithLoandingPanel(MarcacionIndexPage));
