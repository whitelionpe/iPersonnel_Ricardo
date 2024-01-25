import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages, confirmAction } from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { useSelector } from "react-redux";
import RutaParaderoListPage from "./RutaParaderoListPage";
import { isNotEmpty } from "../../../../../_metronic";
import { service as ServiceParadero } from "../../../../api/transporte/paradero.api";
import { service } from "../../../../api/transporte/rutaParadero.api";

const RutaParaderoIndex = (props) => {

  const {  modoEdicion } = props;
  const { IdRuta } = props.selectedIndex;
  const usuario = useSelector(state => state.auth.user);
  const { intl, cancelarEdicion } = props;
  const [dataRowEditNew, setDataRowEditNew] = useState({});

  const [dataParaderosSeleccionados, setDataParaderosSeleccionados] = useState([]);
  const [paraderos, setParaderos] = useState([]);

  async function eliminarRutaParadero(dataRow) {
    var response = await confirmAction(intl.formatMessage({ id: "ALERT.REMOVE" }),intl.formatMessage({ id: "COMMON.YES" }),intl.formatMessage({ id: "COMMON.NOT" }));
    if(response.isConfirmed){
      const { IdRuta, IdParadero } = dataRow;
       if (isNotEmpty(IdRuta)) {
         await service.eliminar({ 
           IdRuta,
           IdParadero
          }).then(() => {
           handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
         }).catch(err => {
           handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
         });
         listarParaderos_Por_Ruta();
       }

    }
  }

  async function listar_Paraderos() {
    let data = await ServiceParadero.obtenerTodos({
      IdParadero : '%',
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    });
    setParaderos(data);
  }

  async function listarParaderos_Por_Ruta(){
    let data = await service.listar({
      IdRuta : IdRuta,
      IdParadero : '%',
      NumPagina : 0,
      TamPagina : 0,
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    });
    setDataParaderosSeleccionados(data);
  }

  async function actualizarParaderos(IdRuta, lstParaderos) {
    const Paraderos = lstParaderos.map(({ IdParadero, Orden }) => ({ IdParadero, Orden }));
    await service.configurarParaderos({ IdRuta, Paraderos, IdUsuario: usuario.username })
      .then(response => {
        listarParaderos_Por_Ruta();
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      });
  }

  useEffect(() => {
      listar_Paraderos();
      listarParaderos_Por_Ruta();
  }, []);

  return <>
        <RutaParaderoListPage
         setDataParaderosSeleccionados={setDataParaderosSeleccionados}
          modoEdicion = {modoEdicion}
          dataParaderosSeleccionados={dataParaderosSeleccionados}
          cancelarEdicion={cancelarEdicion}
          eliminarParadero={eliminarRutaParadero}
          paraderos={paraderos}
          IdRuta={IdRuta}
          actualizarParaderos={actualizarParaderos}
          selected={props.selectedIndex}
        />
      </>
};

export default injectIntl(WithLoandingPanel(RutaParaderoIndex));
