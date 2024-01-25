import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import LocalHotelIcon from '@material-ui/icons/LocalHotel';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'

import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../api/campamento/tipoCama.api";
import PruebaVerPage from "./pruebaVerPage";
import PruebaVerPersonaPage from "./pruebaVerPersonaPage";


const PruebaIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [varIdTipoCama, setVarIdTipoCama] = useState("");
    const [tipoCamaData, setTipoCamaData] = useState([]);
    const [focusedRowKey, setFocusedRowKey] = useState(0);

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [selected, setSelected] = useState({
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision
    });
    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event, newValue) => { setTabIndex(newValue); };

    const [isVisible, setIsVisible] = useState(false);
    const [instance, setInstance] = useState({});
 

    /**--Configuración de acceso de botones******************************/
    const [accessButton, setAccessButton] = useState(defaultPermissions);


    /***********************************************************************/


    const changeTabIndex = (index) => {
        handleChange(null, index);
    }

    useEffect(() => {
        //listarTipoCama();
        //loadControlsPermission();
    }, []);




    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs
                        Title={intl.formatMessage({ id: "CAMP.BEDTYPE.MENU" })}
                        SubMenu={intl.formatMessage({ id: "CAMP.BEDTYPE.SUBMENU" })}
                        Subtitle={intl.formatMessage({ id: "CAMP.BEDTYPE" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "CAMP.BEDTYPE" })}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        <>
                            <div className={classes.root}>
                                <Tabs
                                    orientation="vertical"
                                    value={tabIndex}
                                    onChange={handleChange}
                                    aria-label="Vertical tabs"
                                    className={classes.tabs}
                                    variant="fullWidth"
                                    indicatorColor="primary"
                                    textColor="primary" >
                                    <Tab
                                        label={"RPT COMEDORES"}
                                        icon={<FormatListNumberedIcon fontSize="large" />}
                                        //onClick={listarTipoCama} 
                                        {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={"RPT PERSONA"}
                                        icon={<LocalHotelIcon fontSize="large" />}
                                        //onClick={(e => obtenerTipoCama(selected))} {...tabPropsIndex(1)}
                                        //disabled={isNotEmpty(varIdTipoCama) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <PruebaVerPage
                                        titulo={titulo}
                                        focusedRowKey={focusedRowKey}
                                        accessButton={accessButton}
                                        dataRowEditNew={dataRowEditNew}
                                        setDataRowEditNew={setDataRowEditNew}
                                    />
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                    <PruebaVerPersonaPage
                                        titulo={titulo}
                                        focusedRowKey={focusedRowKey}
                                        accessButton={accessButton}
                                        dataRowEditNew={dataRowEditNew}
                                        setDataRowEditNew={setDataRowEditNew}
                                    />
                                    </>
                                </TabPanel>
                            </div>
                        </>

                    </Portlet>
                </div>
            </div>
            
        </>
    );
};


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <Portlet
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && <>{children}</>}
        </Portlet>
    );
}
TabPanel.propTypes =
{
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};
function tabPropsIndex(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}
export default injectIntl(WithLoandingPanel(PruebaIndexPage));
