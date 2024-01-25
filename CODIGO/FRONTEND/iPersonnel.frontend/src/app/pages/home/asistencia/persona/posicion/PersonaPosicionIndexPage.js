import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { handleErrorMessages} from "../../../../../store/ducks/notify-messages";

import { listar } from "../../../../../api/administracion/personaPosicion.api";
//import PersonaPosicionListPage from "./PersonaPosicionListPage";
import PersonaPosicionListPage from "../../../administracion/persona/posicion/PersonaPosicionListPage";


const PersonaPosicionIndexPage = props => {

  const { intl, setLoading, getInfo, accessButton, settingDataField, selectedIndex, varIdPersona } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const [listarTabs, setListarTabs] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const [expandRow, setExpandRow] = useState(0);

  //::::::::::-Funciones, REGIMEN PERSONA:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function listarPersonaPosicion() {
    setLoading(true);
    const { IdCliente, IdPersona } = selectedIndex;
    await listar({
      IdPersona, IdCliente, IdCompania: '%', IdPosicion: '%', IdUnidadOrganizativa: '%', NumPagina: 0, TamPagina: 0
    }).then(posicion => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(posicion);
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }


  const seleccionarPersonaPosicion = dataRow => {
    //console.log("seleccionarPersonaPosicion", dataRow);
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
    setSelected(dataRow);
    setModoEdicion(false);

  }


  const cancelarEdicion = () => {
    setModoEdicion(false);
    setDataRowEditNew({});
  }

  

  useEffect(() => {
    listarPersonaPosicion();
  }, []);


  return <>

    {!modoEdicion && (
      <>
        <PersonaPosicionListPage
          personaPosicions={listarTabs}
          cancelarEdicion={cancelarEdicion}
          seleccionarRegistro={seleccionarPersonaPosicion}
          focusedRowKey={focusedRowKey}
          getInfo={getInfo}
          expandRow={{ expandRow, setExpandRow }}
          collapsedRow={{ collapsed, setCollapsed }}
          modoEdicion={false}
          //accessButton={accessButton}
        />
      </>
    )}

  </>

};

export default injectIntl(WithLoandingPanel(PersonaPosicionIndexPage));
