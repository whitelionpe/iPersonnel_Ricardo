import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty, dateFormat } from "../../../../../_metronic";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import BallotIcon from '@material-ui/icons/Ballot';

import { listar, obtener, actualizar, crear } from '../../../../api/asistencia/integracionInfotipo.api';

import  IntegracionInfotipoListPage  from './IntegracionInfotipoListPage';

import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import IntegracionInfotipoEditPage from "./IntegracionInfotipoEditPage";
import { serviceCompania } from "../../../../api/administracion/compania.api";

const IntegracionInfotipoIndexPage = (props) => {
    const { intl, setLoading, dataMenu,settingDataField } = props;

    const usuario = useSelector(state => state.auth.user);
    const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

    const classes = useStylesTab();

    const [varIdInfotipo, setVarIdInfotipo] = useState("");
    const [focusedRowKey, setFocusedRowKey] = useState(0);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [selected, setSelected] = useState({ IdCliente: IdCliente, IdDivision: IdDivision });
    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event, newValue) => { setTabIndex(newValue); };

    const [varIdCompania, setVarIdCompania] = useState("");
    const [companiaData, setCompaniaData] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState({});

    const [isVisible, setIsVisible] = useState(false);
    const [instance, setInstance] = useState({});
    const [selectedDelete, setSelectedDelete] = useState({});

    const [infotipos, setInfotipos] = useState([]);
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

    //:::::::::::::::::::: CONFIG TABS :::::::::::::::::::::::::::::::::::

    const titleHeaderToolbar = () => {
        return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `;
    }

    const tabsDisabled = () => {
        return isNotEmpty(varIdInfotipo) ? false : true;
    }

    async function agregarInfotipo(datarow) {
        setLoading(true);
        const { IdInfotipo, Descripcion, Alias, Activo, Unidad, Tipo, NombreTabla, CodigoTabla, DescripcionTabla } = datarow;
        let data = {
            IdCliente: IdCliente
            , IdCompania: varIdCompania
            , IdInfotipo
            , Descripcion
            , Alias
            , Unidad
            , Tipo
            , NombreTabla
            , CodigoTabla
            , DescripcionTabla
            , Activo: Activo
            , IdUsuario: usuario.username
          };
        await crear(data).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarInfotipos(varIdCompania);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      }

    async function actualizarInfotipo(datarow) {
        setLoading(true);
        const { IdInfotipo, Descripcion, Alias, Activo, Unidad, Tipo, NombreTabla, CodigoTabla, DescripcionTabla } = datarow;
        let data = {
          IdCliente: IdCliente
          , IdCompania: varIdCompania
          , IdInfotipo
          , Descripcion
          , Alias
          , Unidad
          , Tipo
          , NombreTabla
          , CodigoTabla
          , DescripcionTabla
          , Activo: Activo
          , IdUsuario: usuario.username
        };
        await actualizar(data).then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
          setModoEdicion(false);
          listarInfotipos(varIdCompania);
        }).catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      }

    async function obtenerInfotipo(datarow) {
        //setValueColor("");
        const {IdInfotipo} = datarow;
        setLoading(true);
        await obtener({ 
            IdInfotipo:IdInfotipo
           }).then(data => {
                //setValueColor( isNotEmpty(data.Color) ? data.Color :  "" ) ;
                setDataRowEditNew({ ...data, esNuevoRegistro: false });
                console.log("editDataRow");
                console.log(dataRowEditNew);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function listarInfotipos(idCompania){
        setLoading(true);
        await listar(
        {
            NumPagina: 0,
            TamPagina: 0,
            IdCompania: idCompania
        }
        ).then(data => {
            setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
            setInfotipos(data);
            changeTabIndex(0);
            setModoEdicion(false);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });

    }

    const nuevoRegistro = () => {
        changeTabIndex(1);
        let data = { Activo: "S" }; 
        setDataRowEditNew({ ...data, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };
    
    const editarRegistro = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerInfotipo(dataRow);
    };
    
    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { IdInfotipo, RowIndex } = dataRow;
        console.log("seleccionarRegistro|IdInfotipo:",IdInfotipo);
        setModoEdicion(false);
        setSelected(dataRow);
        setVarIdInfotipo(IdInfotipo);
        setFocusedRowKey(RowIndex);
    }

    async function listarCompanias() {
        let data = await serviceCompania.obtenerTodosConfiguracion({
          IdCliente: IdCliente,
          IdModulo: dataMenu.info.IdModulo,
          IdAplicacion: dataMenu.info.IdAplicacion,
          IdConfiguracion: "ID_COMPANIA"
        }
        ).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });
        setCompaniaData(data);
    }

    const changeValueCompany = (company) => {
        if(isNotEmpty(company)){
          const { IdCompania } = company;
          setSelectedCompany(company);
          setVarIdCompania(IdCompania);
          listarInfotipos(IdCompania);
          //setVarIdDivision("");
        }else
        {
          setSelectedCompany("");
          setVarIdCompania("");
          setInfotipos([]);
        }
    }

    useEffect(() => {
        listarCompanias();
        loadControlsPermission();
    }, []);


    /************--Configuración de acceso de botones*************/
    const [accessButton, setAccessButton] = useState(defaultPermissions);

    const loadControlsPermission = () => {
        let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
        setAccessButton({ ...accessButton, ...buttonsPermissions });
    }

    const changeTabIndex = (index) => {
        handleChange(null, index);
    }


    const tabContent_IntegracionInfotipoListPage = () => {
        return <>
            <IntegracionInfotipoListPage 
                infotipos = {infotipos}
                editarRegistro={editarRegistro}
                //eliminarRegistro={eliminarRegistro}
                nuevoRegistro={nuevoRegistro}
                titulo={titulo}
                seleccionarRegistro={seleccionarRegistro}
                focusedRowKey={focusedRowKey}
                accessButton={accessButton}
                cancelarEdicion={cancelarEdicion}
                companiaData={companiaData}
                changeValueCompany={changeValueCompany}
                varIdCompania={varIdCompania}
                setVarIdCompania={setVarIdCompania}
                setFocusedRowKey = {setFocusedRowKey}
            />
        </>
    }

    const tabContent_IntegracionInfotipoEditPage = () => {
        return <>
            <IntegracionInfotipoEditPage
                modoEdicion={modoEdicion}
                dataRowEditNew={dataRowEditNew}
                actualizarInfotipo={actualizarInfotipo}
                agregarInfotipo={agregarInfotipo}
                titulo={titulo}
                accessButton={accessButton}
                settingDataField={settingDataField}
                cancelarEdicion={cancelarEdicion}
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
    };

    return <>

        <TabNavContainer
            title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })} 
            submenu={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.PARAMETRIZACION" })}
            subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
            nombrebarra={titleHeaderToolbar()}
            tabIndex={tabIndex}
            handleChange={handleChange}
            componentTabsHeaders={[
                {
                    label: intl.formatMessage({ id: "ACTION.LIST" }),
                    icon: <FormatListNumberedIcon fontSize="large" />,
                    disabled: false,
                },
                {
                    label: intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.CONCEPTO_DE_INTEGRACIÓN" }),
                    icon: <BallotIcon fontSize="large" />,
                    onClick: () => { obtenerInfotipo(selected) },
                    disabled: !tabsDisabled() && accessButton.Tabs[1] ? false : true
                },

            ]}
            className={classes.tabContent}
            componentTabsBody={
                [
                    tabContent_IntegracionInfotipoListPage(),
                    tabContent_IntegracionInfotipoEditPage(),
                ]
            }

        />
    
    </>

};

export default injectIntl(WithLoandingPanel(IntegracionInfotipoIndexPage));