import React, {  useState } from "react";
import {
  handleErrorMessages,
  handleSuccessMessages,
  handleInfoMessages,
} from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { useSelector } from "react-redux";
import DateRange from '@material-ui/icons/DateRange';

import {
  useStylesTab,
} from "../../../../store/config/Styles";

//Multi-idioma
import { injectIntl } from "react-intl";

import ReservaListPage from '../feriado/FeriadoListPage';
import ReservaEditPage from '../feriado/FeriadoEditPage';
import { getStartAndEndOfMonthByDay, isNotEmpty, dateFormat } from '../../../../../_metronic/utils/utils';

import { serviceFeriado } from "../../../../api/administracion/feriado.api";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils';
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

const FeriadoIndexPage = (props) => {
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;

  const [varIdPersona, setVarIdPersona] = useState("");
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );

  const [tituloTabs, setTituloTabs] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );
  const classes = useStylesTab();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setValue(newValue);
    setTabIndex(newValue);
  };

  //Datos principales
  const [selected, setSelected] = useState({});
  const [tabIndex, setTabIndex] = useState(0);
  const [mensajeEliminar, setMensajeEliminar] = useState(intl.formatMessage({ id: "ALERT.REMOVE" }));

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  //Feriados:
  const [feriados, setFeriados] = useState([]);
  const [dateSelected, setDateSelected] = useState({});

  /*********************************************************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, 5);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  /*********************************************************** */
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const changeTabIndex = (index) => {
    handleChange(null, index);
  };

  const getInfo = () => {
    return [
      { text: [intl.formatMessage({ id: "SYSTEM.DIVISION" })], value: perfil.Division, colSpan: 4 }
    ];

  };

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //Reservas 
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const nuevoRegistro = () => {

  var mes = new Date(dateSelected.FechaInicioSelected).toLocaleString('default', { month: 'long' }) // https://402.ecma-international.org/1.0/
  var dia = new Date(dateSelected.FechaInicioSelected).toLocaleString('default', { day: '2-digit' })

    let data = {
      IdReserva: 0,
      FechaInicio: dataRowEditNew.FechaInicio,
      FechaFin: dataRowEditNew.FechaFin,
      Activo: "S",
      esNuevoRegistro: true,
      Mes: mes.toUpperCase(),
      Dia:dia
    };

    setDataRowEditNew({ ...data, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  }

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const grabarReservasPersona = async (dataRow) => {

    const {IdPais,Temporal,Feriado,Activo} = dataRow

    let param = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdSecuencial:0,
      IdPais: perfil.IdPais,
      FechaInicioSelected: dateFormat(dateSelected.FechaInicioSelected,'yyyyMMdd'),
      Fecha: dateFormat(dateSelected.FechaInicioSelected,'yyyyMMdd'),
      Temporal:Temporal,
      Feriado: Feriado.toUpperCase(), 
      EsPlantilla: 'N',
      Activo: Activo,
      IdUsuario: usuario.username,
    }
    //crearFeriado:
    await serviceFeriado.crear(param)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        setModoEdicion(false);

        let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(new Date());
        FechaFin = new Date(FechaFin.getFullYear(), FechaFin.getMonth() + (1), FechaFin.getDate());

        buscarFeriados(FechaInicio, FechaFin);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

  }

  const actualizarFeriados = async (dataRow) => {
    const {IdCliente,IdDivision,IdSecuencial,IdPais,Temporal,Feriado,Activo} = dataRow
      let param = {
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdSecuencial:IdSecuencial,
        IdPais: IdPais,
        FechaInicioSelected: dateFormat(dateSelected.FechaInicioSelected,'yyyyMMdd'), 
        Fecha: dateFormat(dateSelected.FechaInicioSelected,'yyyyMMdd'),
        Temporal:Temporal,
        Feriado: Feriado.toUpperCase(), 
        EsPlantilla: 'N',
        Activo: Activo,
        IdUsuario: usuario.username,
      }
  
      await serviceFeriado.actualizar(param)
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
          setModoEdicion(false);
          let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(new Date());
          FechaFin = new Date(FechaFin.getFullYear(), FechaFin.getMonth() + (1), FechaFin.getDate());
          buscarFeriados(FechaInicio, FechaFin);
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    
  }

  const buscarFeriados = async (FechaInicio, FechaFin) => {
    setLoading(true);

    await serviceFeriado.listar({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      FechaInicio: dateFormat(FechaInicio,"yyyyMMdd"),
      NumeroDias : 70
    })
      .then(resp => {
        let dataFeriado = resp.map(x => ({
          ...x,
          text: x.IdCama,
          startDate: x.Fecha,
          endDate: x.Fecha,
        }));
        setDataRowEditNew({ ...dataRowEditNew, FechaInicio, FechaFin });
        setFeriados(dataFeriado);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)

      }).finally(() => { setLoading(false); });

  }

  const eliminarFeriados = async (dataRow) => {

    const {IdCliente, IdDivision, IdSecuencial} = dataRow;

    let param = {
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdSecuencial: IdSecuencial,
    };

    setLoading(true);
    await serviceFeriado.eliminar(param).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      setModoEdicion(false);
      setDataRowEditNew({});
      let fechaInicio = dataRowEditNew.FechaInicio
      let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(fechaInicio, 2);
      buscarFeriados(FechaInicio, FechaFin);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  const editarFeriados = async (dataRow) => {
    const {IdSecuencial,EsPlantilla} = dataRow

    if( IdSecuencial === 0 &&  EsPlantilla === 'S' )
    {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.HOLIDAY.INFORMATION.MSG" }));
    }
    else
    {
      setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
      setModoEdicion(true);
      obtenerFeriados(dataRow);
    }

  }

  async function obtenerFeriados(dataRow) {
    setLoading(true); 
    const {IdCliente, IdDivision, IdSecuencial} = dataRow;
         await serviceFeriado.obtener({
            IdCliente:IdCliente,
            IdDivision:IdDivision,
            IdSecuencial:IdSecuencial
        }).then(data => {
            setDataRowEditNew({ ...data, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }


  //:::::::::::::::::::::::::::::::::::::::::::::-FUNCION ELIMINAR GENERAL :::::::::::::::::::::::::::::::::

  async function eliminarListRowTab(dataRow, confirm, nivel) {
    const {IdSecuencial,EsPlantilla} = dataRow
    if( IdSecuencial === 0 &&  EsPlantilla === 'S' )
    {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.HOLIDAY.INFORMATION.MSG" }));
      return;
    }

  if (confirm) {
      switch (tabIndex) {
        case 0:
          eliminarFeriados(selected);
        break;
      }
    } else {
      setIsVisible(true);
      setSelected({ ...dataRow});
    }
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 
  const getNombreBarrar = () => {
    return ` ${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `;
  }

  const tabsDisabled = () => {
    return isNotEmpty(varIdPersona) ? false : true;
  }

  const tabsHeaders = [
    {
      label: intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` }),
      icon: <DateRange fontSize="large" />,
      disabled: false,
      onClick: () => {
        setModoEdicion(false);
        let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(new Date());
        FechaFin = new Date(FechaFin.getFullYear(), FechaFin.getMonth() + (1), FechaFin.getDate());
        buscarFeriados(FechaInicio, FechaFin);
      },
    }
  ];

  const comp_Reserva = () => {

    return <>
      {!modoEdicion ?
        <ReservaListPage
          setDataRowEditNew={setDataRowEditNew}
          dataRowEditNew={dataRowEditNew}
          cancelarEdicion={cancelarEdicion}
          titulo={tituloTabs}
          size={classes.avatarLarge}
           getInfo={getInfo}
          showButton={true} 
          nuevoRegistro={nuevoRegistro}
          feriados={feriados}
          buscarFeriados={buscarFeriados}
          eliminarFeriados={eliminarListRowTab}
          editarFeriados={editarFeriados}
          setMensajeEliminar={setMensajeEliminar}
          accessButton={accessButton}
          setDateSelected = {setDateSelected}
        />
        :
        <ReservaEditPage
          titulo={tituloTabs}
           getInfo={getInfo}
          showButton={true}
          modoEdicion={true}
          setDataRowEditNew={setDataRowEditNew}
          dataRowEditNew={dataRowEditNew}
          cancelarEdicion={cancelarEdicion}
          grabar={grabarReservasPersona}
          actualizar={actualizarFeriados}
          dateSelected = {dateSelected}
        />
      }
    </>;

  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer 
        title={intl.formatMessage({ id: "ADMINISTRATION.HOLIDAY.PATHNAME" })}
        subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
        nombrebarra={getNombreBarrar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        value={value}
        componentTabsHeaders={tabsHeaders}
        componentTabsBody={[
          comp_Reserva(),
        ]}
      />
      <Confirm
        message={mensajeEliminar}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarListRowTab(selected, true, 0)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};

export default injectIntl(WithLoandingPanel(FeriadoIndexPage));
